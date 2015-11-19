<?php
class UserQuest extends CActiveRecord {

	public static function model($classname=__CLASS__)
	{
		return parent::model($classname);
	}

	public function rules()
	{
		return array(
			// required
			array('user, quest, start_time, end_time','required'),
			
			//length
			array('id', 'numerical', 'integerOnly' => true),
			array('user', 'numerical', 'integerOnly'=>true),
			array('quest', 'numerical', 'integerOnly'=>true),
			array('start_time', 'numerical', 'integerOnly'=>true),
			array('end_time', 'numerical', 'integerOnly'=>true),
		);
	}
	public function primaryKey() 
	{
		return 'id';
	}

	public function tableName()
	{
		return '{{user_quest}}';
	}
}