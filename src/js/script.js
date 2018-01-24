'use strict';

/* Placeholder for FourSquare API parameters */
var fourSquareData = {
    client_id: 'EVSGF4DMPKFDQUNTWREGWPAP1TEL1YNLTC2YAUK13BJHCQNY',
    client_key: 'TH55VNBSYPX3ZZOPAERLTEBLTQBDWUPUCISGTBRJH3JM3ZZG',
    poiCategories: [
        {categoryName: 'eat', categoryId: '4d4b7105d754a06374d81259'},
        {categoryName: 'shop', categoryId: '4d4b7105d754a06378d81259'},
        {categoryName: 'stay', categoryId: '4bf58dd8d48988d1fa931735'}]
};

/* Placeholder for Google Map API objects */
var mapData = {
    mapProp: {
        center: {lat: 41.380923, lng: 2.16769}, /* Coordinates of Ciutat Vella (core of Barcelona's downtown) */
        zoom: 17},
    map: null,
    infowindow: null,
    bounds: null
};

/* Placeholder for properties and methods that convert data and control UI */
var viewModel = {
    /*
     * Invoked from Google Maps API script in index.html
     * Executes initMap() and sendAjaxRequests()
     */
    init: function() {
        this.initMap();
        this.sendAjaxRequests();
    },
    /*
     * Invoked from init method
     * Creates Google map. Stores map instances in mapData object
     */
    initMap: function() {
        const md = mapData;
        md.bounds = new google.maps.LatLngBounds();
        md.map = new google.maps.Map(document.getElementById('map'), md.mapProp);
        md.infowindow = new google.maps.InfoWindow();
    },
    /*
     * Invoked form init method
     * Sends AJAX requests to Foursquare API for categories listed in fourSquareData.poiCategories array
     */
    sendAjaxRequests:  function() {
        const self = this,
              fs = fourSquareData;
        var venueObj = {};
        /* Gets venues within 150 meters of Ciutat Vella (lat: 41.380923, lng: 2.16769) for each POI category */
        fs.poiCategories.forEach(function(poi) {
            $.ajax({
                url: 'https://api.foursquare.com/v2/venues/search/?ll=41.380923,2.16769&radius=100&categoryId=' + poi.categoryId + '&client_id=' + fs.client_id + '&client_secret=' + fs.client_key + '&v=20131124',
                dataType: 'json',
                success: function(data) {
                    data.response.venues.forEach(function(venue) {
                        // Initialize placeholder object to store venue properties
                        venueObj = {
                            name: venue.name,
                            id: venue.id,
                            lat: venue.location.lat,
                            lng: venue.location.lng,
                            address: venue.location.formattedAddress[0],
                            phone: venue.contact.phone,
                            url: 'https://foursquare.com/v/' + venue.id,
                            // url: 'https://foursquare.com/v/' + venue.id + '?ref=' + fs.client_id, /* need to test with the client ID now */
                            icon: 'img/' + poi.categoryName + '.png',
                            photo: '',
                            rating: ''
                        };
                        /* Pass placeholder object and name of POI category to getVenueDetails call */
                        self.getVenueDetails(venueObj, poi.categoryName);
                    });
                },
                error: function() {
                    self.errorMsg(poi.categoryName);
                }
            });
        });
    },
    /*
     * Invoked from sendAjaxRequests method
     * Sends AJAX request to Foursquare API to get 'photo' and 'rating' details for specific venue
     * Calls createMarker method upon complete
     */
    getVenueDetails: function(venue, poi) {
        const fs = fourSquareData;
        $.ajax({
            url: 'https://api.foursquare.com/v2/venues/' + venue.id + '?&client_id=' + fs.client_id + '&client_secret=' + fs.client_key + '&v=20131124',
            dataType: 'jsonp',
            success: function(data) {
                const venueDetails = data.response.venue;
                if (venueDetails.hasOwnProperty("rating")) {
                    venue.rating = venueDetails.rating / 2;  // convert to 5-point rating and set property
                }
                if (venueDetails.hasOwnProperty("bestPhoto")) {
                    venue.photo = venueDetails.bestPhoto.prefix + '100x100' + venueDetails.bestPhoto.suffix;  // assemble photo URL and set property
                }
            },
            error: function() {
                console.log("Cannot load details for " + venue.name);
            },
            complete: function() {
                viewModel.createMarker(venue, poi);
            }
        });
    },
    /*
     * Invoked from getVenueDetails method
     * Creates Google Maps API marker
     * Adds event listener to marker
     * Pushes marker to an observable array
     */
    createMarker: function(venue, poi) {
        const self = this,
              md = mapData,
              venDetEl = $('#venue-details'),
              drawer = $('#drawer');
        /*
         * Sets specific properties with venue details obtained from FourSquare API
         * Adds marker to the map
         */
        const marker = new google.maps.Marker({
            map: md.map,
            position: {lat: venue.lat, lng: venue.lng},
            title: venue.name,
            address: venue.address,
            phone: venue.phone,
            icon: venue.icon,
            photo: venue.photo,
            rating: venue.rating,
            animation: google.maps.Animation.DROP,
            id: venue.id,
            url: venue.url
        });
        /*
         * Brings up infoWindow on click
         * Sets clicked marker as currentMarker observable
         * Handles animation and #drawer position
         */
        marker.addListener('click', function() {
            const currMarker = self.currentMarker();
            if (self.dropdownMenu()) { self.dropdownMenu(false) }  // hide checkboxes if previously opened
            if (this !== currMarker) {  // check if new marker is clicked
                md.infowindow.open(md.map, this);  // make info window visible
                md.infowindow.setContent(this.title);  // display venue name in the info window
                self.animateMarker(this, currMarker);  // handle animation
                self.currentMarker(this);  // set clicked marker as currentMarker observable
                /* Toggle #drawer (ListingResults) tab */
                if (!drawer.hasClass('open')) {
                    drawer.addClass('open');
                }
                /* Set vertical position of scroll bar to show selected marker at the top of #venue-details container */
                venDetEl.scrollTop(venDetEl.scrollTop() + ($('.active-listing').offset().top - venDetEl.offset().top));
            } else {
                /* Toggle #drawer (Listing Results) tab */
                drawer.toggleClass("open");
            }
        });
        /* Push marker to an observable array associated with one of the POI categories */
        self[poi + 'ListingResults'].push(marker);
        md.bounds.extend(marker.position);  // extend map bounds to include this marker
    },
    /*
     * Invoked from createMarker method
     * Animates clicked marker and removes animation from previously selected marker
     */
    animateMarker: function(marker, currMarker) {
        /* Don't set animation if currentMarker is set to an empty object */
        if (currMarker.hasOwnProperty('animation')) { currMarker.setAnimation(null); }
        marker.setAnimation(google.maps.Animation.BOUNCE);
    },
    /* Handles KO visible binding that hides/shows #checkboxes element */
    dropdownMenu: ko.observable(false),
    /* Handles KO 'click' binding that hides/shows #drawer element */
    toggleDrawer: function() {
        const drawer = $('#drawer');
        drawer.toggleClass("open");
    },
    /* Stores information of clicked marker */
    currentMarker: ko.observable({}),
    /* Stores Marker objects for specific POI category */
    eatListingResults: ko.observableArray([]),
    shopListingResults: ko.observableArray([]),
    stayListingResults: ko.observableArray([]),
    /*
     * Handles KO 'click' binding in list view container
     * Uses event delegation to find clicked location in the list view
     * Handles 'active-listing' class and marker animation
     */
    handleVenueClick: function(vm, e) {
        const md = mapData,
              context = ko.contextFor(e.target),  //  returns binding context for clicked location
              marker = context.$data,  // returns marker object associated with clicked location
              currMarker = vm.currentMarker(),
              parentElem = e.target.closest(".drawer-content");  // gets closest element with class 'drawer-content'
        $(".active-listing").removeClass("active-listing");
        $(parentElem).toggleClass("active-listing");  // sets 'active-listing' class
        /* Handle animation and show info window for marker associated with clicked location */
        if (marker !== currMarker) {
            vm.animateMarker(marker, currMarker);
            md.infowindow.setContent(marker.title);
            md.infowindow.open(md.map, marker);
            md.map.setCenter(marker.getPosition());  // center marker on the map
            vm.currentMarker(marker);  // passes marker object to currentMarker observable
        }
    },
    /* Placeholder for values used in drop-down container */
    categories: ["Eat", "Shop", "Stay"],
    /* Sets array of parameters for KO 'checked' binding  */
    selectedValues: ko.observableArray(["Eat", "Shop", "Stay"]),  // initially selects all 3 categories
    /* Computes value used for KO 'options' control */
    fillOptions: ko.pureComputed(function() {
        var str = viewModel.selectedValues()
            .map(function(item) {
                return item;
            })
            .join(", ");
        return str || "-- Select your POI --";  // returns values from selectedValues array or message
    }),
    /*
     * Invoked by 'change' event bound to checkboxes
     * Displays/hides subset of markers on the map
     */
    filterMarkers:  function(checkedValue){
        var vm = viewModel,
            md = mapData,
            currMarker = vm.currentMarker,
            markersData = vm[checkedValue.toLowerCase() + "ListingResults"]();  // get array of markers associated with checkbox
        if (vm.selectedValues().includes(checkedValue)) {
            /* Display markers on the map associated with checked category */
            markersData.forEach(function(marker) { marker.setMap(md.map); });
            md.map.fitBounds(md.bounds);}
        else {
            if (markersData.includes(currMarker())) {
                currMarker({});  // empty currentMarker if it's included in array of to-be-hidden markers
                md.infowindow.close();  // close infoWindow (if open)
            }
            /* Hides markers on the map associated with unchecked category */
            markersData.forEach(function(marker) { marker.setMap(null); });
        }

    },
    /*
     * Invoked from sendAjaxRequests()
     * Shows error message in HTML for failed ajax() calls
     */
    errorMsg: function(label) {
        const hidden_msg = $('#hidden-msg');
        hidden_msg.css('display','block');
        hidden_msg.append("<p>Failed to load resources for category " + label.italics() + "." + "<br/>" + "Please try again soon.</p>");
        $("#" + label).append("<strong> - failed to load</strong>");
        $('#close-span').click(function() {
            hidden_msg.css('display','none')
        });
    },
    /*
     * Invoked from Google Maps API script in index.html
     * Shows error message for Google Maps API script
     */
    mapErrorMsg: function(){
        const hidden_msg = $('#hidden-msg');
        hidden_msg.css('display','block');
        hidden_msg.append("<p>Failed to load Google Maps." + "<br/>" + "Please try again soon.</p>");
        $('#close-span').click(function() {
            hidden_msg.css('display','none')
        });
    }
};

/*
 * Handles functionality of checkbox that selects all POI categories
 * Writes to viewModel.selectedValues observable array based on the state of the checkbox
 * Displays/hides subset of markers on the map
 */
viewModel.allSelected = ko.computed({
    read: function() {
        return this.selectedValues().length === 3;  // 'checked' binding reads returned boolean to check/uncheck the form control on screen
    },
    write: function(value) {  // parameter is a boolean
        var selectedValues = this.selectedValues();
        var categories = this.categories.slice(0);
        var unselectedValues = [];
        if(value) {
            for (var i = 0; i < categories.length; i++) {
                var key = categories[i];
                if (selectedValues.indexOf(key) === -1) {
                    unselectedValues.push(key);
                }
            }
            unselectedValues.forEach(function(item) {
                var markersData = item.toLowerCase() + "ListingResults";
                viewModel[markersData]().forEach(function(marker) {
                    marker.setMap(mapData.map);
                });
            });
            this.selectedValues(categories);
            mapData.map.fitBounds(mapData.bounds);
        } else {
            selectedValues.forEach(function(item) {
                var markersData = item.toLowerCase() + "ListingResults";
                viewModel[markersData]().forEach(function(marker) {
                    marker.setMap(null);
                });
            });
            this.selectedValues([]);
        }
    },
    owner: viewModel
});

ko.applyBindings(viewModel);

// Set view port of the map to fit the given bounds on browser window resize
$(window).resize(function() {
    mapData.map.fitBounds(mapData.bounds);
});