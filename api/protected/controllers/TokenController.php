<?php

/**
 * TokenController is the controller to handle user requests.
 */

class TokenController extends CController
{
	private $method = 'token';
	// 	Авторизация
 	public function actionAuth()
	{
		if (!Yii::app()->request->getParam('client_id')) 
			Message::Error('Parameter client_id is missing');
		if (!Yii::app()->request->getParam('password'))
			Message::Error('Parameter password is missing');

		if (!Yii::app()->request->getParam('username'))
			Message::Error('Parameter username is missing');

		$user=Users::model()->findByAttributes(array(
				'nick' => Yii::app()->request->getParam('username'),
			)
		);

		if (!$user)
			Message::Error('Username or password is incorrect');
		
		if (!CPasswordHelper::verifyPassword(Yii::app()->request->getParam('password'), $user->pass))
			Message::Error('Username or password is incorrect');
		// Пока закомментировано
		// Логин и пароль совпали
		$token = new Access_Tokens();
		$token->clearOldTokens($user->id);

		$obj = $token->setToken($user->id, $user->role);

		Message::Simple(
			array(
				'access_token' => $obj->access_token,
				'user_id' => $obj->user_id,
				'expires_in' => $obj->expires_in,
				'role' => $user->role
			)
		);

		Message::Error('it\'s ok');

		// $users->setIsNewRecord(true);

		// $users->role = 1;

		// $users->uuid = new CDbExpression('UUID()');
		// $users->pass = CPasswordHelper::hashPassword(Yii::app()->request->getParam('password'));
		// $users->mail = Yii::app()->request->getParam('mail');
		// $users->json_data = CJSON::encode(array());
		// $users->date_activated = false;
		// $users->rating = 0;
		// $users->activated = 0;
		// $users->activation_code = uniqid(); // Случайное число
		// $users->nick = Yii::app()->request->getParam('nick');

		// $users->date_create = new CDbExpression('NOW()');
		// $users->date_last_signup = new CDbExpression('NOW()');

		// if ($users->save())
		// 	Message::Success(array('id' => $users->id));
		// else
		// 	Message::Error($users->getErrors());

	}
	/**
	 * Index action is the default action in a controller.
	 */
	public function actionIndex()
	{
		echo 'Hello World';
	}
}