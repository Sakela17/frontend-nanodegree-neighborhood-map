'use strict';

/* Placeholder for FourSquare API parameters */
var fourSquareData = {
    client_id: 'EVSGF4DMPKFDQUNTWREGWPAP1TEL1YNLTC2YAUK13BJHCQNY',
    client_key: 'TH55VNBSYPX3ZZOPAERLTEBLTQBDWUPUCISGTBRJH3JM3ZZG',
    // poiCategories: [{categoryName: 'stay', categoryId: '4bf58dd8d48988d1fa931735'}]
    // poiCategories: [{name: 'shop', categoryId: '4d4b7105d754a06378d81259'}]
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

/* Methods and properties to convert data and control UI */
var viewModel = {
    /*
     * Invoked from Google Maps API script in index.html
     * Execute initMap() and sendAjaxRequests()
     */
    init: function() {
        this.initMap();
        this.sendAjaxRequests();
    },
    /*
     * Invoked from init method
     * Create Google map. Store map instances in mapData object
     */
    initMap: function() {
        var md = mapData;
        md.bounds = new google.maps.LatLngBounds();
        md.map = new google.maps.Map(document.getElementById('map'), md.mapProp);
        md.infowindow = new google.maps.InfoWindow();
    },
    /*
     * Invoked form init method
     * Send AJAX requests to Foursquare API for categories listed in fourSquareData.poiCategories array
     */
    sendAjaxRequests:  function() {
        var self = this,
            fs = fourSquareData,
            venueObj;
        /* Get venues within 150 meters of Ciutat Vella (lat: 41.380923, lng: 2.16769) for each POI category */
        fs.poiCategories.forEach(function(poi) {
            $.ajax({
                url: 'https://api.foursquare.com/v2/venues/search/?ll=41.380923,2.16769&radius=150&categoryId=' + poi.categoryId + '&client_id=' + fs.client_id + '&client_secret=' + fs.client_key + '&v=20131124',
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
                },
                complete: function(obj, string) {
                    // console.log(string);
                    // if (string === 'success') { viewModel[poi.categoryName + 'ListingResults'].valueHasMutated(); }
                }
            });
        });
    },
    /*
     * Invoked from sendAjaxRequests method
     * Send AJAX request to Foursquare API to get details for specific venue
     * Get 'photo' and 'rating' property values, set properties
     * Call createMarker method upon complete
     */
    getVenueDetails: function(venue, poi) {
        var fs = fourSquareData,
            venueDetails;
        $.ajax({
            url: 'https://api.foursquare.com/v2/venues/' + venue.id + '?&client_id=' + fs.client_id + '&client_secret=' + fs.client_key + '&v=20131124',
            dataType: 'jsonp',
            success: function(data) {
                venueDetails = data.response.venue;
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
     * Create Google Maps API marker
     * Add event listener on click
     * Push marker to an observable array
     */
    createMarker: function(venue, poi) {
        var self = this,
            md = mapData,
            currMarker,
            drawer = $('#drawer'),
            marker;
        /*
         * Set specific properties with venue details obtained from FourSquare API
         * Add marker to the map
         */
        marker = new google.maps.Marker({
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
         * Add event listener to bring up infoWindow on click
         * Set clicked marker as currentMarker observable
         * Handle animation and #drawer position
         */
        marker.addListener('click', function() {
            currMarker = self.currentMarker();
            if (self.dropdownMenu()) { viewModel.dropdownMenu(false) }  // hide checkboxes if previously opened
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
                var venDetEl = $('#venue-details');
                venDetEl.scrollTop(venDetEl.scrollTop() + ($('.active-listing').offset().top - venDetEl.offset().top));
            } else {
                /* Toggle #drawer (Listing Results) tab */
                drawer.toggleClass("open");
                /* Toggle animation when the same marker is clicked */
                // if (this.getAnimation() !== null) {
                //     this.setAnimation(null);
                // } else {
                //     this.setAnimation(google.maps.Animation.BOUNCE);
                // }
            }
        });
        /* Push marker to an observable array associated with one of the POI categories */
        self[poi + 'ListingResults'].push(marker);
        md.bounds.extend(marker.position);  // extend map bounds to include this marker
    },
    /*
     * Invoked from createMarker method
     * Animate clicked marker and remove animation from previously selected marker
     */
    animateMarker: function(marker, currMarker) {
        /* This check is needed for the very first click when current marker is an empty object */
        if (currMarker.hasOwnProperty('animation')) { currMarker.setAnimation(null); }
        marker.setAnimation(google.maps.Animation.BOUNCE);
    },
    /* Set KO visible binding to hide/show #checkboxes element */
    dropdownMenu: ko.observable(false),
    /* Set KO binding for 'click' event to hide/show #drawer element */
    toggleDrawer: function() {
        var drawer = $('#drawer');
        drawer.toggleClass("open");
    },
    /*
     * Set KO observable for clicked marker
     * Marker's id used to identify object in 'Listing Results' container to toggle 'active-listing'  */
    currentMarker: ko.observable({}),
    /*
     * Set KO observable arrays to hold Marker objects
     * Specific marker's object properties bound to the elements in 'Listing Results' container
     */
    eatListingResults: ko.observableArray([]),
    shopListingResults: ko.observableArray([]),
    stayListingResults: ko.observableArray([]),
    /* Set KO binding for 'click' event */
    handleMarker: function(vm, e) {
        var context = ko.contextFor(e.target);
        var marker = context.$data;
        var currMarker = vm.currentMarker();
        var parentElem = e.target.closest(".drawer-content");
        $(".active-listing").removeClass("active-listing");
        $(parentElem).toggleClass("active-listing");
        console.log($(parentElem));

        // If new marker is clicked
        if (marker !== currMarker) {
            vm.animateMarker(marker, currMarker);
            mapData.infowindow.setContent(marker.title);
            mapData.infowindow.open(mapData.map, marker);

        }

        // console.log(vm.currentMarker());
        // context.$data.setAnimation(google.maps.Animation.BOUNCE);
        vm.currentMarker(marker);
        console.log(vm.currentMarker());
    },
    toggleLabels: ["Eat", "Shop", "Stay"],
    selectedLabels: ko.observableArray(["Eat", "Shop", "Stay"]),
    fillOptions: ko.pureComputed(function() {
        var str = viewModel.selectedLabels()
            .map(function(item) {
                return item;
            })
            .join(", ");
        return str || "-- Select your POI --";
    }),
    // Handle checkbox' toggle events in drop down menu
    toggleMarkers:  function(labelName){
        var vm = viewModel,
            currMarker = vm.currentMarker,
            // Get array of markers associated with (un)checked label
            markersData = vm[labelName.toLowerCase() + "ListingResults"]();
        // Show markers associated with checked label
        if (vm.selectedLabels().includes(labelName)) {
            markersData.forEach(function(marker) { marker.setMap(mapData.map); });
            mapData.map.fitBounds(mapData.bounds);}
        // Hide markers associated with unchecked label
        else {
            // Set currentMarker to an empty object if it's included in array of to-be-hidden markers
            // Close infoWindow (if open)
            if (markersData.includes(currMarker())) {
                currMarker({});
                mapData.infowindow.close();
            }
            markersData.forEach(function(marker) { marker.setMap(null); });
        }
    },
    // Error message for ajax() calls in sendAjaxRequests()
    errorMsg: function(label) {
        $("#map-holder").append("<div id='fragment'><span style='cursor:pointer' id='close-span' onclick=$('#fragment').css('display','none')>x</span><p>Failed to load resources for category " + label.italics() + ". Please try again soon.</p></div>");
        $("#" + label).append("<strong> - failed to load</strong>");
    },
    // Error Handling for Google Maps API script
    mapErrorMsg: function(){
        $("#map-holder").append("<div id='fragment'><span style='cursor:pointer' id='close-span' onclick=$('#fragment').css('display','none')>x</span><p>Failed to load Google Maps." + "\n" + "Please try again soon.</p></div>");
        return true;
    }
};
viewModel.allSelected = ko.computed({
    read: function() {
        return this.selectedLabels().length === 3;
    },
    write: function(value) {
        var selectedLabels = this.selectedLabels();
        var toggleLabels = this.toggleLabels.slice(0);
        var unSelectedLabels = [];
        if(value) {
            for (var i = 0; i < toggleLabels.length; i++) {
                var key = toggleLabels[i];
                if (selectedLabels.indexOf(key) === -1) {
                    unSelectedLabels.push(key);
                }
            }
            unSelectedLabels.forEach(function(label) {
                var markersData = label.toLowerCase() + "ListingResults";
                viewModel[markersData]().forEach(function(marker) {
                    marker.setMap(mapData.map);
                });
            });
            this.selectedLabels(toggleLabels);
            mapData.map.fitBounds(mapData.bounds);
        } else {
            toggleLabels.forEach(function(label) {
                var markersData = label.toLowerCase() + "ListingResults";
                viewModel[markersData]().forEach(function(marker) {
                    marker.setMap(null);
                });
            });
            this.selectedLabels([]);
        }
    },
    owner: viewModel
});

ko.applyBindings(viewModel);

// Set view port of the map to fit the given bounds on browser window resize
$(window).resize(function() {
    mapData.map.fitBounds(mapData.bounds);
});