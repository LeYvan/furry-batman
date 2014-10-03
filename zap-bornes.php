<?php
try
{
	envoyerHeaders();
	controller();
} 
catch (Exception $e)
{
	print("erreur");
}

//=============================================================================
// Description: Envoyer type contenu, charset.
function envoyerHeaders()
{
	header("Content-Type: text/json; charset=UTF-8");
}

//=============================================================================
// Description: Envoyer json de bornes extrait de BD.
function chercherBornes()
{
	$listBornes = new stdClass();

	$listeBornes->resultat = "ok";
	$listeBornes->bornes = array();

	$i = 0;
	while ($i < 10)
	{
		$listeBornes->bornes[$i] = new stdClass();

		$listeBornes->bornes[$i]->nom = "Borne_" .  $i;
		$listeBornes->bornes[$i]->pos->x = 90;
		$listeBornes->bornes[$i]->pos->y = 180;
		$i++;
	}

	print(json_encode($listeBornes,JSON_UNESCAPED_UNICODE));
}

//=============================================================================
// Description: Envoyer json d'erreur.
function afficherErreur()
{
	$retour = new stdClass();
	$retour->resultat = "erreur";
	$retour->message = "Requête invalide";

	print(json_encode($retour,JSON_UNESCAPED_UNICODE));
}

//=============================================================================
// Description: Déternime action selon requête http.
function controller()
{
	$controller = false;

	if (isset($_GET['action']))
        {
                // Checker si la requête est valide
                // SELECT dans la BD les bornes
		if ($_GET['action'] == 'chercherBornes')
		{
			chercherBornes();
			$controller = true;
		}
        }

	if (!$controller)
	{
		afficherErreur();
	}
}
?>
