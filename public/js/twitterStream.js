
var newKeyword = "all";
var prevKeyword = "all";
var socket;

var markers = [];

var heatmap;
  var liveTweets = new google.maps.MVCArray();
  heatmap = new google.maps.visualization.HeatmapLayer({
    data: liveTweets,
    radius: 25
  });

function initialize() {
  //Setup Google Map
  var myLatlng = new google.maps.LatLng(17.7850,-12.4183);
  //var light_grey_style = [{"featureType":"landscape","stylers":[{"saturation":-100},{"lightness":65},{"visibility":"on"}]},{"featureType":"poi","stylers":[{"saturation":-100},{"lightness":51},{"visibility":"simplified"}]},{"featureType":"road.highway","stylers":[{"saturation":-100},{"visibility":"simplified"}]},{"featureType":"road.arterial","stylers":[{"saturation":-100},{"lightness":30},{"visibility":"on"}]},{"featureType":"road.local","stylers":[{"saturation":-100},{"lightness":40},{"visibility":"on"}]},{"featureType":"transit","stylers":[{"saturation":-100},{"visibility":"simplified"}]},{"featureType":"administrative.province","stylers":[{"visibility":"off"}]},{"featureType":"water","elementType":"labels","stylers":[{"visibility":"on"},{"lightness":-25},{"saturation":-100}]},{"featureType":"water","elementType":"geometry","stylers":[{"hue":"#ffff00"},{"lightness":-25},{"saturation":-97}]}];
  
  var shades_of_gray = [{"featureType":"all","elementType":"labels.text.fill","stylers":[{"saturation":36},{"color":"#000000"},{"lightness":40}]},{"featureType":"all","elementType":"labels.text.stroke","stylers":[{"visibility":"on"},{"color":"#000000"},{"lightness":16}]},{"featureType":"all","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"administrative","elementType":"geometry.fill","stylers":[{"color":"#000000"},{"lightness":20}]},{"featureType":"administrative","elementType":"geometry.stroke","stylers":[{"color":"#000000"},{"lightness":17},{"weight":1.2}]},{"featureType":"landscape","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":20}]},{"featureType":"poi","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":21}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#000000"},{"lightness":17}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#000000"},{"lightness":29},{"weight":0.2}]},{"featureType":"road.arterial","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":18}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":16}]},{"featureType":"transit","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":19}]},{"featureType":"water","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":17}]}]
  
  var a_dark_world = [{"stylers":[{"visibility":"simplified"}]},{"stylers":[{"color":"#131314"}]},{"featureType":"water","stylers":[{"color":"#131313"},{"lightness":7}]},{"elementType":"labels.text.fill","stylers":[{"visibility":"on"},{"lightness":25}]}]
  

  var midnigt_commander = [{"featureType":"all","elementType":"labels.text.fill","stylers":[{"color":"#ffffff"}]},{"featureType":"all","elementType":"labels.text.stroke","stylers":[{"color":"#000000"},{"lightness":13}]},{"featureType":"administrative","elementType":"geometry.fill","stylers":[{"color":"#000000"}]},{"featureType":"administrative","elementType":"geometry.stroke","stylers":[{"color":"#144b53"},{"lightness":14},{"weight":1.4}]},{"featureType":"landscape","elementType":"all","stylers":[{"color":"#08304b"}]},{"featureType":"poi","elementType":"geometry","stylers":[{"color":"#0c4152"},{"lightness":5}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#000000"}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#0b434f"},{"lightness":25}]},{"featureType":"road.arterial","elementType":"geometry.fill","stylers":[{"color":"#000000"}]},{"featureType":"road.arterial","elementType":"geometry.stroke","stylers":[{"color":"#0b3d51"},{"lightness":16}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"color":"#000000"}]},{"featureType":"transit","elementType":"all","stylers":[{"color":"#146474"}]},{"featureType":"water","elementType":"all","stylers":[{"color":"#021019"}]}]
 
  var black_and_white =[{"featureType":"road","elementType":"labels","stylers":[{"visibility":"on"}]},{"featureType":"poi","stylers":[{"visibility":"off"}]},{"featureType":"administrative","stylers":[{"visibility":"off"}]},{"featureType":"road","elementType":"geometry.fill","stylers":[{"color":"#000000"},{"weight":1}]},{"featureType":"road","elementType":"geometry.stroke","stylers":[{"color":"#000000"},{"weight":0.8}]},{"featureType":"landscape","stylers":[{"color":"#ffffff"}]},{"featureType":"water","stylers":[{"visibility":"off"}]},{"featureType":"transit","stylers":[{"visibility":"off"}]},{"elementType":"labels","stylers":[{"visibility":"off"}]},{"elementType":"labels.text","stylers":[{"visibility":"on"}]},{"elementType":"labels.text.stroke","stylers":[{"color":"#ffffff"}]},{"elementType":"labels.text.fill","stylers":[{"color":"#000000"}]},{"elementType":"labels.icon","stylers":[{"visibility":"on"}]}]
  
  var myOptions = {
    zoom : 1,
    minZoom : 2, 
    maxZoom: 10,
    center: myLatlng,
    mapTypeId: google.maps.MapTypeId.TERRAIN,
    mapTypeControl: true,
    mapTypeControlOptions: {
      style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
      position: google.maps.ControlPosition.LEFT_BOTTOM
    },
    styles: midnigt_commander
  };
  var map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
  
  //Setup heat map and link to Twitter array we will append data to
  
  heatmap.setMap(map);

  if(io !== undefined) {
    // Storage for WebSocket connections
    socket = io.connect();

    // This listens on the "twitter-steam" channel and data is 
    // received everytime a new tweet is receieved.
    socket.on('twitter', function (data) {

      console.log("$$$$$$$ GOT MONGO STREAM $$$$$$$");
      if(prevKeyword != newKeyword)
{

liveTweets = new google.maps.MVCArray();
 heatmap = new google.maps.visualization.HeatmapLayer({
    data: liveTweets,
    radius: 25
  });

heatmap.setMap(map);
prevKeyword = newKeyword;
}


    //  console.log("$$$$ " + data.tweet + " $$$$" );
    if(data.tweet.toLowerCase().indexOf(newKeyword) > -1 || newKeyword == 'all'){

      //Add tweet to the heat map array.
      var tweetLocation = new google.maps.LatLng(data.lng,data.lat);
      

      liveTweets.push(tweetLocation);

      //Flash a dot onto the map quickly
      var image;
if(data.sentiment == 'positive')
  image = "css/map-marker-small-green.png";
else if(data.sentiment == 'negative')
  image = "css/map-marker-small.png";
  else if(data.sentiment == 'neutral')
    image = "css/map-marker-small-yellow.png";

      var marker = new google.maps.Marker({
        position: tweetLocation,
        map: map,
        icon: image,
      });
}

    });


    socket.on('twitter-stream', function (data) {

      console.log(data.tweet);
      //Add tweet to the heat map array.
      var tweetLocation = new google.maps.LatLng(data.lng,data.lat);

      if(data.tweet.toLowerCase().indexOf(newKeyword) > -1 || newKeyword == 'all'){

        console.log("$$$$$$ " +newKeyword+" $$$$$$$$" + data.tweet);
      
      liveTweets.push(tweetLocation);

      console.log(data.sentiment);

var image;
if(data.sentiment == 'positive')
  image = "css/map-marker-small-green.png";
else if(data.sentiment == 'negative')
  image = "css/map-marker-small.png";
  else if(data.sentiment == 'neutral')
    image = "css/map-marker-small-yellow.png";

  var content_string = data.tweet;

   var infowindow = new google.maps.InfoWindow({
    content: content_string,
  });
      
      var marker = new google.maps.Marker({
        position: tweetLocation,
        map: map,
        icon: image,
      });

 marker.addListener('mouseover', function() {
    infowindow.open(map, marker);
  });

      markers.push(marker);
      counterUpdates();
      }
    

    });


socket.on('trends:response', function (trends) {
    showTrendingTopics(trends);
  });

    // Listens for a success response from the server to 
    // say the connection was successful.
    socket.on("connected", function(r) {

      //Now that we are connected to the server let's tell 
      //the server we are ready to start receiving tweets.
      socket.emit("start tweets");
      
    });
  }
}




function chooseKeyword(keyword){

this.newKeyword = keyword;
socket.emit("start tweets");
deleteAllMarkers();
console.log(keyword);
heatmap.setMap(null);

}


// Sets the map on all markers in the array.
function deleteAllMarkers() {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
  }
}


function showTrendingTopics (trends) {
  $('#sidebar #trending-topics').text("");
  if(trends["error"] == false ) {
    trends = trends["trends"];
    $('#sidebar #trending-topics').append("<h4>Top 10 Trending Topics:</h4>");
    for (var i = 0; i < trends.length; i++) {
      $('#sidebar #trending-topics').append("<p>" + trends[i]["name"] + "</p>");
    }
  } else {
    log = trends["trends"]["log"];
    $('#sidebar #trending-topics').append("<h4>Error</h4>");
    $('#sidebar #trending-topics').append("<p>" + log.message + "</p>");
  }
}

function counterUpdates () {
  $('#sidebar #counter').text("Total Tweets: " + tweetPoints.length);
  $('#sidebar #positive-counter').text("Positive Tweets: " + pos);
  $('#sidebar #negative-counter').text("Negative Tweets: " + neg);
  $('#sidebar #neutral-counter').text("Neutral Tweets: " + neu);
}



