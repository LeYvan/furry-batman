<?php	

	error_reporting(0);

	if (isset($argv[1]) && $argv[1] == 'debug')
	{
		if ($argv[2] == 'chercherAvis')
		{
			$_GET['action'] = 'chercherAvis';
			$_GET['borne'] = $argv[3];

			$_GET['dejaChargee'] = $argv[4];
		}

		if ($argv[2] == 'posterAvis')
		{
			$_POST['action'] = 'posterAvis';
			$_POST['borne'] = $argv[3];
			$_POST['text'] = $argv[4];
		}
	}

	require("./include/listeAvis.php");
	require("./include/postAvis.php");

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
		header("Access-Control-Allow-Origin: http://localhost");
	}

	//=============================================================================
	// Description: Envoyer json de bornes extrait de BD.
	function chercherAvis($borne)
	{
		$objJSON = new stdClass();
		$objJSON->resultat = "ok";
		$objJSON->borne = $borne;

		$strFiltre = "";

		if (isset($_GET['dejaChargee']))
		{
			$strFiltre = $_GET['dejaChargee'];
		}

		$avis = new ListeAvis($borne,$strFiltre);
		$objJSON->avis = $avis->getAllAvis();

		print(json_encode($objJSON,JSON_UNESCAPED_UNICODE));
	}

	//=============================================================================
	// Description: Envoyer json résultat post d'avis.
	function posterAvis($borne, $text)
	{
		$objPost = new PostAvis($borne, $text);
		
		$objJSON = new stdClass();
		$objJSON->resultat = $objPost->getSucces() ? "ok" : "erreur";
		$objJSON->message = $objPost->getSucces() ? "avis ajouté" : "une erreur est survenue lors de l'ajout de l'avis.";

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

		if (isset($_GET['action']) || isset($_POST['action']))
		{
			if ($_GET['action'] == 'chercherAvis' && isset($_GET['borne']))
			{
				chercherAvis($_GET['borne']);
				$controller = true;
			} 
			
			if ($_POST['action'] == 'posterAvis' && 
			    isset($_POST['borne']) &&
			    isset($_POST['text'])) 
			{
				posterAvis($_POST['borne'], $_POST['text']);
				$controller = true;
			}
		}

		if (!$controller)
		{
			afficherErreur();
		}
	}
?>
