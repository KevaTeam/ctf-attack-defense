<?php

/**
 * usersController is the controller to handle user requests.
 */

class GamesController extends CController
{
	private $method = 'games';

	public function __construct() {
		if (!Yii::app()->params->log_in) {
			Message::Error('You are not logged');
		}
	}

	public function actionCreate()
	{
		if (!Yii::app()->params->scopes('admin'))
			Message::Error("You do not have sufficient permissions");

		if (!Yii::app()->request->getParam('title'))
			Message::Error("Title is empty");

		$games = new Games;
		
		$games->setIsNewRecord(true);

		$games->title = Yii::app()->request->getParam('title');

		if (Yii::app()->request->getParam('logo'))
			$games->logo = Yii::app()->request->getParam('logo');

		// В первой версии у нас не будет типов игр
		$games->type_game = 1;

		$games->date_create = new CDbExpression('NOW()');
		$games->date_change = new CDbExpression('NOW()');
		
		if (Yii::app()->request->getParam('date_start'))
			$games->date_start = Yii::app()->request->getParam('date_start'); // Нужно проверить
		else
			$games->date_start = new CDbExpression('NOW()');

		if (Yii::app()->request->getParam('date_stop'))
			$games->date_stop = Yii::app()->request->getParam('date_stop'); // Нужно проверить
		else
			$games->date_stop = time(); // не работает!

		$games->rating = 0;
		$games->owner = Yii::app()->params->user['user_id'];

		$games->uuid_game = new CDbExpression('UUID()');

		$games->json_data = CJSON::encode(array());
		$games->json_security_data = CJSON::encode(array());

		$games->rules = Yii::app()->request->getParam('rules');

		if ($games->save())
			Message::Success('1');
		else
			Message::Error($games->getErrors());
	}

	public function actionList()
	{
		$games = Games::model()->findAll(array(
			'select' => 'id, title, owner, rules, date_start',
		));
		
		$array = array();
		$count = 0;

		foreach($games as $value) {
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

		$games = Games::model()->findByPk(Yii::app()->request->getParam('id'),array(
			'select' => 'id, title, owner, rules, date_start'
		));

		if(empty($games))
			Message::Error('The games does not exist.');
		
		Message::Success($games->getAttributes(false));
	}

	public function actionDelete()
	{
		if (!Yii::app()->request->getParam('id'))
			Message::Error('Parameter id is missing');

		$games = Games::model()->findByPk((int)Yii::app()->request->getParam('id'));

		if (empty($games))
			Message::Error('The games does not exist');

		$games->delete();

		Message::Success('1');
	}

	public function actionSave()
	{
		if (!Yii::app()->request->getParam('id'))
			Message::Error('Parameter id is missing');

		if (!Yii::app()->request->getParam('title'))
			Message::Error("title is empty");

		if (!Yii::app()->request->getParam('text'))
			Message::Error("text is empty");

		$pages = Pages::model()->findByPk(19);
		
		if (empty($pages))
			Message::Error('The pages does not exist');
				
		$pages->title = Yii::app()->request->getParam('title');
		$pages->text = Yii::app()->request->getParam('text');

		
		if ($pages->save())
			Message::Success('1');
		else
			Message::Error($pages->getErrors());
	}
	
	
}