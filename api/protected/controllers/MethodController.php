<?php

/**
 * MethodController is the default controller to handle method requests.
 */
class MethodController extends CController
{
	/**
	 * Format response data
	 */
	private $format = 'json';
	/**
	 * Index action is the default action in a controller.
	 */
	public function actionIndex()
	{
		echo 'Empty';
	}
	public function actionCreate()
	{
		echo 'Hello World';
	}

	public function actionRead()
	{
		$model = $this->getModel();

		

		$array = array('model'=>$model);

		echo $this->decodeMessage($array);
	}

	public function actionDelete()
	{
		echo 'Hello World';
	}

	public function actionUpdate()
	{
		echo 'Hello World';
	}

	private function getModel() 
	{
		$model = $_GET['model'];
		return $model;
	}

	private function decodeMessage($array)
	{
		if(!is_array($array)) 
			exit('Return parameters is not array');

		$message = CJSON::encode($array);
		return $message;
	}
}