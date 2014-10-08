var listeBornes;
var listeMarkers = [];
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


