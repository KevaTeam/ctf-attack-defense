<?php

return array(
	'name'=>'CTF API',

	'defaultController'=>'method',
	
	// autoloading model and component classes
	'import'=>array(
		'application.components.*',
		'application.models.*',
	),

	'preload' => array('tokenValidate'),
	'components'=>array(
		'db'=>array(
			'class'=>'system.db.CDbConnection',
			'connectionString' => 'mysql:host=127.0.0.1;dbname=example',
			'emulatePrepare' => true,
			'enableProfiling' => true,
			'username' => 'username',
			'password' => 'password',
			'charset' => 'utf8',
			'tablePrefix' => '',
		),

		'tokenValidate'=>array(
			'class' => 'TokenValidate',
		),

		'urlManager'=>array(
			'showScriptName'=>false, // Hide index.php
			'urlFormat'=>'path',

			'rules'=>array(
				array('token/auth', 'pattern' => 'token', 'verb'=>'GET'),
				array('<controller>/<action>', 'pattern' => 'method/<controller:\w+>.<action:\w+>', 'verb'=>'GET'),
				array('<controller>/<action>', 'pattern' => 'method/<controller:\w+>.<action:\w+>', 'verb'=>'POST'),
			),
		),
		'mail' => array(
		    'class' => 'application.extensions.yii-mail.YiiMail',
		    'transportType' => 'smtp',
		    'transportOptions' => array(
		        'host' => 'smtp.example.ru',
		        'username' => 'my@mail.ru',
		        'password' => 'password',
		        'port' => '465',
		        'encryption'=>'tls',
		    ),
		    
		    'viewPath' => 'application.views.mail',
		    'logging' => true,
		    'dryRun' => false
		),
	),

	'params'=>array(
		'format'=>'json', //Format response data
		'version'=>'0.0.1 alpha',
		'tokenExpiresIn' => 60*60*24*15,
		'log_in' => false,
		'registration_allow' => true, //Позволить пользователям регистрироваться
		'send_mail_allow' => true, // Позволить серверу отправлять письма
		'mail' => array(
			'from' => 'my@mail.ru', // адрес отправителя
			'author' => 'Dmitry Mukovkin',
		),
		'timer' => array(
			'avaiable' => true,
			// Формат (hour, minute, second, month, day, year)
			'start' => mktime(23, 49, 11, 12, 12, 2014),
			'end' => mktime(23, 55, 11, 12, 12, 2014),
		), 

		'paginator' => array(
			'count' => 50, // Количество записей, выдаваемых API по умолчанию
			'limit' => 500, // Максимальное количество записей
		),
	),
);