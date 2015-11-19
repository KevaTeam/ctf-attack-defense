<?php
class settings extends CActiveRecord {
	public static function model($classname=__CLASS__)
	{
		return parent::model($classname);
	}

	public function rules()
	{
		return array(
			array('k','length','max'=>30),
			array('value','length','min'=>1,'max'=>50),
			array('k','unique', 'message'=>'This key already exists.'),
			array('value','unique', 'message'=>'This value already exists.'),
			array('k, value', 'required'),
			array('k, value', 'filter', 'filter' => 'trim'),
		);
	}

	
	public function primaryKey() 
	{
		return 'k';
	}
	public function settings()
	{
		return 'settings';
	}
}