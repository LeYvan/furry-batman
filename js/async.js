var carte;
var posUsager;
var listeMarkers = [];
var xhrZap;
var xhrArrond;
// Position par défaut (Québec).
var latDefaut = 46.803320;
var longDefaut = -71.242773;


/* ===========================================================================
	Fonction: initCarte
	Description: Chargement de la carte.
*/
function initCarte() {
	var optionsCarte = {
		"zoom": 12,
		"mapTypeId": google.maps.MapTypeId.ROADMAP,
		"mapTypeControlOptions": {style: google.maps.MapTypeControlStyle.DROPDOWN_MENU, 
									position: google.maps.ControlPosition.LEFT_TOP},
		"center": new google.maps.LatLng(latDefaut, longDefaut)
		};

	carte = new google.maps.Map(document.getElementById("carte-canvas"), optionsCarte);
}

/* ===========================================================================
	Fonction: verifierPosition
	Description: Vérifie si la géolocation est disponible. Si oui, une autre
				 fonction est appelée pour la récupérer.
*/
function verifierPosition(){
	if ( typeof navigator.geolocation != "undefined" ) {
		console.log('Le navigateur supporte la géolocalisation.');
		navigator.geolocation.getCurrentPosition(getCurrentPositionSuccess, getCurrentPositionError, {});
		} else {
			console.log('Le navigateur NE supporte PAS la géolocalisation.');
			var positionInit = new google.maps.LatLng(latDefaut, longDefaut);
			carte.setCenter(positionInit);
		}	
}

/* ===========================================================================
	Fonction: repereUsager
	Description: Création du repère de l'usager sur la carte.
*/
function repereUsager(lati, longi){
	var posRepere = new google.maps.LatLng(lati , longi);
	posUsager = posRepere;

	var optionsRepere = {
						"position": posRepere, 
						"map": carte,
						"icon": "images/male-2.png",
						"clickable": true,
						"draggable": false					
					};
	var repere = new google.maps.Marker(optionsRepere);

	filtrerZap();	
}

/* ===========================================================================
	Fonction: reperesZap
	Description: Création des repères pour les ZAP sur la carte à partir de la
				 liste des bornes.
*/
function reperesZap(listeBornes){
	var distance; 
	var image;

	for (borne in listeBornes){	

		var posRepere = new google.maps.LatLng(listeBornes[borne].coord_y , listeBornes[borne].coord_x);

		var optionsRepere = {
							"position": posRepere,
							"map": carte,
							"icon": "images/wifi.png",
							"clickable": true,
							"draggable": false					
						};

		var repere = new google.maps.Marker(optionsRepere);

		repere.borne = listeBornes[borne];

		google.maps.event.addListener(repere,'click',evenementBorneClick);
	
		listeMarkers[listeMarkers.length] = repere;
	}
}

/* ===========================================================================
	Fonction: filtrerZap
	Description: Filtre les ZAP pour mettre en évidence celles qui sont dans 
				 un rayon de 5 km de l'usager.
*/
function filtrerZap(){
	for (var i = 0; i < listeMarkers.length; i++) {
		var distance = google.maps.geometry.spherical.computeDistanceBetween(listeMarkers[i].position, posUsager);
		if(distance <= 5000){
			listeMarkers[i].setIcon("images/wifi-green.png");
			listeMarkers[i].setAnimation(google.maps.Animation.DROP);
		}
		else{
			listeMarkers[i].setIcon("images/wifi.png");
		}
	};
}

/* ===========================================================================
	Fonction: getCurrentPositionSuccess
	Description: Récupère la position de l'usager si la géolocalisation est 
				 supportée.
*/
function getCurrentPositionSuccess (position) {	
	console.log('Position obtenue : ' + position.coords.latitude + ', ' + position.coords.longitude);
	var positionInit = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

	carte.setCenter(positionInit);

	repereUsager(position.coords.latitude, position.coords.longitude);
	afficherCerleZoneCouverte(positionInit);
}

/* ===========================================================================
	Fonction: getCurrentPositionError
	Description: Appelée lors de l'échec (refus ou problème) de la récupération 
				 de la position. Utilisation de la position par défaut.
*/	
function getCurrentPositionError(erreur) {	
	console.log('Utilisation de la position par défaut.');
	var positionInit = new google.maps.LatLng(latDefaut, longDefaut);
	carte.setCenter(positionInit);
}

/* ===========================================================================
	Fonction: afficherCerleZoneCouverte
	Description: Affiche un cercle sur la carteautour de la position de 
				 l'usager.
*/	
function afficherCerleZoneCouverte(positionUtilisateur){
	var cercleZAPoptions = {
      "strokeColor": '#000066',
      "strokeOpacity": 0.25,
      "strokeWeight": 2,
      "fillColor": '#000088',
      "fillOpacity": 0.150,
      "map": carte,
      "center": positionUtilisateur,
      "radius": 5000
    };

    var cityCircle = new google.maps.Circle(cercleZAPoptions);
}

/* ===========================================================================
	Fonction: chargerZap
	Description: Chargement des ZAP à l'aide d'une requête AJAX.
*/	
function chargerZap() {	
	xhrZap = new XMLHttpRequest();
	xhrZap.onreadystatechange = chargerZapCallback;
	
	var URL = 'http://yvan.wtf/zap-bornes.php?action=chercherBornes';
	xhrZap.open('GET', URL, true);
	
	xhrZap.send(null);
	controleurChargement("zap");
}

/* ===========================================================================
	Fonction: chargerZapCallback
	Description: Callback de la requête AJAX qui charge les ZAP.
*/	
function chargerZapCallback() {
	if ( xhrZap.readyState == 4 ) {
		
		if ( xhrZap.status != 200 ) {
			var msgErreur = 'Erreur (code=' + xhrZap.status + '): La requête HTTP n\'a pu être complétée.';
			//$('msg-erreur').textContent = msgErreur;
			
		} else {
			var objZap;
			try { 
				objZap = JSON.parse( xhrZap.responseText );
			} catch (e) {
				alert('ERREUR: La réponse AJAX n\'est pas une expression JSON valide.');
				return;
			}
			if ( objZap.resultat == "erreur" ) {
				var msgErreur = 'Erreur: ' + objZap.message;
				//$('msg-erreur').textContent = msgErreur;
				
			} else {
				listeBornes = objZap.bornes;
			}
		}
	}
} 

/* ===========================================================================
	Fonction: chargerArrondissement
	Description: Chargement des arrondissements à l'aide d'une requête AJAX.
*/	
function chargerArrondissement(){
	xhrArrond = new XMLHttpRequest();
	xhrArrond.onreadystatechange = chargerArrondCallback;
	
	var URL = 'http://yvan.wtf/zap-arrond.php?action=lister';
	xhrArrond.open('GET', URL, true);
	
	xhrArrond.send(null);
	controleurChargement("arrond");
}

/* ===========================================================================
	Fonction: chargerArrondCallback
	Description: Callback de la requête AJAX qui charge les arrondissements.
*/	
function chargerArrondCallback() {
	if ( xhrArrond.readyState == 4 ) {
		
		if ( xhrArrond.status != 200 ) {
			var msgErreur = 'Erreur (code=' + xhrArrond.status + '): La requête HTTP n\'a pu être complétée.';
			//$('msg-erreur').textContent = msgErreur;
			
		} else {
			// Document XML retourné.
			var docXML = xhrArrond.responseXML;
			var racineXML = docXML.documentElement;
			var i=0;
			var arrond;
			var coordsTemp;
			while(i < racineXML.children.length){
				arrond = racineXML.children[i];
				coordsTemp = arrond.lastElementChild.textContent;
				var coords = coordsTemp.substring(coordsTemp.indexOf('-'),coordsTemp.length - 2);

				listeArrond[i] = {"nom": arrond.children[1],
								"abreviation": arrond.children[2],
							   	"polygone":coords};
				i++;
			}
			polygoneArrond();
		}
	}
} 

/* ===========================================================================
	Fonction: chargerAvisCallback
	Description: Callback de la requête AJAX qui demande et affiche les
				 avis pour une ZAP.
*/	
function chargerAvisCallback() {
	if ( this.readyState == 4 ) {
		if ( this.status != 200 ) {
			var msgErreur = 'Erreur (code=' + this.status + '): La requête HTTP n\'a pu être complétée.';
			//$('msg-erreur').textContent = msgErreur;
			alert(msgErreur);
		} else {

			try { 
				objAvis = JSON.parse( this.responseText );
			} catch (e) {
				alert('ERREUR: La réponse AJAX n\'est pas une expression JSON valide:\r\n' + this.responseText);
				return;
			}			
			if ( objAvis.resultat == "erreur" ) {
				var msgErreur = 'Erreur: ' + objAvis.message;
				//$('msg-erreur').textContent = msgErreur;
				alert(msgErreur);
			} else {
				if (typeof this.marker.avis == "undefined"){
					this.marker.avis = objAvis.avis;
				}
				else{
					this.marker.avis.concat(objAvis.avis);
				}

				if (objAvis.avis.length === 0) {
					var	btnVoirPlusAvis = document.getElementById('btnVoirPlusAvis');
					btnVoirPlusAvis.style.visibility = 'collapse';

					var ulAvis = document.getElementById('ulAvis' + this.marker.borne.nom);
					ulAvis.style.height = '75%';
				}
				
				afficherAvis(this.marker);
			}
		}
	}
}

/* ===========================================================================
	Fonction: afficherAvis
	Description: Ajoute et affiche au maximun 3 avis de plus pour un marker.
*/	
function afficherAvis(marker){
	var divInfos = marker.divInfoWindow;

	var liChargement = document.getElementById('chargementAvis');
	if (liChargement != null){
		liChargement.parentNode.removeChild(liChargement);
	}

	var ulAvis = document.getElementById('ulAvis' + marker.borne.nom);

	var nbAvisAjoute = 0;

	for (var i = 0; i < marker.avis.length && nbAvisAjoute < 3; i++){
		var liAvis = document.getElementById("liAvis" + marker.avis[i].Id);
		if (liAvis === null){
			liAvis = document.createElement('li');
			liAvis.id = "liAvis" + marker.avis[i].Id;
			liAvis.textContent = marker.avis[i].texte;

			ulAvis.appendChild(liAvis);

			divInfos.scrollTop = divInfos.scrollHeight;

			nbAvisAjoute++;
		}
	}
}