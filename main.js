// ?? Should I have one reference to Firebase and pass to functions ??
// ?? Should I have one reference to Handlebars and pass to functions ??
// ?? Should the $.ajax just make API call and create airport OBJ ??
// ?? Is there a better way to create the airport OBJ and the data OBJ ??

// ?? The Firebase DB only needs to save airport data that doesn't change
//		- Weather & status are the only things that update (kind of)
//		- Airport notes are created by user - currently being overwritten
//			w/each API call

// ?? Create & Update Functionality currently within passAirportData() ??
// ?? Clear page w/each button (submit & favorites)


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


	// READ FUNCTIONALITY: Get saved airports from Firebase DB
	var ref = new Firebase('https://airport-status.firebaseio.com/airports/');
	ref.orderByKey().on("child_added", function(results) {
		console.log(results.key());
		console.log(results.val().name);

		var data = {
			icao: results.val().icao,
			name: results.val().name, // API specific gives us our message, we know this b/c we logged it above
			city: results.val().city,
			state: results.val().state,
			notes: results.val().notes,
			/*weather: results.val().weather,
				visibility: results.val().visibility,
				temp: results.val().temp,
				wind: results.val().wind,
				updated: results.val().updated,
			delay: results.val().delay,
			status: results.val().status,
				reason: results.val().reason,
				avgDelay: results.val().avgDelay,
				minDelay: results.val().minDelay,
				maxDelay: results.val().maxDelay,
				endTime: results.val().endTime,
				closureBegin: results.val().closureBegin,
				closureEnd: results.val().closureEnd,
				trend: results.val().trend,*/
			id: results.key(), // Gets the key of the location that generated the DataSnapshot "results"
		}
		console.log(results.val().notes);
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
		var $searchAirportId = $('#airport-search');

		if(!$searchAirportId.val().trim() || $searchAirportId.val().length > 3){
			alert('Please enter a valid airport 3 letter identifier');
		}
		else{
			$.ajax({
				url: 'http://services.faa.gov/airport/status/' + $searchAirportId.val() + '?format=application/json',
				type: 'GET',
				success: function(response){
					passAirportData(response);
				},
				error: function(response){
					console.log(response);
				}
			});
		}

		$searchAirportId.val('');

	});  // End submitButton event listener/handler

});  // End (document).ready



function passAirportData(data){

	///// Firebase
	var myDBReference = new Firebase('https://airport-status.firebaseio.com/')
	var airportsReference = myDBReference.child('airports');

	///// Handlebars
	var templateSource = $('#airport-template').html();  // Reference html template
	var template = Handlebars.compile(templateSource);  // Compile template w/Handlebars

	// Define OBJ to pass to template
	var airport = {
		icao: data.ICAO.toUpperCase(),
		name: data.name,
		city: data.city,
		state: data.state,
		notes: '',
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
	} // end airport Obj

	// Define OBJ to push to Firebase
	var airportDB = {
		icao: data.ICAO.toUpperCase(),
		name: data.name,
		city: data.city,
		state: data.state,
		notes: '',
	}

	var readyTemplate = template(airport);  // Pass data Obj to template
	$('body').append(readyTemplate);  // Append DOM


	// CREATE FUNCTIONALITY: Push OBJ to Firebase DB
	console.log('set: ' + airportsReference.child(airport.icao));
	var data = {};
	data[airport.icao] = airportDB;  // Dynamically creates Key w/airport ID ~ data.KBUR = airportDB
	airportsReference.update(data);



	//  UPDATE FUNCTIONALITY: Update Firebase DB with airport notes
	$(document).on("click", "#update", function(){
		updateAirport(airport);
	});
}


function updateAirport(data) {
	var $airportNotes = $('#airport-notes');
	// console.log($airportNotes.val());

	var id = data.icao;
	var airportRef = new Firebase('https://airport-status.firebaseio.com/airports/' + id);

	console.log($airportNotes.val());
	airportRef.update({
		notes: $airportNotes.val(),
	});
	$airportNotes.val('');
}


// separate airport OBJ & weather OBJ





