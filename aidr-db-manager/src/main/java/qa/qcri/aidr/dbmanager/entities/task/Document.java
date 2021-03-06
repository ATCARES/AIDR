// default package
// Generated Nov 24, 2014 4:55:08 PM by Hibernate Tools 4.0.0
package qa.qcri.aidr.dbmanager.entities.task;

import java.util.Date;
import java.util.List;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;

import static javax.persistence.GenerationType.IDENTITY;

import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import javax.persistence.Table;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;

import org.hibernate.Hibernate;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import qa.qcri.aidr.dbmanager.entities.misc.Crisis;

/**
 * Document generated by hbm2java
 */
@Entity
@Table(name = "document", catalog = "aidr_predict")
public class Document implements java.io.Serializable {

	/**
	 * 
	 */
	private static final long serialVersionUID = 5732646538544293262L;
	
	@Id
	@GeneratedValue(strategy = IDENTITY)
	@Column(name = "documentID", unique = true, nullable = false)
	private Long documentId;
	
	@ManyToOne(fetch = FetchType.EAGER)
	@JoinColumn(name = "crisisID", nullable = false)
	@JsonBackReference
	private Crisis crisis;
	
	
	private boolean isEvaluationSet;
	private boolean hasHumanLabels;
	private Double valueAsTrainingSample;
	private Date receivedAt;
	private String language;
	private String doctype;
	private String data;
	private String wordFeatures;
	private String geoFeatures;
	
	@OneToMany(fetch = FetchType.LAZY, mappedBy = "document")
	@JsonManagedReference
	private List<TaskAssignment> taskAssignments = null;
	
	@OneToMany(fetch = FetchType.LAZY, mappedBy = "document")
	@JsonManagedReference
	private List<DocumentNominalLabel> documentNominalLabels = null;
	
	public Document() {
	}

	public Document(Crisis crisis, boolean isEvaluationSet,
			boolean hasHumanLabels, Double valueAsTrainingSample,
			Date receivedAt, String language, String doctype, String data) {
		this.crisis = crisis;
		this.isEvaluationSet = isEvaluationSet;
		this.hasHumanLabels = hasHumanLabels;
		this.valueAsTrainingSample = valueAsTrainingSample;
		this.receivedAt = receivedAt;
		this.language = language;
		this.doctype = doctype;
		this.data = data;
	}

	public Document(Crisis crisis, boolean isEvaluationSet,
			boolean hasHumanLabels, Double valueAsTrainingSample,
			Date receivedAt, String language, String doctype, String data,
			String wordFeatures, String geoFeatures, List<TaskAssignment> taskAssignments,
			List<DocumentNominalLabel> documentNominalLabels) {
		this.crisis = crisis;
		this.isEvaluationSet = isEvaluationSet;
		this.hasHumanLabels = hasHumanLabels;
		this.valueAsTrainingSample = valueAsTrainingSample;
		this.receivedAt = receivedAt;
		this.language = language;
		this.doctype = doctype;
		this.data = data;
		this.wordFeatures = wordFeatures;
		this.geoFeatures = geoFeatures;
		this.taskAssignments = taskAssignments;
		this.documentNominalLabels = documentNominalLabels;
	}


	public Long getDocumentId() {
		return this.documentId;
	}

	public void setDocumentId(Long documentId) {
		this.documentId = documentId;
	}


	public Crisis getCrisis() {
		return this.crisis;
	}

	public void setCrisis(Crisis crisis) {
		this.crisis = crisis;
	}

	@Column(name = "isEvaluationSet", nullable = false)
	public boolean isIsEvaluationSet() {
		return this.isEvaluationSet;
	}

	public void setIsEvaluationSet(boolean isEvaluationSet) {
		this.isEvaluationSet = isEvaluationSet;
	}

	@Column(name = "hasHumanLabels", nullable = false)
	public boolean isHasHumanLabels() {
		return this.hasHumanLabels;
	}

	public void setHasHumanLabels(boolean hasHumanLabels) {
		this.hasHumanLabels = hasHumanLabels;
	}

	@Column(name = "valueAsTrainingSample", nullable = false, precision = 22, scale = 0)
	public double getValueAsTrainingSample() {
		return this.valueAsTrainingSample;
	}

	public void setValueAsTrainingSample(double valueAsTrainingSample) {
		this.valueAsTrainingSample = valueAsTrainingSample;
	}

	@Temporal(TemporalType.TIMESTAMP)
	@Column(name = "receivedAt", nullable = false, length = 19)
	public Date getReceivedAt() {
		return this.receivedAt;
	}

	public void setReceivedAt(Date receivedAt) {
		this.receivedAt = receivedAt;
	}

	@Column(name = "language", nullable = false, length = 5)
	public String getLanguage() {
		return this.language;
	}

	public void setLanguage(String language) {
		this.language = language;
	}

	@Column(name = "doctype", nullable = false, length = 20)
	public String getDoctype() {
		return this.doctype;
	}

	public void setDoctype(String doctype) {
		this.doctype = doctype;
	}

	@Column(name = "data", nullable = false, length = 65535)
	public String getData() {
		return this.data;
	}

	public void setData(String data) {
		this.data = data;
	}

	@Column(name = "wordFeatures", length = 65535)
	public String getWordFeatures() {
		return this.wordFeatures;
	}

	public void setWordFeatures(String wordFeatures) {
		this.wordFeatures = wordFeatures;
	}

	@Column(name = "geoFeatures", length = 65535)
	public String getGeoFeatures() {
		return this.geoFeatures;
	}

	public void setGeoFeatures(String geoFeatures) {
		this.geoFeatures = geoFeatures;
	}

	
	public List<TaskAssignment> getTaskAssignments() {
		return this.taskAssignments;
	}

	public void setTaskAssignments(List<TaskAssignment> taskAssignments) {
		this.taskAssignments = taskAssignments;
	}


	public List<DocumentNominalLabel> getDocumentNominalLabels() {
		return this.documentNominalLabels;
	}

	public void setDocumentNominalLabels(List<DocumentNominalLabel> documentNominalLabels) {
		this.documentNominalLabels = documentNominalLabels;
	}
	
	public boolean hasCrisis() {
		return Hibernate.isInitialized(this.crisis);
	}
	
	public boolean hasTaskAssignments() {
		return Hibernate.isInitialized(this.taskAssignments);
	}

	public boolean hasDocumentNominalLabels() {
		return Hibernate.isInitialized(this.documentNominalLabels);
	}
}