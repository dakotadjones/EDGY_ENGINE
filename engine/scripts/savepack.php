<?php
$decoded = base64_decode($_POST['json']);
$jsonFile = fopen('../uploads/'.$_POST['filename'],'w+');
fwrite($jsonFile,$decoded);
fclose($jsonFile);

?>