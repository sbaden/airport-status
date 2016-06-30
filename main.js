
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
	var ref = new Firebase('https://airport-status.firebaseio.com/airports/');  // Ref airports endpoint
	var refNotes = new Firebase('https://airport-status.firebaseio.com/notes/');  // Ref notes endpoint

	refNotes.orderByKey().on('child_added', function(notesResults){  // Get and log all notes
		console.log('Firebase Notes:',notesResults.val().notes);
	});

	ref.orderByKey().on('child_added', function(results) {  // get each airport from DB
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
			$('#airport-list').append($templateHTML); // add data to template
		});



		//// DESTROY FUNCTIONALITY ////
		$('#clear-data').on('click', function(){
			var onComplete = function(error) {
				if (error) { console.log('Failed to clear data'); }
				else { console.log('favorites cleared successfully'); }
			};

			ref.remove(onComplete);  // Destroy airports
			refNotes.remove(onComplete);  // Destroy airport notes
		});
	});



	// Submit button
	$('#airport-form').submit(function(event){
		event.preventDefault();
		console.log('submited');

		var $searchAirportId = $('#airport-search');

		if(!$searchAirportId.val().trim() || $searchAirportId.val().length > 3){  // Checks for valid input
			alert('Please enter a valid airport 3 letter identifier');
		}
		else{
			$.ajax({  // HTTPRequest - Get airport data from FAA
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

		$searchAirportId.val('');  // Reset/Clear search input (clean-up)

	});  // End submitButton event listener/handler
});  // End (document).ready




function passAirportData(data){

	// FIREBASE: Set references
	var myDBReference = new Firebase('https://airport-status.firebaseio.com/')
	var airportsReference = myDBReference.child('airports');
	var airportNotesReference = myDBReference.child('notes');

	// HANDLEBARS: Set template & compile
	var templateSource = $('#airport-template').html();  // Reference html template
	var template = Handlebars.compile(templateSource);  // Compile template w/Handlebars

	
	var airport = {  // Define OBJ to pass to template
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

	
	var airportDB = {  // Define OBJ to push to Firebase
		icao: data.ICAO.toUpperCase(),
		name: data.name,
		city: data.city,
		state: data.state,
		// notes: true,
	}

	var readyTemplate = template(airport);  // Pass data Obj to template
	$('body').append(readyTemplate);  // Append DOM



	//// CREATE FUNCTIONALITY: Push OBJ to Firebase DB ////
	console.log('set: ' + airportsReference.child(airport.icao));

	var data = {};
	data[airport.icao] = airportDB;  // Dynamically creates Key w/airport ID ~ data.KBUR = airportDB

	airportsReference.once('value', function(snapshot) {  // Gets picture of airports
		if(!snapshot.child(airport.icao).exists()){  // If specific airport !exist
			airportsReference.update(data);  // Push new airport to Firebase DB
			console.log('Create DB Entry: Airport');

			var relRef = airportsReference.child(airport.icao);

			relRef.update({  // *See Remarks: Two-way relationship
				notes: true,
			})
			console.log('relRef:',relRef);
		}
	});



	////  UPDATE FUNCTIONALITY: Update Firebase DB with airport notes ////
	$(document).on('click', '#update', function(){
		updateAirport(airport);
	});
}




function updateAirport(data) {
	var $airportNotesInput = $('#airport-notes-input');  // *See Remarks: Create airport note
	var id = data.icao;
	var airportNotesIdRef = new Firebase('https://airport-status.firebaseio.com/notes/' + id);

	airportNotesIdRef.update({
		notes: $airportNotesInput.val(),
	});


	// *See Remarks: two-way relationship
	var notesOwnerRef = airportNotesIdRef.child('owner');
	var idOBJ = {};

	idOBJ[id] = true;  // Dynamically creates Key w/airport ID ~ data.KBUR = airportDB
	notesOwnerRef.update(idOBJ);

	/*var notesOwnerRef = new Firebase('https://airport-status.firebaseio.com/notes/owner');
	notesOwnerRef.update({
	})*/

	// end *See Remarks: two-way relationship


	$airportNotesInput.val('');
}


/*
REMARKS:

	* Create airport note:
		- Each template instance needs unique ID for notes input
		- Currently I have to reload the page between each airport search and note update
		- handlebars.registerHelper()?

	* Two-way relationship:
		- Set up two-way relationship between each airport instance and each notes instance
		- Firebase:  https://www.firebase.com/docs/web/guide/structuring-data.html
		- May have to switch to key rather than airport ID for this to work

		{
		    'airports': {
				'KLAX': {
					'name': 'Los Angeles Municipal Airport',
					'notes': {  // index Mary's groups in her profile
						'KLAX': true,  // value doesn't matter, just that the key exists
					},
				},
		    },
		    'notes': {
				'KLAX': {
					'note': 'Shoreline Route 2+mi Off Shore',
					'owner': {
						'KLAX': true,
					},
				},
		    },
		}

*/


/*
Technical hurdles:
	1) Create Firebase instance with airport ID instead of random Key
	2) Create two-way relationships in Firebase
	3) Create unique ID for handlebars template input field

Learned:
	1) How to dynamically create key name
		var data = {};
		data[airport.icao] = airportDB;

	2) Data structure on Firebase

*/















