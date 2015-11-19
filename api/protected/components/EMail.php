<?php
class EMail extends CComponent {
	static function mailsend($array){
		$message = new YiiMailMessage;
		//userModel is passed to the view
		$message->setBody($array['text'], 'text/html')
				->setSubject($array['subject'])
				->setFrom(array(
					Yii::app()->params->mail['from'] => Yii::app()->params->mail['author']
					)
				)
				->setTo($array['to']);
		Yii::app()->mail->send($message);
    }
}
?>
