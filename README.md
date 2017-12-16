# Neighborhood Map
This is one of the projects for the Front-End Web Developer Nanodegree program at [Udacity](https://www.udacity.com/course/front-end-web-developer-nanodegree--nd001).
Starting with a blank slate, I had to develop a single-page application using third-party libraries and APIs.
The requirements for the application were to feature:
* a full-screen map of a neighborhood (I would like to visit) using the [Google Maps API] (https://developers.google.com/maps/documentation/javascript/);
* at least 5 markers on the map of the locations that I'm interested in within the neighborhood;
* a list view of the locations;
* a filter option (text input or a dropdown menu) to filter both the list view and the markers on the map;
* a functionality that would provide more info for the locations using additional third-party APIs;
* responsive interface utilizing [Knockout] (http://knockoutjs.com/) js framework.

## Project Details
For this project I chose to work with a map featuring places within 150 meters of Cuitat Vella which is the core of the downtown Barcelona, Spain.
I have included 3 major categories for a user to pick from: Eat, Shop, and Stay. Each category can store up to 30 venues.
On the page load, the specific details of the venues are queried from the [Foursquare API](https://developer.foursquare.com/).
Then obtained data is used to display the Google Maps markers on the map and the details of the venues on the Listing Results view.
The dropdown menu features multi-select filter that will hide/display the map markers and the venue details on the list view to match the selection.
By clicking on a map marker, the marker gets animated, the name of the location is displayed in the ```infoWindow```, and additional information highlighted in the list view.
The similar functionality is applied to the venue details on the list view.

As per Foursquare attribution policy, I have included links back to the corresponding Foursquare venue pages. They are anchored to the names of the locations on the list view.
And finally, to make this app responsive, I used [Bootstrap's](https://getbootstrap.com/) grid system along with the CSS media queries.
*Note: some time throughout the process I noticed that the markers are not placed exactly above its location on the Google Maps. Further digging revealed that the lat/lng properties of the venues from the FourSquare API database DO NOT match the lat/lng properties of the same places in Google Maps.
Since I take lat/lng properties from the Foursquare API to create markers, hence the difference in the data presentation.*

## Quick Start
To test working (production) version of the project on the Internet or to inspect the site on your phone, you need:
* Check out the repository
* Install [Node](https://nodejs.org/en/) and [Gulp](https://gulpjs.com/)
* Run a local server from a terminal:
 ```
  $ npm install -g live-server
  $ cd /path/to/directory/dist
  $ live-server --port=80
  ```
* Download and unzip [ngrok](https://ngrok.com/) into project's ```dist``` directory to make your local server accessible remotely.
* In a new terminal window:
```
  $ cd /path/to/directory/dist
  $ ./ngrok http 80
```
* In a web browser open http://localhost:4040/inspect/http and click on one of the links
* Use provided URL to run it in the browser or visit the same URL on your phone.

## Building the Application
To play with the code, you need:
* Clone the repository
* Install [Node](https://nodejs.org/en/) and [Gulp](https://gulpjs.com/)
* In a terminal, navigate to this project and install dependencies:
```
  $ npm install
```
* Make modifications to the code in ```src``` directory (development directory)
* When done, run ```gulp default``` task in the terminal. This will minify html, css, and js files and update their copies in ```dist``` directory (production directory)
* You can additionally run ```gulp min-img``` task which optimizes images with .jpg, .gif., and .png extensions and then saves them in ```dist``` directory

## Sources:
* Google Maps JavaScript API [tutorials](https://developers.google.com/maps/documentation/javascript/);
* Foursquare developers [documentation](https://developer.foursquare.com/docs) for the API;
* Knockout [documentaion}(http://knockoutjs.com/documentation/introduction.html);
* Stackoverflow [post](https://stackoverflow.com/questions/1987524/turn-a-number-into-star-rating-display-using-jquery-and-css) on how to use a sprite technique to show 'star' rating;
* Stackoverflow [post](https://stackoverflow.com/questions/17714705/how-to-use-checkbox-inside-select-option/29573171) on how to create dropdown with checkboxes;
* [Post](http://www.hedonisticlearning.com/posts/the-mistake-everyone-makes-with-knockoutjs.html) from [Hedonistic Learning](http://www.hedonisticlearning.com/) on how to create Knockout binding for multi-select menu;
* Stackoverflow [post](https://stackoverflow.com/questions/36261662/how-to-use-checkbox-inside-select-options-in-knockout) on how to use the Knockout's ```options``` binding to populate <select> with checked values from drop-down list;