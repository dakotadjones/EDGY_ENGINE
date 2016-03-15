// mapgen.js
//var mapgrid = document.getElementById("");

$(document).on("click", "#upload", function() {
	var json_file_data = $("#json").prop("files")[0];
	var form_data = new FormData();// Creating object of FormData class
	form_data.append("file", json_file_data) // Appending parameter named file with properties of file_field to form_data
	form_data.append("user_id", 123) // Adding extra parameters to form_data
	console.log("hello");
	$.ajax({
                url: "uploads/",
                dataType: 'json',
                cache: false,
                contentType: false,
                processData: false,
                data: form_data,                         // Setting the data attribute of ajax with file_data
                type: 'post',
				success: function() { alert("success"); },
				complete: function() { console.log("complete");}
				
       })
	
});
