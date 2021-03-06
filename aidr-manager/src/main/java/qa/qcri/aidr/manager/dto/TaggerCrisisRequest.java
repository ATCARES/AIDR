package qa.qcri.aidr.manager.dto;

import java.util.ArrayList;
import java.util.List;

import qa.qcri.aidr.dbmanager.dto.CrisisDTO;
import qa.qcri.aidr.dbmanager.dto.ModelFamilyDTO;

public class TaggerCrisisRequest {

    private String code;

    private String name;

    private TaggerCrisisType crisisType;

    private TaggerUserRequest users;

    public TaggerCrisisRequest() {
    }

    public TaggerCrisisRequest(String code, String name, TaggerCrisisType crisisType, TaggerUserRequest users) {
        this.code = code;
        this.name = name;
        this.crisisType = crisisType;
        this.users = users;
    }
    
    public CrisisDTO toDTO() throws Exception {
		CrisisDTO dto = new CrisisDTO();

		dto.setCode(this.getCode());
		dto.setName(this.getName());
		dto.setIsTrashed(false);
		dto.setUsersDTO(this.getUsers() != null ? this.getUsers().toDTO() : null);
		dto.setCrisisTypeDTO(this.getCrisisType() != null ? this.getCrisisType().toDTO() : null);

		return dto;
	}
    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public TaggerCrisisType getCrisisType() {
        return crisisType;
    }

    public void setCrisisType(TaggerCrisisType crisisType) {
        this.crisisType = crisisType;
    }

    public TaggerUserRequest getUsers() {
        return users;
    }

    public void setUsers(TaggerUserRequest users) {
        this.users = users;
    }

}
