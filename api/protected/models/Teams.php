<?php
class teams extends CActiveRecord {
	public $date_create;

	public $date_change;

	public static function model($classname=__CLASS__)
	{
		return parent::model($classname);
	}

	public function rules()
	{
		return array(

			array('nick','length','max'=>255),
			array('logo','length','max'=>255),
			array('host','length','max'=>255),
			array('rating','length','max'=>255),
			);
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
		if ($this->isNewRecord) {
			$this->date_create = new CDbExpression('NOW()');
		}

		$this->date_change = new CDbExpression('NOW()');

		return parent::beforeSave();
	}
	public function primaryKey() 
	{
		return 'id';
	}
	public function teams()
	{
		return 'teams';
	}
}