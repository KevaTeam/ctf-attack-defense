<?php

/**
 * settingsController is the controller to handle user requests.
 */

class SettingsController extends CController
{
	private $method = 'settings';

	public function actionSet()
	{
		if (!Yii::app()->params->log_in)
			Message::Error('You are not logged');

		if (!Yii::app()->params->scopes('admin'))
			Message::Error("You do not have sufficient permissions");

		if(!Yii::app()->request->getParam('key')) {
			Message::Error("Parameter key is undefined");
		}

		if(!Yii::app()->request->getParam('value')) {
			Message::Error("Parameter value is undefined");
		}

		$key = Yii::app()->request->getParam('key');
		$value = Yii::app()->request->getParam('value');

		$settings = Settings::model()->findByPk($key, array(
			'select' => 'k, value',
		));
		
		$settings->value = $value;

		if ($settings->save()) {
			Message::Success($settings);
		}
		else
			Message::Error($settings->getErrors());

	}


	public function actionGet()
	{
		if (!Yii::app()->params->log_in)
			Message::Error('You are not logged');

		if (!Yii::app()->params->scopes('admin'))
			Message::Error("You do not have sufficient permissions");

		if(!Yii::app()->request->getParam('key')) {
			Message::Error("Parameter key is undefined");
		}

		$key = Yii::app()->request->getParam('key');

		$settings = Settings::model()->findByPk($key, array(
			'select' => 'k, value',
		));

		if(!$settings) {
			Message::Error("This key is not defined");
		}
		
		Message::Success($settings);
	}
}