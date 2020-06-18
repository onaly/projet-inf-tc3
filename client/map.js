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
    document.getElementById("select_country").innerHTML="";

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
       .bindPopup(data[n].common_name+ "\n ("+ Math.round(data[n].lat*100)/100+", "+ Math.round(data[n].lon*100)/100+")")
       .addEventListener('click', OnMarkerClick)
       .idnum = data[n].id;

      var opt = document.createElement("option");
      opt.setAttribute("value", data[n].id);
      opt.innerHTML=data[n].common_name;
      document.getElementById("select_country").appendChild(opt);
      //"<option value=volvo>Volvo</option>
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
  //var textfield = document.querySelector("#textfield");
  var wp = document.getElementById("select_country").value;
  update_data(wp);
};

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
      //var capital = document.querySelector("#capital");
      //var name = document.querySelector("#name");

      html="";
      html += "<h2>"+data.long_name+"</h2>";
      html += "<p><i>"+data.gov_type+"</i></p>";
      html += "<img style='width:100%;' src='/flags/"+data.flag+"'></img>";
      html += "<p><b> Country: </b><i>"+data.common_name+"</i></p>";
      html += "<p><b> Capital: </b><i>"+data.capital+"</i></p>";

      document.getElementById("description_left").innerHTML = html;



      html = "";
      html += "<p><b> National motto: </b><i>"+data.motto+"</i></p>";
      html += "<p><b> Official languages: </b><i>"+data.official_languages+"</i></p>";
      html += "<p><b>"+data.leader_title+": </b><i>"+data.leader_name+"</i></p>";
      html += "<p><b> Area: </b><i>"+data.area_km2+" km²</i></p>";
      html += "<p><b> Population ("+data.population_year+"): </b><i>"+data.population+"</i></p>";
      html += "<p><b> HDI(2018): </b><i>"+data.hdi_2018+"</i></p>";
      html += "<p><b> Currency: </b><i>"+data.currency+"</i></p>";
      html += "<p><b> Driving side: </b><i>"+data.drives_on+"</i></p>";
      html += "<p><b> Calling code: </b><i>"+data.calling_code+"</i></p>";
      html += "<p><b> Internet TLD: </b><i>"+data.cctld+"</i></p>";
      html += "<p><b> Plus d'infos: </b><a target='_blank' rel='noopener noreferrer' href='https://en.wikipedia.org/wiki/"+data.wp+"'>Wikipedia</a></p>";



      document.getElementById("description_right").innerHTML = html;


      //capital.innerHTML = data.capital;
      //name.innerHTML = data.common_name;
      //document.getElementById("country").innerHTML = data.wp;
      //document.getElementById("latitude").innerHTML = data.latitude;
      //document.getElementById("longitude").innerHTML = data.longitude;

      map.flyTo([data.latitude, data.longitude], 5); // Centrage et zoom sur la ville (avec animation)
      //description.innerHTML = data.desc;
      //name.innerHTML = e.target.getPopup().getContent();

    };

    // Le numéro du lieu est récupéré via la propriété personnalisée du marqueur


    // Envoi de la requête Ajax pour la récupération de la description du lieu de numéro idnum
    xhr.open('GET','service/country/'+idnum,true);
    xhr.send();

};
