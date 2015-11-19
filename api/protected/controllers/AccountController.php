<?php

/**
 * usersController is the controller to handle user requests.
 */

class AccountController extends CController
{
	private $method = 'account';

	public function __construct() {
		if (!Yii::app()->params->log_in) {
			Message::Error('You are not logged');
		}
	}
	public function actionGetProfileInfo()
	{
		$id = Yii::app()->params->user['user_id'];
		$user = Users::model()->findByPk($id,array(
			'select' => 'id, role, nick, mail, activated, json_data, date_create, date_last_signin',
			'condition'=>'id=:id',
    		'params'=>array(':id'=> $id),
		));

		if(empty($user))
			Message::Error('The user does not exist.');
		
		Message::Success($user->getAttributes(false));
	
	}

	public function actionSaveProfileInfo()
	{
		if (!Yii::app()->request->getParam('mail'))
			Message::Error("Mail is empty");

		if (!Yii::app()->request->getParam('nick'))
			Message::Error("Nick is empty");
		
		$users = Users::model()->findByPk((int)Yii::app()->params->user['user_id']);

		if (empty($users))
			Message::Error('The user does not exist');
				
		$users->mail = Yii::app()->request->getParam('mail');
		$users->nick = Yii::app()->request->getParam('nick');
		$users->json_data = Yii::app()->request->getParam('json_data');

		$users->date_last_signup = new CDbExpression('NOW()');


		if ($users->save())
			Message::Success('1');
		else
			Message::Error($users->getErrors());		
	}

	public function actionChangePassword()
	{
		if (!Yii::app()->request->getParam('newpass'))
			Message::Error("newpass is empty");
		if (!Yii::app()->request->getParam('oldpass'))
			Message::Error("oldpass is empty");

		$id = Yii::app()->params->user['user_id'];
		$newpass = Yii::app()->request->getParam('newpass');
		$oldpass = Yii::app()->request->getParam('oldpass');

		$users = Users::model()->findByPk($id);
		
		if (empty($users))
			Message::Error('The user does not exist');
		
		if ($oldpass==$newpass)
			Message::Error('Passwords are matches');

		if (!CPasswordHelper::verifyPassword($oldpass, $users->pass))
			Message::Error('Password is incorrect');
		
		$pass = CPasswordHelper::hashPassword($newpass);

		Users::model()->updateByPk($id, array('pass' => $pass));
		Message::Success('1');
	}

}