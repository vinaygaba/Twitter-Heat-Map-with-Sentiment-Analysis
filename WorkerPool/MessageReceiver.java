package com.vinaygaba.twitterheatmap;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

import com.amazonaws.AmazonClientException;
import com.amazonaws.AmazonServiceException;
import com.amazonaws.auth.AWSCredentials;
import com.amazonaws.auth.profile.ProfileCredentialsProvider;
import com.amazonaws.regions.Region;
import com.amazonaws.regions.Regions;
import com.amazonaws.services.sqs.AmazonSQS;
import com.amazonaws.services.sqs.AmazonSQSClient;
import com.amazonaws.services.sqs.model.DeleteMessageBatchRequest;
import com.amazonaws.services.sqs.model.DeleteMessageBatchRequestEntry;
import com.amazonaws.services.sqs.model.Message;
import com.amazonaws.services.sqs.model.ReceiveMessageRequest;
import com.amazonaws.util.json.JSONObject;

public class MessageReceiver {

	public static void main(String[] args) throws Exception {

		/*
		 * The ProfileCredentialsProvider will return your [default] credential
		 * profile by reading from the credentials file located at
		 * (/Users/gaurang/.aws/credentials).
		 */
		AWSCredentials credentials = null;
		try {
			credentials = new ProfileCredentialsProvider("default").getCredentials();
		} catch (Exception e) {
			throw new AmazonClientException("Cannot load the credentials from the credential profiles file. "
					+ "Please make sure that your credentials file is at the correct "
					+ "location (/Users/vinaygaba/.aws/credentials), and is in valid format.", e);
		}

		AmazonSQS sqs = new AmazonSQSClient(credentials);
		Region usEast1 = Region.getRegion(Regions.US_EAST_1);
		sqs.setRegion(usEast1);
		
		//Initialize SNS Publisher
		SNSPublisher snspub = new SNSPublisher();
		

		try {
			String queueName = "tweet-map";
			String tweetQueueURL = sqs.getQueueUrl(queueName).getQueueUrl();

			// Receive tweets from Queue
			int maxNumberOfMessages = 10;

			while (true) {
				ReceiveMessageRequest receiveMessageRequest = new ReceiveMessageRequest(tweetQueueURL)
						.withMaxNumberOfMessages(maxNumberOfMessages);
				List<Message> messages = sqs.receiveMessage(receiveMessageRequest).getMessages();
				ExecutorService executor = Executors.newFixedThreadPool(maxNumberOfMessages);
				for (Message message : messages) {
					JSONObject tweet = new JSONObject(message.getBody());
					
					Runnable tweetWorker = new TweetWorker(tweet,snspub);
					executor.execute(tweetWorker);
				}
				try {
					System.out.println("Attempting to shut threads down");
					executor.shutdown();
					executor.awaitTermination(maxNumberOfMessages, TimeUnit.SECONDS);
				} catch (InterruptedException e) {
					System.out.println("Threads Interrupted");
				} finally {
					if (!executor.isTerminated())
						System.out.println("Finishing incomplete tasks");
					executor.shutdownNow();
					System.out.println("All threads forcefully shutdown");
				}
				// Delete the 10 messages that are processed
//				List<DeleteMessageBatchRequestEntry> deleteEntries = new ArrayList<DeleteMessageBatchRequestEntry>();
//				for (Message message : messages) {
//					deleteEntries.add(
//							new DeleteMessageBatchRequestEntry(message.getMessageId(), message.getReceiptHandle()));
//				}
//				DeleteMessageBatchRequest deleteRequest = new DeleteMessageBatchRequest(tweetQueueURL, deleteEntries);
//				sqs.deleteMessageBatch(deleteRequest);
			}

		} catch (AmazonServiceException ase) {
			System.out.println("Caught an AmazonServiceException, which means your request made it "
					+ "to Amazon SQS, but was rejected with an error response for some reason.");
			System.out.println("Error Message:    " + ase.getMessage());
			System.out.println("HTTP Status Code: " + ase.getStatusCode());
			System.out.println("AWS Error Code:   " + ase.getErrorCode());
			System.out.println("Error Type:       " + ase.getErrorType());
			System.out.println("Request ID:       " + ase.getRequestId());
		} catch (AmazonClientException ace) {
			System.out.println("Caught an AmazonClientException, which means the client encountered "
					+ "a serious internal problem while trying to communicate with SQS, such as not "
					+ "being able to access the network.");
			System.out.println("Error Message: " + ace.getMessage());
		}
	}
}