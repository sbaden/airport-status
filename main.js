'use strict';  // Strict mode checks for undeclared variables (etc.?)

$(document).ready(function(){

	//console.log('connected');

	///// Firebase
	var myDBReference = new Firebase('https://airport-status.firebaseio.com/')

	// Initialize Firebase
	var config = {
		apiKey: "AIzaSyBbZHH2sVP6K3aZgR5xeQqz2PEw6RbLLTE",
		authDomain: "airport-status.firebaseapp.com",
		databaseURL: "https://airport-status.firebaseio.com",
		storageBucket: "",
	};

	firebase.initializeApp(config);
	///// end Firebase

	// Submit button
	$('#get-airport-data').on('click', function(){
		var $airport = $('#airport-search');

		if(!$airport.val().trim()){
			alert('Please enter a valid airport 3 letter identifier');
		}
		else{
			console.log($airport.val());
		}

		$airport.val('');
	});
    
});







