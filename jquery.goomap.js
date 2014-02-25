/*
 * jQuery goomap v0.0.1
 * Contributing Author: Sebastien Lamy
 * Date: 2014-02-18
 */


;(function ($, doc, win) {
    'use strict';

    $.fn.goomap = function (options) {




        // ---------------------------------------------------------------------
        // SUPPORT FOR MULTIPLE ELEMENTS
        // ---------------------------------------------------------------------
        if (this.length > 1) {
            this.each(function () { $(this).goomap(options); });
            return this;
        }
        

        // ---------------------------------------------------------------------
        // DEFAULT SETTINGS
        // ---------------------------------------------------------------------
        var $googlemaps = google.maps;



        // ---------------------------------------------------------------------
        // DEFAULT SETTINGS
        // ---------------------------------------------------------------------
        var settings = $.extend({
            urlData : '/path-to-json-data.json', // json path to where geo data are stored
            autoDisplay : true, // if false, map display need to be called manually via the function displayMap()
            icons : null, // Default is using google defaul icon
            onDataLoaded : function () {}, // Callback function when geo data are loaded
            mapOptions : {
                center: new $googlemaps.LatLng(41.85, -87.65),
                zoom: 4,
                scrollwheel: false,
                panControl: false,
                mapTypeControl: true,
                scaleControl: false,
                streetViewControl: false,
                zoomControl: true,
                zoomControlOptions: { style: $googlemaps.ZoomControlStyle.SMALL },
                mapTypeId: $googlemaps.MapTypeId.ROADMAP
            }, // As per google map options
            styles : [], // As per google map style
            infoWindow : [ 'title', 'location' ], // default fields to be displayed
            maxWidthWindow : 300, // default width for infow window
            keyForImg : ["image", "images", "photos", "img", "media"] // default image key for displaying image
        }, options);





        // ---------------------------------------------------------------------
        // PRIVATE VARIABLES
        // ---------------------------------------------------------------------
        var _obj = this;
        var _map;
        var _idContainer;
        var _allData;
        var _allMarkers = [];
        var _allInfoWindow = [];
        var _imageKeyArr = settings.keyForImg;





        // ---------------------------------------------------------------------
        // PRIVATE METHODS
        // ---------------------------------------------------------------------



        // get Geo Data from given URL (json only)
        var _getGeoData = function() {
            $.getJSON(settings.urlData, function(data) {
                // Store All Data
                _allData = data.nodes;
                // Call Back when data are loaded
                settings.onDataLoaded.call( _obj );
                // Display Map if autoDIsplay is true
                if (settings.autoDisplay === true){
                    _obj.displayMap();
                }
            });
        };



        // Loop Data to get Geo info
        var _loopMarkers = function() {
            for (var key in _allData) {
                var geoData = _allData[key];
                // Loop through node item geoData (1 round)
                for (var prop in geoData) {
                    if(geoData.hasOwnProperty(prop)){
                        // Add Marker to the Map
                        _addMarker(geoData[prop]);
                    }
                }
            }
        };



        // Add a marker to the map
        var _addMarker = function($item) {
            // Get position 
            var position = new $googlemaps.LatLng($item.latitude,$item.longitude);
            // Get icon if passed on settings 
            var icon = (settings.icons !== null) ? { url: settings.icons.path+$item.marker+".png", size: settings.icons.size, origin: settings.icons.origin, anchor: settings.icons.anchor } : null;
            // Create marker
            var marker = new $googlemaps.Marker({
                position: position,
                map: _map,
                icon: icon
            });
            // Loop through all item properties and create properties to marker
            for (var propertyName in $item) {
                eval("marker."+propertyName+"='"+$item[propertyName]+"'");
            };

            // Add marker to main array of markers
            _allMarkers.push(marker);

            // Define Info Window
            var infowindow = new $googlemaps.InfoWindow({
                content: _templateInfoWindow(marker),
                maxWidth: settings.maxWidthWindow
            });

            // Add listener for markers to open info window
            $googlemaps.event.addListener(marker, 'click', function() {
                _closeAllInfoWindows();
                _allInfoWindow.push(infowindow); 
                infowindow.open(_map,marker);
            });
        };



        // Close all info window
        var _closeAllInfoWindows = function(){
            for (var i=0;i<_allInfoWindow.length;i++) {
                _allInfoWindow[i].close();
            }
        };



        // Generate Info Window
        var _templateInfoWindow = function($marker){
            var tpl = '<div id="content">';
            for (var i =0;i<settings.infoWindow.length;i++) {
                // console.log ($marker[settings.infoWindow[i]]);
                if( $marker[settings.infoWindow[i]] !== "" && $marker[settings.infoWindow[i]] !== "null" ){
                    // Add img tag if match one of the possible images key define in private
                    var field = ($.inArray(settings.infoWindow[i], _imageKeyArr) === -1 ) ? $marker[settings.infoWindow[i]] : '<img src="'+$marker[settings.infoWindow[i]]+'" alt="" />';
                    // Define the key of the object as the class for styling purpose
                    var classes = settings.infoWindow[i];
                    tpl += '<div class="'+classes+'">'+field+'</div>';
                }
            }
            tpl += '</div>';

            return tpl;
        };




        // ---------------------------------------------------------------------
        // PUBLIC METHODS
        // ---------------------------------------------------------------------

        // Init
        this.initialize = function() {
            // Store ID of current container
            _idContainer = this.attr("id");
            // get geo data
            _getGeoData();
            // Return element
            return this;
        };



        // Load the Map
        this.displayMap = function() {
            // Create Map
            _map = new $googlemaps.Map(document.getElementById(_idContainer), settings.mapOptions);
            // Apply style if some are passed on setings
            _map.setOptions({styles: settings.styles});
            // Loop all markers to add them
            _loopMarkers();
        };




        // ---------------------------------------------------------------------
        // RETURN 
        // ---------------------------------------------------------------------
        return this.initialize();



    };

})(jQuery, document, window);