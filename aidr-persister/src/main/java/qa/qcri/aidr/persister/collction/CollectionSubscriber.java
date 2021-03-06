/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package qa.qcri.aidr.persister.collction;

/**
 *
 * @author Imran
 */
import org.apache.log4j.Logger;

import qa.qcri.aidr.common.logging.ErrorLog;
import qa.qcri.aidr.common.redis.LoadShedder;
import qa.qcri.aidr.io.FileSystemOperations;
import redis.clients.jedis.JedisPubSub;
import java.io.*;
import java.nio.charset.Charset;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.concurrent.ConcurrentHashMap;

import static qa.qcri.aidr.utils.ConfigProperties.getProperty;

public class CollectionSubscriber extends JedisPubSub {

    private static Logger logger = Logger.getLogger(CollectionSubscriber.class.getName());
    private static ErrorLog elog = new ErrorLog();

    private String persisterDir;
    private String collectionDir;
    private BufferedWriter out = null;
    private String collectionCode;
    private File file;
    private long itemsWrittenToFile = 0;
    private int fileVolumnNumber = 1;

    private static ConcurrentHashMap<String, LoadShedder> redisLoadShedder = null;

    public CollectionSubscriber() {
    }

    public CollectionSubscriber(String fileLoc, String channel, String collectionCode) {
        //remove leading and trailing double quotes from collectionCode
        fileVolumnNumber = FileSystemOperations.getLatestFileVolumeNumber(collectionCode);
        this.collectionCode = collectionCode.replaceAll("^\"|\"$", "");
        this.persisterDir = fileLoc.replaceAll("^\"|\"$", "");
        collectionDir = createNewDirectory();
        createNewFile();
        createBufferWriter();
        if (null == redisLoadShedder) {
            redisLoadShedder = new ConcurrentHashMap<String, LoadShedder>(20);
        }
        redisLoadShedder.put(channel, new LoadShedder(Integer.parseInt(getProperty("PERSISTER_LOAD_LIMIT")), Integer.parseInt(getProperty("PERSISTER_LOAD_CHECK_INTERVAL_MINUTES")), true));
        logger.info("Created loadshedder for channel: " + channel);
    }

    @Override
    public void onMessage(String channel, String message) {
    }

    @Override
    public void onPMessage(String pattern, String channel, String message) {
        if (redisLoadShedder.get(channel).canProcess(channel)) {
            writeToFile(message);
        } else {
            logger.info("loadshdder denied write for: " + channel);
        }
    }

    @Override
    public void onSubscribe(String channel, int subscribedChannels) {
    }

    @Override
    public void onUnsubscribe(String channel, int subscribedChannels) {
    }

    @Override
    public void onPUnsubscribe(String pattern, int subscribedChannels) {
        logger.info("Unsubscribed Successfully from channel pattern = " + pattern);
        closeFileWriting();
    }

    @Override
    public void onPSubscribe(String pattern, int subscribedChannels) {
        logger.info("Subscribed Successfully to persist channel pattern = " + pattern);
    }

    private void createNewFile() {
        try {
            file = new File(collectionDir + collectionCode + "_" + getDateTime() + "_vol-" + fileVolumnNumber + ".json");
            if (!file.exists()) {
                file.createNewFile();
            }
        } catch (IOException ex) {
            logger.error(collectionCode + " error in creating new file at location " + collectionDir);
            logger.error(elog.toStringException(ex));
        }
    }

    private String createNewDirectory() {
        File theDir = new File(persisterDir + collectionCode);
        if (!theDir.exists()) {
            logger.info("creating directory: " + persisterDir + collectionCode);
            boolean result = theDir.mkdir();

            if (result) {
                logger.info("DIR created for collection: " + collectionCode);
                return persisterDir + collectionCode + "/";
            }

        }
        return persisterDir + collectionCode + "/";
    }

    private void createBufferWriter() {
        try {
            //out = new BufferedWriter(new OutputStreamWriter(new FileOutputStream(this.file, true), Charset.forName("UTF-8")), Integer.parseInt(getProperty("DEFAULT_FILE_WRITER_BUFFER_SIZE")));
        	out = new BufferedWriter(new OutputStreamWriter(new FileOutputStream(this.file, true)), Integer.parseInt(getProperty("DEFAULT_FILE_WRITER_BUFFER_SIZE")));
        } catch (IOException ex) {
            logger.error(collectionCode + "Error in creating Buffered writer");
            logger.error(elog.toStringException(ex));
        }

    }

    private void writeToFile(String message) {
        try {
            out.write(message + "\n");
            itemsWrittenToFile++;
            isTimeToCreateNewFile();
        } catch (IOException ex) {
            logger.error(collectionCode + "Error in writing to file");
            logger.error(elog.toStringException(ex));
        }
    }

    private void isTimeToCreateNewFile() {
        if (itemsWrittenToFile >= Integer.parseInt(getProperty("DEFAULT_FILE_VOLUMN_LIMIT"))) {
            closeFileWriting();
            itemsWrittenToFile = 0;
            fileVolumnNumber++;
            createNewFile();
            createBufferWriter();
        }
    }

    public void closeFileWriting() {
        try {
            if ( out != null ) {
                out.flush();
                out.close();
            }
        } catch (IOException ex) {
            logger.error(collectionCode + "Error in closing file writer");
            logger.error(elog.toStringException(ex));
        }
    }

    private final static String getDateTime() {
        DateFormat df = new SimpleDateFormat("yyyyMMdd");  //yyyy-MM-dd_hh:mm:ss
        return df.format(new Date());
    }
}
