if (typeof com === 'undefined')
	var com = {};

if (typeof com.dinfogarneau === 'undefined')
	com.dinfogarneau = {};

if (typeof com.dinfogarneau.cours526 === 'undefined')
	com.dinfogarneau.cours526 = {};


com.dinfogarneau.cours526.carte;
com.dinfogarneau.cours526.posUsager;
com.dinfogarneau.cours526.listeMarkers = [];
com.dinfogarneau.cours526.xhrZap;
com.dinfogarneau.cours526.xhrArrond;
// Position par défaut (Québec).
com.dinfogarneau.cours526.latDefaut = 46.803320;
com.dinfogarneau.cours526.longDefaut = -71.242773;


/* ===========================================================================
	Fonction: initCarte
	Description: Chargement de la carte.
*/
com.dinfogarneau.cours526.initCarte = function() {
	var optionsCarte = {
		"zoom": 12,
		"mapTypeId": google.maps.MapTypeId.ROADMAP,
		"mapTypeControlOptions": {style: google.maps.MapTypeControlStyle.DROPDOWN_MENU, 
									position: google.maps.ControlPosition.LEFT_TOP},
		"center": new google.maps.LatLng(com.dinfogarneau.cours526.latDefaut, com.dinfogarneau.cours526.longDefaut)
		};

	com.dinfogarneau.cours526.carte = new google.maps.Map(document.getElementById("carte-canvas"), optionsCarte);
};

/* ===========================================================================
	Fonction: verifierPosition
	Description: Vérifie si la géolocation est disponible. Si oui, une autre
				 fonction est appelée pour la récupérer.
*/
com.dinfogarneau.cours526.verifierPosition = function(){
	if ( typeof navigator.geolocation != "undefined" ) {
		console.log('Le navigateur supporte la géolocalisation.');
		navigator.geolocation.getCurrentPosition(com.dinfogarneau.cours526.getCurrentPositionSuccess, com.dinfogarneau.cours526.getCurrentPositionError, {});
		} else {
			console.log('Le navigateur NE supporte PAS la géolocalisation.');
			var positionInit = new google.maps.LatLng(latDefaut, longDefaut);
			com.dinfogarneau.cours526.carte.setCenter(positionInit);
		}	
};

/* ===========================================================================
	Fonction: repereUsager
	Description: Création du repère de l'usager sur la carte.
*/
com.dinfogarneau.cours526.repereUsager = function(lati, longi){
	var posRepere = new google.maps.LatLng(lati , longi);
	com.dinfogarneau.cours526.posUsager = posRepere;

	var optionsRepere = {
						"position": posRepere, 
						"map": com.dinfogarneau.cours526.carte,
						"icon": "images/male-2.png",
						"clickable": true,
						"draggable": false					
					};
	var repere = new google.maps.Marker(optionsRepere);

	com.dinfogarneau.cours526.filtrerZap();	
};

/* ===========================================================================
	Fonction: reperesZap
	Description: Création des repères pour les ZAP sur la carte à partir de la
				 liste des bornes.
*/
com.dinfogarneau.cours526.reperesZap = function(listeBornes){
	var distance; 
	var image;

	for (borne in listeBornes){	

		var posRepere = new google.maps.LatLng(listeBornes[borne].coord_y , listeBornes[borne].coord_x);

		var optionsRepere = {
							"position": posRepere,
							"map": com.dinfogarneau.cours526.carte,
							"icon": "images/wifi.png",
							"clickable": true,
							"draggable": false					
						};

		var repere = new google.maps.Marker(optionsRepere);

		repere.borne = listeBornes[borne];

		google.maps.event.addListener(repere,'click',com.dinfogarneau.cours526.evenementBorneClick);
	
		com.dinfogarneau.cours526.listeMarkers[com.dinfogarneau.cours526.listeMarkers.length] = repere;
	}
};

/* ===========================================================================
	Fonction: filtrerZap
	Description: Filtre les ZAP pour mettre en évidence celles qui sont dans 
				 un rayon de 5 km de l'usager.
*/
com.dinfogarneau.cours526.filtrerZap = function(){
	for (var i = 0; i < com.dinfogarneau.cours526.listeMarkers.length; i++) {
		var distance = google.maps.geometry.spherical.computeDistanceBetween(com.dinfogarneau.cours526.listeMarkers[i].position, com.dinfogarneau.cours526.posUsager);
		if(distance <= 5000){
			com.dinfogarneau.cours526.listeMarkers[i].setIcon("images/wifi-green.png");
			com.dinfogarneau.cours526.listeMarkers[i].setAnimation(google.maps.Animation.DROP);
		}
		else{
			com.dinfogarneau.cours526.listeMarkers[i].setIcon("images/wifi.png");
		}
	};
};

/* ===========================================================================
	Fonction: getCurrentPositionSuccess
	Description: Récupère la position de l'usager si la géolocalisation est 
				 supportée.
*/
com.dinfogarneau.cours526.getCurrentPositionSuccess = function(position) {	
	console.log('Position obtenue : ' + position.coords.latitude + ', ' + position.coords.longitude);
	var positionInit = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

	com.dinfogarneau.cours526.carte.setCenter(positionInit);

	com.dinfogarneau.cours526.repereUsager(position.coords.latitude, position.coords.longitude);
	com.dinfogarneau.cours526.afficherCerleZoneCouverte(positionInit);
};

/* ===========================================================================
	Fonction: getCurrentPositionError
	Description: Appelée lors de l'échec (refus ou problème) de la récupération 
				 de la position. Utilisation de la position par défaut.
*/	
com.dinfogarneau.cours526.getCurrentPositionError = function(erreur) {	
	console.log('Utilisation de la position par défaut.');
	var positionInit = new google.maps.LatLng(latDefaut, longDefaut);
	com.dinfogarneau.cours526.carte.setCenter(positionInit);
};

/* ===========================================================================
	Fonction: afficherCerleZoneCouverte
	Description: Affiche un cercle sur la carteautour de la position de 
				 l'usager.
*/	
com.dinfogarneau.cours526.afficherCerleZoneCouverte = function(positionUtilisateur){
	var cercleZAPoptions = {
      "strokeColor": '#000066',
      "strokeOpacity": 0.25,
      "strokeWeight": 2,
      "fillColor": '#000088',
      "fillOpacity": 0.150,
      "map": com.dinfogarneau.cours526.carte,
      "center": positionUtilisateur,
      "radius": 5000
    };

    var cityCircle = new google.maps.Circle(cercleZAPoptions);
};

/* ===========================================================================
	Fonction: chargerZap
	Description: Chargement des ZAP à l'aide d'une requête AJAX.
*/	
com.dinfogarneau.cours526.chargerZap = function() {	
	com.dinfogarneau.cours526.xhrZap = new XMLHttpRequest();
	com.dinfogarneau.cours526.xhrZap.onreadystatechange = com.dinfogarneau.cours526.chargerZapCallback;
	
	var URL = 'http://yvan.wtf/zap-bornes.php?action=chercherBornes';
	com.dinfogarneau.cours526.xhrZap.open('GET', URL, true);
	
	com.dinfogarneau.cours526.xhrZap.send(null);
	com.dinfogarneau.cours526.controleurChargement("zap");
};

/* ===========================================================================
	Fonction: chargerZapCallback
	Description: Callback de la requête AJAX qui charge les ZAP.
*/	
com.dinfogarneau.cours526.chargerZapCallback = function() {
	if ( com.dinfogarneau.cours526.xhrZap.readyState == 4 ) {
		
		if ( com.dinfogarneau.cours526.xhrZap.status != 200 ) {
			var msgErreur = 'Erreur (code=' + com.dinfogarneau.cours526.xhrZap.status + '): La requête HTTP n\'a pu être complétée.';
			//$('msg-erreur').textContent = msgErreur;
			
		} else {
			var objZap;
			try { 
				objZap = JSON.parse( com.dinfogarneau.cours526.xhrZap.responseText );
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
};

/* ===========================================================================
	Fonction: chargerArrondissement
	Description: Chargement des arrondissements à l'aide d'une requête AJAX.
*/	
com.dinfogarneau.cours526.chargerArrondissement = function(){
	com.dinfogarneau.cours526.xhrArrond = new XMLHttpRequest();
	com.dinfogarneau.cours526.xhrArrond.onreadystatechange = com.dinfogarneau.cours526.chargerArrondCallback;
	
	var URL = 'http://yvan.wtf/zap-arrond.php?action=lister';
	com.dinfogarneau.cours526.xhrArrond.open('GET', URL, true);
	
	com.dinfogarneau.cours526.xhrArrond.send(null);
	com.dinfogarneau.cours526.controleurChargement("arrond");
};

/* ===========================================================================
	Fonction: chargerArrondCallback
	Description: Callback de la requête AJAX qui charge les arrondissements.
*/	
com.dinfogarneau.cours526.chargerArrondCallback = function() {
	if ( com.dinfogarneau.cours526.xhrArrond.readyState == 4 ) {
		
		if ( com.dinfogarneau.cours526.xhrArrond.status != 200 ) {
			var msgErreur = 'Erreur (code=' + com.dinfogarneau.cours526.xhrArrond.status + '): La requête HTTP n\'a pu être complétée.';
			//$('msg-erreur').textContent = msgErreur;
			
		} else {
			// Document XML retourné.
			var docXML = com.dinfogarneau.cours526.xhrArrond.responseXML;
			var racineXML = docXML.documentElement;
			var i=0;
			var arrond;
			var coordsTemp;
			while(i < racineXML.children.length){
				arrond = racineXML.children[i];
				coordsTemp = arrond.lastElementChild.textContent;
				var coords = coordsTemp.substring(coordsTemp.indexOf('-'),coordsTemp.length - 2);

				com.dinfogarneau.cours526.listeArrond[i] = {"nom": arrond.children[1],
								"abreviation": arrond.children[2],
							   	"polygone":coords};
				i++;
			}
			
		}
	}
};

/* ===========================================================================
	Fonction: chargerAvisCallback
	Description: Callback de la requête AJAX qui demande et affiche les
				 avis pour une ZAP.
*/	
com.dinfogarneau.cours526.chargerAvisCallback = function() {
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
				
				com.dinfogarneau.cours526.afficherAvis(this.marker);
			}
		}
	}
};

/* ===========================================================================
	Fonction: afficherAvis
	Description: Ajoute et affiche au maximun 3 avis de plus pour un marker.
*/	
com.dinfogarneau.cours526.afficherAvis = function(marker){
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
};

/* ===========================================================================
	Fonction: envoyerAvisCallback
	Description: 
*/
com.dinfogarneau.cours526.envoyerAvisCallback = function(){

	if ( xhr.readyState == 4 ) {
		
		if ( xhr.status != 200 ) {
			var msgErreur = 'Erreur (code=' + xhr.status + '): La requête HTTP n\'a pu être complétée.';
			$('msgErreur').textContent = msgErreur;
	
		} else {
			try { 
				obj = JSON.parse( xhr.responseText );
			} catch (e) {
				$('msgErreur').textContent = 'ERREUR: La réponse AJAX n\'est pas une expression JSON valide.';
				return;
			}

			
		$('msgErreur').textContent = obj.message;
			
		}
		$('msgErreur').style.visibility = "visible";
	}
};