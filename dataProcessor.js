
var AWS = require('aws-sdk'),
    awsCredentialsPath = './aws.credentials.json',
    sqsQueueUrl = 'https://sqs.us-east-1.amazonaws.com/306587932798/tweet-map',
    sqs;

var AlchemyAPI = require('./alchemyapi');
var alchemyapi = new AlchemyAPI();

// Load credentials from local json file
AWS.config.loadFromPath(awsCredentialsPath);
// Instantiate SQS client
sqs = new AWS.SQS({region:'us-east-1'});

if(sqs == undefined){
	console.log("SQS is Undefined");
}
var i = 0;

readMessage();


function readMessage()
{
sqs.receiveMessage({
   QueueUrl: sqsQueueUrl,
   MaxNumberOfMessages: 10, // how many messages do we wanna retrieve?
   VisibilityTimeout: 60, // seconds - how long we want a lock on this job
   WaitTimeSeconds: 10 // seconds - how long should we wait for a message?
 }, function(err, data) {
   // If there are any messages to get
   if (data.Messages) {
      // Get the first message (should be the only one since we said to only get one above)
      var message = data.Messages[0];
          //body = JSON.parse(message.Body);
      // Now this is where you'd do something with this message
     console.log("Message received in data processor" + message.Body);
     
     var jsonString = JSON.parse(message.Body);  
     var tweetText = jsonString.tweet;
    alchemyapi.sentiment("text", tweetText, {}, function(response) {
  if (err) throw err;

  // See http://www.alchemyapi.com/api/ for format of returned object
  var sentiment = response.docSentiment;
   console.log("Adding new tweet with sentiment");


  if(sentiment == undefined)
   sentiment = 'positive';
 else
  sentiment = sentiment.type;


    console.log(sentiment);


     removeFromQueue(message);
   });
   }
 });
}

var removeFromQueue = function(message) {
   sqs.deleteMessage({
      QueueUrl: sqsQueueUrl,
      ReceiptHandle: message.ReceiptHandle
   }, function(err, data) {
      // If we errored, tell us that we did
      err && console.log(err);
   });
   i++;
   if(i<400)
readMessage();
};