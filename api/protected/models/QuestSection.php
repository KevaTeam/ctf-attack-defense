<?php
class QuestSection extends CActiveRecord {

	public static function model($classname=__CLASS__)
	{
		return parent::model($classname);
	}

	public function rules()
	{
		return array(
			array('title','length','max'=>50),
			array('title, uuid','required'),
			array('title', 'filter', 'filter' => 'trim'),
		);
	}

	public function relations()
	{
		return array(
			//'posts' => array(self::HAS_MANY, 'Quest', 'author_id'),
		);
	}

	public function published($desc=' DESC')
	{
		$this->getDbCriteria()->mergeWith(array(
			'order' => 'id'.$desc,
		));

		return $this;
	}

	public function tableName()
	{
		return '{{quest_section}}';
	}
	public function primaryKey() 
	{
		return 'id';
	}
}