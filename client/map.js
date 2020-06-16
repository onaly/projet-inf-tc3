// Création d'une carte dans la balise div "map",
// et position de la vue sur un point donné et un niveau de zoom
var map = L.map('map').setView([45.775, -102], 2.8);
map.setMaxBounds(map.getBounds()).setMinZoom(2.8).setZoom(3);

// Ajout d'une couche de dalles OpenStreetMap
L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);


// Fonction appelée au chargement de la page
function load_data () {

  // objet pour l'envoi d'une requête Ajax
  var xhr = new XMLHttpRequest();

  // fonction appelée lorsque la réponse à la requête (liste des lieux insolites) sera arrivée
  xhr.onload = function() {

    // transformation des données renvoyées par le serveur
    // responseText est du type string, data est une liste
    var data = JSON.parse(this.responseText);
    console.log(data);
    // boucle sur les lieux
    for ( n = 0; n < data.length; n++ ) {
      // insertion d'un marqueur à la position du lieu,
      // attachement d'une popup, capture de l'événement 'clic'
      // ajout d'une propriété personnalisée au marqueur
      L.marker([data[n].lat,data[n].lon]).addTo(map)
       .bindPopup(data[n].name)
       .addEventListener('click', OnMarkerClick)
       .idnum = data[n].id;
    }
  };

  // Envoi de la requête Ajax pour la récupération de la liste des lieux insolites
  xhr.open('GET','/countries',true);
  xhr.send();
}

// Fonction appelée lors d'un clic sur un marqueur
function OnMarkerClick (e) {
  update_data(e.target.idnum);

}

var bouton = document.querySelector("#bouton");

bouton.onclick = function() {
  var textfield = document.querySelector("#textfield");
  var wp = document.getElementById("textfield").value;
  update_data(wp)
}

var update_data = function(idnum) {

    // objet pour l'envoi d'une requête Ajax
    var xhr = new XMLHttpRequest();

    // fonction appelée lorsque la réponse à la requête (description d'un lieu insolite) sera arrivée
    xhr.onload = function() {

      // transformation des données renvoyées par le serveur
      // responseText est du type string, data est un objet
      var data = JSON.parse(this.responseText);
      console.log(data);
      // affichage dans la zone 'description' du nom (reprise dans le popup)
      // et de la description récupérée par l'appel au serveur
      var capital = document.querySelector("#capital");
      var name = document.querySelector("#name");

      capital.innerHTML = data.capital;
      name.innerHTML = data.name;
      document.getElementById("country").innerHTML = data.wp;
      document.getElementById("latitude").innerHTML = data.latitude;
      document.getElementById("longitude").innerHTML = data.longitude;

      map.flyTo([data.latitude, data.longitude], 5); // Centrage et zoom sur la ville (avec animation)
      //description.innerHTML = data.desc;
      //name.innerHTML = e.target.getPopup().getContent();

    };

    // Le numéro du lieu est récupéré via la propriété personnalisée du marqueur


    // Envoi de la requête Ajax pour la récupération de la description du lieu de numéro idnum
    xhr.open('GET','service/country/'+idnum,true);
    xhr.send();

}
