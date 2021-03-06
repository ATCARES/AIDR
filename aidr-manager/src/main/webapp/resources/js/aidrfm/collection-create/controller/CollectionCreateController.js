Ext.define('AIDRFM.collection-create.controller.CollectionCreateController', {
    extend: 'Ext.app.Controller',

    views: [
        'CollectionCreatePanel'
    ],

    init: function () {
        this.control({

            'collection-create': {
                afterrender: this.afterRenderCollectionCreateView
            },

            "#collectionNameInfo": {
                render: function (infoPanel, eOpts) {
                    var tip = Ext.create('Ext.tip.ToolTip', {
                        trackMouse: true,
                        html: 'Give a name to your collection. For example, Hurricane Sandy, Earthquake Japan.',
                        target: infoPanel.el,
                        dismissDelay: 0
                    });
                }
            },


            "#collectionkeywordsInfo": {
                render: function (infoPanel, eOpts) {
                    var tip = Ext.create('Ext.tip.ToolTip', {
                        trackMouse: true,
                        html: 'This field represents comma separated keywords to filter the Twitter stream.<br>' +
                            'General rules:<br>' +
                            '- Not case-sensitive ("bridge" matches "Bridge").<br>' +
                            '- Whole words match ("bridge" does not match "damagedbridge").<br><br>' +
                            'Multi-word queries:<br>' +
                            '- If you include two or more words on a query, all of them must be present in the tweet ("Brooklyn bridge" does not match a tweet that does not contain "Brooklyn" or does not contain "bridge")<br>' +
                            '- The words does not need to be consecutive or in that order ("Brooklyn bridge" will match "the bridge to Brooklyn")<br><br>' +
                            'Queries with or without hashtags:<br>' +
                            '- If you don\'t include \'#\', you also match hashtags ("bridge" matches "#bridge")<br>' +
                            '- If you do include \'#\', you only match hashtags ("#bridge" does not match "bridge")<br>',
                        target: infoPanel.el,
                        dismissDelay: 0
                    });
                }
            },

            "#collectionGeoInfo": {
                render: function (infoPanel, eOpts) {
                    var tip = Ext.create('Ext.tip.ToolTip', {
                        trackMouse: true,
                        html: 'This field represents a comma-separated pairs of longitude and latitude. A valid geo location represents a bounding box with southwest corner of the box coming first. Note that if you specify a geographical region, all messages posted from within that region will be collected, independently of whether they contain the keywords or not.',
                        target: infoPanel.el,
                        dismissDelay: 0
                    });
                }
            },

            "#collectionFollowInfo": {
                render: function (infoPanel, eOpts) {
                    var tip = Ext.create('Ext.tip.ToolTip', {
                        trackMouse: true,
                        html: "Follow represents a comma-separated list of twitter users IDs to be followed. A valid twitter user id must be in the numeric format.",
                        target: infoPanel.el,
                        dismissDelay: 0
                    });
                }
            },

            "#collectionDurationInfo": {
                render: function (infoPanel, eOpts) {
                    var tip = Ext.create('Ext.tip.ToolTip', {
                        trackMouse: true,
                        html: "Collection duration specifies the length in days after which the collection will be automatically stopped. An increase in duration up to 30days can be requested from AIDR admin.",
                        target: infoPanel.el,
                        dismissDelay: 0
                    });
                }
            },

            "#collectionLangInfo": {
                render: function (infoPanel, eOpts) {
                    var tip = Ext.create('Ext.tip.ToolTip', {
                        trackMouse: true,
                        html: "This field is used to set a comma separated list of language codes to filter results only to the specified languages. The language codes must be a valid BCP 47 language identifier. Language filter is not a mandatory field, but it is strongly recommended if you intend to use the automatic tagger.",
                        target: infoPanel.el,
                        dismissDelay: 0
                    });
                }
            },

            "#collectionTypeInfo": {
                render: function (infoPanel, eOpts) {
                    var tip = Ext.create('Ext.tip.ToolTip', {
                        trackMouse: true,
                        html: "Collection Type.",
                        target: infoPanel.el,
                        dismissDelay: 0
                    });
                }
            },

            "#crisisTypesInfo": {
                render: function (infoPanel, eOpts) {
                    var tip = Ext.create('Ext.tip.ToolTip', {
                        trackMouse: true,
                        html: "Collection type specifies a type of the crisis.",
                        target: infoPanel.el,
                        dismissDelay: 0
                    });
                }
            },

            "#CollectionLang":{
                change: function(field, newValue, oldValue){
                     var selectedValue = newValue;
                     if(field.value.length == 0){
                         this.CollectionCreateComponent.langNote.setText('<span class="redInfo">*</span> Note: if you want to use the automatic tagger, it is best that you collect for a specific language.', false);
                         this.CollectionCreateComponent.langNote.show();
                     }
                     else if(field.value.length > 1){
                         this.CollectionCreateComponent.langNote.setText('<span class="redInfo">*</span> Note: if you want to use the automatic tagger, it is best that you collect for one specific language.', false);
                         this.CollectionCreateComponent.langNote.show();
                     }
                    else{
                         this.CollectionCreateComponent.langNote.setText('');
                         this.CollectionCreateComponent.langNote.hide();
                     }

                }
            },

            "#collectionCancelCreate": {
                click: function (btn, e, eOpts) {
                    document.location.href = BASE_URL + '/protected/home';
                }
            },

            "#collectionCreate": {
                click: function (btn, e, eOpts) {
                    CollectionCreateController.initNameAndCodeValidation();
                }
            },

            "#nameTextField": {
                blur: function (field, eOpts) {
                    CollectionCreateController.generateCollectionCode(field.getValue());
                }
            },

            "#CollectionType":{
                change: function(field, newValue, oldValue){
                     if(newValue === 'SMS'){
                         Ext.getCmp('keywordsPanel').hide();
                         Ext.getCmp('langPanel').hide();
                         Ext.getCmp('geoPanel').hide();
                         Ext.getCmp('followPanel').hide();
                         Ext.getCmp('durationDescription').hide();
                         Ext.getCmp('geoDescription').hide();
                     } else if(newValue === 'Twitter'){
                         Ext.getCmp('keywordsPanel').show();
                         Ext.getCmp('langPanel').show();
                         Ext.getCmp('geoPanel').show();
                         Ext.getCmp('followPanel').show();
                         Ext.getCmp('durationDescription').show();
                         Ext.getCmp('geoDescription').show();
                     }
                }
            }
        });
    },

    afterRenderCollectionCreateView: function (component, eOpts) {
        AIDRFMFunctions.initMessageContainer();
        this.CollectionCreateComponent = component;
        CollectionCreateController = this;
    },

    saveCollection: function () {

        if (AIDRFMFunctions.mandatoryFieldsEntered()) {

            var form = Ext.getCmp('collectionForm').getForm();

            var mask = AIDRFMFunctions.getMask();
            mask.show();

            //Check if some collection already is running for current user
            Ext.Ajax.request({
                url: BASE_URL + '/protected/collection/getRunningCollectionStatusByUser.action',
                method: 'GET',
                params: {
                    id: USER_ID
                },
                headers: {
                    'Accept': 'application/json'
                },
                success: function (resp) {
                    var response = Ext.decode(resp.responseText);
                    var name = form.findField('name').getValue();
                    mask.hide();
                    if (response.success) {
                        if (response.data) {
                            var collectionData = response.data;
                            var collectionName = collectionData.name;
                            Ext.MessageBox.confirm('Confirm', 'The collection <b>' + collectionName + '</b> is already running for user <b>' + USER_NAME + '</b>. ' +
                                'Do you want to stop <b>' + collectionName + '</b>  and start <b>' + name + ' </b>?', function (buttonId) {
                                if (buttonId === 'yes') {
                                    //Create collection and run after creating
                                    createCollection(true)
                                } else {
                                    //Create collection without running
                                    createCollection(false)
                                }
                            });
                        } else {
                            createCollection(true)
                        }
                    } else {
                        AIDRFMFunctions.setAlert(
                            "Error",
                            ['Error while starting Collection .',
                                'Please try again later or contact Support']
                        );
                    }
                },
                failure: function () {
                    mask.hide();
                }
            });

            /**
             * Creates collection
             * @param shouldRun - decides whether run collection after creating. If true then created collection will be
             * started after creating.
             */
            function createCollection(shouldRun) {

                var mask = AIDRFMFunctions.getMask(true, 'Saving collection ...');
                mask.show();

                Ext.Ajax.request({
                    url: 'collection/save.action' + (shouldRun ? '?runAfterCreate=true' : ''),
                    method: 'POST',
                    params: {
                        name: Ext.String.trim( form.findField('name').getValue() ),
                        code: Ext.String.trim( form.findField('code').getValue() ),
                        track: Ext.String.trim( form.findField('track').getValue() ),
                        follow: Ext.String.trim( form.findField('follow').getValue() ),
                        geo: Ext.String.trim( form.findField('geo').getValue() ),
                        geoR: Ext.String.trim(  form.findField('geoR').getValue().geoR1 ),
                        langFilters: form.findField('langFilters').getValue(),
                        durationHours: form.findField('durationHours').getValue(),
                        crisisType: form.findField('crisisType').getValue(),
                        collectionType: form.findField('collectionType').getValue()
                    },
                    headers: {
                        'Accept': 'application/json'
                    },
                    success: function (response) {
                        AIDRFMFunctions.setAlert("Info", ["Collection created successfully.", "You will be redirected to the collection details page."]);
                        mask.hide();

                        var maskRedirect = AIDRFMFunctions.getMask(true, 'Redirecting ...');
                        maskRedirect.show();

//                    wait for 3 sec to let user read information box
                        var isFirstRun = true;
                        Ext.TaskManager.start({
                            run: function () {
                                if (!isFirstRun) {
                                    document.location.href = BASE_URL + '/protected/'+ form.findField('code').getValue() +'/collection-details';
                                }
                                isFirstRun = false;
                            },
                            interval: 3 * 1000
                        });
                    }
                });
            }
        }
    },

    isExist: function () {
        var me = this;

        var form = Ext.getCmp('collectionForm').getForm();
        var code = form.findField('code');
        Ext.Ajax.request({
            url: 'collection/exist.action',
            method: 'GET',
            params: {
                code: code.getValue()
            },
            headers: {
                'Accept': 'application/json'
            },
            success: function (response) {
                me.checkCount--;

                var response = Ext.decode(response.responseText);
                if (response.data) {
                    AIDRFMFunctions.setAlert('Error', 'Collection Code already exist. Please select another code');
                    code.markInvalid("Collection Code already exist. Please select another code");
                } else {
                    if (me.checkCount == 0) {
                        me.saveCollection();
                    }
                }
            }
        });
    },

    isExistName: function () {
        var me = this;

        var form = Ext.getCmp('collectionForm').getForm();
        var name = form.findField('name');
        Ext.Ajax.request({
            url: 'collection/existName.action',
            method: 'GET',
            params: {
                name: name.getValue()
            },
            headers: {
                'Accept': 'application/json'
            },
            success: function (response) {
                me.checkCount--;

                var response = Ext.decode(response.responseText);
                if (response.data) {
                    AIDRFMFunctions.setAlert('Error', [
                        'The name of the collection you have selected is already taken. Please enter a more specific name for your collection indicating a more specific time, location, and/or purpose.',
                        '&nbsp;',
                        '<b>Examples:</b>',
                        '&quot;Earthquake in Chile in Feb. 2014&quot;',
                        '&quot;Earthquake in Concepcion, Chile in 2014&quot;',
                        '&quot;Consequences of earthquake in Concepcion, Chile in 2014&quot;'
                    ]);
                    name.markInvalid("Collection Name already exist. Please select another name");
                } else {
                    if (me.checkCount == 0) {
                        me.saveCollection();
                    }
                }
            }
        });
    },

    initNameAndCodeValidation: function() {
        this.checkCount = 2;
        this.isExist();
        this.isExistName();
    },

    generateCollectionCode: function(value) {
        var me = this;

        var currentCode = me.CollectionCreateComponent.codeE.getValue();
        if (currentCode != ''){
            return false;
        }

        var v = Ext.util.Format.trim(value);
        v = v.replace(/ /g, '_');
        v = Ext.util.Format.lowercase(v);

        var date = Ext.Date.format(new Date(), "ymdHis");
        date = Ext.util.Format.lowercase(date);

        var length = value.length;


        if(length > 64){
            v =  Ext.util.Format.substr(v, 0, length - date.length ) ;
        }

        var result = date + "_" + v;

        if(result.length > 64){
            return false;
        }
        else{
            me.isExistForGenerated(result);
        }
    },

    isExistForGenerated: function (code, attempt) {
        var me = this;

        Ext.Ajax.request({
            url: 'collection/exist.action',
            method: 'GET',
            params: {
                code: code
            },
            headers: {
                'Accept': 'application/json'
            },
            success: function (response) {
                var response = Ext.decode(response.responseText);
                if (response.data) {
                    if (attempt) {
                        me.modifyGeneratedCode(code, attempt);
                    } else {
                        me.modifyGeneratedCode(code, 0);
                    }
                } else {
                    me.CollectionCreateComponent.codeE.setValue(code);
                }
            }
        });
    },

    modifyGeneratedCode: function(oldCode, attempt) {
        var me = this;

        var date = Ext.util.Format.substr(oldCode, oldCode.length - 7, oldCode.length),
            code = Ext.util.Format.substr(oldCode, 0, oldCode.length - 9);

        var result = code + '_' + attempt + date;
        me.isExistForGenerated(result, attempt + 1);
    }

});