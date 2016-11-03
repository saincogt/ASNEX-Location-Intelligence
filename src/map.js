var map = null;
var marker = null;
var default_lat = -12.372938;
var default_lng = 130.879388;
var default_zoom = 15;
var map_div = "map_canvas";
// some google objects
var infowindow = new google.maps.InfoWindow();
var geocoder = new google.maps.Geocoder();
var argument;

$(document).ready(function() {
	$("#frm_show_address").submit(function() {
		var street_address = $("#street_address").val();
		if(street_address.length > 0){
			// display code address
			showAddress(street_address);
		}

		return false;
	});

});

function initialize() {

	var latlng = new google.maps.LatLng(default_lat, default_lng);

	var mapOptions = {
		scaleControl: true,
		zoom: default_zoom,
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

	// map_div
	map = new google.maps.Map(document.getElementById("map"), mapOptions);
	var input1 = document.getElementById('pac-input-1');
	var input2 = document.getElementById('pac-input-2');

	var directionsService = new google.maps.DirectionsService();
	var directionsDisplay = new google.maps.DirectionsRenderer();
	directionsDisplay.setMap(map);

	map.controls[google.maps.ControlPosition.TOP_LEFT].push(input1);
	map.controls[google.maps.ControlPosition.LEFT_TOP].push(input2);

	var input1_autocomplete = new google.maps.places.Autocomplete(input1);
	input1_autocomplete.bindTo('bounds', map);
	var input2_autocomplete = new google.maps.places.Autocomplete(input2);
	input2_autocomplete.bindTo('bounds', map);

	google.maps.event.addListener(map, 'click', function (event) {
		addMarker(event.latLng, map);
	});

	showMarker();
}

function showMarker(){
	// remove all markers
	remove_all_markers();

	marker = new google.maps.Marker({
			position: map.getCenter(),
			map: map,
			// title: arr_markers[marker_index]["name"],
			draggable: true
	});

	show_infoWindow(marker);

	google.maps.event.addListener(marker, 'click', function(event) {
		show_infoWindow(marker);
	});

	google.maps.event.addListener(marker, "dragend", function() {
		show_infoWindow(marker);
	});
}

function show_infoWindow(marker){

	infowindow.setContent( '<div class="googleMap_infowindow">'
		+'<span class="info_details"><strong>Drag marker to required location.</strong></span>'
		+ '<span class="info_details">Latitude:</span><span class="info_details"> <input type="text" size="18" value="'+ marker.getPosition().lat().toFixed(7) + '"/><button>Copy Lat</button></span>'
		+ '<span class="info_details">Longitude:</span><span class="info_details"> <input type="text" size="18" value="'+ marker.getPosition().lng().toFixed(7) +'"/><button>Copy Lng</button></span>' 
		+ '<span class="info_details">Coordinates:</span><span class="info_details"> <input type="text" size="18" value="' + marker.getPosition().lat().toFixed(7) + ', ' + marker.getPosition().lng().toFixed(7) + '"/><button>Copy?</button></div>'
	);
	infowindow.open(map,marker);
}

function remove_all_markers(){
	if(marker != null){
		marker.setMap(null); 
	}
}

// function build_info_window() {

// // var sea_level;

// // 	$.ajax({
// // 		url: "googlemap.html",
// // 		type: "POST",
// // 		dataType: 'html',
// // 		data: {
// // 			lat: marker.getPosition().lat(),
// // 			lng: marker.getPosition().lng()
// // 		},
// // 		success: function(respText) {
// // 			if (respText == '-9999') {
// // 				sea_level = '';
// // 			} else if (respText.match('Error: the free servers are currently overloaded with requests.')) {
// // 				sea_level = '';
// // 			} else {
// // 				sea_level = respText + ' m';
// // 			}
// // 		},
// // 		complete: function() {
// // 			show_infoWindow(sea_level);
// // 		}
// // 	});
// 	show_infoWindow(marker);
// }

function showAddress(address) {

	geocoder.geocode( { 'address': address}, function(results, status) {

		if (status == google.maps.GeocoderStatus.OK) {
			// remove all markers
			remove_all_markers();
			
			map.setCenter(results[0].geometry.location);
			map.setZoom(13);

			showMarker();

		} else {
			alert(address + " not found");
		}
	});
}

function addMarker(location, map) {
	var AnotherMarker = new google.maps.Marker({
		position: location,
		map: map,
		draggable: true
	});

	show_infoWindow(AnotherMarker);

	google.maps.event.addListener(AnotherMarker, 'click', function(event) {
		show_infoWindow(AnotherMarker);
	});

	google.maps.event.addListener(AnotherMarker, "dragend", function() {
		show_infoWindow(AnotherMarker);
	});
	
}