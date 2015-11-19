<?php
class pages extends CActiveRecord {

	public static function model($classname=__CLASS__)
	{
		return parent::model($classname);
	}

	public function rules()
	{
		return array(

			array('title','length','max'=>255),
			array('uuid, title, text, owner, date_create, date_change', 'required'),
			array('date_create, date_change', 
				'default',
				'value'=>new CDbExpression('NOW()'),
				'setOnEmpty'=>false,
				'on'=>'insert'
				),
			);
	}

	public function beforeSave()
	{
		if ($this->isNewRecord) 
		{
			$this->date_create = new CDbExpression('NOW()');
		}

		$this->date_change = new CDbExpression('NOW()');

		return parent::beforeSave();
	}
	public function primaryKey() 
	{
		return 'id';
	}
	public function pages()
	{
		return 'pages';
	}
}