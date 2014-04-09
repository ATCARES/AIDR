Ext.define('TAGGUI.tagger-collection-details.controller.TaggerCollectionDetailsController', {
    extend: 'Ext.app.Controller',

    views: [
        'TaggerCollectionDetailsPanel'
    ],

    init: function () {

        this.control({

            'tagger-collection-details-view': {
                beforerender: this.beforeRenderView
            },

            "#crisisDelete": {
                click: function (btn, e, eOpts) {
                    this.crisisDelete();
                }
            },

            "#crisisSave": {
                click: function (btn, e, eOpts) {
                    this.crisisSave();
                }
            },

            "#goToCollector": {
                click: function (btn, e, eOpts) {
                    this.goToCollector();
                }
            },

            "#addNewClassifier": {
                click: function (btn, e, eOpts) {
                    this.addNewClassifier();
                }
            },

            '#gridTrigger' : {
                keyup : this.onTriggerKeyUp,
                triggerClear : this.onTriggerClear
            },
            
            "#generateCSVLink": {
                click: function (btn, e, eOpts) {
                    this.generateCSVLinkButtonHandler(btn);
                }
            },

            "#generateTweetIdsLink": {
                click: function (btn, e, eOpts) {
                    this.generateTweetIdsLinkButtonHandler(btn);
                }
            } ,

            "#pybossaClassifierFilters":{
                change: function(field, newValue, oldValue, eOpts) {
                    var me = this;
                    var attID = me.mainComponent.classifierComboForPybossaApp.getValue();
                    me.mainComponent.uiWelcomeSaveButton.show();
                    me.mainComponent.uiTutorialOneSaveButton.show();
                    uiTutorialOneSaveButton.uiTutorialTwoSaveButton.show();
                    me.getUITemplateWithAttributeID(attID);
                }
            },

            "#templateSave":{
                click: function (btn, e, eOpts) {
                    this.templateUISave();
                }
            },
            "#uiTypeFilters":{
                change: function(field, newValue, oldValue, eOpts) {
                    var me = this;
                     //type == '1' || type == '2' || type == '6'
                    if(field.value == '' || field.value == '1' || field.value == '2' || field.value == '6'){
                        me.mainComponent.classifierCombo.hide();
                    }
                    else{
                        me.mainComponent.classifierCombo.show();
                    }

                    if(field.value == ''){
                        me.mainComponent.templateSaveButton.hide();
                    }
                    else{
                        var attID = me.mainComponent.classifierCombo.getValue();
                        if(attID == ''){
                            me.mainComponent.templateSaveButton.hide();
                        }
                        else{
                            me.mainComponent.templateSaveButton.show();
                        }
                    }

                    if(field.value == '1'){
                        this.getUITemplate();
                    }
                    else{
                        var attID = me.mainComponent.classifierCombo.getValue();
                        if(field.value != '' && field.value != '1' && attID !=''){
                            this.getUITemplate();
                        }
                        else{
                            me.mainComponent.uiTemplate.setValue('', false);
                            me.mainComponent.classifierCombo.refresh();
                        }
                    }
                }
            },
            "#classifierFilters":{
                change: function(field, newValue, oldValue, eOpts) {
                    var me = this;
                    me.mainComponent.templateSaveButton.show();

                    if(field.value != ''){
                        this.getUITemplate();
                    }
                    else{
                        me.mainComponent.uiTemplate.setValue('', false);
                    }
                }
            },
            "#uiSkinTypeSave":{
                click: function (btn, e, eOpts) {
                    this.templateSkinTypeSave();
                }
            },
            "#landingTopSave":{
                click: function (btn, e, eOpts) {
                    var me = this;
                    var attID = 0;
                    var type = 1;
                    var templateContent = me.mainComponent.uiLandingTemplateOne.getValue();
                    this.templateUIUpdateSave(0, 1, templateContent, 'Saving landing page 1 ...');
                }
            },
            "#landingBtnSave":{
                click: function (btn, e, eOpts) {
                    var me = this;
                    var attID = 0;
                    var type = 2;
                    var templateContent = me.mainComponent.uiLandingTemplateTwo.getValue();
                    this.templateUIUpdateSave(0, type, templateContent, 'Saving landing page 2 ...');
                }
            },
            "#curatorSave":{
                click: function (btn, e, eOpts) {
                    var me = this;
                    var attID = 0;
                    var type = 6;
                    var templateContent = me.mainComponent.curatorInfo.getValue();
                    this.templateUIUpdateSave(0, type, templateContent, 'Saving Curator information ...');
                }
                //curatorInfo
            },
            "#uiWelcomeSave":{
                click: function (btn, e, eOpts) {
                    var me = this;
                    var attID = me.mainComponent.classifierComboForPybossaApp.getValue();
                    var type = 3;
                    var templateContent = me.mainComponent.welcomePageUI.getValue();
                    this.templateUIUpdateSave(attID, type, templateContent, 'Saving MicroMappers welcome page ...');
                }
            },
            "#uiTutorialOneSave":{
                click: function (btn, e, eOpts) {
                    var me = this;
                    var attID = me.mainComponent.classifierComboForPybossaApp.getValue();
                    var type = 4;
                    var templateContent = me.mainComponent.tutorial1UI.getValue();
                    this.templateUIUpdateSave(attID, type, templateContent, 'Saving Tutorial Page 1 ...');
                }
            },
            "#uiTutorialTwoSave":{
                click: function (btn, e, eOpts) {
                    var me = this;
                    var attID = me.mainComponent.classifierComboForPybossaApp.getValue();
                    var type = 5;
                    var templateContent = me.mainComponent.tutorial2UI.getValue();
                    this.templateUIUpdateSave(attID, type, templateContent, 'Saving Tutorial Page 2 ...');
                }
            }

        });

    },

    updateUITemplateDisplayComponent: function(sVar){
        var me = this;
        me.mainComponent.uiTemplate.setValue(sVar, false);
        me.mainComponent.uiTemplate.setReadOnly(true);
        me.mainComponent.templateSaveButton.setText('Edit',false);
    },

    beforeRenderView: function (component, eOpts) {
        AIDRFMFunctions.initMessageContainer();

        this.mainComponent = component;
        taggerCollectionDetailsController = this;
        this.getTemplateStatus();

        this.loadUITemplate();

//        this.generateCSVLink();
//        this.generateTweetIdsLink();
        this.loadLatestTweets();


        var me = this;
    },

    crisisDelete: function () {
        Ext.MessageBox.confirm('Confirm Crisis Delete', 'Do you want to delete <b>"' + CRISIS_NAME + '"</b>?',
            function (buttonId) {
            if (buttonId === 'yes') {
                AIDRFMFunctions.setAlert("Ok", 'Will be implemented later');
            }
        });
    },

    crisisSave: function () {
        var me = this;

        var crisisTypeId = me.mainComponent.crysisTypesCombo.getValue();
        var crisisTypeName = me.mainComponent.crisisTypesStore.findRecord("crisisTypeID", crisisTypeId).data.name;

        Ext.Ajax.request({
            url: BASE_URL + '/protected/tagger/updateCrisis.action',
            method: 'POST',
            params: {
                crisisID: CRISIS_ID,
                crisisTypeID: crisisTypeId,
                crisisTypeName: Ext.String.trim( crisisTypeName )
            },
            headers: {
                'Accept': 'application/json'
            },
            success: function (resp) {
                var response = Ext.decode(resp.responseText);
                if (response.success) {
                    me.mainComponent.saveButton.hide();
                    CRISIS_TYPE_ID = crisisTypeId;
                } else {
                    AIDRFMFunctions.setAlert("Error", 'Error while saving crisis.');
                }
            }
        });
    },


    templateUISave:function(){
        var me = this;

        var btnText = me.mainComponent.templateSaveButton.text;

        if(btnText == 'Edit'){
            me.mainComponent.uiTemplate.setReadOnly(false);
            me.mainComponent.templateSaveButton.setText('Save',false);
        }
        else{
            var templateContent = me.mainComponent.uiTemplate.getValue();
            var attID = me.mainComponent.classifierCombo.getValue();
            var noCustomizationRequired = false;
            var status = true;


            if(!noCustomizationRequired) {
                var mask = AIDRFMFunctions.getMask(true, 'Saving data ...');
                mask.show();
                Ext.Ajax.request({
                    url: BASE_URL + '/protected/uitemplate/updateTemplate.action',
                    method: 'POST',
                    params: {
                        crisisID: CRISIS_ID,
                        nominalAttributeID: attID,
                        templateType: type,
                        templateValue: Ext.String.trim( templateContent ),
                        isActive: status
                    },
                    headers: {
                        'Accept': 'application/json'
                    },
                    success: function (resp) {
                        var response = Ext.decode(resp.responseText);
                        if (response.success) {
                            me.mainComponent.uiTemplate.setReadOnly(true);
                            me.mainComponent.templateSaveButton.setText('Edit',false);
                        } else {
                            AIDRFMFunctions.setAlert("Error", 'Error while updating templateSave.');
                        }
                        mask.hide();
                    }
                    ,
                    failure: function () {
                        mask.hide();
                    }
                });
            }

        }

    },

    templateSkinTypeSave:function(){
        var me = this;
         //me.mainComponent.optionRG.items.items[
        var mask = AIDRFMFunctions.getMask(true, 'Saving custom UI skin type ...');
        mask.show();
        var value = me.mainComponent.optionRG.getChecked();
        Ext.Ajax.request({
            url: BASE_URL + '/protected/uitemplate/updateTemplate.action',
            method: 'POST',
            params: {
                crisisID: CRISIS_ID,
                nominalAttributeID: 0,
                templateType: 7,
                templateValue: value[0].inputValue,
                isActive: true
            },
            headers: {
                'Accept': 'application/json'
            },
            success: function (resp) {
                var response = Ext.decode(resp.responseText);
                if (response.success) {

                } else {
                    AIDRFMFunctions.setAlert("Error", 'Error while updating templateSave.');
                }
                mask.hide();
            },
            failure: function () {
                mask.hide();
            }
        });


    },

    templateUIUpdateSave:function(attID, type, templateContent, mask){
        var me = this;
        var status = true;

        Ext.Ajax.request({
            url: BASE_URL + '/protected/uitemplate/updateTemplate.action',
            method: 'POST',
            params: {
                crisisID: CRISIS_ID,
                nominalAttributeID: attID,
                templateType: type,
                templateValue: Ext.String.trim( templateContent ),
                isActive: status
            },
            headers: {
                'Accept': 'application/json'
            },
            success: function (resp) {
                var response = Ext.decode(resp.responseText);
                if (response.success) {
                    me.mainComponent.uiTemplate.setReadOnly(true);
                    me.mainComponent.templateSaveButton.setText('Edit',false);
                } else {
                    AIDRFMFunctions.setAlert("Error", 'Error while updating templateSave.');
                }
                //mask.hide();
                AIDRFMFunctions.setAlert("Confirmation", mask);


            },
            failure: function () {
               // mask.hide();
                mask = " Requst failed : " + mask ;
                AIDRFMFunctions.setAlert("Error", mask);
            }
        });

    },


    goToCollector: function() {
        document.location.href = BASE_URL + '/protected/' + CRISIS_CODE +'/collection-details';
    },

    addNewClassifier: function() {
        document.location.href = BASE_URL + "/protected/" + CRISIS_CODE + '/predict-new-attribute';
    },

    getTemplateStatus: function() {
        var me = this;

        Ext.Ajax.request({
            url: BASE_URL + '/protected/tagger/getTemplateStatus.action',
            method: 'GET',
            params: {
                code: CRISIS_CODE
            },
            headers: {
                'Accept': 'application/json'
            },
            success: function (response) {
                var resp = Ext.decode(response.responseText);
                if (resp.success && resp.data) {
                    try {
                        var data = Ext.JSON.decode(resp.data);
                        if (data && data.status) {
                            if (data.status == 'ready') {
                                var title =  "Help us classifying tweets related to " + CRISIS_NAME;
                                var twitterURL = "https://twitter.com/intent/tweet?text="+title+"&url=" + data.url;
                                var facebookURL= "https://www.facebook.com/sharer/sharer.php?t="+title+"&u=" + data.url;
                                var googlePlusURL= "https://plus.google.com/share?url="+data.url;
                                var pinterestURL= "http://www.pinterest.com/pin/create/button/?media=IMAGEURL&description="+title+"&url=" + data.url;
                                me.mainComponent.pyBossaLink.setText('<div class="gray-backgrpund"><a href="' + data.url + '"><i>' + data.url + '</i></a></div>', false);
                                me.mainComponent.twitterLink.setText('<a href="'+ twitterURL +'"><image src="/AIDRFetchManager/resources/img/icons/twitter-icon.png" /></a>', false);
                                me.mainComponent.facebookLink.setText('<a href="'+ facebookURL +'"><image src="/AIDRFetchManager/resources/img/icons/facebook-icon.png" /></a>', false);
                                me.mainComponent.googlePlusLink.setText('<a href="'+ googlePlusURL +'"><image src="/AIDRFetchManager/resources/img/icons/google-icon.png" /></a>', false);
                                me.mainComponent.pinterestLink.setText('<a href="'+ pinterestURL +'"><image src="/AIDRFetchManager/resources/img/icons/pinterest-icon.png" /></a>', false);

                            } else if (data.status == 'not_ready') {
                                me.mainComponent.pyBossaLink.setText('<div class="gray-backgrpund"><i>' + data.message + '</i></div>', false);
                            }
                        }
                    } catch (e) {
                        me.mainComponent.pyBossaLink.setText('<div class="gray-backgrpund"><i>Initializing crowdsourcing task. Please come back in a few minutes.</i></div>', false);
                    }
                } else {
                    me.mainComponent.pyBossaLink.setText('<div class="gray-backgrpund"><i>Initializing crowdsourcing task. Please come back in a few minutes.</i></div>', false);
                }
            },
            failure: function () {
                me.mainComponent.pyBossaLink.setText('<div class="gray-backgrpund"><i>Initializing crowdsourcing task. Please come back in a few minutes.</i></div>', false);
            }
        });
    },

    ////////////////////////////////////////////

    getUITemplateDefaultText: function(){
        var me = this;
        var sText = '';
        var processNextStep = true;
        if(attID == null){
            processNextStep = false;
        }
        if(templateType == 1){
            var iMax = me.mainComponent.crisisModelsStore.data.items.length -1;
            for(var i=0; i < me.mainComponent.crisisModelsStore.data.items.length; i++){
                var temp = me.mainComponent.crisisModelsStore.data.items[i].data.attribute;
                if(i == 0){
                    sText = sText + temp;
                }
                else{
                    if(iMax == i && iMax !=0){
                        sText = sText +', and '+ temp;
                    }
                    else{
                        sText = sText +', '+ temp;
                    }
                }
            }
            if(sText !=''){
                sText = '<p>Hi!  Thanks a lot for helping us tag tweets on '+CRISIS_NAME+'. We need to identify which tweets refer to ' + sText + ' to gain a better understanding of this situation. Simply click on "Start Here" to start tagging.<br/>Thank you for volunteering your time as a Digital Humanitarian!</p>' ;
                me.updateUITemplateDisplayComponent(sText) ;
            }
        }
        if(templateType == 2){
            sText = 'For any questions, please see <a href="http://aidr.qcri.org/">AIDR - Artificial Intelligence for Disaster Response</a>';
            me.updateUITemplateDisplayComponent(sText) ;
        }

        if(templateType == 5 && processNextStep){
            for(var i=0; i < me.mainComponent.crisisModelsStore.data.items.length; i++){
                var tempName = me.mainComponent.crisisModelsStore.data.items[i].data.attribute;
                var tempID = me.mainComponent.crisisModelsStore.data.items[i].data.attributeID;
                if(tempID == attID){
                    var labelList='';
                    Ext.Ajax.request({
                        url: BASE_URL + '/protected/uitemplate/getCrisisChildren.action',
                        method: 'GET',
                        params: {
                            id: CRISIS_ID
                        },
                        headers: {
                            'Accept': 'application/json'
                        },
                        success: function (response) {
                            var resp = Ext.decode(response.responseText);
                            if (resp.success && resp.data) {
                                try {
                                    var data = Ext.JSON.decode(resp.data);
                                    var nominalEle = data.nominalAttributeJsonModelSet;

                                    var sVar = '';
                                    for(var i=0; i < nominalEle.length; i++){
                                        if(nominalEle[i].nominalAttributeID == attID){
                                            var nominalLabelSet = nominalEle[i].nominalLabelJsonModelSet;
                                            for(var j=0; j < nominalLabelSet.length; j++){
                                                sVar = sVar + nominalLabelSet[i].name + ': ' + nominalLabelSet[i].description + '<br/>';
                                            }
                                        }
                                    }
                                    console.log('svar: ' + sText);
                                    if(sVar!=''){
                                        sText = 'Being a Digital Humanitarian is as easy and fast as a click of the mouse. If you want to keep track of your progress and points, make sure to login! This Clicker will simply load a tweet and ask you to click on the category that best describes the tweet<br/><br/>';
                                        sText = sText + sVar;
                                        sText = sText + 'Note that these tweets come directly from twitter and may on rare occasions include disturbing content. Only start clicking if you understand this and still wish to volunteer.<br/>';
                                        sText = sText + 'Thank you!'
                                        me.updateUITemplateDisplayComponent(sText) ;
                                    }

                                } catch (e) {
                                    console.log("resp:" + resp);
                                }
                            } else {

                            }
                        }

                    });
                }
            }
        }
    } ,
    getUIDefaultTextWithAttribute: function(typeSet, attID){
        var me = this;
        var sText = '';
        var processNextStep = true;
        if(typeSet.length > 0){
            Ext.Ajax.request({
                url: BASE_URL + '/protected/uitemplate/getCrisisChildren.action',
                method: 'GET',
                params: {
                    id: CRISIS_ID
                },
                headers: {
                    'Accept': 'application/json'
                },
                success: function (response) {
                    var resp = Ext.decode(response.responseText);
                    if (resp.success && resp.data) {
                        try {
                            var data = Ext.JSON.decode(resp.data);
                            var nominalEle = data.nominalAttributeJsonModelSet;

                            var sTutorial = '';
                            var sDesc = '';
                            for(var i=0; i < nominalEle.length; i++){
                                if(nominalEle[i].nominalAttributeID == attID){
                                    sDesc = nominalEle[i].description;
                                    var sAttName = nominalEle[i].name;
                                    var nominalLabelSet = nominalEle[i].nominalLabelJsonModelSet;

                                    for(var j=0; j < nominalLabelSet.length; j++){
                                        sTutorial = sTutorial + nominalLabelSet[j].name + ': ' + nominalLabelSet[j].description + '<br/>';
                                    }
                                }
                            }

                            if(sDesc !='' &&  (typeSet.indexOf(3) > -1)){
                                me.mainComponent.welcomePageUI.setValue(sDesc, false);
                            }

                            if(sAttName !=''  &&  (typeSet.indexOf(4) > -1)){
                                var sText = CRISIS_NAME+ ': '+sAttName+' Tutorial<br/><br/>Hi! Many thanks for volunteering your time as a Digital Humanitarian, in order to learn more about '+CRISIS_NAME+'. Critical information is often shared on Twitter in real time, which is where you come in.';
                                me.mainComponent.tutorial1UI.setValue(sText, false);
                            }

                            if(sTutorial!='' && (typeSet.indexOf(5) > -1)){
                                var tutorialPartOne = 'Being a Digital Humanitarian is as easy and fast as a click of the mouse. If you want to keep track of your progress and points, make sure to login! This Clicker will simply load a tweet and ask you to click on the category that best describes the tweet<br/><br/>';
                                tutorialPartOne = tutorialPartOne + sTutorial;
                                tutorialPartOne = tutorialPartOne + 'Note that these tweets come directly from twitter and may on rare occasions include disturbing content. Only start clicking if you understand this and still wish to volunteer.<br/>';
                                tutorialPartOne = tutorialPartOne + 'Thank you!'
                                me.mainComponent.tutorial2UI.setValue(tutorialPartOne, false);
                            }


                        } catch (e) {
                            console.log("resp:" + resp);
                        }
                    } else {

                    }
                }

            });
        }
    },
    loadUITemplateDisplayDefaultComponent: function(templateType){
        var me = this;
        var sText = '';

        if(templateType == 1){
            Ext.Ajax.request({
                url: BASE_URL + '/protected/uitemplate/getCrisisChildren.action',
                method: 'GET',
                params: {
                    id: CRISIS_ID
                },
                headers: {
                    'Accept': 'application/json'
                },
                success: function (response) {
                    var resp = Ext.decode(response.responseText);
                    if (resp.success && resp.data) {
                        try {
                            var data = Ext.JSON.decode(resp.data);
                            var nominalEle = data.nominalAttributeJsonModelSet;

                            var sText = '';
                            var iMax = nominalEle.length -1;
                            for(var i=0; i < nominalEle.length; i++){
                                var temp = nominalEle.name;
                                if(i == 0){
                                    sText = sText + temp;
                                }
                                else{
                                    if(iMax == i && iMax !=0){
                                        sText = sText +', and '+ temp;
                                    }
                                    else{
                                        sText = sText +', '+ temp;
                                    }
                                }
                            }
                            if(sText !=''){
                                sText = '<p>Hi!  Thanks a lot for helping us tag tweets on '+CRISIS_NAME+'. We need to identify which tweets refer to ' + sText + ' to gain a better understanding of this situation. Simply click on "Start Here" to start tagging.<br/>Thank you for volunteering your time as a Digital Humanitarian!</p>' ;
                                me.mainComponent.uiLandingTemplateOne.setValue(sText, false);
                            }

                        } catch (e) {
                            console.log("resp:" + resp);
                        }
                    } else {

                    }
                }

            });
        }

        if(templateType == 2){
            sText = 'For any questions, please see <a href="http://aidr.qcri.org/">AIDR - Artificial Intelligence for Disaster Response</a>';
            me.mainComponent.uiLandingTemplateTwo.setValue(sText, false);
        }

    },
    loadUITemplate: function() {
        var me = this;
        Ext.Ajax.request({
            url: BASE_URL + '/protected/uitemplate/getTemplate.action',
            method: 'GET',
            params: {
                crisisID: CRISIS_ID
            },
            headers: {
                'Accept': 'application/json'
            },
            success: function (response) {
                var resp = Ext.decode(response.responseText);
                if (resp.success && resp.data) {
                    try {
                        var data = Ext.JSON.decode(resp.data);

                        if(data.length == 0){
                            me.loadUITemplateDisplayDefaultComponent(1) ;
                            me.loadUITemplateDisplayDefaultComponent(2);
                            me.loadUITemplateDisplayDefaultComponent(7) ;
                        }
                        else{
                            var typeOneFound = false;
                            var typeTwoFound = false;
                            var typeSevenFound = false;
                            for(var i=0; i < data.length; i++){
                                if(data[i].templateType == 1){
                                    typeOneFound = true;
                                    me.mainComponent.uiLandingTemplateOne.setValue(data[i].templateValue, false);
                                }
                                if(data[i].templateType == 2){
                                    typeTwoFound = true;
                                    me.mainComponent.uiLandingTemplateTwo.setValue(data[i].templateValue, false);
                                }
                                if(data[i].templateType == 7){
                                    var sVar = data[i].templateValue;
                                    if(me.mainComponent.optionRG.items.items[0].inputValue == sVar){
                                        me.mainComponent.optionRG.items.items[0].setValue(true);

                                    }
                                    if(me.mainComponent.optionRG.items.items[1].inputValue == sVar){
                                        me.mainComponent.optionRG.items.items[1].setValue(true);

                                    }
                                }
                                if(data[i].templateType == 6){
                                    typeSevenFound = true;
                                    me.mainComponent.curatorInfo.setValue(data[i].templateValue, false);
                                }
                            }
                            if(!typeOneFound){me.loadUITemplateDisplayDefaultComponent(1)}
                            if(!typeTwoFound){me.loadUITemplateDisplayDefaultComponent(2)}
                            if(!typeSevenFound){me.loadUITemplateDisplayDefaultComponent(6)}
                        }
                    } catch (e) {
                        console.log("resp:" + resp);
                        //me.mainComponent.pyBossaLink.setText('<div class="gray-backgrpund"><i>Initializing crowdsourcing task. Please come back in a few minutes.</i></div>', false);
                    }
                } else {

                    //me.mainComponent.pyBossaLink.setText('<div class="gray-backgrpund"><i>Initializing crowdsourcing task. Please come back in a few minutes.</i></div>', false);
                }
            },
            failure: function () {

            }
        });
    },

    renderUpdatedUITemplateDisplayComponent: function(templateType, sText){
        var me = this;
        if(templateType == 1){
                me.mainComponent.uiLandingTemplateOne.setValue(sText, false);
        }
        if(templateType == 2){
            me.mainComponent.uiLandingTemplateTwo.setValue(sText, false);
        }
        if(templateType == 7){
            if(me.mainComponent.optionRG.items.items[0].inputValue == sVar){
                me.mainComponent.optionRG.items.items[0].setValue(true);

            }
            if(me.mainComponent.optionRG.items.items[1].inputValue == sVar){
                me.mainComponent.optionRG.items.items[1].setValue(true);

            }
        }
        if(templateType == 6){
            me.mainComponent.curatorInfo.setValue(sText, false);
        }
        if(templateType == 3){
            me.mainComponent.welcomePageUI.setValue(sText, false);
        }
        if(templateType == 4){
            me.mainComponent.tutorial1UI.setValue(sText, false);
        }
        if(templateType == 5){
            me.mainComponent.tutorial2UI.setValue(sText, false);
        }
    },

    getUITemplateWithAttributeID: function(attID) {

        var me = this;

        Ext.Ajax.request({
            url: BASE_URL + '/protected/uitemplate/getTemplate.action',
            method: 'GET',
            params: {
                crisisID: CRISIS_ID
            },
            headers: {
                'Accept': 'application/json'
            },
            success: function (response) {
                var resp = Ext.decode(response.responseText);
                if (resp.success && resp.data) {
                    try {
                        var data = Ext.JSON.decode(resp.data);
                        var sVar = '';
                        var typeThreeFound = false;
                        var typeFourFound = false;
                        var typeFiveFound = false;
                        for(var i=0; i < data.length; i++){
                            var type =  data[i].templateType;
                            if(type == 3 ){
                                if(data[i].nominalAttributeID == attID){
                                    typeThreeFound = true;
                                    sVar = data[i].templateValue;
                                    me.renderUpdatedUITemplateDisplayComponent(type, sVar);
                                }
                            }
                            if(type == 4 ){
                                if(data[i].nominalAttributeID == attID){
                                    typeFourFound = true ;
                                    sVar = data[i].templateValue;
                                    me.renderUpdatedUITemplateDisplayComponent(type, sVar);
                                }
                            }
                            if(type == 5){
                                if(data[i].nominalAttributeID == attID){
                                    typeFiveFound = true ;
                                    sVar = data[i].templateValue;
                                    me.renderUpdatedUITemplateDisplayComponent(type, sVar);
                                }
                            }
                        }

                        var searchTemplateID = new Array();

                        if(!typeThreeFound){
                            searchTemplateID[0] = 3;
                        }
                        if(!typeFourFound){
                            searchTemplateID[1] = 4;
                        }
                        if(!typeFiveFound){
                            searchTemplateID[2] = 5;
                        }
                        me.getUIDefaultTextWithAttribute(searchTemplateID, attID);


                    } catch (e) {
                        console.log("resp:" + resp);
                    }
                }
                else {}
            },
            failure: function () {

            }
        });
    },

    getUITemplate: function(type, attID) {

        var me = this;

        Ext.Ajax.request({
            url: BASE_URL + '/protected/uitemplate/getTemplate.action',
            method: 'GET',
            params: {
                crisisID: CRISIS_ID
            },
            headers: {
                'Accept': 'application/json'
            },
            success: function (response) {
                var resp = Ext.decode(response.responseText);
                if (resp.success && resp.data) {
                    try {
                        var data = Ext.JSON.decode(resp.data);
                        var sVar = '';
                        for(var i=0; i < data.length; i++){

                            if(data[i].templateType == type){
                                if(type == 1 || type == 2 || type == 6 || type == 7){
                                    sVar = data[i].templateValue;
                                    me.renderUpdatedUITemplateDisplayComponent(type, sVar);
                                }
                                else{
                                    if(data[i].nominalAttributeID == attID){
                                        sVar = data[i].templateValue;
                                        me.renderUpdatedUITemplateDisplayComponent(type, sVar);
                                    }
                                }
                            }
                        }
                        if(sVar == '' ){
                            me.getUILandingPageDefaultText(type, attID);
                        }
                        else{
                            me.renderUpdatedUITemplateDisplayComponent(attID, sVar);
                        }

                    } catch (e) {
                        console.log("resp:" + resp);
                    }
                }
                else {}
            },
            failure: function () {

            }
        });
    },
    ///////////////////////////////////////////////

    getUISkinTemplate: function() {
        var me = this;
        me.mainComponent.optionRG.items.items[0].setValue(true);
        me.mainComponent.uiSkinTypeSaveButton.show();
        Ext.Ajax.request({
            url: BASE_URL + '/protected/uitemplate/getTemplate.action',
            method: 'GET',
            params: {
                crisisID: CRISIS_ID
            },
            headers: {
                'Accept': 'application/json'
            },
            success: function (response) {
                var resp = Ext.decode(response.responseText);
                if (resp.success && resp.data) {
                    try {
                        var data = Ext.JSON.decode(resp.data);
                        var attID = me.mainComponent.classifierComboForSkinType.getValue();
                        var sVar = '';
                        for(var i=0; i < data.length; i++){

                            if(data[i].templateType == 5 && data[i].nominalAttributeID == attID){
                                sVar = data[i].templateValue;
                                if(me.mainComponent.optionRG.items.items[0].inputValue == sVar){
                                    me.mainComponent.optionRG.items.items[0].setValue(true);

                                }
                                if(me.mainComponent.optionRG.items.items[1].inputValue == sVar){
                                    me.mainComponent.optionRG.items.items[1].setValue(true);

                                }
                            }
                        }

                    } catch (e) {
                        console.log("resp:" + resp);
                        //me.mainComponent.pyBossaLink.setText('<div class="gray-backgrpund"><i>Initializing crowdsourcing task. Please come back in a few minutes.</i></div>', false);
                    }
                } else {

                    //me.mainComponent.pyBossaLink.setText('<div class="gray-backgrpund"><i>Initializing crowdsourcing task. Please come back in a few minutes.</i></div>', false);
                }
            },
            failure: function () {

            }
        });
    },
    generateCSVLink: function() {
        var me = this;
        me.mainComponent.CSVLink.setText('<div class="loading-block"></div>', false);

        Ext.Ajax.request({
            url: BASE_URL + '/protected/tagger/taggerGenerateCSVLink.action',
            method: 'GET',
            params: {
                code: CRISIS_CODE
            },
            headers: {
                'Accept': 'application/json'
            },
            success: function (response) {
                var resp = Ext.decode(response.responseText);
                if (resp.success) {
                    if (resp.data && resp.data != '') {
                        me.mainComponent.CSVLink.setText('<div class="styled-text download-link">&#8226;&nbsp;<a href="' + resp.data + '">Download latest 100,000 tweets</a></div>', false);
                    } else {
                        me.mainComponent.CSVLink.setText('<div class="styled-text download-link">&#8226;&nbsp;Download latest 100,000 tweets - Not yet available for this crisis.</div>', false);
                    }
                } else {
                    me.mainComponent.CSVLink.setText('', false);
                    AIDRFMFunctions.setAlert("Error", resp.message);
                }
            }
        });
    },

    generateTweetIdsLink: function() {
        var me = this;
        me.mainComponent.tweetsIdsLink.setText('<div class="loading-block"></div>', false);

        Ext.Ajax.request({
            url: BASE_URL + '/protected/tagger/taggerGenerateTweetIdsLink.action',
            method: 'GET',
            params: {
                code: CRISIS_CODE
            },
            headers: {
                'Accept': 'application/json'
            },
            success: function (response) {
                var resp = Ext.decode(response.responseText);
                if (resp.success) {
                    if (resp.data && resp.data != '') {
                        me.mainComponent.tweetsIdsLink.setText('<div class="styled-text download-link">&#8226;&nbsp;<a href="' + resp.data + '">Download all tweets (tweet-ids only)</a></div>', false);
                    } else {
                        me.mainComponent.tweetsIdsLink.setText('<div class="styled-text download-link">&#8226;&nbsp;Download all tweets (tweet-ids only) - Not yet available for this crisis.</div>', false);
                    }
                } else {
                    me.mainComponent.tweetsIdsLink.setText('', false);
                    AIDRFMFunctions.setAlert("Error", resp.message);
                }
            }
        });
    },

    loadLatestTweets: function () {
        var me = this;

        Ext.Ajax.request({
            url: BASE_URL + '/protected/tagger/loadLatestTweets.action',
            method: 'GET',
            params: {
                code: CRISIS_CODE
//                code: "2014-02-uk_floods"
            },
            headers: {
                'Accept': 'application/json'
            },
            success: function (response) {
                var jsonData = Ext.decode(response.responseText);
                var tweetData = Ext.JSON.decode(jsonData.data);

                var data = me.transformTweetData(tweetData);
                fetchData = data;
                fetchTmpData = Ext.clone(data);

                me.mainComponent.taggerFetchStore.setProxy({
                    type: 'pagingmemory',
                    data: fetchTmpData,
                    reader: {
                        type: 'json',
                        totalProperty: 'totalCount',
                        root: 'data',
                        successProperty: 'success'
                    }
                });
                me.mainComponent.taggerFetchStore.load();
            }
        });
    },

    transformTweetData: function(tweetData) {
        var result = {};
        var data = [];
        Ext.Array.each(tweetData, function(r, index) {
            if (r.text && r.nominal_labels) {
                var row = {};
                row.text = r.text ? r.text : '';
                row.attribute_name = r.nominal_labels[0].attribute_name ? r.nominal_labels[0].attribute_name : '';
                row.label_name = r.nominal_labels[0].label_name ? r.nominal_labels[0].label_name : '';
                row.confidence = r.nominal_labels[0].confidence ? (r.nominal_labels[0].confidence) + '%' : '0%';
                data.push(row);
            }
        });
        result.data = data;
        result.totalCount = data.length;
        result.success = true;
        return result;
    },

    onTriggerKeyUp : function(t) {
        var me = this;

        var thisRegEx = new RegExp(t.getValue(), "i");
        var grid = me.mainComponent.taggerFetchGrid;
        var records = [];
        Ext.each(fetchData.data, function (record) {
            if (thisRegEx.test(record[grid.columns[0].dataIndex])) {
                if (!grid.filterHidden && grid.columns[0].isHidden()) {
                } else {
                    records.push(record);
                }
            }
        });
        fetchTmpData.data = records;
        fetchTmpData.totalCount = records.length;
        me.mainComponent.taggerFetchStore.load();
    },

    onTriggerClear : function() {
        var me = this;

        fetchTmpData.data = fetchData.data;
        fetchTmpData.totalCount = fetchData.totalCount;
        me.mainComponent.taggerFetchStore.load();
    },

    generateCSVLinkButtonHandler: function(btn) {
        var me = this;
        btn.setDisabled(true);
        me.mainComponent.CSVLink.setText('<div class="loading-block"></div>', false);

        Ext.Ajax.request({
            url: BASE_URL + '/protected/collection/generateCSVLink.action',
            method: 'GET',
            params: {
                code: CRISIS_CODE
            },
            headers: {
                'Accept': 'application/json'
            },
            success: function (response) {
                btn.setDisabled(false);
                var resp = Ext.decode(response.responseText);
                if (resp.success) {
                    if (resp.data && resp.data != '') {
                        me.mainComponent.CSVLink.setText('<div class="styled-text download-link"><a href="' + resp.data + '">' + resp.data + '</a></div>', false);
                    } else {
                        me.mainComponent.CSVLink.setText('', false);
                        AIDRFMFunctions.setAlert("Error", "Generate CSV service returned empty url. For further inquiries please contact admin.");
                    }
                } else {
                    me.mainComponent.CSVLink.setText('', false);
                    AIDRFMFunctions.setAlert("Error", resp.message);
                }
            },
            failure: function () {
                btn.setDisabled(false);
            }
        });
    },

    generateTweetIdsLinkButtonHandler: function(btn) {
        var me = this;
        btn.setDisabled(true);
        me.mainComponent.tweetsIdsLink.setText('<div class="loading-block"></div>', false);

        Ext.Ajax.request({
            url: BASE_URL + '/protected/collection/generateTweetIdsLink.action',
            method: 'GET',
            params: {
                code: CRISIS_CODE
            },
            headers: {
                'Accept': 'application/json'
            },
            success: function (response) {
                btn.setDisabled(false);
                var resp = Ext.decode(response.responseText);
                if (resp.success) {
                    if (resp.data && resp.data != '') {
                        me.mainComponent.tweetsIdsLink.setText('<div class="styled-text download-link"><a href="' + resp.data + '">' + resp.data + '</a></div>', false);
                    } else {
                        me.mainComponent.tweetsIdsLink.setText('', false);
                        AIDRFMFunctions.setAlert("Error", "Generate Tweet Ids service returned empty url. For further inquiries please contact admin.");
                    }
                } else {
                    me.mainComponent.tweetsIdsLink.setText('', false);
                    AIDRFMFunctions.setAlert("Error", resp.message);
                }
            },
            failure: function () {
                btn.setDisabled(false);
            }
        });
    }
});