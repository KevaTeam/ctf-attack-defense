<?php

/**
 * usersController is the controller to handle user requests.
 */

class TeamsController extends CController
{
	private $method = 'teams';

	public function actionCreate()
	{
		if (!Yii::app()->params->log_in)
			Message::Error('You are not logged');

		if (!Yii::app()->request->getParam('nick'))
			Message::Error("Nick is empty");

		
		$teams = new Teams;

		$teams->setIsNewRecord(true);

		$teams->nick = Yii::app()->request->getParam('nick');
		$teams->host = Yii::app()->request->getParam('host');
		$teams->rating = Yii::app()->request->getParam('rating');

		$logo = Yii::app()->request->getParam('logo');
		$teams->logo = (!empty($logo) ? $logo : '');

		if ($teams->save())
			Message::Success(array('id' => $teams->id));
		else
			Message::Error($teams->getErrors());

	}


	public function actionList()
	{
		$teams = Teams::model()->published()->findAll(array(
			'select' => 'id, nick, logo, host, rating',
		));
		
		$array = array();
		$count = 0;

		foreach($teams as $value) {
			$count++;
			// False - return without null values;
			$array[] = $value->getAttributes(false);
		}

		Message::Success(array(
			'count' => $count,
			'items' => $array
		));
	}
	
	public function actionGet()
	{
		if (!Yii::app()->request->getParam('id'))
			Message::Error('Parameter id is missing');

		$id = (int)Yii::app()->request->getParam('id');
		$games = Teams::model()->findByPk($id,array(
			'select' => 'id, json_data, date_create, date_last_signin',
			'condition'=>'id=:id',
    		'params'=>array(':id'=> $id),
		));

		if(empty($games))
			Message::Error('The games does not exist.');
		
		Message::Success($games->getAttributes(false));
	}

	public function actionDelete()
	{
		if (!Yii::app()->params->log_in)
			Message::Error('You are not logged');

		if (!Yii::app()->params->scopes('admin'))
			Message::Error("You do not have sufficient permissions");


		$id = (int)Yii::app()->request->getParam('id');
		if (!$id) 
			Message::Error('Parameter id is missing');

		$teams = Teams::model()->findByPk($id);

		if (!$teams)
			Message::Error("The team doesn't exists");



		 $teams->delete();

		 Message::Success('1');
	}

	// Не готово
	public function actionSave()
	{
		if (!Yii::app()->request->getParam('id'))
			Message::Error('Parameter id is missing');

		if (!Yii::app()->request->getParam('nick'))
			Message::Error("Nick is empty");

		if (!Yii::app()->request->getParam('host'))
			Message::Error("Host is empty");

		if (!Yii::app()->request->getParam('rating'))
			Message::Error("Rating is empty");

		$id = (int)Yii::app()->request->getParam('id');

		// Пока зашитый id, в будущем берем по access_token
		$teams = Teams::model()->findByPk($id);

		if (empty($teams))
			Message::Error('The team does not exist');
				
		$teams->nick = Yii::app()->request->getParam('nick');
		$teams->logo = Yii::app()->request->getParam('logo');
		$teams->host = Yii::app()->request->getParam('host');
		$teams->rating = Yii::app()->request->getParam('rating');

		
		if ($teams->save())
			Message::Success('1');
		else
			Message::Error($teams->getErrors());
	}
}