<?php
class Games extends CActiveRecord {
	public static function model($classname=__CLASS__)
	{
		return parent::model($classname);
	}

	public function rules()
	{
		return array(
			// required
			array('title, uuid_game, type_game, owner, date_create, date_start, date_stop, date_change, rating, json_data, json_security_data','required'),
			array('title', 'filter', 'filter' => 'trim'),
			//length
			array('title','length','min'=>3,'max'=>50),
			);
	}

	public function relations() 
	{
		return array(
            'stitle' => array(self::BELONGS_TO, 'QuestSection', 'section'),
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
	public function primaryKey() 
	{
		return 'id';
	}
	public function tableName()
	{
		return '{{games}}';
	}
}