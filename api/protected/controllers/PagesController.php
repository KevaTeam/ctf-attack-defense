<?php

/**
 * usersController is the controller to handle user requests.
 */

class PagesController extends CController
{
	private $method = 'pages';

	public function __construct() {
		if (!Yii::app()->params->log_in) {
			Message::Error('You are not logged');
		}
	}

	public function actionCreate()
	{
		if (!Yii::app()->request->getParam('title'))
			Message::Error("Title is empty");
		if (!Yii::app()->request->getParam('text'))
			Message::Error("Text is empty");

		$pages = new Pages;
		
		$pages->setIsNewRecord(true);

		$pages->title = Yii::app()->request->getParam('title');

		$pages->text = Yii::app()->request->getParam('text');

		$pages->owner = Yii::app()->params->user['user_id'];

		$pages->uuid = new CDbExpression('UUID()');
		$pages->date_create = new CDbExpression('NOW()');
		$pages->date_change = new CDbExpression('NOW()');

		if ($pages->save())
			Message::Success('1');
		else
			Message::Error($pages->getErrors());
	}

	public function actionList()
	{
		$pages = Pages::model()->findAll(array(
			'select' => 'id, title',
		));
		
		$array = array();
		$count = 0;

		foreach($pages as $value) {
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

		$pages = Users::model()->findByPk(Yii::app()->request->getParam('id'),array(
			'select' => 'id,title,text',
			'condition'=>'id=:id',
    		'params'=>array(':id'=> Yii::app()->request->getParam('id')),
		));

		if(empty($pages))
			Message::Error('The pages does not exist.');
		
		Message::Success($pages->getAttributes(false));
	}

	public function actionDelete()
	{
		if (!Yii::app()->request->getParam('id'))
			Message::Error('Parameter id is missing');

		$pages = Pages::model()->findByPk((int)Yii::app()->request->getParam('id'));

		if (empty($pages))
			Message::Error('The pages does not exist');

		$pages->delete();

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