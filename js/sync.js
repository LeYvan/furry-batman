if (typeof com === 'undefined')
	var com = {};

if (typeof com.dinfogarneau === 'undefined')
	com.dinfogarneau = {};

if (typeof com.dinfogarneau.cours526 === 'undefined')
	com.dinfogarneau.cours526 = {};



com.dinfogarneau.cours526.listeBornes;
com.dinfogarneau.cours526.listeMarkers = [];
com.dinfogarneau.cours526.infoWindow;
com.dinfogarneau.cours526.rtcLayer;
com.dinfogarneau.cours526.listePolygones = [];
com.dinfogarneau.cours526.listeArrond = [];
com.dinfogarneau.cours526.listeCouleur = ["red", "blue", "yellow", "green", "orange", "purple", "black"];
// Indique quels éléments ont déjà été chargés.
com.dinfogarneau.cours526.elementsCharges = {"dom": false, "api-google-map": false, "zap": false, "arrond":false};


/* ===========================================================================
	Fonction: init
	Description: Fonction init de base de la page.
*/
com.dinfogarneau.cours526.init = function(){
	$("boutonOptions").addEventListener('click', com.dinfogarneau.cours526.showOptions, false);
	$("options").style.visibility = "hidden";

	var chkBox = document.getElementsByTagName("input");

	for (var i = 0; i < chkBox.length; i++) {
		chkBox[i].addEventListener('change', com.dinfogarneau.cours526.gestionClickOptions, false);
	};
};

window.addEventListener('load',com.dinfogarneau.cours526.init, false);

/* ===========================================================================
	Fonction: controleurChargement
	Description: Contrôle le chargement asynchrone de divers éléments.
*/
com.dinfogarneau.cours526.controleurChargement = function(nouvElemCharge) {
	console.log('controleurChargement: Nouvel élément chargé "' + nouvElemCharge + '".');
	if (typeof com.dinfogarneau.cours526.elementsCharges[nouvElemCharge] != "undefined") {

		com.dinfogarneau.cours526.elementsCharges[nouvElemCharge] = true;

		var tousCharge = true;
		for (var elem in com.dinfogarneau.cours526.elementsCharges) {
			if ( ! com.dinfogarneau.cours526.elementsCharges[elem] )
				tousCharge = false;
			}

			if (tousCharge) {
				console.log('controleurChargement: Tous les éléments ont été chargés.');
				com.dinfogarneau.cours526.traitementPostChargement();
			} else {
				console.log('controleurChargement: Il reste encore des éléments à charger.');
		}
	}
};

// Gestionnaire d'événements pour le chargement du DOM
window.addEventListener('DOMContentLoaded', function() {
		console.log('DOM chargé.');
		com.dinfogarneau.cours526.controleurChargement("dom");
		chargerScriptAsync('https://maps.googleapis.com/maps/api/js?sensor=true&libraries=geometry&callback=com.dinfogarneau.cours526.apiGoogleMapCharge', null);
		}, false);

/* ===========================================================================
	Fonction: apiGoogleMapCharge
	Description: Indique que l'API Google Map est chargé.
*/
com.dinfogarneau.cours526.apiGoogleMapCharge = function() {
	console.log('API Google Map chargé.');
	com.dinfogarneau.cours526.controleurChargement("api-google-map");
};

/* ===========================================================================
	Fonction: traitementPostChargement
	Description: Responsable des traitements post-chargement.
*/
com.dinfogarneau.cours526.traitementPostChargement = function() {
	console.log('Traitement post-chargement.');

	com.dinfogarneau.cours526.initCarte();
	com.dinfogarneau.cours526.verifierPosition();
	com.dinfogarneau.cours526.reperesZap(listeBornes);
	com.dinfogarneau.cours526.rtcLayer = new google.maps.KmlLayer(null);
	com.dinfogarneau.cours526.polygoneArrond();
};

/* ===========================================================================
	Fonction: showOptions
	Description: Afficher/Cacher le pannau d'options
*/
com.dinfogarneau.cours526.showOptions = function(){
	var panel = $("options");
	if(panel.style.visibility == "hidden"){
		panel.style.visibility = "visible";
	}
	else{
		panel.style.visibility = "hidden";
	}
};

/* ===========================================================================
	Fonction: evenementBorneClick
	Description: Affiche les infoWindows lors d'un clic sur une ZAP.
*/
com.dinfogarneau.cours526.evenementBorneClick = function(){
	var infoWindow = com.dinfogarneau.cours526.creerInfoWindowBorne(this);
	infoWindow.open(com.dinfogarneau.cours526.carte,this);
};

/* ===========================================================================
	Fonction: creeInfoWindowAjouterAvis
	Description: Affiche une infoWIndow pour ajouter une avis.
*/
com.dinfogarneau.cours526.creeInfoWindowAjouterAvis = function(marker){
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
	btnEnvoyer.marker = marker;
	btnEnvoyer.addEventListener('click',com.dinfogarneau.cours526.envoyerAvis);

	var loading = document.createElement('span');
	loading.id = 'chargementAvis';
	loading.className = "chargementAvis";
	loading.style.visibility = "hidden";

	var msgErreur = document.createElement('p');
	msgErreur.id = 'msgErreur';
	msgErreur.style.visibility = "hidden";
	
	frmAvis.appendChild(h1Titre);
	frmAvis.appendChild(lblAvis);
	frmAvis.appendChild(txtAvis);
	frmAvis.appendChild(btnEnvoyer);
	divInfoWindow.appendChild(loading);
	divInfoWindow.appendChild(msgErreur);
	divInfoWindow.appendChild(frmAvis);

	if (typeof com.dinfogarneau.cours526.infoWindow != "undefined") com.dinfogarneau.cours526.infoWindow.close();
	com.dinfogarneau.cours526.infoWindow = new google.maps.InfoWindow();
	com.dinfogarneau.cours526.infoWindow.setContent(divInfoWindow);

	return com.dinfogarneau.cours526.infoWindow;
};

/* ===========================================================================
	Fonction: btnPosterAvisClick
	Description: afficher fenêtre d'ajout d'avis.
*/
com.dinfogarneau.cours526.btnPosterAvisClick = function(marker) {
	var infoWindow = com.dinfogarneau.cours526.creeInfoWindowAjouterAvis(marker);
	infoWindow.open(com.dinfogarneau.cours526.carte,marker);
};

/* ===========================================================================
	Fonction: creerInfoWindowBorne
	Description: Création d'une infoWindow pour afficher les avis.
*/
com.dinfogarneau.cours526.creerInfoWindowBorne = function(marker){
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
		com.dinfogarneau.cours526.chargerAvisBorne(this.marker);
	});

	var btnPosterAvis = document.createElement('span');
	btnPosterAvis.id = "btnPosterAvis"
	btnPosterAvis.marker = marker;
	btnPosterAvis.textContent = "Poster un avis";

	btnPosterAvis.addEventListener('click',function(){
		com.dinfogarneau.cours526.btnPosterAvisClick(this.marker);
	});

	divInfoWindow.appendChild(btnPosterAvis);
	divInfoWindow.appendChild(btnVoirPplusDavis);

	marker.divInfoWindow = divInfoWindow;

	com.dinfogarneau.cours526.chargerAvisBorne(marker);

	if (typeof com.dinfogarneau.cours526.infoWindow != "undefined") com.dinfogarneau.cours526.infoWindow.close();
	com.dinfogarneau.cours526.infoWindow = new google.maps.InfoWindow();
	com.dinfogarneau.cours526.infoWindow.setContent(divInfoWindow);

	return com.dinfogarneau.cours526.infoWindow;
};

/* ===========================================================================
	Fonction: chargerAvisBorne
	Description: Chargement des avis.
*/
com.dinfogarneau.cours526.chargerAvisBorne = function(marker){
	var xhrAvis = new XMLHttpRequest();
	xhrAvis.onreadystatechange = com.dinfogarneau.cours526.chargerAvisCallback;

	// Pour pouvoir récupérer le marker qui a lancé la recherche d'avis,
	// on donne com.dinfogarneau.cours526.le marker en référence à la requête.
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
};

/* ===========================================================================
	Fonction: showRTC
	Description: Affiche le layer des trajets RTC.
*/
com.dinfogarneau.cours526.showRTC = function(e){
	com.dinfogarneau.cours526.rtcLayer = new google.maps.KmlLayer({
										    //url: 'http://yvan.wtf/include/rtc-trajets.kml'
										    url: 'http://gmaps-samples.googlecode.com/svn/trunk/ggeoxml/cta.kml'
										});
	
	if(e.target.checked){
  		com.dinfogarneau.cours526.rtcLayer.setMap(carte);
	}
	else{
		com.dinfogarneau.cours526.rtcLayer.setMap(null);
	}
};

/* ===========================================================================
	Fonction: polygoneArrond
	Description: Création des polygones des arrondissements si la requête HTTP 
				 a fonctionnée.
*/	
com.dinfogarneau.cours526.polygoneArrond = function(){		
	console.log("polygoneArrond start")
 	var i;
 	
 	var polygone;

 	for (i = 0; i < com.dinfogarneau.cours526.listeArrond.length; i++) {
 		var coordsTemp = [];
 		var coordsPoly = [];

 		coordsTemp = com.dinfogarneau.cours526.listeArrond[i].polygone.split(',');
 		
 		for (var j = 0; j < coordsTemp.length; j++) {
 			var paireCoord = coordsTemp[j].split(' ');
 				coordsPoly[j] = new google.maps.LatLng(paireCoord[1], paireCoord[0]); 			
 		}

 		nom = com.dinfogarneau.cours526.listeArrond[i].abreviation.textContent;

 		polygone = new google.maps.Polygon({
 			paths: coordsPoly,
 			strokeColor: com.dinfogarneau.cours526.listeCouleur[i],
 			strokeOpacity: 0.8,
 			strokeWeight: 2,
 			fillColor : com.dinfogarneau.cours526.listeCouleur[i],
 			fillOpacity : 0.35
 		});

 		com.dinfogarneau.cours526.listePolygones[i] = {"nom": nom, "polygone": polygone};
 		if(com.dinfogarneau.cours526.listePolygones.length == 6) console.log("polygoneArrond done");
 	}
};

/* ===========================================================================
	Fonction: gestionClickOptions
	Description: Gestionnaire du clic des options d'affichage.
*/	
com.dinfogarneau.cours526.gestionClickOptions = function(e){
	if(e.target.id == "all"){
		com.dinfogarneau.cours526.gererArrondSelect(e.target.checked)
	}else if(e.target.id == "rtc"){
		com.dinfogarneau.cours526.showRTC(e);
	}else {
		com.dinfogarneau.cours526.afficherCacherArrond(e.target.id, e.target.checked);
	}
};

/* ===========================================================================
	Fonction: getArrondissement
	Description: Rechercher et retourne un arrondissement selon son id.
*/	
com.dinfogarneau.cours526.getArrondissement = function(id){
	var i = 0;
	while(i < com.dinfogarneau.cours526.listePolygones.length){
		if(com.dinfogarneau.cours526.listePolygones[i].nom == id){
			return com.dinfogarneau.cours526.listePolygones[i].polygone;
		}
		i++;
	}
	return null;
};

/* ===========================================================================
	Fonction: afficherCacherArrond
	Description: Affiche ou cache un arrondissement sur la carte selon le 
				 statut du checkbox.
*/	
com.dinfogarneau.cours526.afficherCacherArrond = function(id,status){
	if(status){
		com.dinfogarneau.cours526.getArrondissement(id).setMap(com.dinfogarneau.cours526.carte);
	}
	else
	{
		com.dinfogarneau.cours526.getArrondissement(id).setMap(null);
	}

};

/* ===========================================================================
	Fonction: gererArrondSelect
	Description: Gestion de l'affichage de tous les arrondissement en même 
				 temps.
*/	
com.dinfogarneau.cours526.gererArrondSelect = function(status){
	var afficherCacher = false;
	if(status){
		afficherCacher = true;
	}

	for(var i = 0; i < com.dinfogarneau.cours526.listePolygones.length; i++){
		$(com.dinfogarneau.cours526.listePolygones[i].nom).checked = afficherCacher;
		com.dinfogarneau.cours526.afficherCacherArrond(com.dinfogarneau.cours526.listePolygones[i].nom, afficherCacher);
	}
};

/* ===========================================================================
	Fonction: envoyerAvis
	Description: 
*/	
com.dinfogarneau.cours526.envoyerAvis = function(){
	$('btnEnvoyer').disabled = true;
	$('txtAvis').disabled = true;
	$('chargementAvis').style.visibility = "visible";

	xhr = new XMLHttpRequest();
	xhr.onreadystatechange = envoyerAvisCallback;
	
	// Contenu de la requête avec la méthode POST.
	contenuPOST = 'borne=' + encodeURIComponent($('btnEnvoyer').marker.borne.nom) + '&text=' + encodeURIComponent($('txtAvis').value) + '&action=posterAvis';

	alert(contenuPOST);
	var URL = 'http://yvan.wtf/zap-avis.php';

	xhr.open('POST', URL, true);
	xhr.setRequestHeader('Content-type','application/x-www-form-urlencoded');
	xhr.send(contenuPOST);
};

com.dinfogarneau.cours526.chargerZap();
com.dinfogarneau.cours526.chargerArrondissement();