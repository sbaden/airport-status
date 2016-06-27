'use strict';  // Strict mode checks for undeclared variables (etc.?)

$(document).ready(function(){  //console.log('connected');
	
	// Initialize Firebase
	var config = {
		apiKey: "AIzaSyBbZHH2sVP6K3aZgR5xeQqz2PEw6RbLLTE",
		authDomain: "airport-status.firebaseapp.com",
		databaseURL: "https://airport-status.firebaseio.com",
		storageBucket: "",
	};

	firebase.initializeApp(config);

	// Submit button
	$('#get-airport-data').on('click', function(){
		var $airport = $('#airport-search');
		//console.log($airport.val().length);

		if(!$airport.val().trim() || $airport.val().length > 3){
			alert('Please enter a valid airport 3 letter identifier');
		}
		else{  //console.log($airport.val());

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
	//console.log(data.ICAO);

	///// Firebase
	var myDBReference = new Firebase('https://airport-status.firebaseio.com/')


	var airportsReference = myDBReference.child('Airports');
	///// end Firebase


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
	} // end airport Obj
	// console.log(airport.icao.toUpperCase());

	var readyTemplate = template(airport);  // Pass data Obj to template
	$('body').append(readyTemplate);  // Append DOM

	airportsReference.push({
		airport: airport + airport.icao,
	});

}







