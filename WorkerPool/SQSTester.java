package com.vinaygaba.twitterheatmap;

public class SQSTester {

	public static void main(String[] args) {
		// TODO Auto-generated method stub
		String queueUrl = "https://sqs.us-east-1.amazonaws.com/306587932798/tweet-map";
		SQSUtil awssqsUtil =   SQSUtil.getInstance();
		awssqsUtil.sendMessageToQueue(queueUrl, "Testing Java Code");

		
	}

}
