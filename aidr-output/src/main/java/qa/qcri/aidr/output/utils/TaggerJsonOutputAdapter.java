/**
 * @author Koushik Sinha
 * Last modified: 11/01/2014
 * 
 * The TaggerJsonOutputAdpater class implements Tagger specific
 * json object format. Specifically, it can return null if the 
 * nominal_labels field in a json message is null. 
 *  
 */

package qa.qcri.aidr.output.utils;

import org.apache.log4j.Logger;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import qa.qcri.aidr.common.logging.ErrorLog;

public class TaggerJsonOutputAdapter {
	// Logger setup
	private static Logger logger = Logger.getLogger(TaggerJsonOutputAdapter.class);
	private static ErrorLog elog = new ErrorLog();

	private String crisisCode = null;

	public TaggerJsonOutputAdapter() {}

	public String getCrisisCode() {
		return crisisCode;
	}

	public void setCrisisCode(String crisisCode) {
		this.crisisCode = crisisCode;
	}

	public String buildJsonString(String rawJsonString, boolean rejectNullFlag) {
		Gson jsonObject = new GsonBuilder().serializeNulls().disableHtmlEscaping()
				.serializeSpecialFloatingPointValues()	//.setPrettyPrinting()
				.create();
		// remove top-level array: we are only dealing with JsonObjects from REDIS in aidr-output
		if (rawJsonString.startsWith("["))		// should never happen 
			rawJsonString = rawJsonString.substring(1, rawJsonString.length()-1);	

		try {
			JsonParser parser = new JsonParser();
			JsonObject obj = (JsonObject) parser.parse(rawJsonString);
			JsonElement tweetData = null;
			JsonElement timestamp = null;

			String id = null;
			JsonObject userData = null;
			JsonElement screen_name = null;

			JsonObject aidrData = null;
			JsonArray nominalLabels; 
			crisisCode = null;

			if (obj.has("text")) {					// should always be true
				tweetData = obj.get("text");		// get the tweet text string

				if (obj.has("created_at")) {
					timestamp = obj.get("created_at");
				}

				if (obj.has("id")) {
					id = obj.get("id").getAsString();
				}

				if (obj.has("user")) {
					userData = (JsonObject) obj.get("user");
					screen_name = userData.get("screen_name");
				}

				if (obj.has("aidr")) {								// should always be true
					aidrData = (JsonObject) obj.get("aidr");		// get the aidr JSON object

					// extract relevant fields from the aidr JSON object
					JsonElement crisisCode = null;
					if (aidrData.has("crisis_code")) {				// should always be true
						crisisCode = aidrData.get("crisis_code");
						setCrisisCode(crisisCode.getAsString());
					}
					JsonElement crisisName = null;					
					if (aidrData.has("crisis_name"))				// should always be true
						crisisName = aidrData.get("crisis_name");	
					if (aidrData.has("nominal_labels")) {			// if false, then something wrong in AIDR setup
						nominalLabels = aidrData.get("nominal_labels").getAsJsonArray();
					} else {
						nominalLabels = new JsonArray();
					}
					JsonReturnClass jsonObj = new JsonReturnClass();
					jsonObj.text = tweetData;
					jsonObj.created_at = timestamp;
					jsonObj.crisis_code = crisisCode;
					jsonObj.crisis_name = crisisName;
					jsonObj.nominal_labels.addAll(nominalLabels);

					jsonObj.id = id;
					jsonObj.screen_name = screen_name;

					if (!isemptyNominalLabels(nominalLabels)) 
						return jsonObject.toJson(jsonObj);

					if (rejectNullFlag) 
						return null;			// returning "null" to meet Tagger's specific front-end requirements
					else
						return jsonObject.toJson(jsonObj);
				}
			}
		} catch (Exception e) {
			//logger.error("Exception in json parsing for string: " + rawJsonString);
		}

		// no group label called "aidr" or "text" present
		if (rejectNullFlag) 
			return null;			// returning "null" to meet Tagger's specific front-end requirements
		else
			return jsonObject.toJson(new JsonObject());

	}

	private boolean isemptyNominalLabels(JsonArray nominalLabels) {
		if (nominalLabels.size() == 0) 
			return true;
		else
			return false;
	}

	public class JsonReturnClass {
		private JsonElement created_at = null;
		private JsonElement text = null;
		private JsonElement crisis_code = null;
		private JsonElement crisis_name = null;

		private String id = null;
		private JsonElement screen_name = null;

		private JsonArray nominal_labels;

		public JsonReturnClass() {
			nominal_labels = new JsonArray();
		}

		public JsonElement getDate() {
			return created_at;
		}

		public JsonElement getText() {
			return text;
		}

		public JsonElement getCrisisCode() {
			return crisis_code;
		}

		public JsonElement getCrisisName() {
			return crisis_name;
		}

		public JsonArray getNominalLabels() {
			JsonArray arr = new JsonArray();
			if (nominal_labels != null) 
				arr.addAll(nominal_labels);
			return arr;
		}

		public String getId() {
			return id;
		}

		public JsonElement getScreenName() {
			return screen_name;
		}
	}
}