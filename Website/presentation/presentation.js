// presentation.js
var demoSlide = 18;
var alreadyLoaded = false;

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
	if (parseInt(slideNum) < demoSlide || parseInt(slideNum) > demoSlide) {
		if (alreadyLoaded) { $("#game").hide(); $("#slideContainer").show(); }
		$("#slideContainer").load("slides/slide"+slideNum+".html").removeClass().addClass("slide"+slideNum);
		$(document.body).css("background-color", $(".slide"+slideNum).css("background-color"));
		$("#slideNum").css("background-color", $(".slide"+slideNum).css("background-color"));
		$("#slideNum").css("color", $(".slide"+slideNum).css("color"));
	} else if (parseInt(slideNum) == demoSlide) {
		$("#slideContainer").hide();
		if (!alreadyLoaded) {
			$("#gameContainer").load("edgy.html #game", function() {
				$.getScript('edgy.js');
				alreadyLoaded = true;
			});
		} else {
			$("#game").show();
			$("#slideContainer").hide();
		}
	} 
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