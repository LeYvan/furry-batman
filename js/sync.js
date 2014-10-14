var listeBornes;
var listeMarkers = [];
var infoWindow;

// Indique quels éléments ont déjà été chargés.
var elementsCharges = {"dom": false, "api-google-map": false, "zap": false};
window.addEventListener('load',init, false);

chargerZap();

function init(){
	$("boutonOptions").addEventListener('click', showOptions, false);
	$("rtc").addEventListener('change', showRTC, false);
	$("options").style.visibility = "hidden";
}



// Fonction contrôlant le chargement asynchrone de divers éléments.
function controleurChargement(nouvElemCharge) {
	console.log('controleurChargement: Nouvel élément chargé "' + nouvElemCharge + '".');
	if (typeof elementsCharges[nouvElemCharge] != "undefined") {

		elementsCharges[nouvElemCharge] = true;

		var tousCharge = true;
		for (var elem in elementsCharges) {
			if ( ! elementsCharges[elem] )
				tousCharge = false;
			}

			if (tousCharge) {
				console.log('controleurChargement: Tous les éléments ont été chargés.');
				traitementPostChargement();
			} else {
				console.log('controleurChargement: Il reste encore des éléments à charger.');
		}
	}
}

// Gestionnaire d'événements pour le chargement du DOM
window.addEventListener('DOMContentLoaded', function() {
		console.log('DOM chargé.');
		controleurChargement("dom");
		chargerScriptAsync('https://maps.googleapis.com/maps/api/js?sensor=true&libraries=geometry&callback=apiGoogleMapCharge', null);
		}, false);

// Fonction appelée pour indiquer que l'API Google Map est chargé.
function apiGoogleMapCharge() {
	console.log('API Google Map chargé.');
	controleurChargement("api-google-map");
}

// Fonction responsable des traitements post-chargement.
function traitementPostChargement() {
	console.log('Traitement post-chargement.');

	initCarte();
	verifierPosition();
	reperesZap(listeBornes);
}

// Afficher/Cacher le pannau d'options
function showOptions(){
	var panel = $("options");
	if(panel.style.visibility == "hidden"){
		panel.style.visibility = "visible";
	}
	else{
		panel.style.visibility = "hidden";
	}
}

// Appeller quand click borne.
function evenementBorneClick(){
	var infoWinow = creerInfoWindowBorne(this);
	infoWindow.open(carte,this);
}

// Appeller pour créer fenêtre info borne.
function creerInfoWindowBorne(marker){
	var divInfoWindow = document.createElement('div');
	divInfoWindow.id = "infoWindowDiv";
	var unH1 = document.createElement('h1');

	unH1.textContent = marker.borne.batiment;
	divInfoWindow.appendChild(unH1);

	var divInfos = document.createElement('div');
	divInfoWindow.appendChild(divInfos);

	var pArrond = document.createElement('p');
	pArrond.id = "pArrond";
	pArrond.textContent = marker.borne.arrond;
	divInfos.appendChild(pArrond);

	var pAdresse = document.createElement('p');
	pAdresse.id ="pAdresse";
	pAdresse.textContent = marker.borne.noCivic + ' ' + marker.borne.rue;
	divInfos.appendChild(pAdresse);

	var listeAvis = document.createElement('ul');
	listeAvis.id = "ulAvis" + marker.borne.nom;

	var liChargement = document.createElement('li');
	liChargement.id = "chargementAvis";
	liChargement.textContent += "Chargement des avis...";
	listeAvis.appendChild(liChargement);
	divInfoWindow.appendChild(listeAvis);

	var btnVoirPplusDavis = document.createElement('span');
	btnVoirPplusDavis.id = "btnVoirPlusAvis"
	btnVoirPplusDavis.marker = marker;
	btnVoirPplusDavis.textContent = "Voir plus d'avis";

	btnVoirPplusDavis.addEventListener('click',function(){
		chargerAvisBorne(this.marker);
	});

	divInfoWindow.appendChild(btnVoirPplusDavis);

	marker.divInfoWindow = divInfoWindow;

	chargerAvisBorne(marker);

	if (typeof infoWindow != "undefined") infoWindow.close();

	infoWindow = new google.maps.InfoWindow();
	infoWindow.setContent(divInfoWindow);

	return infoWindow;
}

function chargerAvisBorne(marker){
	var xhrAvis = new XMLHttpRequest();
	xhrAvis.onreadystatechange = chargerAvisCallback;

	// Pour pouvoir récupérer le marker qui a lancé la recherche d'avis
	// On donne le marker en référence à la requête
	xhrAvis.marker = marker;

	var strURL = 'http://yvan.wtf/zap-avis.php?action=chercherAvis&borne=' + marker.borne.nom;

	if (typeof marker.avis != "undefined"){
		var strDejaCharge = "&dejaChargee="

		for (i in marker.avis){
			strDejaCharge += marker.avis[i].Id;
			if (i < marker.avis.length - 1){
				strDejaCharge += ',';
			}
		}
		
		strURL += strDejaCharge;	
	}

	xhrAvis.open('GET', strURL, true);
	xhrAvis.send(null);
}

function showRTC(e){
	var rtcLayer = new google.maps.KmlLayer({
										    	url: './include/rtc-trajets.kml'
										    	//url: 'http://gmaps-samples.googlecode.com/svn/trunk/ggeoxml/cta.kml'
										  		});
	if(e.target.checked){
  		rtcLayer.setMap(carte);
	}
	else{
		rtcLayer.setMap(null);
	}

}



