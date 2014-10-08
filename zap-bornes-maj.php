<?php
	error_reporting(0);
	
	require("include/param-bd.inc");

	print("Récupération de la dernière version du fichier de la ville...\r\n");

	$strKml = file_get_contents('http://donnees.ville.quebec.qc.ca/Handler.ashx?id=29&f=KML');

	$objKml = new DOMDocument();
	$objKml->loadXML($strKml);

	$xpath = new DOMXpath($objKml);

	$xpath->registerNamespace('kml', "http://www.opengis.net/kml/2.2");

	$kmlBornes = $xpath->query("//kml:Folder[@id='kml_ft_WIFI']/kml:Placemark");

	print("Nombre de bornes trouvées: " . $kmlBornes->length . ".\r\n");

	$listeBornes = array();

	for ($i = 0; $i < $kmlBornes->length; $i++)
	{
		$kmlBorne = $kmlBornes->item($i+1);

		$objBorne = new stdClass();

		$objBorne->nom =      $xpath->query("kml:name",$kmlBorne)->item(0)->nodeValue;

		$objBorne->batiment = $xpath->query("kml:ExtendedData/kml:SchemaData/kml:SimpleData[@name='NOM_BATI']",$kmlBorne)->item(0)->nodeValue;
		$objBorne->rue =      $xpath->query("kml:ExtendedData/kml:SchemaData/kml:SimpleData[@name='RUE']",$kmlBorne)->item(0)->nodeValue;
		$objBorne->noCivic =  $xpath->query("kml:ExtendedData/kml:SchemaData/kml:SimpleData[@name='NO_CIV']",$kmlBorne)->item(0)->nodeValue;
		$objBorne->arrond =   $xpath->query("kml:ExtendedData/kml:SchemaData/kml:SimpleData[@name='ARROND']",$kmlBorne)->item(0)->nodeValue;

		$objBorne->pos_raw = $xpath->query("kml:Point/kml:coordinates", $kmlBorne)->item(0)->nodeValue;

		if (strlen($objBorne->pos_raw) > 0)
		{
			$objBorne->pos_arr  = explode(",", $objBorne->pos_raw);

			$objBorne->pos->x = $objBorne->pos_arr[0];
			$objBorne->pos->y = $objBorne->pos_arr[1];

			unset($objBorne->pos_raw);

			$listeBornes[$i] = $objBorne;
		}
	}

	if (count($listeBornes) == 0)
	{
		die ("Rien à importer.");
	}

	print("Nombre de bornes valides: " . count($listeBornes) . ".\r\n" .
	      "Supression des anciennes bornes...");

	try 
	{
		
		$bd = new PDO("mysql:host=$dbHote; dbname=$dbNom", 
				$dbUtilisateur, 
				$dbMotPasse, 
				array(PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8"));

		$bd->setAttribute(PDO::ATTR_ERRMODE, 
				PDO::ERRMODE_EXCEPTION);

		$strSQL = "CREATE TABLE IF NOT EXISTS bornes (
				Id int(11) NOT NULL AUTO_INCREMENT,
				arrond varchar(25) NOT NULL,
				batiment varchar(30) NOT NULL,
				rue int(75) NOT NULL,
				noCivic varchar(10) NOT NULL,
				nom varchar(10) NOT NULL,
				coord_x double NOT NULL,
				coord_y double NOT NULL,
				PRIMARY KEY (`Id`)
				);";

		$bd->exec($strSQL);

		$strSQL = "DELETE FROM bornes;";
		
		$bd->exec($strSQL);

		print("Ok!\r\n");

	} catch (PDOException $pdo_e) 
	{
		print ("\r\nErreur lors de la tentative de CREATE/DELETE sur la table 'bornes'.\r\nTerminaison du script d'importation...\r\n");
		exit();
	}

	$strSQL = "INSERT INTO bornes (arrond, batiment, rue, noCivic, nom, coord_x, coord_y)\r\n" . 
		  "VALUES \r\n";

	foreach ($listeBornes as $index => $borne)
	{
		// Effectue insertion multiple.
		// Requête préparées non efficace dans ce scénario.
		$borne->nom = $bd->quote($borne->nom);
		$borne->batiment = $bd->quote($borne->batiment);
		$borne->rue = $bd->quote($borne->rue);
		$borne->noCivic = $bd->quote($borne->noCivic);
		$borne->arrond = $bd->quote($borne->arrond);

		$strSQL = $strSQL . "({$borne->arrond},{$borne->batiment},{$borne->rue},{$borne->noCivic},{$borne->nom},{$borne->pos->x},{$borne->pos->y})";

		if ($index < count($listeBornes))
		{
			$strSQL = $strSQL . ", \r\n";
		}
		else
		{
			$strSQL = $strSQL . "\r\n;";
		}
	}

	try 
	{
		$resulta = $bd->exec($strSQL);
	}
	catch (PDOException $pdo_e)
	{
		print ("Erreur lors de la tentative d'insertion dans la table 'bornes'.\r\nTerminaison du script d'importation...\r\n");
		exit();

	}

	print("La mise à jour de la base de donnée des bornes ZAP s'est effectuée correctement!\r\n");
?>
