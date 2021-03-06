package qa.qcri.aidr.collector.api;

import static qa.qcri.aidr.collector.utils.ConfigProperties.getProperty;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.util.List;

import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.client.Client;
import javax.ws.rs.client.ClientBuilder;
import javax.ws.rs.client.WebTarget;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.UriInfo;

import org.apache.commons.lang.StringUtils;
import org.apache.log4j.Logger;
import org.glassfish.jersey.jackson.JacksonFeature;

import qa.qcri.aidr.collector.beans.CollectionTask;
import qa.qcri.aidr.collector.beans.ResponseWrapper;
import qa.qcri.aidr.collector.collectors.TwitterStreamTracker;
import qa.qcri.aidr.collector.utils.GenericCache;

/**
 * REST Web Service
 *
 * @author Imran
 */
@Path("/twitter")
public class TwitterCollectorAPI {

    private static Logger logger = Logger.getLogger(TwitterCollectorAPI.class.getName());

    @Context
    private UriInfo context;

    public TwitterCollectorAPI() {
    }

    @POST
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    @Path("/start")
    public Response startTask(CollectionTask task) {
        logger.info("Collection start request received for " + task.getCollectionCode());
        logger.info("Details:\n" + task.toString());
        ResponseWrapper response = new ResponseWrapper();

        //check if all twitter specific information is available in the request
        if (!task.isTwitterInfoPresent()) {
            response.setStatusCode(getProperty("STATUS_CODE_COLLECTION_ERROR"));
            response.setMessage("One or more Twitter authentication token(s) are missing");
            return Response.ok(response).build();
        }

        //check if all query parameters are missing in the query
        if (!task.isToTrackAvailable() && !task.isToFollowAvailable() && !task.isGeoLocationAvailable()) {
            response.setStatusCode(getProperty("STATUS_CODE_COLLECTION_ERROR"));
            response.setMessage("Missing one or more fields (toTrack, toFollow, and geoLocation). At least one field is required");
            return Response.ok(response).build();
        }

        String collectionCode = task.getCollectionCode();

        //check if a task is already running with same configutations
        logger.info("Checking OAuth parameters for " + collectionCode);
        GenericCache cache = GenericCache.getInstance();
		if (cache.isTwtConfigExists(task)) {
            String msg = "Provided OAuth configurations already in use. Please stop this collection and then start again.";
            logger.info(collectionCode + ": " + msg);
            response.setMessage(msg);
            response.setStatusCode(getProperty("STATUS_CODE_COLLECTION_ERROR"));
            return Response.ok(response).build();
        }

		task.setStatusCode(getProperty("STATUS_CODE_COLLECTION_INITIALIZING"));
		logger.info("Initializing connection with Twitter streaming API for collection " + collectionCode);
		try {
			TwitterStreamTracker tracker = new TwitterStreamTracker(task);
			tracker.start();

			String cacheKey = task.getCollectionCode();
			cache.incrCounter(cacheKey, new Long(0));

			// if twitter streaming connection successful then change the status
			// code
			task.setStatusCode(getProperty("STATUS_CODE_COLLECTION_RUNNING"));
			task.setStatusMessage(null);
			cache.setTwtConfigMap(cacheKey, task);
			cache.setTwitterTracker(cacheKey, tracker);

			if (Boolean.valueOf(getProperty("DEFAULT_PERSISTANCE_MODE"))) {
				startPersister(collectionCode);
			}

			response.setMessage(getProperty("STATUS_CODE_COLLECTION_INITIALIZING"));
			response.setStatusCode(getProperty("STATUS_CODE_COLLECTION_INITIALIZING"));
		} catch (Exception ex) {
			logger.error("Exception in creating TwitterStreamTracker for collection " + collectionCode, ex);
			response.setMessage(ex.getMessage());
			response.setStatusCode(getProperty("STATUS_CODE_COLLECTION_ERROR"));
		}
		return Response.ok(response).build();
	}

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Path("/stop")
    public Response stopTask(@QueryParam("id") String collectionCode) throws InterruptedException {
        GenericCache cache = GenericCache.getInstance();
        TwitterStreamTracker tracker = cache.getTwitterTracker(collectionCode);
        CollectionTask task = cache.getConfig(collectionCode);

        cache.delFailedCollection(collectionCode);
        cache.deleteCounter(collectionCode);
        cache.delTwtConfigMap(collectionCode);
        cache.delLastDownloadedDoc(collectionCode);
        cache.delTwitterTracker(collectionCode);

		if (tracker != null) {
			try {
				tracker.close();
			} catch (IOException e) {
				ResponseWrapper response = new ResponseWrapper();
				response.setMessage(e.getMessage());
				response.setStatusCode(getProperty("STATUS_CODE_COLLECTION_NOTFOUND"));
				return Response.ok(response).build();
			}

            if (Boolean.valueOf(getProperty("DEFAULT_PERSISTANCE_MODE"))) {
                stopPersister(collectionCode);
            }

            logger.info(collectionCode + ": " + "Collector has been successfully stopped.");
        } else {
            logger.info("No collector instances found to be stopped with the given id:" + collectionCode);
        }

        if (task != null) {
            return Response.ok(task).build();
        }

        ResponseWrapper response = new ResponseWrapper();
        response.setMessage("Invalid key. No running collector found for the given id.");
        response.setStatusCode(getProperty("STATUS_CODE_COLLECTION_NOTFOUND"));
        return Response.ok(response).build();
    }

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Path("/status")
    public Response getStatus(@QueryParam("id") String id) {
        ResponseWrapper response = new ResponseWrapper();
        if (StringUtils.isEmpty(id)) {
            response.setMessage("Invalid key. No running collector found for the given id.");
            response.setStatusCode(getProperty("STATUS_CODE_COLLECTION_NOTFOUND"));
            return Response.ok(response).build();
        }
        CollectionTask task = GenericCache.getInstance().getConfig(id);
        if (task != null) {
            return Response.ok(task).build();
        }

        CollectionTask failedTask = GenericCache.getInstance().getFailedCollectionTask(id);
        if (failedTask != null) {
            return Response.ok(failedTask).build();
        }

        response.setMessage("Invalid key. No running collector found for the given id.");
        response.setStatusCode(getProperty("STATUS_CODE_COLLECTION_NOTFOUND"));
        return Response.ok(response).build();

    }

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Path("/restart")
    public Response restartCollection(@QueryParam("code") String collectionCode) throws InterruptedException {
        List<CollectionTask> collections = GenericCache.getInstance().getAllRunningCollectionTasks();
        CollectionTask collectionToRestart = null;
        for (CollectionTask collection : collections) {
            if (collection.getCollectionCode().equalsIgnoreCase(collectionCode)) {
                collectionToRestart = collection;
                break;
            }
        }
        stopTask(collectionCode);
        Thread.sleep(3000);
        Response response = startTask(collectionToRestart);
        return response;
    }

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Path("/status/all")
    public Response getStatusAll() {
        List<CollectionTask> allTasks = GenericCache.getInstance().getAllConfigs();
        return Response.ok(allTasks).build();
    }

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Path("/failed/all")
    public Response getAllFailedCollections() {
        List<CollectionTask> allTasks = GenericCache.getInstance().getAllFailedCollections();
        return Response.ok(allTasks).build();
    }

    @Deprecated
    public void startCollectorPersister(String collectionCode) {
        Client client = ClientBuilder.newBuilder().register(JacksonFeature.class).build();
        try {
            WebTarget webResource = client.target(getProperty("PERSISTER_REST_URI") + "persister/start?file="
                    + URLEncoder.encode(getProperty("DEFAULT_PERSISTER_FILE_LOCATION"), "UTF-8")
                    + "&collectionCode=" + URLEncoder.encode(collectionCode, "UTF-8"));
            Response clientResponse = webResource.request(MediaType.APPLICATION_JSON).get();
            String jsonResponse = clientResponse.readEntity(String.class);

            logger.info(collectionCode + ": Collector persister response = " + jsonResponse);
        } catch (RuntimeException e) {
            logger.error(collectionCode + ": Could not start persister. Is persister running?", e);
        } catch (UnsupportedEncodingException e) {
            // TODO Auto-generated catch block
            logger.error(collectionCode + ": Unsupported Encoding scheme used");
        }
    }

    private void startPersister(String collectionCode) {
        Client client = ClientBuilder.newBuilder().register(JacksonFeature.class).build();
        try {
            WebTarget webResource = client.target(getProperty("PERSISTER_REST_URI") + "collectionPersister/start?channel_provider="
                    + URLEncoder.encode(getProperty("TAGGER_CHANNEL"), "UTF-8")
                    + "&collection_code=" + URLEncoder.encode(collectionCode, "UTF-8"));
            Response clientResponse = webResource.request(MediaType.APPLICATION_JSON).get();
            String jsonResponse = clientResponse.readEntity(String.class);

            logger.info(collectionCode + ": Collector persister response = " + jsonResponse);
        } catch (RuntimeException e) {
            logger.error(collectionCode + ": Could not start persister. Is persister running?", e);
        } catch (UnsupportedEncodingException e) {
            logger.error(collectionCode + ": Unsupported Encoding scheme used");
        }
    }

    @Deprecated
    public void stopCollectorPersister(String collectionCode) {
        Client client = ClientBuilder.newBuilder().register(JacksonFeature.class).build();
        try {
            WebTarget webResource = client.target(getProperty("PERSISTER_REST_URI")
                    + "persister/stop?collectionCode=" + URLEncoder.encode(collectionCode, "UTF-8"));
            Response clientResponse = webResource.request(MediaType.APPLICATION_JSON).get();
            String jsonResponse = clientResponse.readEntity(String.class);
            logger.info(collectionCode + ": Collector persister response =  " + jsonResponse);
        } catch (RuntimeException e) {
            logger.error(collectionCode + ": Could not stop persister. Is persister running?", e);
        } catch (UnsupportedEncodingException e) {
            // TODO Auto-generated catch block
            logger.error(collectionCode + ": Unsupported Encoding scheme used");
        }
    }

    public void stopPersister(String collectionCode) {
        Client client = ClientBuilder.newBuilder().register(JacksonFeature.class).build();
        try {
            WebTarget webResource = client.target(getProperty("PERSISTER_REST_URI")
                    + "collectionPersister/stop?collection_code=" + URLEncoder.encode(collectionCode, "UTF-8"));
            Response clientResponse = webResource.request(MediaType.APPLICATION_JSON).get();
            String jsonResponse = clientResponse.readEntity(String.class);
            logger.info(collectionCode + ": Collector persister response =  " + jsonResponse);
        } catch (RuntimeException e) {
            logger.error(collectionCode + ": Could not stop persister. Is persister running?", e);
        } catch (UnsupportedEncodingException e) {
            // TODO Auto-generated catch block
            logger.error(collectionCode + ": Unsupported Encoding scheme used");
        }
    }

    @Deprecated
    public void startTaggerPersister(String collectionCode) {
        Client client = ClientBuilder.newBuilder().register(JacksonFeature.class).build();
        try {
            WebTarget webResource = client.target(getProperty("PERSISTER_REST_URI") + "taggerPersister/start?file="
                    + URLEncoder.encode(getProperty("DEFAULT_PERSISTER_FILE_LOCATION"), "UTF-8")
                    + "&collectionCode=" + URLEncoder.encode(collectionCode, "UTF-8"));
            Response clientResponse = webResource.request(MediaType.APPLICATION_JSON).get();
            String jsonResponse = clientResponse.readEntity(String.class);
            logger.info(collectionCode + ": Tagger persister response = " + jsonResponse);
        } catch (RuntimeException e) {
            logger.error(collectionCode + ": Could not start persister. Is persister running?", e);
        } catch (UnsupportedEncodingException e) {
            // TODO Auto-generated catch block
            logger.error(collectionCode + ": Unsupported Encoding scheme used");
        }
    }

    @Deprecated
    public void stopTaggerPersister(String collectionCode) {
        Client client = ClientBuilder.newBuilder().register(JacksonFeature.class).build();
        try {
            WebTarget webResource = client.target(getProperty("PERSISTER_REST_URI")
                    + "taggerPersister/stop?collectionCode=" + URLEncoder.encode(collectionCode, "UTF-8"));
            Response clientResponse = webResource.request(MediaType.APPLICATION_JSON).get();
            String jsonResponse = clientResponse.readEntity(String.class);
            logger.info(collectionCode + ": Tagger persister response: " + jsonResponse);
        } catch (RuntimeException e) {
            logger.error(collectionCode + ": Could not stop persister. Is persister running?", e);
        } catch (UnsupportedEncodingException e) {
            // TODO Auto-generated catch block
            logger.error(collectionCode + ": Unsupported Encoding scheme used");
        }
    }
}
