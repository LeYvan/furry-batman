<?php
require "config.php";

class wfBD
{
	public $connexion;

	/*
		Méthode: connexion
		Description: Établis une connexion à la BD, sauf si il en existe déjà une.
	*/
	public function connexion()
	{
		if ($connexion == null)
		{
			try 
			{
				$connexion = new PDO("mysql:host=$dbHote; dbname=$dbNom", 
									 $dbUtilisateur, 
									 $dbMotPasse, 
									 array(PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8"));

				$connexion->setAttribute(PDO::ATTR_ERRMODE, 
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
		Description: Lance une requête sur la BD et retourne le résultat.
	*/
	public function query($strSQL, $params)
	{
		try 
		{
			$req = $connexion->prepare($strSQL);
			$req->execute($params);
			$prepReqProf->setFetchMode(PDO::FETCH_OBJ);
		} 
		catch (PDOException $e) {
			throw new Exception("Requête à la BD impossible: " . $e->getMessage());
		}
	}
	//=========================================================================
}
?>