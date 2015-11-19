<?php
/**
 * Created by PhpStorm.
 * User: dmitry
 * Date: 11.09.15
 * Time: 20:48
 */

class CheckController extends CController
{
    private $method = 'check';


    public function actionPermission()
    {
        if (!Yii::app()->params->log_in)
            return Message::Success(array('status' => 'guest'));

        if (Yii::app()->params->scopes('admin'))
            return Message::Success(array('status' => 'admin'));

        return Message::Success(array('status' => 'user'));
    }
}
