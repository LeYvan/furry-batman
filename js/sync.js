var listeBornes;
var listeMarkers = [];
var infoWindow;

// Indique quels éléments ont déjà été chargés.
var elementsCharges = {"dom": false, "api-google-map": false, "zap": false};
window.addEventListener('load',init, false);

chargerZap();

function init()
{
	$("boutonOptions").addEventListener('click', showOptions, false);
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
function showOptions()
{
	var panel = $("options");
	if(panel.style.visibility == "hidden")
	{
		panel.style.visibility = "visible";
	}
	else
	{
		panel.style.visibility = "hidden";
	}
}

// Appeller quand click borne.
function evenementBorneClick()
{
	var infoWinow = creerInfoWindowBorne(this);
	infoWindow.open(carte,this);
}

// Appeller pour créer fenêtre info borne.
function creerInfoWindowBorne(marker)
{
	var unDiv = document.createElement('div');
	var unH1 = document.createElement('h1');

	unH1.textContent = marker.borne.nom;
	unDiv.appendChild(unH1);

	var divInfos = document.createElement('div');
	unDiv.appendChild(divInfos);

	var spanArrond = document.createElement('p');
	spanArrond.textContent = "Arrondissement: " + marker.borne.arrond;
	divInfos.appendChild(spanArrond);

	var spanBatiment = document.createElement('p');
	spanBatiment.textContent = "Bâtiment: " + marker.borne.batiment;
	divInfos.appendChild(spanBatiment);

	var spanRue = document.createElement('p');
	spanRue.textContent = "Rue: " + marker.borne.rue;
	divInfos.appendChild(spanRue);

	var spanNoCivic = document.createElement('p');
	spanNoCivic.textContent = "No. Civic: " + marker.borne.noCivic;
	divInfos.appendChild(spanNoCivic);

	var listeAvis = document.createElement('ul');
	var liChargement = document.createElement('li');
	liChargement.id = "chargementAvis";
	liChargement.textContent = "Chargement des avis...";
	listeAvis.appendChild(liChargement);
	unDiv.appendChild(listeAvis);

	var btnVoirPplusDavis = document.createElement('span');
	btnVoirPplusDavis.style.display = "inline-bloc";
	btnVoirPplusDavis.style.backgroundColor = 'gray';
	btnVoirPplusDavis.textContent = "Voir plus d'avis";
	btnVoirPplusDavis.addEventListener('click',function(){alert("!");});
	unDiv.appendChild(btnVoirPplusDavis);

	marker.unDiv = unDiv;

	chargerAvisBorne(marker);

	if (typeof infoWindow != "undefined") infoWindow.close();

	infoWindow = new google.maps.InfoWindow({
		"content": unDiv 
	});
	
	return infoWindow;//.open(carte,this);
}

function chargerAvisBorne(borne)
{
	borne.xhr = new XMLHttpRequest();
	borne.xhr.onreadystatechange = chargerAvisCallback;
	borne.xhr.borne = borne;

	var URL = 'http://yvan.wtf/zap-avis.php?action=chercherAvis&borne=' + borne.nom;

	borne.xhr.open('GET', URL, true);
	borne.xhr.send(null);
}