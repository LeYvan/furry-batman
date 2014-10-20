<?php

require "param-bd.inc";

class PostAvis 
{
	private $objConnexion;
	private $sql_ajouterAvis = "INSERT INTO avis (nom, texte) VALUES (:nom,:text);";

	private $succes;

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
	public function __construct($borne, $text)
	{
		$this->connexion();
	
		try 
		{
			$req = $this->objConnexion->prepare($this->sql_ajouterAvis);
			$req->bindParam(':nom', $borne);
			$req->bindParam(':text', $text);
			
			$this->succes = $req->execute();
		} 
		catch (PDOException $e) {
			$test = new Exception("Requête à la BD impossible: " . $e->getMessage());
			$test->debugObjet = $this;
			throw $test;
		}
	}
	//=========================================================================

	/*
		Méthode: getResultat
	*/
	public function getSucces()
	{
		return $this->succes;
	}
	//=========================================================================

}
?>
