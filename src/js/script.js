$('#drawer').on('swipeup', handleSwipeUp);
$('#drawer').on('swipedown', handleSwipeDown);

function handleSwipeUp() {
    alert("swiped up");
}

function handleSwipeDown() {
    alert('swiped down');
}



// var touchstartX = 0;
// var touchstartY = 0;
// var touchendX = 0;
// var touchendY = 0;

// var gestureZone = document.getElementById('drawer');

// gestureZone.addEventListener('touchstart', function(event) {
//     touchstartX = event.screenX;
//     touchstartY = event.screenY;
// }, false);

// gestureZone.addEventListener('touchend', function(event) {
//     touchendX = event.screenX;
//     touchendY = event.screenY;
//     handleGesure();
// }, false); 

// function handleGesure() {
//     var swiped = 'swiped: ';
//     // if (touchendX < touchstartX) {
//         // alert(swiped + 'left!');
//     // }
//     // if (touchendX > touchstartX) {
//         // alert(swiped + 'right!');
//     // }
//     if (touchendY < touchstartY) {
//         alert(swiped + 'down!');
//     }
//     if (touchendY > touchstartY) {
//         alert(swiped + 'up!');
//     }
//     // if (touchendY == touchstartY) {
//         // alert('tap!');
//     // }
// }

var mapData = {
    map: null,
    infoWindow: null,
    bounds: null,
    eatMarkersData: [],
    shopMarkersData: [],
    stayMarkersData: []
};

var fourSquareData = {
    cliend_id: 'EVSGF4DMPKFDQUNTWREGWPAP1TEL1YNLTC2YAUK13BJHCQNY',
    client_key: 'TH55VNBSYPX3ZZOPAERLTEBLTQBDWUPUCISGTBRJH3JM3ZZG',
    poiCategories: [{name: 'stay', categoryId: '4bf58dd8d48988d1fa931735'}]
    // poiCategories: [{name: 'eat', categoryId: '4d4b7105d754a06374d81259'}, {name: 'shop', categoryId: '4d4b7105d754a06378d81259'}, {name: 'stay', categoryId: '4bf58dd8d48988d1fa931735'}]
    // categoryFood: {name: 'eat', categoryId: 4d4b7105d754a06374d81259},
    // categoryShop: {name: 'shop', categoryId: 4d4b7105d754a06378d81259},
    // categoryHotel: {name: 'stay', categoryId: 4bf58dd8d48988d1fa931735}

};


var viewModel = {
    initialize: function() {
        console.log('go');
        this.initMap();
        this.sendAjaxRequests();
    },
    initMap: function() {
        var mapProperties;
        mapData.bounds = new google.maps.LatLngBounds();
        mapProperties = {
            center: new google.maps.LatLng(41.380923, 2.167697),
            zoom: 17
        };
        mapData.map = new google.maps.Map(document.getElementById('map'), mapProperties);
        mapData.infoWindow = new google.maps.InfoWindow();
    },
    // Send AJAX requests to Foursquare API for 3 POI categories
    // Called from initialize()
    sendAjaxRequests:  function() {
        var obj,
            fourSquare = fourSquareData;
        console.log(fourSquare);
        fourSquareData.poiCategories.forEach(function(poi) {
            $.ajax({
                url: 'https://api.foursquare.com/v2/venues/search/?ll=41.380923,2.167697&radius=150&categoryId=' + poi.categoryId + '&client_id=' + fourSquareData.cliend_id + '&client_secret=' + fourSquareData.client_key + '&v=20131124',
                dataType: 'json',
                success: function(data) {
                    if (data.meta.code === 200) {
                        data.response.venues.forEach(function(venue) {
                            console.log('loop each venue in ' + poi.name + ' category');
                            console.log(obj);
                            obj = {
                                name: venue.name,
                                id: venue.id,
                                lat: venue.location.lat,
                                lng: venue.location.lng,
                                address: venue.location.formattedAddress[0],
                                phone: venue.contact.phone,
                                url: 'https://foursquare.com/v/' + venue.id,
                                icon: 'img/' + poi.name + '.png',
                                photo: '',
                                rating: ''
                            };
                            $.ajax({
                                url: 'https://api.foursquare.com/v2/venues/' + obj.id + '?&client_id=' + fourSquareData.cliend_id + '&client_secret=' + fourSquareData.client_key + '&v=20131124',
                                dataType: 'jsonp',
                                success: function(data) {
                                    var venueDetails = data.response.venue;
                                    if (data.meta.code === 200) {
                                        if (venueDetailsails.hasOwnProperty("rating")) {
                                            obj.rating = venueDetails.rating / 2;
                                            console.log('has rating');
                                        }
                                        if (venueDetails.hasOwnProperty("bestPhoto")) {
                                            obj.photo = venueDetails.bestPhoto.prefix + '100x100' + venueDetails.bestPhoto.suffix;
                                            console.log('has photo');
                                        }

                                    } else {
                                        console.log("cannot load image for" + obj.name);
                                    }
                                },
                                error: function() {
                                    console.log("cannot load image for" + obj.name);
                                },
                                complete: function() {
                                    console.log(obj);
                                    viewModel.createMarker(obj, poi.name);

                                    console.log('complete venue details request');

                                }
                            });

                        })
                    } else {
                        viewModel.errorMsg(poi.name);
                    }
                },
                error: function() {
                    viewModel.errorMsg(poi.name);
                },
                complete: function(object, string) {
                    console.log(object.responseText);
                    console.log(string);
                    if (string === 'success') { viewModel[poi.name + 'ListingResults'].valueHasMutated(); }
                }
            });
        });
    },
    // Create Google Maps API markers in place of Foursquare API venues passed in array from sendAjaxRequests()
    createMarker: function(obj, poi) {
        var marker = new google.maps.Marker({
            map: mapData.map,
            position: {lat: venue.lat, lng: venue.lng},
            title: obj.name,
            address: obj.address,
            phone: obj.phone,
            icon: obj.icon,
            photo: obj.photo,
            rating: obj.rating,
            animation: google.maps.Animation.DROP,
            id: obj.id,
            url: obj.url
        });
        // Create a click event listener to open infoWindow with a name of the place at each marker
        // Set clicked marker as current marker
        // Handle animation and drawer position
        // Send request to get image and rating for the clicked marker
        marker.addListener('click', function() {
            var drawer = $('#drawer');
            var currMarker = viewModel.currentMarker();
            mapData.infoWindow.setContent(this.title);
            mapData.infoWindow.open(mapData.map, this);
            // Close dropdown menu if open
            if (viewModel.dropdownMenu()) { viewModel.dropdownMenu(false) }
            // If different marker is clicked, animate it and pass it to current marker observable

            // Run getVenueDetails() to get image and rating for the clicked marker
            if (this !== currMarker) {
                viewModel.animateMarker(this, currMarker);
                viewModel.currentMarker(this);
                // Bring focus to venue on list view
                $('.active-listing').focus();

                if (!drawer.hasClass("open")) { drawer.addClass("open"); }
                // Toggle drawer when the same marker is clicked
            } else {
                drawer.toggleClass("open");
            }
        });
        // Push marker to array associated with one of the POI categories
        mapData[poi + 'MarkersData'].push(marker);
        mapData.bounds.extend(marker.position);
    },
    // Animate clicked marker and remove animation from previously selected marker
    animateMarker: function(marker, currMarker) {
        // This check is needed for the very first click when current marker is an empty object
        if (currMarker.hasOwnProperty('animation')) { currMarker.setAnimation(null); }
        marker.setAnimation(google.maps.Animation.BOUNCE);
    },
    getVenueDetails: function(venue) {
        $.ajax({
            url: 'https://api.foursquare.com/v2/venues/' + venue.id + '?&client_id=EVSGF4DMPKFDQUNTWREGWPAP1TEL1YNLTC2YAUK13BJHCQNY&client_secret=TH55VNBSYPX3ZZOPAERLTEBLTQBDWUPUCISGTBRJH3JM3ZZG&v=20131124',
            dataType: 'jsonp',
            success: function(data) {
                if (data.meta.code === 200) {
                    if (data.response.venue.hasOwnProperty("rating")) {
                        venue.rating = data.response.venue.rating / 2;
                        // viewModel.currentMarker.valueHasMutated();
                        // viewModel.showRating(venue.rating);
                        console.log(venue);
                    } else {
                        venue.rating = "";
                    }
                    if (data.response.venue.hasOwnProperty("bestPhoto")) {
                        venue.photo = data.response.venue.bestPhoto.prefix + '100x100' + data.response.venue.bestPhoto.suffix;
                        console.log('has photo');
                        // viewModel.currentMarker.valueHasMutated();
                    } else {
                        venue.photo = "";
                    }

                } else {
                    alert("Sorry, cannot load image for selected venue. Please try again soon.");
                }
            },
            error: function() {
                alert("Sorry, cannot load image for selected venue. Please try again soon.");
            }
        });
    },
    // Add child node which image overlays the parent node's image to show rating (yellow stars)
    // Set image's width using venue's rating passed as a parameter
    showRating: function(r) {
        console.log($('#stars'));
        $('#stars').html($('<span/>').width(r*16));
    },
    dropdownMenu: ko.observable(false),
    // Show/hide dropdown menu with checkboxes
    toggleDropdown: function() {
        this.dropdownMenu(!this.dropdownMenu());
    },
    // Handle position of the #drawer element
    toggleDrawer: function() {
        var drawer = $('#drawer');
        drawer.toggleClass("open");
    },
    currentProfit: ko.observable(150000),
    currentMarker: ko.observable({}),
    eatListingResults: ko.observableArray(mapData.eatMarkersData),
    shopListingResults: ko.observableArray(mapData.shopMarkersData),
    stayListingResults: ko.observableArray(mapData.stayMarkersData),
    //
    handleMarker: function(vm, e) {
        var context = ko.contextFor(e.target);
        var marker = context.$data;
        var currMarker = vm.currentMarker();
        var parentElem = e.target.closest(".drawer-content");
        $(".active-listing").removeClass("active-listing");
        $(parentElem).toggleClass("active-listing");
        console.log($(parentElem));

        // console.log(ko.contextFor(e.target));
        // console.log(context.$data);
        if (marker !== currMarker) {
            vm.animateMarker(marker, currMarker);
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
    // Handle checkbox click events for 'Eat', 'Shop', and 'Stay' labels
    toggleMarkers:  function(labelName){
        // Store reference to array of markers from mapData that matches clicked label
        var markersData = mapData[labelName.toLowerCase() + "MarkersData"];
        // Check if clicked label was previously selected. Show/hide markers
        if (viewModel.selectedLabels().includes(labelName)) {
            markersData.forEach(function(marker) {
                marker.setMap(mapData.map);
            });
            mapData.map.fitBounds(mapData.bounds);
        } else {
            markersData.forEach(function(marker) {
                marker.setMap(null);
            });

            // Set currentMarker observable to null if its value matches an object from the hidden array of markers
            if (markersData.includes(viewModel.currentMarker())) {
                console.log('hello');
                viewModel.currentMarker(null);
            }
        }
    },
    errorMsg: function(label) {
        $("#map-holder").append("<div id='fragment'><span style='cursor:pointer' id='close-span' onclick=$('#fragment').css('display','none')>x</span><p>Failed to load resources. Please try again soon.</p></div>");
        $("#" + label).append("<strong> - failed to load</strong>");
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
                var markersData = label.toLowerCase() + "MarkersData";
                mapData[markersData].forEach(function(marker) {
                    marker.setMap(mapData.map);
                });
            });
            this.selectedLabels(toggleLabels);
            mapData.map.fitBounds(mapData.bounds);
        } else {
            toggleLabels.forEach(function(label) {
                console.log('all deselected');
                var markersData = label.toLowerCase() + "MarkersData";
                mapData[markersData].forEach(function(marker) {
                    marker.setMap(null);
                });
            });
            this.selectedLabels([]);
        }
    },
    owner: viewModel
});

ko.applyBindings(viewModel);

