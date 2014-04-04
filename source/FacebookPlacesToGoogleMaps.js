// ==UserScript==
// @name           Facebook Places - With Google Maps
// @namespace      http://swaroop.in
// @description    Facebook places by default has Bing maps, but if you wish to have Google Maps instead. This is the right script for you
// @include        http://www.facebook.com/pages/*
// @include        http://facebook.com/pages/*
// @include        https://www.facebook.com/pages/*
// @include        https://facebook.com/pages/* 	
// ==/UserScript==

// Heavy inspiration of the Dynamic Google Maps script from http://userscripts.org/scripts/show/116339
// Don't remove the &callback=initialize as despite the callback error this is required. 
API_js_callback = "http://maps.google.com/maps/api/js?sensor=false&callback=initialize";

var script = document.createElement('script');
    script.src = API_js_callback;
    var head = document.getElementsByTagName("head")[0];
    (head || document.body).appendChild(script);

var mappingDiv = document.createElement('div');
    mappingDiv.id = 'map_canvas';
    mappingDiv.style.height = '500px';
    mappingDiv.style.width = '500px';
	mappingDiv.style.position = 'fixed';

initialize = setTimeout(function () {
    google = unsafeWindow.google;
    
    var currentPlace = new google.maps.LatLng(-30.034176,-51.229212);
    var myOptions = {
        zoom: 16,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        center: currentPlace
    }
	
	prepareDivForDynamicMaps();
    
    map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);

	// Replaces the current map with google maps. 
	function replaceWithGoogleMap(latitude, longitude, width, height) {
		GM_log('Starting to replace Google Map with latitude = ' + latitude + ' and longitude ' + longitude + " and size " + width + "x" + height);
		
		mappingDiv.width = width + "px";
		mappingDiv.height = height + "px";
		
		var newPlace = new google.maps.LatLng(latitude, longitude);
        map.setCenter(newPlace);
		
	    var myOptions = {
			visible: true,
			map: map,
			clickable: false,
			position: newPlace
		}
		
		var marker = new google.maps.Marker(myOptions);
		
		GM_log('Finished replacing Google Map with latitude = ' + latitude + ' and longitude ' + longitude + " and size " + width + "x" + height);
	}
	
	function prepareDivForDynamicMaps() {
		// For now coding for Google Maps
		var divPagelet_Place_info = document.getElementById('pagelet_info');
		var divReference = divPagelet_Place_info.childNodes[0].childNodes[1].childNodes[1];
		
		insertAfter(divReference, mappingDiv);

		// GM_log('Modified DIV ' + divReference.outerHTML);
	}
	
	// This function inserts newNode after referenceNode
	function insertAfter( referenceNode, newNode )
	{
		referenceNode.parentNode.insertBefore( newNode, referenceNode.nextSibling );
	}
	
	// Fetch the URL parameter from your "http://yoururl/someAction?param1=value1&param2=value2"
	// works with "?param1=value1&param2=value2"
	function fetchURLParameter(fullURL, paramName) {
		var parameters = fullURL.slice(fullURL.indexOf('?')+1);
		// GM_log('Paramters = ' + parameters);
		var paramArray = parameters.split('&');
		for(var a=0; a<paramArray.length; a++) {
			var eachParam = paramArray[a];
			// GM_log('Param[' + a + '] = ' + eachParam);
			var eachParamArray = eachParam.split('=');
			// GM_log('Key = ' + eachParamArray[0] + ' Param = ' + eachParamArray[1]);
			if(eachParamArray[0] == paramName) {
				return eachParamArray[1];
			}
		}
	}
	
	function fetchLatitudeAndLongitude () {
		
			GM_log('Start looking for the pagelet_place_info');
			
			// A pain to drill down to find the right element - you need to know the id or name of the element.
			// This will be replaced with JQuery later - don't worry - the logic won't change
			var divPagelet_Place_info = document.getElementById('pagelet_info');
			GM_log('Found pagelet_place_info');
		   
			// 0/1/1
			var divReference = divPagelet_Place_info.childNodes[0].childNodes[1].childNodes[1];
			// prepareDivForDynamicMaps(divReference);
			
			GM_log('Found Div Reference' + divReference.outerHTML);
			
			// 0/1/1/0/0		
			var bingImgReference = divReference.childNodes[0].childNodes[0];      
			
			GM_log("Found Bing Image = " + bingImgReference.outerHTML);
		   
			var bingMapsImageSrc = bingImgReference.src;
			GM_log('bingMapsImageSrc = ' + bingMapsImageSrc);
		   
			var coordinateURL = fetchURLParameter(bingMapsImageSrc, 'url');
			coordinateURL = unescape(coordinateURL);
			coordinateURL = unescape(coordinateURL);
		   
			GM_log('Coordinate URL = ' + coordinateURL);
			var coordinates = fetchURLParameter(coordinateURL, 'ppl');
			//GM_log('Coordinates = ' + coordinates);
		   
			// would be in the format xxxx,,latitude,longitude
			var coordinatesArray = coordinates.split(',');
			var latitude = coordinatesArray[2];
			var longitude = coordinatesArray[3];
			GM_log('Latitude = ' + latitude + ' Longitude = ' + longitude);
		   
			var imageWidth = bingImgReference.width;
			var imageHeight = bingImgReference.height + 200;
			
			replaceWithGoogleMap(latitude, longitude, imageWidth, imageHeight);

			// Empty out the original div as we want to remove the original map.
			divReference.innerHTML = "";
			GM_log('Removing the original image');
			
			GM_log('FINISH: Facebook places - now replaced Bing Maps with Dynamic Google Map image');

	}
	
	fetchLatitudeAndLongitude();

	//--
}, 5000);