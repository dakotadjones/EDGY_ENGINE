// presentation.js
function show() {
	$(".show").animate({opacity:1});
}

function hide() {
	$(".hide").animate({opacity:0});
}

function slideDividers() {
	$(".redDivider").animate({bottom:"288px"});
	$(".yellowDivider").animate({bottom:"281px"});
	$(".orangeDivider").animate({bottom:"274px"});
}

function loadSlide(slideNum) {
	console.log(slideNum);
	$("#slideContainer").load("slides/slide"+slideNum+".html").removeClass().addClass("slide"+slideNum);
	$(document.body).css("background-color", $(".slide"+slideNum).css("background-color"));
	$("#slideNum").css("background-color", $(".slide"+slideNum).css("background-color"));
	$("#slideNum").css("color", $(".slide"+slideNum).css("color"));
}
$(document).ready( function() {
	
	$("#goToSlide").click( function() {
		var slideNum = $("#slideNum").val();
		loadSlide(slideNum);
	});
	
	$(document).keydown(function(E) {
		var slideNum = $("#slideNum").val();
		$("#slideNum").val(slideNum);
		switch(E.keyCode) {
			case 39:
			case 32:
				// next
				if (slideNum == "0" || slideNum == "") slideNum = "1";
				else slideNum = parseInt(slideNum) + 1;
				$("#slideNum").val(slideNum);
				loadSlide(slideNum);
				break;
			case 37:
				// back
				if (slideNum == "0" || slideNum == "") slideNum = "1";
				else slideNum = parseInt(slideNum) - 1;
				$("#slideNum").val(slideNum);
				loadSlide(slideNum);
				break;
			
		}
	});
});