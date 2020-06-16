# TD2-s9.py

import http.server
import socketserver
import sqlite3
import json

from urllib.parse import urlparse, parse_qs, unquote


#
# Définition du nouveau handler
#
class RequestHandler(http.server.SimpleHTTPRequestHandler):

  # sous-répertoire racine des documents statiques
  static_dir = '/client'

  #
  # On surcharge la méthode qui traite les requêtes GET
  #
  def do_GET(self):
    # on récupère les paramètres
    self.init_params()

    # le chemin d'accès commence par /countries
    if self.path.startswith('/countries'):
      self.send_countries()

    # le chemin d'accès commence par /service/country/...
    elif self.path_info[0] == 'service' and self.path_info[1] == 'country' and len(self.path_info) > 2:
      self.send_json_country(self.path_info[2])

    # ou pas...
    else:
      self.send_static()

  #
  # On surcharge la méthode qui traite les requêtes HEAD
  #
  def do_HEAD(self):
    self.send_static()

  #
  # On envoie le document statique demandé
  #
  def send_static(self):

    # on modifie le chemin d'accès en insérant un répertoire préfixe
    self.path = self.static_dir + self.path

    # on appelle la méthode parent (do_GET ou do_HEAD)
    # à partir du verbe HTTP (GET ou HEAD)
    if (self.command=='HEAD'):
        http.server.SimpleHTTPRequestHandler.do_HEAD(self)
    else:
        http.server.SimpleHTTPRequestHandler.do_GET(self)

  #
  # on analyse la requête pour initialiser nos paramètres
  #
  def init_params(self):
    # analyse de l'adresse
    info = urlparse(self.path)
    self.path_info = [unquote(v) for v in info.path.split('/')[1:]]  # info.path.split('/')[1:]
    self.query_string = info.query
    self.params = parse_qs(info.query)

    # récupération du corps
    length = self.headers.get('Content-Length')
    ctype = self.headers.get('Content-Type')
    if length:
      self.body = str(self.rfile.read(int(length)),'utf-8')
      if ctype == 'application/x-www-form-urlencoded' :
        self.params = parse_qs(self.body)
    else:
      self.body = ''

    # traces
    print('path_info =',self.path_info)
    print('body =',length,ctype,self.body)
    print('params =', self.params)


  #
  # On renvoie la liste des pays
  #
  def send_countries(self):

    # création d'un curseur (conn est globale)
    c = conn.cursor()

    # récupération de la liste des pays dans la base
    c.execute("SELECT wp, name, latitude, longitude FROM countries")
    r = c.fetchall()

    # construction de la réponse
    data = []
    for a in r:
       data.append({'id': a[0], 'lat':a[2],'lon':a[3], 'name': a[1]})
       print(data)
    # envoi de la réponse
    self.send_json(data)
    #headers = [('Content-Type','text/plain;charset=utf-8')]
    #self.send(txt,headers)


  #
  # On renvoie les informations d'un pays au format json
  #
  def send_json_country(self,country):

    # on récupère le pays depuis la base de données
    r = self.db_get_country(country)

    # on renvoie un dictionnaire
    data = {k:r[k] for k in r.keys()}
    json_data = json.dumps(data)

    # on envoie la réponse
    headers = [('Content-Type','application/json')]
    self.send(json_data, headers)

  #
  # Récupération d'un pays dans la base
  #
  def db_get_country(self,country):
    # préparation de la requête SQL
    c = conn.cursor()
    sql = 'SELECT wp, name, latitude, longitude, capital from countries WHERE wp=?'

    # récupération de l'information (ou pas)
    c.execute(sql,(country,))
    return c.fetchone()

  # on envoie un contenu encodé en json
  def send_json(self,data,headers=[]):
    body = bytes(json.dumps(data),'utf-8') # encodage en json et UTF-8
    self.send_response(200)
    self.send_header('Content-Type','application/json')
    self.send_header('Content-Length',int(len(body)))
    [self.send_header(*t) for t in headers]
    self.end_headers()
    self.wfile.write(body)


  #
  # On envoie les entêtes et le corps fourni
  #
  def send(self,body,headers=[]):

    # on encode la chaine de caractères à envoyer
    encoded = bytes(body, 'UTF-8')

    self.send_raw(encoded)

  def send_raw(self,data,headers=[]):
    # on envoie la ligne de statut
    self.send_response(200)

    # on envoie les lignes d'entête et la ligne vide
    [self.send_header(*t) for t in headers]
    self.send_header('Content-Length',int(len(data)))
    self.end_headers()

    # on envoie le corps de la réponse
    self.wfile.write(data)


#
# Ouverture d'une connexion avec la base de données
#
conn = sqlite3.connect('pays.sqlite')

# Pour accéder au résultat des requêtes sous forme d'un dictionnaire
conn.row_factory = sqlite3.Row

#
# Instanciation et lancement du serveur
#
httpd = socketserver.TCPServer(("", 8080), RequestHandler)
httpd.serve_forever()
