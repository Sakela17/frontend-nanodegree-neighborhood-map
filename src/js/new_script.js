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

var mapData = {
    map: null,
    infoWindow: null,
    bounds: null,
    poiCategories: ['restaurant', 'store', 'lodging'],
    restaurantMarkersData: [],
    storeMarkersData: [],
    lodgingMarkersData: []
};


// var fourSquareData = {
//     eatVenues: [],
//     shopVenues: [],
//     stayVenues: []
// };


var viewModel = {
    initialize: function() {
        this.initMap();
        this.sendRequests();
        // this.getImage();
    },
    initMap: function() {
        var mapProperties;
        mapData.bounds = new google.maps.LatLngBounds();
        mapProperties = {
            center: new google.maps.LatLng(41.380923, 2.167697),
            // center: {lat: 41.380923, lng: 2.167697},
            zoom: 16
            // styles: styles
            // mapTypeControl: false
        };
        mapData.map = new google.maps.Map(document.getElementById('map'), mapProperties);
        mapData.infoWindow = new google.maps.InfoWindow();
    },
    sendRequests:  function() {
        // request venues in category FOOD (id: 4d4b7105d754a06374d81259)
        $.ajax({
            type: "GET",
            url: 'https://api.foursquare.com/v2/venues/search/?ll=41.380923,2.167697&radius=150&categoryId=4d4b7105d754a06374d81259&client_id=EVSGF4DMPKFDQUNTWREGWPAP1TEL1YNLTC2YAUK13BJHCQNY&client_secret=TH55VNBSYPX3ZZOPAERLTEBLTQBDWUPUCISGTBRJH3JM3ZZG&v=20131124',
            dataType: 'json',
            success: function(data) {
                if (data.meta.code === 200) {
                    console.log(data);
                    data.response.venues.forEach(function(venue) {
                        mapData.restaurantMarkersData.push({
                        name: venue.name,
                        id: venue.id,
                        lat: venue.location.lat,
                        lng: venue.location.lng,
                        address: venue.location.formattedAddress[0],
                        phone: venue.contact.phone,
                        icon: 'img/restaurant.png'});                       
                    });
                    viewModel.addMarkers(mapData.restaurantMarkersData);

                } else {
                    alert("Sorry, cannot load venues for category 'Eat'. Please try again soon.");
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
        });
        // request venues in category SHOP & SERVICE (id: 4d4b7105d754a06378d81259)
        // $.ajax({
        //     url: 'https://api.foursquare.com/v2/venues/search/?ll=41.380923,2.167697&radius=150&categoryId=4d4b7105d754a06378d81259&client_id=EVSGF4DMPKFDQUNTWREGWPAP1TEL1YNLTC2YAUK13BJHCQNY&client_secret=TH55VNBSYPX3ZZOPAERLTEBLTQBDWUPUCISGTBRJH3JM3ZZG&v=20131124',
        //     dataType: 'json',
        //     success: function(data) {
        //         if (data.meta.code === 200) {
        //             console.log(data);
        //             data.response.venues.forEach(function(venue) {
        //                 mapData.storeMarkersData.push({
        //                 name: venue.name,
        //                 id: venue.id,
        //                 lat: venue.location.lat,
        //                 lng: venue.location.lng,
        //                 address: venue.location.formattedAddress[0] + ',' + venue.location.formattedAddress[1],
        //                 phone: venue.contact.phone,
        //                 icon: 'img/supermarket.png'});                       
        //             });
        //             viewModel.addMarkers(mapData.storeMarkersData);

        //         } else {
        //             alert("Sorry, cannot load venues for category 'Eat'. Please try again soon.");
        //         }                
        //     },
        //     error: function(xhr, ajaxOptions, thrownError) {
        //         console.error('Error')
        //         alert(xhr.status)
        //         alert(thrownError)
        //     },
        //     complete: function() {
        //         console.log('complete');
        //     }                
        // });
        // // request venues in category HOTEL (id: 4bf58dd8d48988d1fa931735)
        // $.ajax({
        //     url: 'https://api.foursquare.com/v2/venues/search/?ll=41.380923,2.167697&radius=150&categoryId=4bf58dd8d48988d1fa931735&client_id=EVSGF4DMPKFDQUNTWREGWPAP1TEL1YNLTC2YAUK13BJHCQNY&client_secret=TH55VNBSYPX3ZZOPAERLTEBLTQBDWUPUCISGTBRJH3JM3ZZG&v=20131124',
        //     dataType: 'json',
        //     success: function(data) {
        //         if (data.meta.code === 200) {
        //             data.response.venues.forEach(function(venue) {
        //                 mapData.lodgingMarkersData.push({
        //                 name: venue.name,
        //                 id: venue.id,
        //                 lat: venue.location.lat,
        //                 lng: venue.location.lng,
        //                 address: venue.location.formattedAddress[0] + ',' + venue.location.formattedAddress[1],
        //                 phone: venue.contact.phone,
        //                 icon: 'img/lodging.png'});                       
        //             });
        //             viewModel.addMarkers(mapData.lodgingMarkersData);

        //         } else {
        //             alert("Sorry, cannot load venues for category 'Eat'. Please try again soon.");
        //         }                
        //     },
        //     error: function(xhr, ajaxOptions, thrownError) {
        //         console.error('Error')
        //         alert(xhr.status)
        //         alert(thrownError)
        //     },
        //     complete: function() {
        //         console.log('complete');
        //     }                
        // });
    },
    // Add child node which image overlays the parent node's image to show rating (yellow stars)
    // Set image's width using vanue's rating passed in the argument
    showRating: function(r) {
        // console.log(this);
        $('.stars').html($('<span/>').width(r*16));
    },
    getVenueDetails: function(venue) {
        $.ajax({
            url: 'https://api.foursquare.com/v2/venues/' + venue.id + '?&client_id=EVSGF4DMPKFDQUNTWREGWPAP1TEL1YNLTC2YAUK13BJHCQNY&client_secret=TH55VNBSYPX3ZZOPAERLTEBLTQBDWUPUCISGTBRJH3JM3ZZG&v=20131124',
            dataType: 'jsonp',
            success: function(data) {
                if (data.meta.code === 200) {
                    console.log(data);
                    if (data.response.venue.hasOwnProperty("rating")) {
                        venue.rating = data.response.venue.rating / 2;
                        viewModel.showRating(venue.rating);
                        console.log(data.response.venue.rating);

                    }
                    venue.photo = data.response.venue.bestPhoto.prefix + '100x100' + data.response.venue.bestPhoto.suffix;


                    console.log(venue.photo);
                    viewModel.currentMarker(venue);
                    
                } else {
                    console.log(data.meta.code);
                    alert("Sorry, cannot load venues for category 'Eat'. Please try again soon.");
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
                id: venue.id
            });
            // Create a click event listener to open infoWindow with a name of the place at each marker
            // Wrap event listener function in IIFE to pass a current value of placeName variable
            // to event listener on each iteration
            marker.addListener('click', (function(markerCopy) {
                return function() {
                    mapData.infoWindow.setContent(markerCopy.title);
                    mapData.infoWindow.open(mapData.map, this);
                    if (viewModel.currentMarker() === null) {
                        markerCopy.setAnimation(google.maps.Animation.BOUNCE);
                        viewModel.currentMarker(markerCopy);
                    }
                    if (viewModel.currentMarker() !== markerCopy) {
                        viewModel.currentMarker().setAnimation(null);
                        markerCopy.setAnimation(google.maps.Animation.BOUNCE);
                        viewModel.currentMarker(markerCopy);
                    }
                    console.log(markerCopy.id);
                    viewModel.getVenueDetails(markerCopy);
                    console.log(viewModel.currentMarker());
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
        $("#drawer").click(function () {
                        tp = $(this).css('top') == '0px' ? '-150px' : '0px';
                        $(this).animate( {top: tp }, 500);
                    });
        console.log(mapData.restaurantMarkersData);
        console.log(mapData.storeMarkersData);
        console.log(mapData.lodgingMarkersData);       
    },
    // Show/hide dropdown menu with checkboxes
    toggleDropdown: function() {
        if (this.dropdownMenu()) {
            this.dropdownMenu(false);
        } else {
            this.dropdownMenu(true);
        }
    },
    dropdownMenu: ko.observable(false),
    currentMarker: ko.observable(null),
    toggleAllLabel: ko.observable(true),
    toggleEatLabel: ko.observable(true),
    toggleShopLabel: ko.observable(true),
    toggleStayLabel: ko.observable(true),
    toggleAllMarkers: function() {
        if (this.toggleAllLabel()) {
            this.toggleEatLabel(true);
            this.toggleEatMarkers();
            this.toggleShopLabel(true);
            this.toggleShopMarkers();
            this.toggleStayLabel(true);
            this.toggleStayMarkers();
            // cityMap.fitBounds(bounds);
        } else {
            this.toggleEatLabel(false);
            this.toggleEatMarkers();
            this.toggleShopLabel(false);
            this.toggleShopMarkers();
            this.toggleStayLabel(false);
            this.toggleStayMarkers();
        }
        return true;
    },
    toggleEatMarkers: function() {
        if (this.toggleEatLabel()) {
            mapData.restaurantMarkersData.forEach(function(marker) {
                // marker.visible = true;
                // marker.animation = google.maps.Animation.DROP;
                marker.setMap(mapData.map);
            });
            mapData.map.fitBounds(mapData.bounds);
        } else {
            mapData.restaurantMarkersData.forEach(function(marker) {
                marker.setMap(null);
            });
            this.toggleAllLabel(false);

        }
        return true;
    },
    toggleShopMarkers: function() {
        if (this.toggleShopLabel()) {
            mapData.storeMarkersData.forEach(function(marker) {
                marker.setMap(mapData.map);
            });
            mapData.map.fitBounds(mapData.bounds);
        } else {
            mapData.storeMarkersData.forEach(function(marker) {
                marker.setMap(null);
            });
            this.toggleAllLabel(false);

        }
        return true;
    },
    toggleStayMarkers: function() {
        if (this.toggleStayLabel()) {
            mapData.lodgingMarkersData.forEach(function(marker) {
                marker.setMap(mapData.map);
            });
            mapData.map.fitBounds(mapData.bounds);
        } else {
            mapData.lodgingMarkersData.forEach(function (marker) {
                marker.setMap(null);
            });
            this.toggleAllLabel(false);
        }
        return true;
    }
   
};

ko.applyBindings(viewModel);
