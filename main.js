
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



	// READ FUNCTIONALITY: Get saved airports from Firebase DB
	var ref = new Firebase('https://airport-status.firebaseio.com/airports/');
	var refNotes = new Firebase('https://airport-status.firebaseio.com/notes/');

	refNotes.orderByKey().on('child_added', function(notesResults){
		console.log('Firebase Notes:',notesResults.val().notes);
	});

	ref.orderByKey().on("child_added", function(results) {
		console.log('Firebase Airports Key:',results.key());
		console.log('Firebase Airports val:',results.val().name);

		var data = {
			icao: results.val().icao,
			name: results.val().name, // API specific gives us our message, we know this b/c we logged it above
			city: results.val().city,
			state: results.val().state,
			notes: results.val().notes,
			id: results.key(), // Gets the key of the location that generated the DataSnapshot "results"
		}

		var templateSource = $('#airport-template').html();  // Reference html template
		var template = Handlebars.compile(templateSource);  // Compile template w/Handlebars

		var templateHTML = template(data); // render the data
		var $templateHTML = $(templateHTML);

		$templateHTML.click(function() {
			var airportId = $(this).data('id');
			// updateMessage(airportId);
		});

		$('#get-saved-airports').on('click', function(){
			console.log(data);	
			$('#airport-list').append($templateHTML); // adds data to list dynamically
		});

		// DESTROY FUNCTIONALITY
		$('#clear-data').on('click', function(){

			var onComplete = function(error) {
				if (error) { console.log('Failed to clear data'); }
				else { console.log('favorites cleared successfully'); }
			};

			ref.remove(onComplete);
			refNotes.remove(onComplete);
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
				url: 'https://services.faa.gov/airport/status/' + $searchAirportId.val() + '?format=application/json',
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
	var airportNotesReference = myDBReference.child('notes');

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
		// notes: true,
	}

	var readyTemplate = template(airport);  // Pass data Obj to template
	$('body').append(readyTemplate);  // Append DOM


	// CREATE FUNCTIONALITY: Push OBJ to Firebase DB
	console.log('set: ' + airportsReference.child(airport.icao));

	var data = {};
	data[airport.icao] = airportDB;  // Dynamically creates Key w/airport ID ~ data.KBUR = airportDB

	airportsReference.once("value", function(snapshot) {
		if(!snapshot.child(airport.icao).exists()){
			airportsReference.update(data);  // PUSH to Firebase DB
			console.log('Create DB Entry: Airport');

			var relRef = airportsReference.child(airport.icao);
			relRef.update({
				notes: true,
			})
			console.log('relRef:',relRef);
		}
	});



	//  UPDATE FUNCTIONALITY: Update Firebase DB with airport notes
	$(document).on("click", "#update", function(){
		updateAirport(airport);
	});
}


function updateAirport(data) {
	var $airportNotesInput = $('#airport-notes-input');
	var id = data.icao;
	var airportNotesIdRef = new Firebase('https://airport-status.firebaseio.com/notes/' + id);

	airportNotesIdRef.update({
		notes: $airportNotesInput.val(),
	});

	var notesOwnerRef = airportNotesIdRef.child('owner');
	var idOBJ = {};

	idOBJ[id] = true;  // Dynamically creates Key w/airport ID ~ data.KBUR = airportDB
	notesOwnerRef.update(idOBJ);

	/*var notesOwnerRef = new Firebase('https://airport-status.firebaseio.com/notes/owner');
	notesOwnerRef.update({

	})*/
	$airportNotesInput.val('');
}
















