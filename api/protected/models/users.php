<?php
class Users extends CActiveRecord {
	public $date_create;

	public $date_last_signup;

	public static function model($classname=__CLASS__)
	{
		return parent::model($classname);
	}

	public function rules()
	{
		return array(

			array('nick','length','max'=>30),
			array('uuid, role, nick, pass, mail, rating, rating, activated, date_create, date_last_signup', 'required'),
			array('date_create, date_last_signup', 
				'default',
				'value'=>new CDbExpression('NOW()'),
				'setOnEmpty'=>false,
				'on'=>'insert'
				),
			);
	}

	public function beforeSave()
	{
		if ($this->isNewRecord) {
			$this->date_create = new CDbExpression('NOW()');
			$this->rating = 0;
		}

		$this->date_last_signup = new CDbExpression('NOW()');

		return parent::beforeSave();
	}
	public function primaryKey() 
	{
		return 'id';
	}
	public function users()
	{
		return 'users';
	}
}