
'use strict';  // Strict mode checks for undeclared variables (etc.?)

$(document).ready(function(){

	// FIREBASE: Set config & Initialize
	var config = {
		apiKey: 'AIzaSyBbZHH2sVP6K3aZgR5xeQqz2PEw6RbLLTE',
		authDomain: 'airport-status.firebaseapp.com',
		databaseURL: 'https://airport-status.firebaseio.com',
		storageBucket: '',
	};

	firebase.initializeApp(config);



	//// READ FUNCTIONALITY: Get saved airports from Firebase DB ////
	var airportsReference = new Firebase('https://airport-status.firebaseio.com/airports/');  // Ref airports endpoint
	var airportNotesReference = new Firebase('https://airport-status.firebaseio.com/notes/');  // Ref notes endpoint

	airportNotesReference.orderByKey().on('child_added', function(notesResults){  // Get and log all notes
		console.log('Firebase Notes:',notesResults.val().notes);
	});

	airportsReference.orderByKey().on('child_added', function(results) {  // get each airport from DB
		console.log('Firebase Airports Key:',results.key());
		console.log('Firebase Airports val:',results.val().name);

		var data = {  // Define OBJ for each airports data
			icao: results.val().icao,
			name: results.val().name,
			city: results.val().city,
			state: results.val().state,
			notes: results.val().notes,
			id: results.key(), // Gets the key of the location that generated the DataSnapshot "results"
		}

		// HANDLEBARS: Set template, compile & append DOM 
		var templateSource = $('#airport-template').html();  // Reference html template
		var template = Handlebars.compile(templateSource);  // Compile template w/Handlebars
		var templateHTML = template(data); // render the data
		var $templateHTML = $(templateHTML);

		$('#get-saved-airports').on('click', function(){
			console.log(data);
			$('#airport-wrapper').empty();
			$('#data-wrapper').append($templateHTML); // add data to template
		});



		//// DESTROY FUNCTIONALITY ////
		$('#clear-data').on('click', function(){
			$('#airport-wrapper').empty();
			$('#data-wrapper').empty();
			var onComplete = function(error) {
				if (error) { console.log('Failed to clear data'); }
				else { console.log('favorites cleared successfully'); }
			};

			airportsReference.remove(onComplete);  // Destroy airports
			airportNotesReference.remove(onComplete);  // Destroy airport notes
		});
	});



	// Submit button
	$('#airport-form').submit(function(event){
		event.preventDefault();
		console.log('submited');
		$('#airport-wrapper').empty();
		$('#data-wrapper').empty();

		var $searchAirportId = $('#airport-search');

		if(!$searchAirportId.val().trim() || $searchAirportId.val().length > 3){  // Checks for valid input
			alert('Please enter a valid airport 3 letter identifier');
		}
		else{
			$.ajax({  // HTTPRequest - Get airport data from FAA
				url: 'https://services.faa.gov/airport/status/' + $searchAirportId.val() + '?format=application/json',
				type: 'GET',
				success: function(response){
					passAirportData(response, airportsReference, airportNotesReference);
				},
				error: function(response){
					console.log(response);
				}
			});
		}

		$searchAirportId.val('');  // Reset/Clear search input (clean-up)

	});  // End submitButton event listener/handler
});  // End (document).ready




function passAirportData(data, airportsReference, airportNotesReference){

	// HANDLEBARS: Set template & compile
	var templateSource = $('#airport-template').html();  // Reference html template
	var template = Handlebars.compile(templateSource);  // Compile template w/Handlebars

	var note = '';
	airportsReference.once('value', function(snapshot) {  // Gets picture of airports
		if(!snapshot.child(data.ICAO.toUpperCase()).child('notes').exists()){  // If specific airport !exist
			note = '';
		}
		else{
			console.log('notes found');
			note = snapshot.child(data.ICAO.toUpperCase()).val().notes;
		}
	});

	
	var airport = {  // Define OBJ to pass to template
		icao: data.ICAO.toUpperCase(),
		name: data.name,
		city: data.city,
		state: data.state,
		notes: note,
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

	
	var airportDB = {  // Define OBJ to push to Firebase
		icao: data.ICAO.toUpperCase(),
		name: data.name,
		city: data.city,
		state: data.state,
	}

	var readyTemplate = template(airport);  // Pass data Obj to template
	$('#airport-wrapper').append(readyTemplate);  // Append DOM



	//// CREATE FUNCTIONALITY: Push OBJ to Firebase DB ////
	console.log('set: ' + airportsReference.child(airport.icao));

	var data = {};
	data[airport.icao] = airportDB;  // Dynamically creates Key w/airport ID ~ data.KBUR = airportDB

	airportsReference.once('value', function(snapshot) {  // Gets picture of airports
		if(!snapshot.child(airport.icao).exists()){  // If specific airport !exist
			airportsReference.update(data);  // Push new airport to Firebase DB
			console.log('Create DB Entry: Airport');
		}
	});


	////  UPDATE FUNCTIONALITY: Update Firebase DB with airport notes ////
	$(document).on('click', '#update', function(){
		updateAirport(airport, airportsReference);
	});
}



function updateAirport(data, airportsReference) {
	var $airportNotesInput = $('#airport-notes-input');  // *See Remarks: Create airport note
	var id = data.icao;
	var airportNotesIdRef = airportsReference.child(id).child('notes');

	airportNotesIdRef.push({
		note: $airportNotesInput.val(),
	});

	$airportNotesInput.val('');
}



/*REMARKS:

	- Checkout Bootstrap

	- Alax Saldivar: ag.saldivar@gmail.com

	* Create airport note:
		- Each template instance needs unique ID for notes input
		- Currently I have to reload the page between each airport search and note update
		- handlebars.registerHelper()?

	* Understand Two-way relationship: Firebase

*/









