<?php
class Quests extends CActiveRecord {

	public static function model($classname=__CLASS__)
	{
		return parent::model($classname);
	}

	public function rules()
	{
		return array(
			// required
			array('title, section, owner, moderate, full_text, answer, score, time','required'),
			
			//length
			array('id', 'numerical', 'integerOnly' => true),
			array('title','length','min'=>3,'max'=>100),
			array('short_text','length','min'=>5),
			array('full_text','length','min'=>20),
			array('answer', 'length','min'=>4,'max'=>255),
			array('answer', 'filter', 'filter' => 'trim'),
			array('author', 'length', 'max'=>100)
			//
			// array('date_create, date_change', 
			// 	'default',
			// 	'value'=>new CDbExpression('NOW()'),
			// 	'setOnEmpty'=>false,
			// 	'on'=>'insert'
			// 	),
			);
	}

	public function relations() 
	{
		return array(
            'stitle' => array(self::BELONGS_TO, 'QuestSection', 'section'),
            'passed' => array(self::HAS_MANY, 'UserQuest','quest')
        );
	}

	public function published($desc=' DESC')
	{
		$this->getDbCriteria()->mergeWith(array(
			'order' => 't.id'.$desc,
		));

		return $this;
	}

	public function paginator() {
		$count = abs((int)Yii::app()->request->getParam('count'));
		if (!$count)
			$count = Yii::app()->params['paginator']['count'];

        if ($count > Yii::app()->params['paginator']['limit'])
            $count = Yii::app()->params['paginator']['limit'];

        $offset = abs((int)Yii::app()->request->getParam('offset'));
	    if (!$offset)
	    	$offset = 0;

		$this->getDbCriteria()->mergeWith(array(
			'limit' => $count,
			'offset' => $offset
		));

		return $this;
	}

	function showHide($access) {
		if($access) {
			// $this->getDbCriteria()->mergeWith(array(
			// 	'order' => 't.id'.$desc,
			// ));			
		}
		
		return $this;
	}

	public function primaryKey() 
	{
		return 'id';
	}
	public function tableName()
	{
		return '{{quests}}';
	}
}