<?php

require "param-bd.inc";

class ListeBornes 
{
	public $objConnexion;
	public $sql_listerBornes = "SELECT * FROM bornes";

	public $bornes;

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
		Description: Récupéré une liste de bornes de la BD.
	*/
	public function __construct()
	{
		$this->connexion();
		$this->bornes = array();

		try 
		{
			$req = $this->objConnexion->prepare($this->sql_listerBornes);
			$req->execute();
			$req->setFetchMode(PDO::FETCH_OBJ);

			while ($borne = $req->fetch())
			{
				$this->bornes[] = $borne;
			}
		} 
		catch (PDOException $e) {
			throw new Exception("Requête à la BD impossible: " . $e->getMessage());
		}
	}
	//=========================================================================

	/*
		Méthode: getAllBornes
	*/
	public function getAllBornes()
	{
		return $this->bornes;
	}
	//=========================================================================

}
?>
