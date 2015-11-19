<?php
class TokenValidate extends CComponent {
	public $user = array(),
		   $scopes = array(
		   	'user' => 1,
		   	'admin' => 2
		   	);
	public function init() {
		$access_token = Yii::app()->request->getParam('access_token');
		if ($access_token) {
			$token = new Access_Tokens();

			$query = $token->testToken($access_token);

			if ($query) {
				Yii::app()->params->log_in = true;
				Yii::app()->params->user = $query->attributes;

				
			}
		}

		Yii::app()->params->scopes = function($scope) {
			if (!Yii::app()->params->log_in) 
				return false;
			
			$dec_scope = decbin(Yii::app()->params->user['scope']);
			
			// Проверяем битовую маску
			if (Yii::app()->params->user['scope'] & $this->scopes[$scope]) {
				return true;
			}

			return false;
		 };
	}
}
?>