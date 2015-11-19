<?php

/**
 * AuthController is the controller to handle user requests.
 */

class AuthController extends CController
{
	private $method = 'auth';
// 	Регистрация
 	public function actionSignup()
	{
		if (!Yii::app()->params->registration_allow)
			Message::Error('Registration is closed');

		if (!Yii::app()->request->getParam('password'))
			Message::Error('Parameter password is missing');

		if (!Yii::app()->request->getParam('nick'))
			Message::Error('Parameter nick is missing');

		if (!Yii::app()->request->getParam('mail'))
			Message::Error('Parameter mail is missing');

		if (!Yii::app()->request->getParam('university'))
			Message::Error('Parameter university is missing');


		$validator = new CEmailValidator;
		if (!$validator->validateValue(Yii::app()->request->getParam('mail')))
			Message::Error('It is not mail');
		
		$users = new Users;

		$users->setIsNewRecord(true);

		// Возможность устанавливать роль только для администратора
		if(Yii::app()->params->log_in && Yii::app()->params->scopes('admin'))
			$users->role = (((int)Yii::app()->request->getParam('role') == 2) ? 2 : 1);
		else
			$users->role = 1;


		$users->uuid = new CDbExpression('UUID()');
		$users->pass = CPasswordHelper::hashPassword(Yii::app()->request->getParam('password'));
		$users->mail = Yii::app()->request->getParam('mail');
		$users->json_data = CJSON::encode(array('university' => Yii::app()->request->getParam('university')));
		$users->date_activated = false;
		$users->activated = 0;
		$users->activation_code = uniqid(); // Случайное число
		$users->nick = Yii::app()->request->getParam('nick');
		$users->rating = 0;
		$users->date_create = new CDbExpression('NOW()');
		$users->date_last_signin = new CDbExpression('NOW()');
		
		// Потенциальная уязвимость!!!
		$users->ip = $_SERVER['REMOTE_ADDR'];
		if ($users->save())
			Message::Success(array('id' => $users->id));
		else
			Message::Error($users->getErrors());

	}

	public function actionRestore() 
	{
		$mail = Yii::app()->request->getParam('mail');
		if (!$mail)
			Message::Error('Parameter mail is missing');
		
		$validator = new CEmailValidator;
		if (!$validator->validateValue($mail))
			Message::Error('It is not mail');

		$users = Users::model()->findByAttributes(array('mail' => $mail));	
		if (!$users)
			Message::Error('User not found');

		// $users->activation_code = uniqid();

		// print_r(Yii::app());
		EMail::mailsend(array(
			'subject' => 'Restore password to your account on FreeHackQuest.',
			'to' => $mail,
			'text' => 'Restore: </br>

	Somebody (may be you) reseted your password on ' . Yii::app()->name.'</br>
	Your new password: test</br>'

			));
		//$users->save();
			Message::Success(array('success' => true));
	}
}