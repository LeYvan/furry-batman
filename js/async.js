// Référence à la carte Google (variable globale).
var carte;
var posUsager;
var listeMarkers = [];

// Position par défaut (Québec).
var latDefaut = 46.803320;
var longDefaut = -71.242773;

// Fonction responsable de charger la carte.
function initCarte() {
			
	// Object JSON pour les options de la carte.
	var optionsCarte = {
		"zoom": 12,
		"mapTypeId": google.maps.MapTypeId.ROADMAP,
		"mapTypeControlOptions": {style: google.maps.MapTypeControlStyle.DROPDOWN_MENU, 
									position: google.maps.ControlPosition.LEFT_TOP},
		"center": new google.maps.LatLng(latDefaut, longDefaut)
		};

	carte = new google.maps.Map(document.getElementById("carte-canvas"), optionsCarte);
}

function verifierPosition()
{
	// Est-ce que le navigateur supporte la géolocalisation ?
	if ( typeof navigator.geolocation != "undefined" ) {
		console.log('Le navigateur supporte la géolocalisation.');
		navigator.geolocation.getCurrentPosition(getCurrentPositionSuccess, getCurrentPositionError, {});
		} else {
			// Pas de support de la géolocalisation.
			console.log('Le navigateur NE supporte PAS la géolocalisation.');
			// Utilisation de la position par défaut.
			var positionInit = new google.maps.LatLng(latDefaut, longDefaut);
			// Centrage de la carte sur la bonne coordonnée.
			carte.setCenter(positionInit);
		}	
}

function repereUsager(lati, longi){
	// Position du repère.
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

function reperesZap(listeBornes){
	var distance; 
	var image;

	for (borne in listeBornes){	

		// Position du repère.
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

// Fonction appelée lors du succès de la récupération de la position.
function getCurrentPositionSuccess (position) {	
	// Utilisation de la position de l'utilisateur.
	console.log('Position obtenue : ' + position.coords.latitude + ', ' + position.coords.longitude);
	var positionInit = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
	// Centrage de la carte sur la bonne coordonnée.
	carte.setCenter(positionInit);

	//Appel de la fonction du repère
	repereUsager(position.coords.latitude, position.coords.longitude);

	afficherCerleZoneCouverte(positionInit);
}
		
// Fonction appelée lors de l'échec (refus ou problème) de la récupération de la position.
function getCurrentPositionError(erreur) {	
	// Utilisation de la position par défaut.
	console.log('Utilisation de la position par défaut.');
	var positionInit = new google.maps.LatLng(latDefaut, longDefaut);
	// Centrage de la carte sur la bonne coordonnée.
	carte.setCenter(positionInit);
}

function afficherCerleZoneCouverte(positionUtilisateur)
{
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

    // Add the circle for this city to the map.
    var cityCircle = new google.maps.Circle(cercleZAPoptions);
}

function chargerZap() {	
	// Création de l'objet XMLHttpRequest.
	xhr = new XMLHttpRequest();
	// Fonction JavaScript à exécuter lorsque l'état de la requête HTTP change.
	xhr.onreadystatechange = chargerZapCallback;
	
	// URL pour la requête HTTP avec AJAX (inclut le paramètre).
	var URL = 'http://yvan.wtf/zap-bornes.php?action=chercherBornes';
	
	// Préparation de la requête HTTP-GET en mode asynchrone (true).
	xhr.open('GET', URL, true);
	

	xhr.send(null);

	controleurChargement("zap");
}

// Callback de la requête AJAX qui charge les bornes ZAP
function chargerZapCallback() {
	// La requête AJAX est-elle complétée (readyState=4) ?
	if ( xhr.readyState == 4 ) {
		
		// La requête AJAX est-elle complétée avec succès (status=200) ?
		if ( xhr.status != 200 ) {
			// Affichage du message d'erreur.
			var msgErreur = 'Erreur (code=' + xhr.status + '): La requête HTTP n\'a pu être complétée.';
			//$('msg-erreur').textContent = msgErreur;
			
		} else {
			try { 
				objZap = JSON.parse( xhr.responseText );
			} catch (e) {
				alert('ERREUR: La réponse AJAX n\'est pas une expression JSON valide.');
				// Fin de la fonction.
				return;
			}			// Y a-t-il eu une erreur côté serveur ?
			if ( objZap.resultat == "erreur" ) {
				// Affichage du message d'erreur.
				var msgErreur = 'Erreur: ' + objZap.message;
				//$('msg-erreur').textContent = msgErreur;
				
			} else {
				//traitement afficher les ZAP
				listeBornes = objZap.bornes;
			}
		}
	}
} 

// Callback de la requête AJAX qui demande et affiche les avis sur une borne.
function chargerAvisCallback() {
	if ( this.readyState == 4 ) {

		// La requête AJAX est-elle complétée avec succès (status=200) ?
		if ( this.status != 200 ) {
			// Affichage du message d'erreur.
			var msgErreur = 'Erreur (code=' + this.status + '): La requête HTTP n\'a pu être complétée.';
			//$('msg-erreur').textContent = msgErreur;
			alert(msgErreur);
		} else {
			// Création de l'objet JavaScript à partir de l'expression JSON.
			// *** Notez l'utilisation de "responseText".
			try { 
				objAvis = JSON.parse( this.responseText );
			} catch (e) {
				alert('ERREUR: La réponse AJAX n\'est pas une expression JSON valide:\r\n' + this.responseText);
				// Fin de la fonction.
				return;
			}			// Y a-t-il eu une erreur côté serveur ?
			if ( objAvis.resultat == "erreur" ) {
				// Affichage du message d'erreur.
				var msgErreur = 'Erreur: ' + objAvis.message;
				//$('msg-erreur').textContent = msgErreur;
				alert(msgErreur);
			} else {
				//traitement afficher les ZAP
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

// Ajoute et affiche au maximun 3 avis de plus pour un marker.
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