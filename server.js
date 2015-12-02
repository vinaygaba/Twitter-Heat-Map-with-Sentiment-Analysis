//Setup web server and socket
var twitter = require('twitter'),
    express = require('express'),
    app = express(),
    http = require('http'),
    server = http.createServer(app),
    io = require('socket.io').listen(server);

var SNSClient = require('aws-snsclient');

var AWS = require('aws-sdk'),
    awsCredentialsPath = './aws.credentials.json',
    sqsQueueUrl = 'https://sqs.us-east-1.amazonaws.com/306587932798/tweet-map',
    sqs;

//var SNSClient = require('aws-snsclient');

//var sns = new AWS.SNS();

var client = SNSClient(function(err, message) {
    //console.log(message);
    var json = JSON.parse(message);
    console.log(json.body.sentiment);
});

// Load credentials from local json file
AWS.config.loadFromPath(awsCredentialsPath);
// Instantiate SQS client
sqs = new AWS.SQS({region:'us-east-1'});


// sqs.client.listQueues(function (err, data) {
//   if (err) {
//     console.log("Error " + err);
//   }
//   else {
//     console.log("QUEUE NAME "+ data);
//   }
// });

var router = express.Router();


//MongoDb Client
var MongoClient = require('mongodb').MongoClient;

var flag = false;

//Setup twitter stream api
var twit = new twitter({
 consumer_key: 'key',
  consumer_secret: 'key',
  access_token_key: 'key',
  access_token_secret: 'key'
}),
stream = null;


var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
//var url = 'mongodb://localhost:27017/twitter_data';


var url = 'mongodb://localhost:27017/twitter_data';


//Use the default port (for beanstalk) or default to 8081 locally
server.listen(process.env.PORT || 8081);

//Setup rotuing for app
app.use(express.static(__dirname + '/public'));




MongoClient.connect(url, function(err, db) {
  //assert.equal(null, err);
              

              //Create web sockets connection.
io.sockets.on('connection', function (socket) {

  socket.on("start tweets", function() {



    app.post('/api/sentiment/', function (request, response) {
    var body = '';

    request.on('data', function (data) {
        body += data;
    });

    request.on('end', function () {
        console.log("Inside POST"+body);
        
        var data=JSON.parse(body);

        data = JSON.parse(data.Message);
        console.log(data);
        var outputPoint = {
            "lat": data.lat,
            "lng": data.lng,
            "sentiment": data.sentiment,
            "tweet": data.tweet
        };
        console.log("outputPoint"+ outputPoint);

        //console.log("Output point changes" + outputPoint['lat'] + ' ' + outputPoint['lng']);
       socket.broadcast.emit("twitter-stream", outputPoint);
      //  Send out to web sockets channel.          
       socket.emit('twitter-stream', outputPoint);
                
    });

    response.status(200);
    response.send("received");
  });
    



   console.log("Reached DB");


   var cursor =db.collection('tweets').find( ).limit(10);
   cursor.each(function(err, tweets) {
      assert.equal(err, null);
      if (tweets != null) {


    //   var outputPoint = {"tweet":tweets.tweet_text};
     var outputPoint = {"lat": tweets.coordinate.coordinates[0],"lng": tweets.coordinate.coordinates[1],"tweet":tweets.tweet_text};

      var params = {
                    MessageBody: JSON.stringify(outputPoint), /* required */
                    QueueUrl: sqsQueueUrl, /* required */
                    DelaySeconds: 0,
                    };

sqs.sendMessage(params, function(err, data) {
  if (err) console.log(err, err.stack); // an error occurred
  //else     
  // console.log("SQS WAS SUCCESSFUL " + data);           // successful response
});
    //socket.broadcast.emit("twitter-stream", outputPoint);

          //Send out to web sockets channel.
         //socket.emit('twitter-stream', outputPoint);
          //i++;

      } else {
         //callback();
      }
   });





/////////// TEST ///////////



if(stream === null) {
 if(!flag) { 
      //Connect to twitter stream passing in filter for entire world.
     // twit.stream('statuses/filter', {'locations':'-180,-90,180,90'}, function(stream) {
      flag = true;
      console.log("$$$$$ GETTING TWITTER STREAM $$$$$")
      twit.stream('statuses/filter', {track: 'love,news,jokes,travel,war,hatred'},   function(stream) {
          stream.on('data', function(tweet) {
              // Does the JSON result have coordinates
              if(!tweet.geo)
              {
                //console.log(tweet);
              }
  else{

  // alchemyapi.sentiment("text", tweet.text, {}, function(response) {
 if (err) throw err;

   //var outputPoint = {"lat": tweet.coordinates.coordinates[0],"lng": tweet.coordinates.coordinates[1],"tweet":tweet.text};
    var outputPoint = {"lat": tweet.coordinates.coordinates[0],"lng": tweet.coordinates.coordinates[1],"tweet":tweet.text};

    var params = {
                    MessageBody: JSON.stringify(outputPoint), /* required */
                    QueueUrl: sqsQueueUrl, /* required */
                    DelaySeconds: 0,
                    };

sqs.sendMessage(params, function(err, data) {
  if (err) console.log(err, err.stack); // an error occurred
  //else     
  console.log("SQS WAS SUCCESSFUL " + data);           // successful response
});
   // socket.broadcast.emit("new-twitter-stream", outputPoint);

    //Send out to web sockets channel.
   // socket.emit('new-twitter-stream', outputPoint);


   db.collection('tweets').insertOne( {
    //"username":tweet.user.screen_name,
    "tweet_id" : tweet.id,
    "tweet_id_str" : tweet.id_str,
    "tweet_created_at" : tweet.created_at,
    "tweet_timestamp" : tweet.timestamp_ms,
    "tweet_lang" : tweet.lang,
    "tweet_text" : tweet.text,
    "geo":tweet.geo,
    "retweet_count" : tweet.retweet_count,
    "favourite_count" : tweet.favorite_count,
    "coordinate":tweet.coordinates,
    "possibly_sensitive":tweet.possibly_sensitive
   }, function(err, result) {
    if(err) throw err;
    //console.log("Inserted a document with id : " + result[0]._id);
  });

  // Do something with data
//});
   
}//else loop ends




});

              
              stream.on('limit', function(limitMessage) {
                return console.log(limitMessage);
              });

              stream.on('warning', function(warning) {
                return console.log(warning);
              });

              stream.on('disconnect', function(disconnectMessage) {
                return console.log(disconnectMessage);
              });


         });




     }
   }

});

socket.emit("connected");
  });

    // Emits signal to the client telling them that the
    // they are connected and can start receiving Tweets
    

});



function getTrends(woeid) {
    var params = {id: woeid};
    twit.get('trends/place', params, function(error, tweets, response){
      if (!error) {
    name = [], urls = [];
    trends = tweets[0];
    trends["error"] = false;
    if(socket !== undefined) {
      socket.emit("trends:response", trends);
    }
        } else {
            console.log(error);
      socket.emit("trends:response", {'trends': {'error':true, log:error[0]}})
        }
    });
}










