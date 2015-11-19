<?php
class access_tokens extends CActiveRecord {

	public static function model($classname=__CLASS__)
	{
		return parent::model($classname);
	}

	public function clearOldTokens($user_id) {
		$tokens = $this::model()->deleteAll('user_id=:id', array(':id'=>$user_id));
	}
	public function setToken($user_id, $scope) {
		$this->user_id = $user_id;
		$this->access_token = hash('sha256', md5(rand(0, 1000000)).microtime());
		$this->scope = $scope;
		$this->expires_in = time() + Yii::App()->params->tokenExpiresIn;
		$this->issue_time = time();
		$this->ip = (new CHttpRequest())->getUserHostAddress();

		$this->save();

		return $this;
	}

	public function testToken($access_token) {
		$query = $this::model()->find('access_token=:access_token', array(':access_token' => $access_token));

		return $query;
	}

	public function published($desc=' DESC')
	{
		$this->getDbCriteria()->mergeWith(array(
			'order' => 'id'.$desc,
		));

		return $this;
	}

	public function beforeSave()
	{
		return parent::beforeSave();
	}
}
