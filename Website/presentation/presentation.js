// presentation.js
$(document).ready( function() {
	
	$("#goToSlide").click( function() {
		var slideNum = $("#slideNum").val();
		$("#slideContainer").load("slides/slide"+slideNum+".html");
	});
});