<?php

/**
 * TimerController is the controller to handle user requests.
 */

class TimerController extends CController
{
	private $method = 'timer';
	
	public function __construct() {
		if (!Yii::app()->params->log_in) {
			Message::Error('You are not logged');
		}
	}

	public function actionCurrent() {
		Message::Success(array(
			'time' => time()
		));
	}

	public function actionGet()
	{
		if(!Yii::app()->params->timer['avaiable']) {
			Message::Error('The timer is not avaiable');
		}

		$times = Settings::model()->findAll('k="datetime_start" OR k = "datetime_end" ORDER BY k');
		// [0]->datetime_end
		// [1]->datetime_start
		$timestart = strtotime($times[1]->value);
		$timeend   = strtotime($times[0]->value);
		
		if(($timestart === false) || ($timeend == false)) {
			Message::Error('time is undefined');
		}

		$diff = $timestart - time();
		$diffEnd = $timeend - time();
		Message::Success(array(
			'start' => ($diff > 0 ? $diff : 0),
			'end' => ($diffEnd > 0 ? $diffEnd : 0)
		));
	}
	
	
}