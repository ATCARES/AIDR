package qa.qcri.aidr.utils;

import java.util.HashMap;
import java.util.Map;

import javax.ws.rs.client.Client;
import javax.ws.rs.client.ClientBuilder;
import javax.ws.rs.client.WebTarget;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import org.apache.log4j.Logger;
import org.glassfish.jersey.jackson.JacksonFeature;

import qa.qcri.aidr.common.code.ResponseWrapper;
import qa.qcri.aidr.common.logging.ErrorLog;
import static qa.qcri.aidr.utils.ConfigProperties.getProperty;

public class ResultStatus extends ResponseWrapper {

	private static Logger logger = Logger.getLogger(ResultStatus.class);
	private static ErrorLog elog = new ErrorLog();

	@Deprecated
	@SuppressWarnings({ "unused", "unchecked" })
	public static Integer getTotalDownloadedCount(final String collectionCode) {
		Response clientResponse = null;
		Client client = ClientBuilder.newBuilder().register(JacksonFeature.class).build();
		try {
			WebTarget webResource = client.target(getProperty("managerUrl")
					+ "/public/collection/findTotalCount?channelCode=" + collectionCode);

			clientResponse = webResource.request(MediaType.APPLICATION_JSON).get();
			Map<String, Integer> collectionMap = new HashMap<String, Integer>();

			if (clientResponse.getStatus() == 200) {
				//convert JSON string to Map
				collectionMap = clientResponse.readEntity(Map.class);
				logger.info("Channel info received from manager: " + collectionMap);
				if (collectionMap != null) {
					return collectionMap.get(collectionCode);
				}
			} else {
				logger.warn("Couldn't contact AIDRFetchManager for publiclyListed status, channel: " + collectionCode);
			}
		} catch (Exception e) {
			logger.error("Error in querying manager for running collections: " + clientResponse);
			logger.error(elog.toStringException(e));
		}
		return null;
	}

}
