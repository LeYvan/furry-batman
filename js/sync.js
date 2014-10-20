var listeBornes;
var listeMarkers = [];
var infoWindow;
var listePolygones = [];
var listeArrond = [];
var listeCouleur = ["red", "blue", "yellow", "green", "orange", "purple", "black"];
// Indique quels éléments ont déjà été chargés.
var elementsCharges = {"dom": false, "api-google-map": false, "zap": false, "arrond":false};
window.addEventListener('load',init, false);

chargerZap();
chargerArrondissement();

/* ===========================================================================
	Fonction: init
	Description: Fonction init de base de la page.
*/
function init(){
	$("boutonOptions").addEventListener('click', showOptions, false);
	$("options").style.visibility = "hidden";

	var chkBox = document.getElementsByTagName("input");

	for (var i = 0; i < chkBox.length; i++) {
		chkBox[i].addEventListener('change', gestionClickOptions, false);
	};
}

/* ===========================================================================
	Fonction: controleurChargement
	Description: Contrôle le chargement asynchrone de divers éléments.
*/
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

/* ===========================================================================
	Fonction: apiGoogleMapCharge
	Description: Indique que l'API Google Map est chargé.
*/
function apiGoogleMapCharge() {
	console.log('API Google Map chargé.');
	controleurChargement("api-google-map");
}

/* ===========================================================================
	Fonction: traitementPostChargement
	Description: Responsable des traitements post-chargement.
*/
function traitementPostChargement() {
	console.log('Traitement post-chargement.');

	initCarte();
	verifierPosition();
	reperesZap(listeBornes);
}

/* ===========================================================================
	Fonction: showOptions
	Description: Afficher/Cacher le pannau d'options
*/
function showOptions(){
	var panel = $("options");
	if(panel.style.visibility == "hidden"){
		panel.style.visibility = "visible";
	}
	else{
		panel.style.visibility = "hidden";
	}
}

/* ===========================================================================
	Fonction: evenementBorneClick
	Description: Affiche les infoWindows lors d'un clic sur une ZAP.
*/
function evenementBorneClick(){
	var infoWinow = creerInfoWindowBorne(this);
	infoWindow.open(carte,this);
}

/* ===========================================================================
	Fonction: creeInfoWindowAjouterAvis
	Description: Affiche une infoWIndow pour ajouter une avis.
*/
function creeInfoWindowAjouterAvis(marker){
	var divInfoWindow = document.createElement('div');
	divInfoWindow.id = "infoWindowDiv";

	var frmAvis = document.createElement('form');
	frmAvis.action = 'zap-avis.php';
	frmAvis.method = 'post';

	var h1Titre = document.createElement('h1');
	h1Titre.textContent = 'Ajouter un avis';

	var txtAvis = document.createElement('textarea');
	txtAvis.id = 'txtAvis';

	var lblAvis = document.createElement('lblAvis');
	lblAvis.textContent = 'Avis:';
	lblAvis.for = 'txtAvis';

	var btnEnvoyer = document.createElement('span');
	btnEnvoyer.id = 'btnEnvoyer';
	btnEnvoyer.className = btnEnvoyer.id;
	btnEnvoyer.textContent = "Envoyer";
	btnEnvoyer.addEventListener('click',function(){
		alert('envoyer avis');
	});
	
	frmAvis.appendChild(h1Titre);
	frmAvis.appendChild(lblAvis);
	frmAvis.appendChild(txtAvis);
	frmAvis.appendChild(btnEnvoyer);
	divInfoWindow.appendChild(frmAvis);

	if (typeof infoWindow != "undefined") infoWindow.close();
	infoWindow = new google.maps.InfoWindow();
	infoWindow.setContent(divInfoWindow);

	return infoWindow;
}

/* ===========================================================================
	Fonction: btnPosterAvisClick
	Description: afficher fenêtre d'ajout d'avis.
*/
function btnPosterAvisClick(marker) {
	var infoWinow = creeInfoWindowAjouterAvis(marker);
	infoWindow.open(carte,marker);
}

/* ===========================================================================
	Fonction: creerInfoWindowBorne
	Description: Création d'une infoWindow pour afficher les avis.
*/
function creerInfoWindowBorne(marker){
	var divInfoWindow = document.createElement('div');
	divInfoWindow.id = "infoWindowDiv";
	var unH1 = document.createElement('h1');

	unH1.textContent = marker.borne.batiment;
	divInfoWindow.appendChild(unH1);

	var divInfos = document.createElement('div');
	divInfos.id = "divBorneInfos";
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

	var btnPosterAvis = document.createElement('span');
	btnPosterAvis.id = "btnPosterAvis"
	btnPosterAvis.marker = marker;
	btnPosterAvis.textContent = "Poster un avis";

	btnPosterAvis.addEventListener('click',function(){
		btnPosterAvisClick(this.marker);
	});

	divInfoWindow.appendChild(btnPosterAvis);
	divInfoWindow.appendChild(btnVoirPplusDavis);

	marker.divInfoWindow = divInfoWindow;

	chargerAvisBorne(marker);

	if (typeof infoWindow != "undefined") infoWindow.close();
	infoWindow = new google.maps.InfoWindow();
	infoWindow.setContent(divInfoWindow);

	return infoWindow;
}

/* ===========================================================================
	Fonction: chargerAvisBorne
	Description: Chargement des avis.
*/
function chargerAvisBorne(marker){
	var xhrAvis = new XMLHttpRequest();
	xhrAvis.onreadystatechange = chargerAvisCallback;

	// Pour pouvoir récupérer le marker qui a lancé la recherche d'avis,
	// on donne le marker en référence à la requête.
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

/* ===========================================================================
	Fonction: showRTC
	Description: Affiche le layer des trajets RTC.
*/
function showRTC(e){
	var rtcLayer = new google.maps.KmlLayer({
										    url: 'http://yvan.wtf/include/rtc-trajets.kml?time='+new Date().getTime()
										    //url: 'http://gmaps-samples.googlecode.com/svn/trunk/ggeoxml/cta.kml'
										  	});
	if(e.target.checked){
  		rtcLayer.setMap(carte);
	}
	else{
		rtcLayer.setMap(null);
	}

}

/* ===========================================================================
	Fonction: polygoneArrond
	Description: Création des polygones des arrondissements si la requête HTTP 
				 a fonctionnée.
*/	
function polygoneArrond(){		
 	var i;
 	
 	var polygone;

 	for (i = 0; i < listeArrond.length; i++) {
 		var coordsTemp = [];
 		var coordsPoly = [];

 		coordsTemp = listeArrond[i].polygone.split(',');
 		
 		for (var j = 0; j < coordsTemp.length; j++) {
 			var paireCoord = coordsTemp[j].split(' ');
 				coordsPoly[j] = new google.maps.LatLng(paireCoord[1], paireCoord[0]); 			
 		}

 		nom = listeArrond[i].abreviation.textContent;

 		polygone = new google.maps.Polygon({
 			paths: coordsPoly,
 			strokeColor: listeCouleur[i],
 			strokeOpacity: 0.8,
 			strokeWeight: 2,
 			fillColor : listeCouleur[i],
 			fillOpacity : 0.35
 		});

 		listePolygones[i] = {"nom": nom, "polygone": polygone};
 	}
}

/* ===========================================================================
	Fonction: gestionClickOptions
	Description: Gestionnaire du clic des options d'affichage.
*/	
function gestionClickOptions(e){
	if(e.target.id == "all"){
		gererArrondSelect(e.target.checked)
	}else if(e.target.id == "rtc"){
		showRTC(e);
	}else {
		afficherCacherArrond(e.target.id, e.target.checked);
	}
}

/* ===========================================================================
	Fonction: getArrondissement
	Description: Rechercher et retourne un arrondissement selon son id.
*/	
function getArrondissement(id){
	var i = 0;
	while(i < listePolygones.length){
		if(listePolygones[i].nom == id){
			return listePolygones[i].polygone;
		}
		i++;
	}
	return null;
}

/* ===========================================================================
	Fonction: afficherCacherArrond
	Description: Affiche ou cache un arrondissement sur la carte selon le 
				 statut du checkbox.
*/	
function afficherCacherArrond(id,status){
	if(status){
		getArrondissement(id).setMap(carte);
	}
	else
	{
		getArrondissement(id).setMap(null);
	}

}

/* ===========================================================================
	Fonction: gererArrondSelect
	Description: Gestion de l'affichage de tous les arrondissement en même 
				 temps.
*/	
function gererArrondSelect(status){
	var afficherCacher = false;
	if(status){
		afficherCacher = true;
	}

	for(var i = 0; i < listePolygones.length; i++){
		$(listePolygones[i].nom).checked = afficherCacher;
		afficherCacherArrond(listePolygones[i].nom, afficherCacher);
	}
}




