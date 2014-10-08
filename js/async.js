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

function repereUsager(lati, longi)
{
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

function reperesZap(listeBornes)
{
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

}
		
// Fonction appelée lors de l'échec (refus ou problème) de la récupération de la position.
function getCurrentPositionError(erreur) {	
	// Utilisation de la position par défaut.
	console.log('Utilisation de la position par défaut.');
	var positionInit = new google.maps.LatLng(latDefaut, longDefaut);
	// Centrage de la carte sur la bonne coordonnée.
	carte.setCenter(positionInit);
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

// Callback de la requête AJAX qui demande et affiche les informations d'un professeur.
function chargerZapCallback() {
	// La requête AJAX est-elle complétée (readyState=4) ?
	if ( xhr.readyState == 4 ) {
		
		// La requête AJAX est-elle complétée avec succès (status=200) ?
		if ( xhr.status != 200 ) {
			// Affichage du message d'erreur.
			var msgErreur = 'Erreur (code=' + xhr.status + '): La requête HTTP n\'a pu être complétée.';
			//$('msg-erreur').textContent = msgErreur;
			
		} else {
			// Création de l'objet JavaScript à partir de l'expression JSON.
			// *** Notez l'utilisation de "responseText".
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