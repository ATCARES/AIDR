package qa.qcri.aidr.manager.service.impl;

import qa.qcri.aidr.manager.dto.CollectionLogDataResponse;
import qa.qcri.aidr.manager.exception.AidrException;
import qa.qcri.aidr.manager.hibernateEntities.AidrCollectionLog;
import qa.qcri.aidr.manager.repository.CollectionLogRepository;
import qa.qcri.aidr.manager.service.CollectionLogService;






//import com.sun.jersey.api.client.Client;		// gf 3 way
//import com.sun.jersey.api.client.ClientResponse;
//import com.sun.jersey.api.client.WebResource;
import javax.ws.rs.client.Client;
import javax.ws.rs.client.ClientBuilder;
import javax.ws.rs.client.WebTarget;
import javax.ws.rs.core.Response;

import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.ws.rs.core.MediaType;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.glassfish.jersey.jackson.JacksonFeature;

@Service("collectionLogService")
public class CollectionLogServiceImpl implements CollectionLogService {

    private Logger logger = Logger.getLogger(getClass());

    // gf 3 way - disable @AutoWired since Client API has changed
    //@Autowired
    

    @Autowired
    private CollectionLogRepository collectionLogRepository;

    @Value("${persisterMainUrl}")
    private String persisterMainUrl;

    @Override
    @Transactional(readOnly = false)
    public void update(AidrCollectionLog collectionLog) throws Exception {
        collectionLogRepository.update(collectionLog);
    }

    @Override
    @Transactional(readOnly = false)
    public void delete(AidrCollectionLog collectionLog) throws Exception {
        collectionLogRepository.delete(collectionLog);

    }

    @Override
    public void create(AidrCollectionLog collectionLog) throws Exception {
        collectionLogRepository.save(collectionLog);
    }

    @Override
    @Transactional(readOnly = true)
    public AidrCollectionLog findById(Integer id) throws Exception {
        return collectionLogRepository.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public CollectionLogDataResponse findAll(Integer start, Integer limit) throws Exception {
        return collectionLogRepository.getPaginatedData(start, limit);
    }

    @Override
    @Transactional(readOnly = true)
    public CollectionLogDataResponse findAllForCollection(Integer start, Integer limit, Integer collectionId) throws Exception {
        return collectionLogRepository.getPaginatedDataForCollection(start, limit, collectionId);
    }

    @Override
    @Transactional(readOnly = true)
    public Integer countTotalDownloadedItemsForCollection(Integer collectionId) throws Exception {
        return collectionLogRepository.countTotalDownloadedItemsForCollection(collectionId);
    }

    @Override
    @Transactional(readOnly = true)
    public Map<Integer, Integer> countTotalDownloadedItemsForCollectionIds(List<Integer> ids) throws Exception {
        return collectionLogRepository.countTotalDownloadedItemsForCollectionIds(ids);
    }

    @Override
    public Map<String, Object> generateCSVLink(String code) throws AidrException {
        try {
            Client client = ClientBuilder.newBuilder().register(JacksonFeature.class).build();            
            WebTarget webResource = client.target(persisterMainUrl + "/persister/genCSV?collectionCode=" + code);
            Response clientResponse = webResource.request(MediaType.APPLICATION_JSON).get();
            //String jsonResponse = clientResponse.readEntity(String.class);
            
            Map<String, Object> jsonResponse = clientResponse.readEntity(Map.class);
            return jsonResponse;
            /*
            if (jsonResponse != null && "http".equals(jsonResponse.substring(0, 4))) {
                return jsonResponse;
            } else {
                return "";
            }*/
        } catch (Exception e) {
            throw new AidrException("[generateCSVLink] Error while generating CSV link in Persister", e);
        }
    }

    @Override
    public Map<String, Object> generateTweetIdsLink(String code) throws AidrException {
        Client client = ClientBuilder.newBuilder().register(JacksonFeature.class).build();
        try {
        	WebTarget webResource = client.target(persisterMainUrl + "/persister/genTweetIds?collectionCode=" + code);
        	Response clientResponse = webResource.request(MediaType.APPLICATION_JSON).get();
        	//String jsonResponse = clientResponse.readEntity(String.class);
        	
        	Map<String, Object> jsonResponse = clientResponse.readEntity(Map.class);
            return jsonResponse;
            /*
            if (jsonResponse != null && "http".equals(jsonResponse.substring(0, 4))) {
                return jsonResponse;
            } else {
                return "";
            }*/
        } catch (Exception e) {
            throw new AidrException("[generateTweetIdsLink] Error while generating Tweet Ids link in Persister", e);
        }
    }
    
    @Override
    public Map<String, Object> generateJSONLink(String code, String jsonType) throws AidrException {
        try {
            Client client = ClientBuilder.newBuilder().register(JacksonFeature.class).build();
            WebTarget webResource = client.target(persisterMainUrl + "/persister/genJson?collectionCode=" + code + "&jsonType=" + jsonType);
            Response clientResponse = webResource.request(MediaType.APPLICATION_JSON).get();
            //String jsonResponse = clientResponse.readEntity(String.class);
            
            Map<String, Object> jsonResponse = clientResponse.readEntity(Map.class);
            return jsonResponse;
            /*
            if (jsonResponse != null && "http".equals(jsonResponse.substring(0, 4))) {
                return jsonResponse;
            } else {
                return "";
            }*/
        } catch (Exception e) {
            throw new AidrException("[generateJSONLink] Error while generating JSON download link in Persister", e);
        }
    }

    @Override
    public Map<String, Object> generateJsonTweetIdsLink(String code, String jsonType) throws AidrException {
        Client client = ClientBuilder.newBuilder().register(JacksonFeature.class).build();
        try {
            WebTarget webResource = client.target(persisterMainUrl + "/persister/genJsonTweetIds?collectionCode=" + code 
            		+ "&downloadLimited=true&"+ "&jsonType=" + jsonType);
        	Response clientResponse = webResource.request(MediaType.APPLICATION_JSON).get();
        	//String jsonResponse = clientResponse.readEntity(String.class);
        	
        	Map<String, Object> jsonResponse = clientResponse.readEntity(Map.class);
            return jsonResponse;
            /*
            if (jsonResponse != null && "http".equals(jsonResponse.substring(0, 4))) {
                return jsonResponse;
            } else {
                return "";
            }*/
        } catch (Exception e) {
            throw new AidrException("[generateJsonTweetIdsLink] Error while generating JSON Tweet Ids download link in Persister", e);
        }
    }
}