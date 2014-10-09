<?php

require "param-bd.inc";

class ListeAvis 
{
	public $objConnexion;
	public $sql_listerAvis = "SELECT * FROM avis WHERE nom=:borne";
	//public $sql_posterAvis = "INSERT INTO avis (nom,texte) VALUES (:borne, @texte);";

	public $avis;

	public $strSQL;

	/* ===========================================================================
		Méthode: connexion
		Description: Établis une connexion à la BD, sauf si il en existe déjà une.
	*/
	public function connexion()
	{

		global $dbHote, $dbNom, $dbUtilisateur, $dbMotPasse;

		if ($this->objConnexion == null)
		{
			try 
			{
				$this->objConnexion = new PDO("mysql:host=$dbHote; dbname=$dbNom", 
									 $dbUtilisateur, 
									 $dbMotPasse, 
									 array(PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8"));

				$this->objConnexion->setAttribute(PDO::ATTR_ERRMODE, 
							    PDO::ERRMODE_EXCEPTION);

			} 
			catch (PDOException $e) 
			{
				throw new Exception("Connexion à la BD impossible: " . $e->getMessage());
			}
		}
	}
	//=========================================================================

	/*
		Méthode: connexion
		Description: Récupérer une liste d'avis de la BD selon le nom de 
			     borne passé en paramètre.
	*/
	public function __construct($borne, $filtre)
	{
		$this->connexion();
		$this->avis = array();

		try 
		{
			if (strlen($filtre) > 0)
			{
				$req = $this->preparerFiltre($this->objConnexion,$filtre);
			}
			else
			{
				$req = $this->objConnexion->prepare($this->sql_listerAvis);
			}
			
			$req->bindParam(':borne', $borne);

			$req->execute();

			$req->setFetchMode(PDO::FETCH_OBJ);

			while ($unAvis = $req->fetch())
			{
				$this->avis[] = $unAvis;
			}
		} 
		catch (PDOException $e) {
			$test = new Exception("Requête à la BD impossible: " . $e->getMessage());
			$test->debugObjet = $this;
			throw $test;
		}
	}
	//=========================================================================


	private function preparerFiltre($objCon, $filtre)
	{
		$strSQL = $this->sql_listerAvis . " AND Id NOT IN (";

		$lesFiltres = explode(",",$filtre);

		for ($i = 0; $i < count($lesFiltres); $i++)
		{
			$strSQL = $strSQL . ":filtre_" . $lesFiltres[$i] . " ";
			if ($i < count($lesFiltres) - 1)
			{
				$strSQL = $strSQL . ", ";
			}
		}

		$strSQL = $strSQL . ")";

		$req = $objCon->prepare($strSQL);

		for ($i = 0; $i < count($lesFiltres); $i++)
		{
			$strNomFiltre = ":filtre_" . $lesFiltres[$i];

			$req->bindParam($strNomFiltre, $lesFiltres[$i]);
		}

		
		return $req;
	}


	/*
		Méthode: getAllAvis
	*/
	public function getAllAvis()
	{
		return $this->avis;
	}
	//=========================================================================

}
?>
