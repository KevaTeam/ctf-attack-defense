<?php
class Message extends CComponent {
	static public function success($message) {
		if (YII_DEBUG)
			$response['version'] = Yii::App()->params->version;

		$response['method'] = Yii::app()->controller->action->id;
		
		$response['response'] = $message;
		
		/**
		 * Indents a flat JSON string to make it more human-readable.
		 * @param string $json The original JSON string to process.
		 * @return string Indented version of the original JSON string.
		 */
		function indent($json) {

		 $result = '';
		 $pos = 0;
		 $strLen = strlen($json);
		 $indentStr = '  ';
		 $newLine = "\n";
		 $prevChar = '';
		 $outOfQuotes = true;

		 for ($i = 0; $i <= $strLen; $i++) {

		  // Grab the next character in the string.
		  $char = substr($json, $i, 1);

		  // Are we inside a quoted string?
		  if ($char == '"' && $prevChar != '\\') {
		   $outOfQuotes = !$outOfQuotes;

		   // If this character is the end of an element, 
		   // output a new line and indent the next line.
		  } else if (($char == '}' || $char == ']') && $outOfQuotes) {
		   $result .= $newLine;
		   $pos--;
		   for ($j = 0; $j < $pos; $j++) {
		    $result .= $indentStr;
		   }
		  }

		  // Add the character to the result string.
		  $result .= $char;

		  // If the last character was the beginning of an element, 
		  // output a new line and indent the next line.
		  if (($char == ',' || $char == '{' || $char == '[') && $outOfQuotes) {
		   $result .= $newLine;
		   if ($char == '{' || $char == '[') {
		    $pos++;
		   }

		   for ($j = 0; $j < $pos; $j++) {
		    $result .= $indentStr;
		   }
		  }

		  $prevChar = $char;
		 }

		 return $result;
		}

		if (YII_DEBUG)
			echo indent(CJSON::encode($response));
		else
			echo CJSON::encode($response);
	}
	static public function simple($array) {
		echo CJSON::encode($array);

		Yii::App()->end();
	}
	static public function error($text) {
		if (YII_DEBUG)
			$response['version'] = Yii::App()->params->version;

		$response['error']=array(
			'description' => $text,
			//'method' => Yii::app()->controller->action->id || '',
			'url' => Yii::app()->request->getPathInfo(),
		);

		echo CJSON::encode($response);

		Yii::App()->end();
	}
}
?>