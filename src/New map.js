/**
 * ASNEX Map tool using Google Maps APIs
 */
/*eslint no-use-before-define: ["error", { "functions": false }]*/

var DEFAULT_LAT = -12.372938;
var DEFAULT_LNG = 130.879388;
var DEFAULT_ZOOM = 15;
var NUMBERFLOOR = 7;
var MAP_DIV = 'map';
var map = null;
var markers = [];
var infowindow = new google.maps.InfoWindow();

/* exported initialize */
/* global google:true */
/**
 * Initialize the map in the element div 'map'
 * @return {void}
 */
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
	initSearchBox();
	var directionsService = new google.maps.DirectionsService();
	var directionsDisplay = new google.maps.DirectionsRenderer({
		draggable: true,
		map: map
	});
	directionsDisplay.setMap(map);
}

/**
 * Initialize SearchBoxes
 * @return {void}
 */
function initSearchBox() {
	'use strict';
	var origin = document.getElementById('origin');
	var destination = document.getElementById('destination');
	var searchBox1 = new google.maps.places.SearchBox(origin);
	var searchBox2 = new google.maps.places.SearchBox(destination);
	map.controls[google.maps.ControlPosition.TOP_LEFT].push(origin);
	map.controls[google.maps.ControlPosition.LEFT_TOP].push(destination);
	var originAutoComplete = new google.maps.places.Autocomplete(origin);
	var destinationAutoComplete = new google.maps.places.Autocomplete(destination);
	originAutoComplete.bindTo('bounds', map);
	destinationAutoComplete.bindTo('bounds', map);
	markers.push(new google.maps.Marker({
		map: map,
		position: places.geometry.location
	}));

	google.maps.event.addListener(map, 'click', function (event) {
		addMarker(event.latLng, map);
	});
}

/**
 * [direction description]
 * @return {void}
 */
function direction() {
	'use strict';
	var origin = document.getElementById('origin').value;
	var destination = document.getElementById('destination').value;
	console.log(origin, destination);
	displayRoute(origin, destination, directionsService, directionsDisplay);
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
 * Add a marker on the map
 * @param {object} location indicates the current location being clicked
 * @param {object} currentMap indicates the map where the marker is going to be created in
 * @return {void}
 */
function addMarker(location, currentMap) {
	'use strict';
	var currentMarker = new google.maps.Marker({
		position: location,
		map: currentMap,
		draggable: true
	});
	markers.push(currentMarker);
	google.maps.event.addListener(currentMarker, 'click', function() {
		// should show the infowindow
		console.log('just clicked!');
		showInfoWindow(currentMarker);
	});
	google.maps.event.addListener(currentMarker, 'dblclick', function(event) {
		// markers[markers.length - 1].setMap(null);
		// markers.pop();
		// delete event.target;
		// console.log('just double clicked!');
		currentMarker.setMap(null);
	});
	google.maps.event.addListener(currentMarker, 'dragend', function () {
		console.log('dragend! cool!');
		showInfoWindow(currentMarker);

	});
	google.maps.event.addListener(currentMarker, 'rightclick', function () {
		console.log('right clicked!');
		showRightMenu(currentMarker);
	});
}

/**
 * [setMarker description]
 * @param {[type]} position [description]
 * @param {[type]} currentMap [description]
 * @param {[type]} markerId [description]
 * @return {void}
 */
function setMarker(position, currentMap, markerId) {
	'use strict';
	removeMarkers(markerId);
	var tempMarker = new google.maps.Marker({
		position: position,
		map: currentMap,
		draggable: true
	});
	tempMarker.setMap(map);
	tempMarker.metadata = { id: markerId };
	markers[markerId] = tempMarker;
}

/**
 * remove the specific marker from the map
 * @param  {number} markerId the id of the marker
 * @return {void}
 */
function removeMarkers(markerId) {
	'use strict';
	if (markers[markerId]) {
		markers[markerId].setMap(null);
		delete markers[markerId];
	}
}

/**
 * index all the markers from the array
 * @param {number} parameter index of the markers array
 * @return {void}
 */
function setMapOnAll(parameter) {
	'use strict';
	for (var i = 0; i < markers.length; i++) {
		markers[i].setMap(parameter);
	}
}

/**
 * @param  {object} tempMarker show infor window for the marker.
 * @return {null} return null, show the info window.
 */
function showInfoWindow (tempMarker) {
	'use strict';
	var markerPositionLat = tempMarker.getPosition().lat().toFixed(NUMBERFLOOR);
	var markerPositionLng = tempMarker.getPosition().lng().toFixed(NUMBERFLOOR);
	var markerPostion = tempMarker.getPosition().lat().toFixed(NUMBERFLOOR) + ', ' + tempMarker.getPosition().lng().toFixed(NUMBERFLOOR);

	infowindow.setContent( '<div class="googleMap_infowindow">'
		+ '<span class="info_details"><strong>Drag marker to required location.</strong></span>'
		+ '<span class="info_details">Latitude:</span><span class="info_details"> <input id="markerX" type="text" size="18" value="'+ markerPositionLat + '"/><button id="copyLat" onclick="copyContent("markerX", "copyLat")">Copy Lat</button></span>'
		+ '<span class="info_details">Longitude:</span><span class="info_details"> <input id="markerY" type="text" size="18" value="'+ markerPositionLng +'"/><button id="copyLng" onclick="copyContent("markerY", "copyLng")">Copy Lng</button></span>'
		+ '<span class="info_details">Coordinates:</span><span class="info_details"> <input id="markerXY" type="text" size="18" value="' + markerPostion + '"/><button id="copyLatLng" onclick="copyContent("markerXY", "copyLatLng")">Copy?</button></div>'
	);
	infowindow.open(map, tempMarker);
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

function showRightMenu(tempMarker) {
	showInfoWindow(tempMarker);
	infowindow.setContent('insert origin,right clicked');
}