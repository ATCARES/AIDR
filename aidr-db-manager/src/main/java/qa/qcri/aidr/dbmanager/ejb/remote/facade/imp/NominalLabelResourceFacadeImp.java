package qa.qcri.aidr.dbmanager.ejb.remote.facade.imp;

import java.util.ArrayList;
import java.util.List;

import javax.ejb.Stateless;

import org.apache.log4j.Logger;
import org.hibernate.Hibernate;
import org.hibernate.criterion.Restrictions;

import qa.qcri.aidr.common.exception.PropertyNotSetException;
import qa.qcri.aidr.dbmanager.dto.NominalLabelDTO;
import qa.qcri.aidr.dbmanager.ejb.local.facade.impl.CoreDBServiceFacadeImp;
import qa.qcri.aidr.dbmanager.ejb.remote.facade.NominalLabelResourceFacade;
import qa.qcri.aidr.dbmanager.entities.model.NominalLabel;


/**
 * @author Koushik
 */

@Stateless(name="NominalLabelResourceFacadeImp")
public class NominalLabelResourceFacadeImp extends CoreDBServiceFacadeImp<NominalLabel, Long> implements NominalLabelResourceFacade {

	private Logger logger = Logger.getLogger("db-manager-log");

	protected NominalLabelResourceFacadeImp(){
		super(NominalLabel.class);
	}

	@Override
	public void saveNominalLabel(NominalLabelDTO nominalLabel) throws PropertyNotSetException {
		save(nominalLabel.toEntity());
	}

	@Override
	public NominalLabelDTO addNominalLabel(NominalLabelDTO nominalLabel) {
		try {
			NominalLabel nb = nominalLabel.toEntity();
			em.persist(nb);
			em.flush();
			em.refresh(nb);
			return new NominalLabelDTO(nb);
		} catch (Exception e) {
			e.printStackTrace();
			return null;
		}
	}

	@Override
	public NominalLabelDTO editNominalLabel(NominalLabelDTO nominalLabel) throws PropertyNotSetException {
		System.out.println("Received request for: " + nominalLabel.getNominalLabelId() + ":" + nominalLabel.getNominalLabelCode());
		try {
			NominalLabel label = nominalLabel.toEntity();
			NominalLabel oldLabel = getById(label.getNominalLabelId()); 
			if (oldLabel != null) {
				oldLabel = em.merge(label);
				return (oldLabel != null) ? new NominalLabelDTO(oldLabel) : null;
			} else {
				throw new RuntimeException("Not found");
			}
		} catch (Exception e) {
			System.out.println("Exception in merging/updating nominalLabel: " + nominalLabel.getNominalLabelId());
			e.printStackTrace();	
		}
		return null;
	}

	@Override
	public Integer deleteNominalLabel(NominalLabelDTO nominalLabel) throws PropertyNotSetException {
		if (nominalLabel != null) {
			em.remove(nominalLabel.toEntity());
			return 1;
		}
		return 0;
	}

	@Override
	public Integer deleteNominalLabelByID(Long nominalLabelID) {
		NominalLabel nb = this.getById(nominalLabelID);
		if (nb != null) {
			em.remove(nb);
			return 1;
		} 
		return 0;
	}

	@Override
	public NominalLabelDTO getNominalLabelByID(Long nominalLabelID) throws PropertyNotSetException {
		NominalLabel nb = this.getById(nominalLabelID);
		return nb != null ? new NominalLabelDTO(nb) : null;
	}

	@Override
	public NominalLabelDTO getNominalLabelWithAllFieldsByID(Long nominalLabelID) throws PropertyNotSetException {
		NominalLabel nb = this.getById(nominalLabelID);
		if (nb != null) {
			Hibernate.initialize(nb.getModelNominalLabels());
			Hibernate.initialize(nb.getNominalAttribute());
			Hibernate.initialize(nb.getNominalAttributeDependentLabels());
			Hibernate.initialize(nb.getDocumentNominalLabels());
			return new NominalLabelDTO(nb);
		} 
		return null;
	}

	@Override
	public NominalLabelDTO getNominalLabelByCode(String code) throws PropertyNotSetException {
		NominalLabel nb = this.getByCriteria(Restrictions.eq("nominalLabelCode", code));
		return nb != null ? new NominalLabelDTO(nb) : null;
	}

	@Override
	public NominalLabelDTO getNominalLabelWithAllFieldsByCode(String code) throws PropertyNotSetException {
		NominalLabel nb = this.getByCriteria(Restrictions.eq("nominalLabelCode", code));
		if (nb != null) {
			Hibernate.initialize(nb.getModelNominalLabels());
			Hibernate.initialize(nb.getNominalAttribute());
			Hibernate.initialize(nb.getNominalAttributeDependentLabels());
			Hibernate.initialize(nb.getDocumentNominalLabels());
			return new NominalLabelDTO(nb);
		} 
		return null;
	}

	@Override
	public List<NominalLabelDTO> getAllNominalLabels() throws PropertyNotSetException {
		List<NominalLabelDTO> dtoList = new ArrayList<NominalLabelDTO>();
		List<NominalLabel> list = this.getAll();
		if (list != null && !list.isEmpty()) {
			for (NominalLabel nb: list) {
				dtoList.add(new NominalLabelDTO(nb));
			}
		}
		return dtoList;
	}

	@Override
	public Boolean isNominalLabelExists(Long nominalLabelID) {
		NominalLabel nb = this.getById(nominalLabelID);
		return nb != null ? true : false;
	}

	@Override
	public Boolean isNominalLabelExists(String code) {
		NominalLabel nb = this.getByCriteria(Restrictions.eq("nominalLabelCode", code));
		return nb != null ? true : false;
	}
}
