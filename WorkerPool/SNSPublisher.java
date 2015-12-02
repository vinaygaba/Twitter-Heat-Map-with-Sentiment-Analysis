package com.vinaygaba.twitterheatmap;

import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.auth.ClasspathPropertiesFileCredentialsProvider;
import com.amazonaws.regions.Region;
import com.amazonaws.regions.Regions;
import com.amazonaws.services.sns.AmazonSNSClient;
import com.amazonaws.services.sns.model.PublishRequest;
import com.amazonaws.services.sns.model.PublishResult;

public class SNSPublisher {

	String topicArn = "arn:aws:sns:us-east-1:306587932798:sentiment";
	static String accessKey = "AKIAJJ2I73EU2UQV2PKA";
	String secretKey = "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";
	static AmazonSNSClient snsClient;
	
	public SNSPublisher(){
		snsClient = new AmazonSNSClient(new BasicAWSCredentials(accessKey, secretKey));
		snsClient.setRegion(Region.getRegion(Regions.US_EAST_1));
	}
	
	public void publishToSNS(String message){
		PublishRequest publishRequest = new PublishRequest(topicArn, message);
		PublishResult publishResult = snsClient.publish(publishRequest);
		//print MessageId of message published to SNS topic
		System.out.println("MessageId - " + publishResult.getMessageId());
	}

}
