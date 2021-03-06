/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package qa.qcri.aidr.persister.collector;

//import java.util.logging.Level;
//import java.util.logging.Logger;

import org.apache.log4j.Logger;

import qa.qcri.aidr.common.logging.ErrorLog;
import qa.qcri.aidr.redis.JedisConnectionPool;
import qa.qcri.aidr.utils.GenericCache;
import redis.clients.jedis.Jedis;
import static qa.qcri.aidr.utils.ConfigProperties.getProperty;

/**
 *
 * @author Imran
 */
public class RedisCollectorPersister implements Runnable {

	private static Logger logger = Logger.getLogger(RedisCollectorPersister.class.getName());
	private static ErrorLog elog = new ErrorLog();
	
	String fileName;
	Thread t;
	boolean suspendFlag;
	Jedis subscriberJedis=null;
	CollectorSubscriber subscriber = null;
	String collectionCode;

	// koushik: make jedis thread-safe
	private JedisConnectionPool connObject = null;
	
	public RedisCollectorPersister(String fileName, String collectionCode) throws InterruptedException {
		this.fileName = fileName + collectionCode;
		this.collectionCode = collectionCode;
		// koushik: thread-safe jedis access code
		connObject = new JedisConnectionPool();
		
		t = new Thread(this, this.fileName);
		suspendFlag = true;
		//subscriberJedis = new Jedis("localhost");
		try {
			subscriberJedis = connObject.getJedisConnection();
			subscriber = new CollectorSubscriber(fileName, collectionCode);
		} catch (Exception e) {
			// TODO Auto-generated catch block
			logger.error(collectionCode + ": Error in subscribing to Redis");
        	logger.error(elog.toStringException(e));
        	
			connObject.close(subscriberJedis);
			subscriberJedis = null;
			subscriber = null;
			
		}
	}

	public void startMe(){
		t.start(); // Start the thread
	}


	public void run() {
		try {
			while (suspendFlag) {
				// koushik: Added a finally block to gracefully unsubscribe
				try {
					logger.info(collectionCode + ": started collecting data to -> " + fileName);
					logger.info("Channel to Listen  to: " + getProperty("FETCHER_CHANNEL") + collectionCode);
                            subscriberJedis.psubscribe(subscriber, getProperty("FETCHER_CHANNEL") + collectionCode);
					logger.info(collectionCode + ": Stopped collecting data -> " + fileName);
					Thread.sleep(200);
				} finally {
					if (subscriber != null && subscriber.isSubscribed()) {
						subscriber.punsubscribe(getProperty("TAGGER_CHANNEL") + collectionCode);
						try {
							connObject.close(subscriberJedis);		// return jedis resource to JedisPool
							Thread.sleep(200);
						} catch (InterruptedException ex) {
							//Logger.getLogger(RedisCollectorPersister.class.getName()).log(Level.SEVERE, null, ex);
							logger.warn(collectionCode + " error in closing Redis connection");
				        	logger.warn(elog.toStringException(ex));
						}
					}
				}

			}
		} catch (InterruptedException e) {
			logger.warn(collectionCode + " interrupted.");
		}
		logger.info(collectionCode + " exiting.");
	}

	public void suspendMe() {
		suspendFlag = false;

		if (subscriber != null && subscriber.isSubscribed()) {
			// Bug fix: redundant "." in fully qualified channel name
			//subscriber.punsubscribe(Config.FETCHER_CHANNEL+ "."+collectionCode);
			subscriber.punsubscribe(getProperty("FETCHER_CHANNEL") + collectionCode);
		}
		/*
		try {
			connObject.close(subscriberJedis);		// return jedis resource to JedisPool
			Thread.sleep(200);
		} catch (InterruptedException ex) {
			Logger.getLogger(RedisCollectorPersister.class.getName()).log(Level.SEVERE, null, ex);
		}*/
		
		//t.stop();		// koushik: replaced by t.join()
		try {
			t.join();
		} catch (InterruptedException e) {
			// TODO Auto-generated catch block
			logger.warn(collectionCode + ": Collector Persister Thread join interrupted");
		}
	}

	synchronized void myresume() {
		suspendFlag = false;
		notify();
	}
}
