'use strict';  // Strict mode checks for undeclared variables (etc.?)

$(document).ready(function(){

	// Initialize Firebase
	var config = {
		apiKey: "AIzaSyBbZHH2sVP6K3aZgR5xeQqz2PEw6RbLLTE",
		authDomain: "airport-status.firebaseapp.com",
		databaseURL: "https://airport-status.firebaseio.com",
		storageBucket: "",
	};

	firebase.initializeApp(config);


	// Get a database reference to airports
	var myDBReference = new Firebase('https://airport-status.firebaseio.com/')
	var airportsReference = myDBReference.child('airports');


	// Read Functionality
	var ref = new Firebase('https://airport-status.firebaseio.com/airports/');
	ref.orderByKey().on("child_added", function(results) {
		console.log(results.key());
		console.log(results.val().data.name);

		var data = {
			icao: results.val().data.icao,
			name: results.val().data.name, // API specific gives us our message, we know this b/c we logged it above
			city: results.val().data.city,
			state: results.val().data.state,
			weather: results.val().data.weather,
				visibility: results.val().data.visibility,
				temp: results.val().data.temp,
				wind: results.val().data.wind,
				updated: results.val().data.updated,
			delay: results.val().data.delay,
			status: results.val().data.status,
				reason: results.val().data.reason,
				avgDelay: results.val().data.avgDelay,
				minDelay: results.val().data.minDelay,
				maxDelay: results.val().data.maxDelay,
				endTime: results.val().data.endTime,
				closureBegin: results.val().data.closureBegin,
				closureEnd: results.val().data.closureEnd,
				trend: results.val().data.trend,
			notes: results.val().data.notes,
			id: results.key(), // Gets the key of the location that generated the DataSnapshot "results"
		}
		console.log(data.notes);
		var templateSource = $('#airport-template').html();  // Reference html template
		var template = Handlebars.compile(templateSource);  // Compile template w/Handlebars

		var templateHTML = template(data); // render the data
		var $templateHTML = $(templateHTML);

		$templateHTML.click(function() {
			var airportId = $(this).data('id');
			// updateMessage(airportId);
		});

		$('#favorites-form').submit(function(){
			event.preventDefault();
			console.log(data);	
			$('#airport-list').append($templateHTML); // adds data to list dynamically
		});
	});



	// Submit button
	$('#airport-form').submit(function(event){
		event.preventDefault();
		console.log('submited');
		var $airport = $('#airport-search');

		if(!$airport.val().trim() || $airport.val().length > 3){
			alert('Please enter a valid airport 3 letter identifier');
		}
		else{
			$.ajax({
				url: 'http://services.faa.gov/airport/status/' + $airport.val() + '?format=application/json',
				type: 'GET',
				success: function(response){
					passAirportData(response);
				},
				error: function(response){
					console.log(response);
				}
			});
		}

		$airport.val('');

	});  // End submitButton event listener/handler

});  // End (document).ready



function passAirportData(data){

	///// Firebase
	var myDBReference = new Firebase('https://airport-status.firebaseio.com/')
	var airportsReference = myDBReference.child('airports');


	var templateSource = $('#airport-template').html();  // Reference html template
	var template = Handlebars.compile(templateSource);  // Compile template w/Handlebars

	var airport = {
		icao: data.ICAO.toUpperCase(),
		name: data.name,
		city: data.city,
		state: data.state,
		weather: data.weather.weather,
			visibility: data.weather.visibility,
			temp: data.weather.temp,
			wind: data.weather.wind,
			updated: data.weather.meta.updated,
		delay: data.delay,
		status: data.status.type,
			reason: data.status.reason,
			avgDelay: data.status.avgDelay,
			minDelay: data.status.minDelay,
			maxDelay: data.status.maxDelay,
			endTime: data.status.endTime,
			closureBegin: data.status.closureBegin,
			closureEnd: data.status.closureEnd,
			trend: data.status.trend,
		// notes: data.notes,
	} // end airport Obj

	var readyTemplate = template(airport);  // Pass data Obj to template
	$('body').append(readyTemplate);  // Append DOM

	// if(airportsReference.child(airport.icao)){
		console.log('set: ' + airportsReference.child(airport.icao));
		airportsReference.child(airport.icao).set({
			data: airport,
		});
	/*}
	else{
		console.log('set: ' + airportsReference.child(airport.icao));
		airportsReference.child(airport.icao).set({
			data: airport,
		});
	}*/

	$(document).on("click", "#update", function(){
		var $airportNotes = $('#airport-notes');
		// console.log($airportNotes.val());

		var id = airport.icao;
		var airportRef = new Firebase('https://airport-status.firebaseio.com/airports/' + id + '/data/');

		console.log($airportNotes.val());
		airportRef.update({
			notes: $airportNotes.val(),
		});
	});

}






