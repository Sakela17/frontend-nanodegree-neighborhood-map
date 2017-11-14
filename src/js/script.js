// $(function(){
//     viewModel.addMarkers();
// });


// function loadScript() {
//     var script = document.createElement('script');
//     script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyCpSNOWPh2xCf2RnBzwrsHL2ZobHMGXsek&libraries=places&callback=viewModel.initMap';
//     document.body.appendChild(script);
// }

// // Load Google Maps when DOM is parsed
// window.addEventListener('load', loadScript);

// document.addEventListener('DOMContentLoaded', loadScript);


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

var viewModel = {
    initialize: function() {
        this.initMap();
        this.sendRequests();
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
    sendRequests:  function() {
        // request venues in category FOOD (id: 4d4b7105d754a06374d81259)
        $.ajax({
            url: 'https://api.foursquare.com/v2/venues/search/?ll=41.380923,2.167697&radius=150&categoryId=4d4b7105d754a06374d81259&client_id=EVSGF4DMPKFDQUNTWREGWPAP1TEL1YNLTC2YAUK13BJHCQNY&client_secret=TH55VNBSYPX3ZZOPAERLTEBLTQBDWUPUCISGTBRJH3JM3ZZG&v=20131124',
            dataType: 'json',
            success: function(data) {
                if (data.meta.code === 200) {
                    console.log(data);
                    data.response.venues.forEach(function(venue) {
                        mapData.eatMarkersData.push({
                        name: venue.name,
                        id: venue.id,
                        lat: venue.location.lat,
                        lng: venue.location.lng,
                        address: venue.location.formattedAddress[0],
                        phone: venue.contact.phone,
                        url: 'https://foursquare.com/v/' + venue.id,
                        icon: 'img/restaurant.png'});                       
                    });
                    viewModel.addMarkers(mapData.eatMarkersData);

                } else {
                    alert("There was a problem loading venues for category 'Eat'. Please try again soon.");
                }                
            },
            error: function() {
                $("#eatLabel").append("<strong> - problem loading</strong>");
                alert("There was a problem loading venues for category 'Eat'. Please try again soon.");
            }
        });
        // request venues in category SHOP & SERVICE (id: 4d4b7105d754a06378d81259)
        $.ajax({
            url: 'https://api.foursquare.com/v2/venues/search/?ll=41.380923,2.167697&radius=150&categoryId=4d4b7105d754a06378d81259&client_id=EVSGF4DMPKFDQUNTWREGWPAP1TEL1YNLTC2YAUK13BJHCQNY&client_secret=TH55VNBSYPX3ZZOPAERLTEBLTQBDWUPUCISGTBRJH3JM3ZZG&v=20131124',
            dataType: 'json',
            success: function(data) {
                if (data.meta.code === 200) {
                    console.log(data);
                    data.response.venues.forEach(function(venue) {
                        mapData.shopMarkersData.push({
                        name: venue.name,
                        id: venue.id,
                        lat: venue.location.lat,
                        lng: venue.location.lng,
                        address: venue.location.formattedAddress[0] + ',' + venue.location.formattedAddress[1],
                        phone: venue.contact.phone,
                        url: 'https://foursquare.com/v/' + venue.id,
                        icon: 'img/supermarket.png'});                       
                    });
                    viewModel.addMarkers(mapData.shopMarkersData);

                } else {
                    alert("Sorry, cannot load venues for category 'Shop'. Please try again soon.");
                }                
            },
            error: function(xhr, ajaxOptions, thrownError) {
               $("#shopLabel").append("<strong> - problem loading</strong>");
                alert("There was a problem loading venues for category 'Shop'. Please try again soon.");
            }               
        });
        // request venues in category HOTEL (id: 4bf58dd8d48988d1fa931735)
        $.ajax({
            url: 'https://api.foursquare.com/v2/venues/search/?ll=41.380923,2.167697&radius=150&categoryId=4bf58dd8d48988d1fa931735&client_id=EVSGF4DMPKFDQUNTWREGWPAP1TEL1YNLTC2YAUK13BJHCQNY&client_secret=TH55VNBSYPX3ZZOPAERLTEBLTQBDWUPUCISGTBRJH3JM3ZZG&v=20131124',
            dataType: 'json',
            success: function(data) {
                if (data.meta.code === 200) {
                    data.response.venues.forEach(function(venue) {
                        mapData.stayMarkersData.push({
                        name: venue.name,
                        id: venue.id,
                        lat: venue.location.lat,
                        lng: venue.location.lng,
                        address: venue.location.formattedAddress[0] + ',' + venue.location.formattedAddress[1],
                        phone: venue.contact.phone,
                        url: 'https://foursquare.com/v/' + venue.id,
                        icon: 'img/lodging.png'});                       
                    });
                    viewModel.addMarkers(mapData.stayMarkersData);

                } else {
                    alert("Sorry, cannot load venues for category 'Stay'. Please try again soon.");
                }                
            },
            error: function(xhr, ajaxOptions, thrownError) {
                $("#stayLabel").append("<strong> - problem loading</strong>");
                alert("There was a problem loading venues for category 'Stay'. Please try again soon.");
            }
        });
        console.log(mapData.eatMarkersData);
    },
    // Add child node which image overlays the parent node's image to show rating (yellow stars)
    // Set image's width using venue's rating passed as a parameter
    showRating: function(r) {
        $('#stars').html($('<span/>').width(r*16));
    },
    getVenueDetails: function(venue) {
        $.ajax({
            url: 'https://api.foursquare.com/v2/venues/' + venue.id + '?&client_id=EVSGF4DMPKFDQUNTWREGWPAP1TEL1YNLTC2YAUK13BJHCQNY&client_secret=TH55VNBSYPX3ZZOPAERLTEBLTQBDWUPUCISGTBRJH3JM3ZZG&v=20131124',
            dataType: 'jsonp',
            success: function(data) {
                if (data.meta.code === 200) {
                    console.log(data.response.venue);
                    if (data.response.venue.hasOwnProperty("rating")) {
                        venue.rating = data.response.venue.rating / 2;
                        viewModel.showRating(venue.rating);
                        console.log(venue.rating);
                    }
                    if (data.response.venue.hasOwnProperty("bestPhoto")) {
                        venue.photo = data.response.venue.bestPhoto.prefix + '100x100' + data.response.venue.bestPhoto.suffix;
                        console.log(venue);
                        // viewModel.currentMarker.valueHasMutated();
                    }
                    viewModel.currentMarker(venue);


                    console.log(venue.photo);
                    // viewModel.currentMarker(venue);
                    
                } else {
                    console.log(data.meta.code);
                    alert("Sorry, cannot load image for selected venue. Please try again soon.");
                }                
            },
            error: function(xhr, ajaxOptions, thrownError) {
                console.error('Error')
                alert(xhr.status)
                alert(thrownError)
            },
            complete: function() {
                console.log('complete');
            }                

        })

    },
    addMarkers: function(arr) {
        var marker;
        
        arr.forEach(function(venue, ind){
            marker = new google.maps.Marker({
                map: mapData.map,
                position: {lat: venue.lat, lng: venue.lng},
                title: venue.name,
                address: venue.address,
                phone: venue.phone,
                // visible: true,
                icon: venue.icon,
                photo: "",
                rating: "",
                animation: google.maps.Animation.DROP,
                id: venue.id,
                url: venue.url
            });
            // Create a click event listener to open infoWindow with a name of the place at each marker
            // Wrap event listener function in IIFE to pass a current marker on each iteration
            marker.addListener('click', (function(markerCopy) {
                return function() {
                    var drawer = $('#drawer');
                    // var drawerTop = drawer.css('top');
                    // var topValue;
                    mapData.infoWindow.setContent(this.title);
                    mapData.infoWindow.open(mapData.map, this);
                    // If new marker is clicked, remove animation from previous marker
                    // Animate clicked marker and pass it to current marker observable
                    // , set animation and drawer. remove animation from previous marker
                    var currMarker = viewModel.currentMarker();
                    console.log(currMarker);
                    if (this !== currMarker) {
                        if (currMarker) {
                            currMarker.setAnimation(null);
                        } 
                        this.setAnimation(google.maps.Animation.BOUNCE);
                        
                        // viewModel.currentMarker(this);
                        viewModel.getVenueDetails(markerCopy);
                        drawer.addClass("open");                      
                    // Handle drawer position if the same marker is clicked
                    } else {
                        drawer.hasClass("open") ? drawer.removeClass("open") : drawer.addClass("open");
                    }
                    // console.log(markerCopy.id);
                    // viewModel.getVenueDetails(markerCopy);
                    // console.log(viewModel.currentMarker());
                    // var drawer = $('#drawer').addClass('open');

                    // if (markerCopy.getAnimation() !== null) {
                    //     markerCopy.setAnimation(null);
                    // } else {
                    //     markerCopy.setAnimation(google.maps.Animation.BOUNCE);
                    // }
                };
            })(marker));
            // Remove object from array and replace with new marker object
            arr.splice(ind, 1, marker);
            // markerArr.push(marker);
            mapData.bounds.extend(marker.position);
        });
        // $("#drawer").click(function () {
        //     console.log(this);
        //                 tp = $(this).css('top') == '0px' ? '-130px' : '0px';
        //                 $(this).animate( {top: tp }, 500);
        //             });
        console.log(mapData.eat);
        console.log(mapData.shopMarkersData);
        console.log(mapData.stayMarkersData);
        // viewModel.currentMarker(marker);
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
    currentMarker: ko.observable(),
    // toggleAllLabel: ko.observable(true),
    toggleLabels: ["Eat", "Shop", "Stay"],
    selectedLabels: ko.observableArray(["Eat", "Shop", "Stay"]),
    fillOptions: ko.pureComputed(function() {
        // console.log(viewModel.selectedLabels());
        var str = viewModel.selectedLabels()
        .map(function(item) {
            return item;
        })
        .join(", ")
        return str || "-- Select your POI --";
        // console.log(viewModel.poiOptions());
        // return viewModel.options();
    }),
    toggleMarkers:  function(toggleLabel){
        var markersData = toggleLabel.toLowerCase() + "MarkersData";
        if (viewModel.selectedLabels().includes(toggleLabel)) {
            mapData[markersData].forEach(function(marker) {
                marker.setMap(mapData.map);
            });
            // mapData.map.fitBounds(mapData.bounds);
        } else {
            mapData[markersData].forEach(function(marker) {
                marker.setMap(null);
            });
        }
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
            })
            this.selectedLabels(toggleLabels);
            
        } else {
            toggleLabels.forEach(function(label) {
                console.log('all deselected');
                var markersData = label.toLowerCase() + "MarkersData";
                mapData[markersData].forEach(function(marker) {
                    marker.setMap(null);
                });
            })
            this.selectedLabels([]);
        }
    },
    owner: viewModel
});

ko.applyBindings(viewModel);