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
			array('rating', 'numerical', 'integerOnly'=>true),
			array('nick','length','max'=>30),
			array('pass','length','min'=>6,'max'=>64),
			array('mail','unique', 'message'=>'This mail already exists.'),
			array('nick','unique', 'message'=>'This nick already exists.'),
			array('uuid, role, nick, pass, mail, rating, activated, activation_code, date_create, date_last_signin', 'required'),
			array('nick, pass, mail', 'filter', 'filter' => 'trim'),
		);
	}
	
    public function relations()
    {
        return array(
            'count' => array(self::MANY_MANY, 'Quests','user_quest(user, quest)')
        );
    }

	public function beforeSave()
	{
		if ($this->isNewRecord) {
			$this->date_create = new CDbExpression('NOW()');
			$this->rating = 0;
		}

		$this->date_last_signin = new CDbExpression('NOW()');

		return parent::beforeSave();
	}
	
	public function published($row=false, $desc=' DESC')
	{
		if(!$row) 
			return $this;

		$this->getDbCriteria()->mergeWith(array(
			'order' => $row.$desc,
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

	public function search($nick)
	{
		$this->getDbCriteria()->mergeWith(array(
			'condition' => 'nick LIKE :nick',
            'params' => array(
                ':nick' => '%'.$nick.'%',
            ),
		));

		return $this;
	}
	public function primaryKey() 
	{
		return 'id';
	}
	public function tableName()
	{
		return 'users';
	}
}