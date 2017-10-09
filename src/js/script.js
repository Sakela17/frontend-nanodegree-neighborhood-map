var cityMap;
var infowindow;
var bounds;


var storeData = [];
var lodgingData = [];
var restaurantData = [];
var storeMarkersData = [];
var restaurantMarkersData = [];
var lodgingMarkersData = [];



var requestTypes = ['restaurant', 'store', 'lodging'];


function mapInit() {
    var styles = [
        {
            stylers: [
                {hue: '#00ff6f'},
                {saturation: -50}
            ]
        }
    ];

    var mapProperties = {
        center: new google.maps.LatLng(41.380923, 2.167697),
        // center: {lat: 41.380923, lng: 2.167697},
        zoom: 16
        // styles: styles
        // mapTypeControl: false
    };
    // Constructor creates a new map - only center and zoom are required.
    cityMap = new google.maps.Map(document.getElementById('map'), mapProperties);
    // console.log(mapProperties.center);

    bounds = new google.maps.LatLngBounds();

    infowindow = new google.maps.InfoWindow();
    var service = new google.maps.places.PlacesService(cityMap);
    // Loop over requestTypes array to get a list of nearby locations matching the specified type
    requestTypes.forEach(function(type) {
        service.nearbySearch({
            location: mapProperties.center,
            radius: '150',
            type: type
        }, function (results, status) {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                var i,
                    location,
                    placeName,
                    marker,
                    // length = 1;
                    length = results.length;
                for (i = 0; i < length; i++) {
                    location = results[i].geometry.location;
                    placeName = results[i].name;
                    // Create marker for each location
                    marker = new google.maps.Marker({
                        map: cityMap,
                        position: location,
                        title: placeName,
                        visible: false,
                        icon: '',
                        // animation: google.maps.Animation.DROP,
                        id: i
                    });
                    console.log(marker);


                    // Create a click event listener to open infoWindow with a name of the place at each marker
                    // Wrap event listener function in IIFE to pass a current value of placeName variable
                    // to event listener on each iteration
                    marker.addListener('click', (function(placeNameCopy) {
                        return function() {
                            infowindow.setContent(placeNameCopy);
                            infowindow.open(cityMap, this);
                        };
                    })(placeName));

                    switch (type) {
                        case 'restaurant':
                            // shopData.push(results[i]);
                            marker.icon = 'img/restaurant.png';
                            restaurantMarkersData.push(marker);
                            bounds.extend(marker.position);
                        // console.log(restaurantData);
                            break;
                        case 'store':
                            // storeData.push(results[i]);
                            marker.icon = 'img/supermarket.png';
                            storeMarkersData.push(marker);
                            // storeMarkersData[i].visible = true;
                            // console.log(storeMarkersData[i].icon);
                            break;
                        case 'lodging':
                            // shopData.push(results[i]);
                            marker.icon = 'img/lodging.png';
                            lodgingMarkersData.push(marker);
                            // console.log(lodgingData);
                            break;
                        default:
                            console.log('Error');
                    }
                }
            }
        });



    });

    // service.nearbySearch({
    //     location: mapProperties.center,
    //     radius: '150',
    //     type: [requestTypes[0]]
    // }, callback);

    // function callback(results, status, type) {
    //     if (status === google.maps.places.PlacesServiceStatus.OK) {
    //         switch(type) {
    //             case 'store':
    //                 for (var i = 0; i < results.length; i++) {
    //                     shopData.push(results[i]);
    //                     // createMarker(results[i]);
    //                 }
    //                 console.log(shopData);
    //                 break;
    //             case 'lodging':
    //                 for (var i = 0; i < results.length; i++) {
    //                     stayData.push(results[i]);
    //                     // createMarker(results[i]);
    //                 }
    //                 console.log(stayData);
    //                 break;
    //             case 'restaurant':
    //                 for (var i = 0; i < results.length; i++) {
    //                     eatData.push(results[i]);
    //                     // createMarker(results[i]);
    //                 }
    //                 console.log(eatData);
    //                 break;
    //             default:
    //                 console.log('Error');
    //         }
    //         // for (var i = 0; i < results.length; i++) {
    //         //     eatData.push(results[i]);
    //         //
    //         //     // createMarker(results[i]);
    //         // }
    //         // console.log(eatData);
    //     }
    // }

    // function setMapOnMarker() {
    //     for (var i = 0; i < storeMarkerData.length; i++) {
    //         storeMarkerData[i].setMap(citiMap);
    //     }
    //     // console.log('setVisible...');
    //     // console.log(storeMarkerData[0]);
    //     // storeMarkerData.forEach(function(marker) {
    //     //    marker.visible = true;
    //     // });
    // }
    // setMapOnMarker();


    function createMarker(place) {
        var placeLoc = place.geometry.location;
        var marker = new google.maps.Marker({
            map: cityMap,
            position: placeLoc
        });

        google.maps.event.addListener(marker, 'click', function () {
            infowindow.setContent(place.name);
            infowindow.open(cityMap, this);
        });
    }
    // cityMap.data.loadGeoJson('google.json');
    // console.log(cityMap.data.toGeoJson(function (data) {
    //     return data}));
    // var dataLayer = new google.maps.Data
}

function loadScript() {
    console.log("hello");
    var script = document.createElement('script');
    script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyCpSNOWPh2xCf2RnBzwrsHL2ZobHMGXsek&libraries=places&callback=mapInit';
    document.body.appendChild(script);
}

// Load Google Maps when DOM is parsed
document.addEventListener('DOMContentLoaded', loadScript);
// window.addEventListener('load', loadScript);

var viewModel = function() {
    var self = this;
    self.toggleAllLabel = ko.observable(false);
    self.toggleEatLabel = ko.observable(false);
    self.toggleShopLabel = ko.observable(false);
    self.toggleStayLabel = ko.observable(false);
    self.toggleAllMarkers = function() {
        if (self.toggleAllLabel()) {
            self.toggleEatLabel(true);
            self.toggleEatMarkers();
            self.toggleShopLabel(true);
            self.toggleShopMarkers();
            self.toggleStayLabel(true);
            self.toggleStayMarkers();
            // cityMap.fitBounds(bounds);
        } else {
            self.toggleEatLabel(false);
            self.toggleEatMarkers();
            self.toggleShopLabel(false);
            self.toggleShopMarkers();
            self.toggleStayLabel(false);
            self.toggleStayMarkers();
        }
        return true;
    };

    self.toggleEatMarkers = function() {
        if (self.toggleEatLabel()) {
            restaurantMarkersData.forEach(function(marker) {
                marker.visible = true;
                marker.setMap(cityMap);
            });
            cityMap.fitBounds(bounds);
        } else {
            restaurantMarkersData.forEach(function(marker) {
                marker.setMap(null);
            });
            self.toggleAllLabel(false);

        }
        return true;
    };

    self.toggleShopMarkers = function() {
        if (self.toggleShopLabel()) {
            storeMarkersData.forEach(function(marker) {
                // marker.animation = google.maps.Animation.DROP;
                marker.visible = true;
                marker.setMap(cityMap);
            });
            cityMap.fitBounds(bounds);
        } else {
            storeMarkersData.forEach(function(marker) {
                marker.setMap(null);
            });
            self.toggleAllLabel(false);

        }
        return true;
    };
    self.toggleStayMarkers = function() {
        if (self.toggleStayLabel()) {
            lodgingMarkersData.forEach(function(marker) {
                marker.visible = true;
                marker.setMap(cityMap);
            });
            cityMap.fitBounds(bounds);
        } else {
            lodgingMarkersData.forEach(function (marker) {
                marker.setMap(null);
            });
            self.toggleAllLabel(false);
        }
        return true;
    };



    // self.toggleVisibility = function() {
    //     // console.log(this.checkSome());
    //
    //     if (self.checkSome()) {
    //         storeMarkerData.forEach(function(marker) {
    //             marker.setMap(marker.map);
    //             // console.log(marker.map);
    //
    //             marker.visible = true;
    //             // that.checkSome(false);
    //             // console.log(that.checkSome)
    //             // return true;
    //
    //         });
    //     } else {
    //         storeMarkerData.forEach(function(marker) {
    //             marker.setMap(null);
    //             // console.log(marker.map);
    //
    //             marker.visible = false;
    //             // that.checkSome(false);
    //             // console.log(that.checkSome)
    //             // return false;
    //
    //         });
    //         return true;
    //     }


    // }
    // this.eatPins = ko.observableArray([]),
    // this.shopPins = ko.observableArray([]),
    // this.stayPins = ko.observableArray([]),
        // this.selectedPoi = ko.observableArray(['Germany']) // Initially, only Germany is selected
};

ko.applyBindings(new viewModel());



function getPhotos(item) {
    var baseImgURL = 'https://irs3.4sqi.net/img/general/'; // base url to retrieve venue photos

    $.ajax({
        url: 'https://api.foursquare.com/v2/venues/' + item.venue.id + '/photos?client_id=RG0BDGPCIXRYCKU3MGO2K4NSMZQMEZG3PVX1IEQQ1W5V5OMF&client_secret=1OVPLSTAD3E0PNUHRMZVSFC24NJS0YATRZSTZ0BCWGPU5AKU&v=20130815',
        dataType: 'jsonp',
        success: function(data) {
            // console.log(data);

            var imgItems = data.response.photos.items;
            // console.log(imgItems);

            // set venu photo data in venue photo albumn
            for (var i in imgItems) {
                var venueImgURL = 'https://irs3.4sqi.net/img/general/width100' + imgItems[i].suffix;
                var venueImgObj = {
                    href: venueImgURL,
                    title: item.venue.name
                };
                // push venue photo data object to venue photo albumn
                item.venue.photos.groups.push(venueImgURL);
            }

            item.venue.firstImage = item.venue.photos.groups[0];

            // console.log(item.venue.firstImage);
        }
    });
}




var expanded = false;

function showCheckboxes() {
    var checkboxes = document.getElementById("checkboxes");
    if (!expanded) {
        checkboxes.style.display = "block";
        expanded = true;
    } else {
        checkboxes.style.display = "none";
        expanded = false;
    }
}

