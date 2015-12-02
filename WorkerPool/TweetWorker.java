package com.vinaygaba.twitterheatmap;
import java.io.IOException;
import java.io.StringWriter;

import javax.xml.parsers.ParserConfigurationException;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerException;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;
import javax.xml.xpath.XPath;
import javax.xml.xpath.XPathConstants;
import javax.xml.xpath.XPathExpressionException;
import javax.xml.xpath.XPathFactory;

import org.w3c.dom.Document;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.SAXException;

import com.alchemyapi.api.AlchemyAPI;
import com.amazonaws.util.json.JSONException;
import com.amazonaws.util.json.JSONObject;

public class TweetWorker implements Runnable {
	private JSONObject tweet;
	private SNSPublisher snspub;
	
	public TweetWorker(JSONObject tweet,SNSPublisher snspub) {
		this.tweet = tweet;
		this.snspub = snspub;
	}
	
	private void getSentiment() {
		
		
		// make a URL and hit up alchemy
		try {
			
			
			AlchemyAPI alchemy = AlchemyAPI.GetInstanceFromString(key);
			Document doc = alchemy.TextGetTextSentiment(tweet.getString("tweet"));
	     	NodeList elementsByTagName = doc.getElementsByTagName("type");
			String sentiment = elementsByTagName.item(0).getTextContent();
			System.out.println("Tag value" + sentiment);
			System.out.println("Tweet text"+ tweet.getString("tweet"));
			System.out.println("Latitude"+ tweet.getString("lat"));
			System.out.println("Longitude" + tweet.getString("lng"));
			
			JSONObject jsonObject = new JSONObject();
			jsonObject.put("tweet",tweet.getString("tweet"));
			jsonObject.put("lat",tweet.getString("lat"));
			jsonObject.put("lng",tweet.getString("lng"));
			jsonObject.put("sentiment",sentiment);
			
			
			
			
			/*NodeList childNodes = doc.getChildNodes();
			for(int i = 0 ; i < childNodes.getLength(); i++)
			{
				System.out.println("Tag value from list" + childNodes.item(i).getNodeValue());
			}*/
			
//			XPath xPath = XPathFactory.newInstance().newXPath();
//            Node node = (Node) xPath.evaluate("//docSentiment//type", doc, XPathConstants.NODE);
//            System.out.println("Node value" + node.getNodeValue());
			
			System.out.println(getStringFromDocument(doc));
			//snspub.publishToSNS(getStringFromDocument(doc));
			snspub.publishToSNS(jsonObject.toString());
		} catch (JSONException | XPathExpressionException | IOException | SAXException | ParserConfigurationException e) {
			e.printStackTrace();
		}
	}
	
	@Override
	public void run() {
		getSentiment();
	}
	
	private String getStringFromDocument(Document doc) {
        try {
            DOMSource domSource = new DOMSource(doc);
            StringWriter writer = new StringWriter();
            StreamResult result = new StreamResult(writer);

            TransformerFactory tf = TransformerFactory.newInstance();
            Transformer transformer = tf.newTransformer();
            transformer.transform(domSource, result);

            return writer.toString();
        } catch (TransformerException ex) {
            ex.printStackTrace();
            return null;
        }
    }

}