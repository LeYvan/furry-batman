<?php

	error_reporting(E_ALL);

	if (isset($argv[1]) && $argv[1] == 'debug')
	{
		$_GET['action'] = 'chercherBornes';
	}

	require("./include/bd.php");

	try
	{
		envoyerHeaders();
		controller();
	} 
	catch (Exception $e)
	{
		print("erreur: " . $e->getMessage());
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
		$objJSON = new stdClass();
		$objJSON->resultat = "ok";

		$bornes = new ListeBornes();
		$objJSON->bornes = $bornes->getAllBornes();

		print(json_encode($objJSON,JSON_UNESCAPED_UNICODE));
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
