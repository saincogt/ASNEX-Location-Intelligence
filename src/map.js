/**
 * Google map APIs
 */
/*eslint no-use-before-define: ["error", { "functions": false }]*/
/*global google:true*/
var map = null;
var marker = null;
var DEFAULT_LAT = -12.372938;
var DEFAULT_LNG = 130.879388;
var DEFAULT_ZOOM = 15;
var MAP_DIV = 'map';
var VALUE_TO_FIX = 7;
var fromPlace = 0;
var locationFromPlace;
var placeName;
var addressFromPlace;
var geocoder;
var StartingPoint = '30 Malay Rd, NT';
var EndPoint = 'Alice Springs, NT';
geocoder = new google.maps.Geocoder;
var trans = {
	DefaultLat: 40.741895,
	DefaultLng: -73.989308,
	DefaultHeading: 182,
	DefaultPitch: 5,
	DefaultSvZoom: 1,
	DefaultAddress: 'New York, NY, USA',
	Geolocation: 'Geolocation:',
	Latitude: 'Latitude:',
	Longitude: 'Longitude:',
	GetAltitude: 'Get Altitude',
	NoResolvedAddress: 'No resolved address',
	GeolocationError: 'Geolocation error.',
	GeocodingError: 'Geocode was not successful for the following reason: ',
	Altitude: 'Altitude: ',
	Meters: ' meters',
	NoResult: 'No result found',
	ElevationFailure: 'Elevation service failed due to: ',
	SetOrigin: 'Set as Origin',
	SetDestination: 'Set as Destination',
	Address: 'Address: ',
	Bicycling: 'Bicycling',
	Transit: 'Transit',
	Walking: 'Walking',
	Driving: 'Driving',
	Kilometer: 'Kilometer',
	Mile: 'Mile',
	Avoid: 'Avoid',
	DirectionsError: 'Calculating error or invalid route.',
	North: 'N',
	South: 'S',
	East: 'E',
	West: 'W',
	Type: 'type',
	Lat: 'latitude',
	Lng: 'longitude',
	Dd: 'DD',
	Dms: 'DMS',
	CheckMapDelay: 7e3
};

// some google objects
var infowindow = new google.maps.InfoWindow();

// var geocoder = new google.maps.Geocoder();

/**
 * [initialize description]
 * @return {[type]} [description]
 */
/*exported initialize*/
function initialize() {
	'use strict';

	var latlng = new google.maps.LatLng(DEFAULT_LAT, DEFAULT_LNG);

	var mapOptions = {
		scaleControl: true,
		zoom: DEFAULT_ZOOM,
		zoomControl: true,
		center: latlng,
		mapTypeId: google.maps.MapTypeId.ROADMAP,
		draggableCursor: 'crosshair',
		mapTypeControl: true,
		mapTypeControlOptions: {
			style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
			position: google.maps.ControlPosition.TOP_RIGHT
		}
	};

	map = new google.maps.Map(document.getElementById(MAP_DIV), mapOptions);
	var input1 = document.getElementById('pac-input-1');
	var searchBox1 = new google.maps.places.SearchBox(input1);
	var input2 = document.getElementById('pac-input-2');
	var searchBox2 = new google.maps.places.SearchBox(input2);
	map.controls[google.maps.ControlPosition.TOP_LEFT].push(input1);
	map.controls[google.maps.ControlPosition.LEFT_TOP].push(input2);

	var input1Autocomplete = new google.maps.places.Autocomplete(input1);
	input1Autocomplete.bindTo('bounds', map);
	var input2Autocomplete = new google.maps.places.Autocomplete(input2);
	input2Autocomplete.bindTo('bounds', map);

	var directionsService = new google.maps.DirectionsService();
	var directionsDisplay = new google.maps.DirectionsRenderer({
		draggable: true,
		map: map
	});
	// searchBox1.addListener('places_changed', function () {
	// 	var places = searchBox1.getPlaces();

	// 	if (places.length === false) {
	// 		return;
	// 	}

	// 	removeAllMarker();
	// 	var markers = [];
	// 	var bounds = new google.maps.LatLngBounds();
	// 	places.forEach(function (place) {
	// 		if (!place.geometry) {
	// 			// console.log('Returned place contains no geometry!');
	// 			return;
	// 		}

	// 		markers.push(new google.maps.Marker({
	// 			map: map,
	// 			title: place.name,
	// 			position: place.geometry.location
	// 		}));
	// 		if (place.geometry.viewpoint) {
	// 			bounds.union(place.geometry.viewpoint);
	// 		} else {
	// 			bounds.extend(place.geometry.location);
	// 		}
	// 	});
	// 	map.fitBounds(bounds);
	// });
	searchBox1.addListener('places_changed', function () {
		var places = input1Autocomplete.getPlace();
		if (places.length === false) {
			return;
		}

		removeAllMarker();
		addMarker(places.position, map);
		StartingPoint = places.position;
	});

	searchBox2.addListener('places_changed', function () {
		var places = input2Autocomplete.getPlace();
		if (places.length === false) {
			return;
		}

		removeAllMarker();
		addMarker(places.position, map);
		EndPoint = places.position;
	});

	directionsDisplay.addListener('directions_changed', function () {
		computeTotalDistance(directionsDisplay.getDirections());
	});

	directionsDisplay.setMap(map);

	displayRoute(StartingPoint, EndPoint, directionsService, directionsDisplay);

	google.maps.event.addListener(map, 'click', function (event) {
		addMarker(event.latLng, map);
	});
}

/**
 * [codeAddress description]
 * @return {[type]} [description]
 */
function codeAddress() {
	'use strict';
	var address = document.getElementById('pac-input-1').value;
	if (fromPlace === 1) {
		map.setCenter(locationFromPlace);
		if (marker !== null) {
			marker.setMap(null);
		}
		marker = new google.maps.Marker({
			map: map,
			position: locationFromPlace
		});
		latres = locationFromPlace.lat();
		lngres = locationFromPlace.lng();
		if (placeName !== '') {
			document.getElementById('address').value = addressFromPlace;
			var addressForInfoWindow = '<strong>' + placeName + '</strong> ' + addressFromPlace;
		} else {
			document.getElementById('address').value = addressFromPlace;
			var addressForInfoWindow = '<strong>' + placeName + '</strong> ' + addressFromPlace;
		}
		infowindow.setContent(infowindowContent(addressForInfoWindow, latres, lngres));
		infowindow.open(map, marker);
		document.getElementById('latitude').value = latres;
		document.getElementById('longitude').value = lngres;
		bookUp(document.getElementById('address').value, latres, lngres);
		ddversdms();
	} else {
		geocoder.geocode({
			address: address
		}, function(results, status) {
			if (status === google.maps.GeocoderStatus.OK) {
				map.setCenter(results[0].geometry.location);
				if (marker !== null) {
					marker.setMap(null);
				}
				marker = new google.maps.Marker({
					map: map,
					position: results[0].geometry.location
				});
				latres = results[0].geometry.location.lat();
				lngres = results[0].geometry.location.lng();
				document.getElementById('address').value = results[0].formatted_address;
				infowindow.setContent(infowindowContent(document.getElementById('address').value, latres, lngres));
				infowindow.open(map, marker);
				document.getElementById('latitude').value = latres;
				document.getElementById('longitude').value = lngres;
				bookUp(document.getElementById('address').value, latres, lngres);
				ddversdms();
			} else {
				// alert(trans.GeocodingError + status);
			}
		});
	}
}

/**
 * [bookUp description]
 * @param  {[type]} address   [description]
 * @param  {[type]} latitude  [description]
 * @param  {[type]} longitude [description]
 * @return {[type]}           [description]
 */
function bookUp(address, latitude, longitude) {
	'use strict';
	return false;
}

/**
 * [simulateClick description]
 * @param  {[type]} latitude  [description]
 * @param  {[type]} longitude [description]
 * @return {[type]}           [description]
 */
function simulateClick(latitude, longitude) {
	'use strict';
	var mev = {
		stop: null,
		latLng: new google.maps.LatLng(latitude, longitude)
	};
	google.maps.event.trigger(map, 'click', mev);
}

/**
 * [infowindowContent description]
 * @param  {[type]} text   [description]
 * @param  {[type]} latres [description]
 * @param  {[type]} lngres [description]
 * @return {[type]}        [description]
 */
function infowindowContent(text, latres, lngres) {
	'use strict';
	return '<div id="info_window">' + text + '<br/><strong>' + trans.Latitude + '</strong> ' + Math.round(latres * 1e6) / 1e6 + ' | <strong>' + trans.Longitude + '</strong> ' + Math.round(lngres * 1e6) / 1e6 + '<br/><br/><span id="altitude"><button type="button" class="btn btn-primary" onclick="getElevation()">' + trans.GetAltitude + '</button></span>' + bookmark() + '</div>';
}

/**
 * [ddversdms description]
 * @return {[type]} [description]
 */
function ddversdms() {
	'use strict';
	var lat, lng, latdeg, latmin, latsec, lngdeg, lngmin, lngsec;
	lat = parseFloat(document.getElementById('latitude').value) || 0;
	lng = parseFloat(document.getElementById('longitude').value) || 0;
	if (lat >= 0) {
		document.getElementById('nord').checked = true;
	}
	if (lat < 0) {
		document.getElementById('sud').checked = true;
	}
	if (lng >= 0) {
		document.getElementById('est').checked = true;
	}
	if (lng < 0) {
		document.getElementById('ouest').checked = true;
	}
	lat = Math.abs(lat);
	lng = Math.abs(lng);
	latdeg = Math.floor(lat);
	latmin = Math.floor((lat - latdeg) * 60);
	latsec = Math.round((lat - latdeg - latmin / 60) * 1e3 * 3600) / 1e3;
	lngdeg = Math.floor(lng);
	lngmin = Math.floor((lng - lngdeg) * 60);
	lngsec = Math.floor((lng - lngdeg - lngmin / 60) * 1e3 * 3600) / 1e3;
	document.getElementById('latitude_degres').value = latdeg;
	document.getElementById('latitude_minutes').value = latmin;
	document.getElementById('latitude_secondes').value = latsec;
	document.getElementById('longitude_degres').value = lngdeg;
	document.getElementById('longitude_minutes').value = lngmin;
	document.getElementById('longitude_secondes').value = lngsec;
}

/**
 * [showMarker description]
 * @return {[type]} [description]
 */
function showMarker() {
	'use strict';

	// remove all markers
	removeAllMarker();

	marker = new google.maps.Marker({
		position: map.getCenter(),
		map: map,

		// title: arr_markers[marker_index]["name"],
		draggable: true
	});

	showInfoWindow(marker);

	google.maps.event.addListener(marker, 'click', function() {
		showInfoWindow(marker);
	});

	google.maps.event.addListener(marker, 'dragend', function() {
		showInfoWindow(marker);
	});
}

/**
 * @param  {object} tempMarker show infor window for the marker.
 * @return {null} return null, show the info window.
 */
function showInfoWindow (tempMarker) {
	'use strict';

	var markerPositionLat = tempMarker.getPosition().lat().toFixed(VALUE_TO_FIX);
	var markerPositionLng = tempMarker.getPosition().lng().toFixed(VALUE_TO_FIX);
	var markerPostion = tempMarker.getPosition().lat().toFixed(VALUE_TO_FIX) + ', ' + tempMarker.getPosition().lng().toFixed(VALUE_TO_FIX);

	infowindow.setContent( '<div class="googleMap_infowindow">'
		+ '<span class="info_details"><strong>Drag marker to required location.</strong></span>'
		+ '<span class="info_details">Latitude:</span><span class="info_details"> <input id="markerX" type="text" size="18" value="'+ markerPositionLat + '"/><button id="copyLat" onclick="copyContent("markerX", "copyLat")">Copy Lat</button></span>'
		+ '<span class="info_details">Longitude:</span><span class="info_details"> <input id="markerY" type="text" size="18" value="'+ markerPositionLng +'"/><button id="copyLng" onclick="copyContent("markerY", "copyLng")">Copy Lng</button></span>'
		+ '<span class="info_details">Coordinates:</span><span class="info_details"> <input id="markerXY" type="text" size="18" value="' + markerPostion + '"/><button id="copyLatLng" onclick="copyContent("markerXY", "copyLatLng")">Copy?</button></div>'
	);

	// var newDiv = document.createElement('div');
	// newDiv.classList.add('googleMap_infowindow');
	// var newSpan1 = document.createElement('span');
	// newSpan1.classList.add('info_details');
	// var newStrong = document.createElement('strong');
	// var newContent = document.createTextNode('Drag marker to required location.');
	// newStrong.appendChild(newContent);
	// newSpan1.appendChild(newStrong);
	// newDiv.appendChild(newSpan1);

	// var currentDiv = document.getElementById('map');
	// document.body.insertBefore(newDiv, currentDiv);
	infowindow.open(map, tempMarker);
}

/**
 * remove all the markers existing on the map
 * @return {null} clear all the markers on the map
 */
function removeAllMarker() {
	'use strict';
	if(marker !== null) {
		marker.setMap(null);
	}
}

/**
 * show the address
 * @param  {address} address show the address
 * @return {null}         return null
 */
// function showAddress(address) {
// 	'use strict';

// 	geocoder.geocode( { 'address': address}, function(results, status) {

// 		if (status === google.maps.GeocoderStatus.OK) {
// 			// remove all markers
// 			removeAllMarker();

// 			map.setCenter(results[0].geometry.location);
// 			map.setZoom(13);

// 			showMarker();

// 		} else {
// 			alert(address + ' not found');
// 		}
// 	});
// }

/**
* Add marker to the map.
* @param {object} location the location of the crusor.
* @param {object} map the map object.
* @return {null} show the marker on the map.
**/
function addMarker(location, map) {
	'use strict';
	var AnotherMarker = new google.maps.Marker({
		position: location,
		map: map,
		draggable: true
	});

	// showInfoWindow(AnotherMarker);

	google.maps.event.addListener(AnotherMarker, 'click', function() {
		showInfoWindow(AnotherMarker);
	});

	google.maps.event.addListener(AnotherMarker, 'dragend', function() {
		showInfoWindow(AnotherMarker);
	});
}

/**
 * [displayRoute description]
 * @param  {[type]} origin      [description]
 * @param  {[type]} destination [description]
 * @param  {[type]} service     [description]
 * @param  {[type]} display     [description]
 * @return {[type]}             [description]
 */
function displayRoute(origin, destination, service, display) {
	'use strict';
	service.route({
		origin: origin,
		destination: destination,
		travelMode: 'WALKING',
		avoidTolls: true
	}, function (response, status) {
		if (status === 'OK') {
			display.setDirections(response);
		} else {

			// alert('Failed due to: ' + status);
		}
	});
}

/**
 * [computeTotalDistance description]
 * @param  {[type]} result [description]
 * @return {[type]}        [description]
 */
function computeTotalDistance(result) {
	'use strict';
	var total = 0;
	var myroute = result.routes[0];
	for (var i = 0; i < myroute.legs.length; i++) {
		total += myroute.legs[i].distance.value;
	}
	total /= 1000;

	// document.getElementById('total').innerHTML = total + ' km';
}

/**
 * Reveal the coordinates from the pasted strings
 * @return {[type]} [description]
 */
function getCoordinates() {
	'use strict';
	var x = document.getElementById('myText').value;

	// var whereCoordinates = x.indexOf('-1');
	// var myCoordinates = x.slice(whereCoordinates);
	// var coordinatesArray = myCoordinates.split(", ");
	if (x !== '') {
		var coordinatesArray = x.match(/[-+]\d+\.\d+|\d+\.\d+\b|\d+\d+\-\d(?=\w)/g).map(function (v) { return +v; });
		document.getElementById('completeCoordinates').value = coordinatesArray;
		document.getElementById('coordinatesX').value = coordinatesArray[0];
		document.getElementById('coordinatesY').value = coordinatesArray[1];
		document.getElementById('copyX').innerHTML = 'Copy X';
		document.getElementById('copyY').innerHTML = 'Copy Y';
		document.getElementById('copyXY').innerHTML = 'CopyXY';
		document.getElementById('copyX').className = 'btn btn-primary';
		document.getElementById('copyY').className = 'btn btn-primary';
		document.getElementById('copyXY').className = 'btn btn-primary';
		document.getElementById('copyLast').innerHTML = 'Copy Last Input';
		document.getElementById('lastInput').value = x;
		document.getElementById('myText').value = '';
	}
}

/**
 * [copyContent description]
 * @param  {[type]} textId   [description]
 * @param  {[type]} buttonId [description]
 * @return {[type]}          [description]
 */
function copyContent(textId, buttonId) {
	'use strict';
	document.getElementById(textId).select();
	document.execCommand('copy');
	document.getElementById(buttonId).innerHTML = 'Copied';
	document.getElementById(buttonId).className = 'btn btn-success';
}

/**
 * [generateLink description]
 * @return {[type]} [description]
 */
function generateLink() {
	'use strict';
	var road1 = document.getElementById('road1').value.toLowerCase().replace(/ /g, '+');
	var road2 = document.getElementById('road2').value.toLowerCase().replace(/ /g, '+');
	var address = 'http://maps.googleapis.com/maps/api/geocode/json?address=';
	var regionDisplay = '&amp;region=au';
	var regionActual = '&region=au';
	var myString = address + road1 + '+and+' + road2;
	document.getElementById('geocodeLink').href = myString + regionActual;
	document.getElementById('geocodeLink').innerHTML = myString + regionDisplay;
}
