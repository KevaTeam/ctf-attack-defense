	<?php

/**
 * usersController is the controller to handle user requests.
 */

class ServiceController extends CController
{
	private $method = 'service';

	public function __construct() {
		if (!Yii::app()->params->log_in) {
			Message::Error('You are not logged');
		}
	}

	public function actionCreate()
	{
		if (!Yii::app()->params->scopes('admin'))
			Message::Error("You do not have sufficient permissions");

		if (!Yii::app()->request->getParam('name'))
			Message::Error('Parameter name is missing');

		if (!Yii::app()->request->getParam('program'))
			Message::Error('Parameter program is missing');

		if (!Yii::app()->request->getParam('timeout'))
			Message::Error('Parameter timeout is missing');


		$service = new Services;
		$service->setIsNewRecord(true);

		$service->name = Yii::app()->request->getParam('name');

		$service->timeout = Yii::app()->request->getParam('timeout');
		$service->program = Yii::app()->request->getParam('program');

		if($service->save())
			Message::Success($service->id);
		else
			Message::Error($service->getErrors());
	}

	public function actionGet() 
	{
		$id = (int)Yii::app()->request->getParam('id');
		if (!$id)
			Message::Error('Parameter id is missing');

		$service = Services::model()->with('stitle')->findByPk($id, array(
			'select' => 'id, title, section, short_text, full_text, score'
		));
	
		if(!$service)
			Message::Error('Service is not found');

		$out = $service->getAttributes(false);

		$out['section'] = array(
			'id' => $out['section'],
			'title' => $service->stitle->title
		);
		
		Message::Success($out);
	}

	public function actionSave() 
	{
		if (!Yii::app()->params->scopes('admin'))
			Message::Error("You do not have sufficient permissions");

		$id = (int)Yii::app()->request->getParam('id');
		if (!$id)
			Message::Error('Parameter id is missing');

		$service = $this->getService($id);

		if (!Yii::app()->request->getParam('name'))
			Message::Error('Parameter name is missing');

		if (!(int)Yii::app()->request->getParam('timeout'))
			Message::Error('Parameter timeout is missing');

		if (!Yii::app()->request->getParam('program'))
			Message::Error('Parameter full_text is missing');

		$service->name = Yii::app()->request->getParam('name');


		$service->timeout = Yii::app()->request->getParam('timeout');
		$service->program = Yii::app()->request->getParam('program');

		if($service->save())
			Message::Success($service->id);
		else
			Message::Error($service->getErrors());
	}

	public function actionDelete() 
	{
		if (!Yii::app()->params->scopes('admin'))
			Message::Error("You do not have sufficient permissions");

		$id = (int)Yii::app()->request->getParam('id');
		if (!$id)
			Message::Error('Parameter id is missing');

		$service = $this->getService($id);

		$service->delete();

		Message::Success('1');
	}


	public function actionList()
	{
		if (!Yii::app()->params->scopes('admin'))
			Message::Error("You do not have sufficient permissions");

		$section = Services::model()->
			findAll(array('select' => 'id, name, timeout, program'));


		$array = array(); 
		$count = 0;

		foreach($section as $value) {
			$count++;

			// False - return without null values;
			$arr = $value->getAttributes(false);
			$array[] = $arr;
		}

		Message::Success(array(
			'count' => $count,
			'items' => $array
		));
	}

	public function actionTake()
	{
		$id = (int)Yii::app()->request->getParam('id');
		if (!$id)
			Message::Error('Parameter id is missing');

		$check_user_service = UserService::model()->find('service=:service_id AND user=:user_id', array(
			':service_id'=>$id,
			':user_id'=>Yii::app()->params->user['user_id'],
		));
		
		if ($check_user_service) {
			Message::Error('You are already take this service');
		}

		$service = $this->getService($id, array(
			'with' => 'sname',
			'fields' => 'id, timeout, program, name'
		));
		
		$attr = $service->getAttributes(false);
		$attr['section'] = $service->getRelated('sname');

		$user_service = new UserService();

		$user_service->user = Yii::app()->params->user['user_id'];
		$user_service->service = $service->id;
		$user_service->start_time = time();
		$user_service->end_time = 0;

		if ($user_service->save())	
			Message::Success($attr);
		else
			Message::Error($user_service->getErrors());
	}
	public function actionPass()
	{
		$id = (int)Yii::app()->request->getParam('id');
		if (!$id)
			Message::Error('Parameter id is missing');

		$answer = strtolower(Yii::app()->request->getParam('answer'));
		if (!$answer)
			Message::Error('Parameter answer is missing');

		$service = $this->getService($id);

		$user_service = UserService::model()->find('user=:user_id AND service=:service_id', array(
				':user_id' => Yii::app()->params->user['user_id'],
				':service_id' => $id
			)
		);
		
		if(!$user_service) {
			Message::Error('You are not take this service');
		}

		if($user_service->end_time > 0) {
			Message::Success(($service->answer == $answer));
			return true;
		}

		$attempts = new Attempts();

		$attempts->user = Yii::app()->params->user['user_id'];
		$attempts->service = $service->id;
		
		$attempts->user_answer = strtolower($answer);
		$attempts->real_answer = strtolower($service->answer);

		$attempts->time = time();

		if(!$attempts->save()) 
		{
			Message::Error($attempts->getErrors());
		}

		$success = (strtolower($service->answer) == strtolower($answer));

		if ($success) {
			$user_service->end_time = time();
			// Обновляем рейтинг пользователя
			$users = Users::model()->findByPk(Yii::app()->params->user['user_id']);
			Users::model()->updateByPk(Yii::app()->params->user['user_id'], array('rating' => ($users->rating + $service->score)));

			if (!$user_service->save())
				Message::Error($user_service->getErrors());

		}
		
		Message::Success($success);
	}


	public function actionGetAttempts() {
		if (!Yii::app()->params->scopes('admin'))
			Message::Error("You do not have sufficient permissions");


		$attempts = Attempts::model()->with(
				array(
					'services' => array('select' => 'name'),
					'users' => array('select' => 'nick'),
					array('service_section' => array('select' => 'name'))
				)
			)
			->paginator()
			->published()
			->findAll();
	
		$array = array();
		foreach($attempts as $key => $value) {
			$record = $value->getAttributes();

			$record['service'] = $value->services->getAttributes(false);
			$record['user'] = $value->users->getAttributes(false);
			$record['service']['section'] = $value->service_section->getAttributes(false)['name'];
			
			$array[] = $record;
		}
		Message::Success($array);
	}

	public function actionEditSection()	
	{
		if (!Yii::app()->params->scopes('admin'))
			Message::Error("You do not have sufficient permissions");

		$id = (int)Yii::app()->request->getParam('id');
		if (!$id)
			Message::Error('Parameter id is missing');

		$title = Yii::app()->request->getParam('name');
		if (!$title)
			Message::Error('Parameter name is missing');

		$section = ServiceSection::model()->findByPk($id);

		if (!$section)
			Message::Error('Service section does not exists');

		$section->title = $title;

		if ($section->save())
			Message::Success(array('id' => $section->id));
		else
			Message::Error($section->getErrors());

	}

	public function actionDeleteSection()
	{
		if (!Yii::app()->params->scopes('admin'))
			Message::Error("You do not have sufficient permissions");

		$id = (int)Yii::app()->request->getParam('id');
		if (!$id)
			Message::Error('Parameter id is missing');

		$section = ServiceSection::model()->findByPk($id);

		if (empty($section))
			Message::Error('Service section does not exist');

		$section->delete();

		Message::Success('1');
	}

	/*
	 * $id - id services
	 * $options - array 
	*/
	private function getService($id, $options=array())
	{
		$service = Services::model()->with(isset($options['with']) ? $options['with'] : false)->findByPk($id, array(
			'select' => isset($options['fields']) ? $options['fields'] : '*'
		));
		
		if(!$service)
			Message::Error('Service is not found');

		return $service;
	}
}
