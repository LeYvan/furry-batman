<?php	

	error_reporting(0);

	if (isset($argv[1]) && $argv[1] == 'debug')
	{
		$_GET['action'] = 'lister';
	}

	try
	{
		envoyerHeaders();
		controller();
	} 
	catch (Exception $e)
	{
		afficherErreur("erreur: " . $e->getMessage());
	}

	//=============================================================================
	// Description: Envoyer type contenu, charset.
	function envoyerHeaders()
	{
		header("Content-Type: text/xml; charset=UTF-8");
		header("Access-Control-Allow-Origin: http://localhost");
	}

	//=============================================================================
	function listerArrondissements()
	{
		$strXML = recupererXmlDocVille();
		print($strXML);
	}

	//=============================================================================
	// Description: Envoyer xml résultat post d'avis.
	function recupererXmlDocVille()
	{
		try
		{
			$strXML = $strKml = file_get_contents('http://donnees.ville.quebec.qc.ca/Handler.ashx?id=2&f=XML');
			if (strlen($strXML) > 0)
			{
				return $strXML;
			}
			else
			{
				afficherErreur("Fichier de la ville impossible à récupérer.");
			}

		} 
		catch(Exception $e)
		{
			afficherErreur("Erreur système.");
		}
	}

			

	//=============================================================================
	// Description: Envoyer json d'erreur.
	function afficherErreur($message = 'Requête invalide')
	{
		print("<?xml version=\"1.0\" encoding = \"UTF-8\" ?>\r\n");
		print("<xml xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\">\r\n");
		print("	<resultat>erreur</resultat>\r\n");
		print("	<message>$message</message>\r\n");
		print("</xml>\r\n");
	}

	//=============================================================================
	// Description: Déternime action selon requête http.
	function controller()
	{
		$controller = false;

		if (isset($_GET['action']))
		{
			if ($_GET['action'] == 'lister')
			{
				listerArrondissements();
				$controller = true;
			}
		}

		if (!$controller)
		{
			afficherErreur();
		}
	}
?>
