<?php

require "param-bd.inc";

class ListeAvis 
{
	public $objConnexion;
	public $sql_listerAvis = "SELECT * FROM avis WHERE nom=:borne;";
	//public $sql_posterAvis = "INSERT INTO avis (nom,texte) VALUES (:borne, @texte);";

	public $avis;

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
	public function __construct($borne)
	{
		$this->connexion();
		$this->avis = array();

		try 
		{
			$req = $this->objConnexion->prepare($this->sql_listerAvis);
			$req->execute(array(':borne' => $borne));
			$req->setFetchMode(PDO::FETCH_OBJ);

			while ($unAvis = $req->fetch())
			{
				$this->avis[] = $unAvis;
			}
		} 
		catch (PDOException $e) {
			throw new Exception("Requête à la BD impossible: " . $e->getMessage());
		}
	}
	//=========================================================================

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
