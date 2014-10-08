// Permet de charger de manière asynchrone un script
// et d'appeler une fonction de callback après le chargement.
function chargerScriptAsync(urlFichier, callbackFct) {
	var script = document.createElement('script');
	script.src = urlFichier;
	script.async = true;
	// Fonction de callback (optionnel) après le chargement asynchrone du script.
	if (typeof callbackFct == "function") {
		script.addEventListener('load', callbackFct, false);
	}
	document.documentElement.firstChild.appendChild(script);
}

console.log('util.js: Script synchrone chargé.');

// Raccourci pour la fonction "getElementById".
// Retourne l'objet correspondant à l'identifiant (attribut id) reçu en paramètre.
function $(idElem) {
	return document.getElementById(idElem);
}

// Fonction permettant de voir le code HTML d'un objet DOM reçu en paramètre.
// Utile pour le debogage uniquement.
function voirCode(objDOM) {			
	// Utilisation de la propriété "outerHTML" si elle est disponible (nouveauté HTML5).
	if ( typeof  objDOM.outerHTML  !=  "undefined" )
		alert("Code HTML de l'objet DOM\n" + objDOM.outerHTML);
	else
		// Utilisation de la propriété "innerHTML" vu que "outerHTML" n'est pas disponible.
		alert("Code HTML de l'intérieur de l'objet DOM (EXCLUANT la racine de l'élément)\n" + objDOM.innerHTML);
}
