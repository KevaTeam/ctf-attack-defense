<?php

/**
 * usersController is the controller to handle user requests.
 */

class UserController extends CController
{
	private $method = 'user';

	public function actionList()
	{
		if (!Yii::app()->params->log_in)
			Message::Error('You are not logged');

		$order = Yii::app()->request->getParam('order');
		if ($order != 'rating')
			$order = false;

		$select = 'id, role, nick, activated, rating';
		if (Yii::app()->params->scopes('admin'))
			$select = 'id, role, nick, activated, mail, rating, json_data, date_create, date_last_signin';

		$users = Users::model()->published($order)->paginator()->findAll(array(
			'select' => $select,
			//'condition' => 'deleted=0' //проверка на удаление 
		));
		
		$array = array();
		$count = 0;

		foreach($users as $value) {
			$count++;
			// False - return without null values;
			$item = $value->getAttributes(false);

			$item['passed'] = '0';
			$item['processing'] = '0';
			$array[] = $item;
		}

		Message::Success(array(
			'count' => $count,
			'items' => $array
		));
	}
	
	public function actionGet()
	{
		if (!Yii::app()->params->log_in)
			Message::Error('You are not logged');

		if (!Yii::app()->request->getParam('id'))
			Message::Error('Parameter id is missing');
		
		$select = 'id, nick, rating';
		if (Yii::app()->params->scopes('admin'))
			$select = 'id, role, nick, activated, mail, rating, json_data, date_create, date_last_signin';

		$users = Users::model()->findByPk(Yii::app()->request->getParam('id'),array(
			'select' => $select,
			'condition'=>'id=:id',
    		'params'=>array(':id'=> Yii::app()->request->getParam('id')),
		));

		if(empty($users))
			Message::Error('The user does not exist.');
		

		$quest_passed = UserQuest::model()->findAll(array(
			'condition'	=> 'user=:user',
			'params' => array(':user' => Yii::app()->request->getParam('id'))
		));

		$count_passed = 0;
		$count_processing = count($quest_passed);

		foreach($quest_passed as $value) {
			if($value->end_time > 0)
				$count_passed++;
		}
		$array = $users->getAttributes(false);

		$array['passed'] = $count_passed;
		$array['processing'] = $count_processing;

		Message::Success($array);
	}

	public function actionDelete()
	{
		if (!Yii::app()->params->log_in)
			Message::Error('You are not logged');

		if (!Yii::app()->params->scopes('admin'))
			Message::Error("You do not have sufficient permissions");

		if (!Yii::app()->request->getParam('id'))
			Message::Error('Parameter id is missing');

		$users = Users::model()->findByPk((int)Yii::app()->request->getParam('id'));

		if (empty($users))
			Message::Error('The user does not exist');

		$users->delete();

		Message::Success('1');
	}

	// Не готово
	public function actionEdit()
	{
		if (!Yii::app()->params->log_in)
			Message::Error('You are not logged');

		if (!Yii::app()->params->scopes('admin'))
			Message::Error("You do not have sufficient permissions");

		if (!Yii::app()->request->getParam('id'))
			Message::Error('Parameter id is missing');

		if (!Yii::app()->request->getParam('mail'))
			Message::Error("Mail is empty");

		if (!Yii::app()->request->getParam('nick'))
			Message::Error("Nick is empty");

		$users = Users::model()->findByPk((int)Yii::app()->request->getParam('id'));
		// $users = Users::model()->findByPk((int)Yii::app()->request->getParam('id'));
		
		if (empty($users))
			Message::Error('The user does not exist');
				
		$users->mail = Yii::app()->request->getParam('mail');
		$users->nick = Yii::app()->request->getParam('nick');
		$users->role = Yii::app()->request->getParam('role');

		if (Yii::app()->request->getParam('password') != '')
			$users->pass = CPasswordHelper::hashPassword(Yii::app()->request->getParam('password'));
		
		if ($users->save())
			Message::Success('1');
		else
			Message::Error($users->getErrors());
	}

	public function actionSearch() 
	{
		$nick = Yii::app()->request->getParam('nick');
		if (!$nick)
			Message::Error("Nick is empty");


		$users = Users::model()->search($nick)->paginator()->findAll(array(
		    'select' => 'id, role, nick, activated',
		));

		$array = array();
		$count = 0;

		foreach($users as $value) {
			$count++;
			// False - return without null values;
			$array[] = $value->getAttributes(false);
		}

		Message::Success(array(
			'count' => $count,
			'items' => $array
		));
	}
}