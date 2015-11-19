<?php
// Debug?
define('YII_DEBUG',false);

header('Access-Control-Allow-Origin: *');
$dir = dirname(__FILE__);
$yii = $dir.'/framework/yii.php';
$config = $dir.'/protected/config/main.php';


// include Yii bootstrap file
require_once($yii);

// create a Web application instance and run
Yii::createWebApplication($config)->run();
