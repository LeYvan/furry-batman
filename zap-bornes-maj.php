<?php
	require("include/config.php");

	print("Récupération de la dernière version du fichier de la ville...\r\n");

	$strKml = file_get_contents('http://donnees.ville.quebec.qc.ca/Handler.ashx?id=29&f=KML');

	$objKml = new DOMDocument();
	$objKml->loadXML($strKml);

	$xpath = new DOMXpath($objKml);

	$xpath->registerNamespace('kml', "http://www.opengis.net/kml/2.2");

	$kmlBornes = $xpath->query("//kml:Folder[@id='kml_ft_WIFI']/kml:Placemark");

	print("Nombre de bornes trouvées: " . $kmlBornes->length . "\r\n");

	$listeBornes = array();

	$i = 0;
	foreach ($kmlBornes as $kmlBorne)
	{
		$i++;

		$objBorne = new stdClass();

		$objBorne->nom =      $xpath->query("kml:name",$kmlBorne)->item(0)->nodeValue;

		$objBorne->batiment = $xpath->query("kml:ExtendedData/kml:SchemaData/kml:SimpleData[@name='NOM_BATI']",$kmlBorne)->item(0)->nodeValue;
		$objBorne->rue =      $xpath->query("kml:ExtendedData/kml:SchemaData/kml:SimpleData[@name='RUE']",$kmlBorne)->item(0)->nodeValue;
		$objBorne->no_civ =   $xpath->query("kml:ExtendedData/kml:SchemaData/kml:SimpleData[@name='NO_CIV']",$kmlBorne)->item(0)->nodeValue;
		$objBorne->arrond =   $xpath->query("kml:ExtendedData/kml:SchemaData/kml:SimpleData[@name='ARROND']",$kmlBorne)->item(0)->nodeValue;

		$objBorne->pos_raw = $xpath->query("kml:Point/kml:coordinates", $kmlBorne)->item(0)->nodeValue;

		if (strlen($objBorne->pos_raw) > 0)
		{
			$objBorne->pos_arr  = explode(",", $objBorne->pos_raw);

			$objBorne->pos->x = $objBorne->pos_arr[0];
			$objBorne->pos->y = $objBorne->pos_arr[1];
			$objBorne->pos->z = $objBorne->pos_arr[2];

			$listeBornes[$i] = $objBorne;
		}
	}

	if (count($listeBornes) == 0)
	{
		die ("Rien à importer.");
	}

	$strSQL = "DELETE FROM bornes;";

	$bd = new PDO("mysql:host=$dbHote; dbname=$dbNom", 
					 $dbUtilisateur, 
					 $dbMotPasse, 
					 array(PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8"));

	$bd->setAttribute(PDO::ATTR_ERRMODE, 
						PDO::ERRMODE_EXCEPTION);

	$bd->exec($strSQL);

		
?>
