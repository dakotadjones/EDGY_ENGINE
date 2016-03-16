<?php

$list = scandir("../assets");
// format the array
$jsonArray = [];
$pngArray = [];
foreach ($list as $file) {
	$ext = pathinfo($file, PATHINFO_EXTENSION);
	if ($ext == "json") {
		array_push($jsonArray, basename($file, ".json"));
	} else if ($ext == "png") {
		array_push($pngArray, basename($file, ".png"));
	}
}

echo json_encode(array_intersect($jsonArray,$pngArray));

?>