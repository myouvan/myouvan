Images.NewImageWindow = Ext.extend(Ext.Window, {

    constructor: function(config) {
	this.action = config.action;
	this.submitConfig = config.submitConfig;
	this.loadMaskVisible = false;

	this.makeComponents();
	if (config.item)
	    this.form.getForm().setValues(config.item);
    },

    makeComponents: function() {
	this.makeFormItems();
	this.makeForm();

	var actionStr = (this.action == 'create' ? 'Create' : 'Update');
	Images.NewImageWindow.superclass.constructor.call(this, {
	    title: actionStr + ' Image',
	    modal: true,
	    width: 625,
	    height: 254,
	    layout: 'fit',
	    plain: true,
	    closable: false,
	    items: this.form,
	    buttonAlign: 'center',
	    buttons: [{
		text: actionStr,
		handler: function() {
		    if (this.form.getForm().isValid()) {
			this.form.getForm().submit(this.submitConfig);
		    } else {
			Ext.Msg.alert('Error', 'Some of fields are invalid');
		    }
		},
		scope: this
	    }, {
		text: 'Close',
		handler: function() {
		    this.close();
		},
		scope: this
	    }]
	});
    },

    makeFormItems: function() {
	this.formItems = [{
	    xtype: 'textfield',
	    name: 'image[title]',
	    itemId: 'title',
	    fieldLabel: 'Title',
	    width: 200,
	    allowBlank: false,
	    blankText: "can't be blank",
	    msgTarget: 'qtip'
	}, {
	    xtype: 'storecombobox',
	    name: 'image[os]',
	    fieldLabel: 'OS',
	    itemId: 'os',
	    width: 200,
	    allowBlank: false,
	    blankText: "can't be blank",
	    storeConfig: {
		url: paths.images.oss
	    }
	}, {
	    xtype: 'storecombobox',
	    name: 'image[iqn]',
	    fieldLabel: 'IQN',
	    itemId: 'iqn',
	    width: 500,
	    allowBlank: false,
	    blankText: "can't be blank",
	    storeConfig: {
		url: paths.images.iqns
	    }
	}, {
	    xtype: 'textarea',
	    name: 'image[comment]',
	    fieldLabel: 'Comment',
	    itemId: 'comment',
	    width: 300,
	    height: 100
	}];
    },

    makeForm: function() {
	this.form = new Ext.form.FormPanel({
	    layout: 'hbox',
	    layoutConfig: {
		align: 'stretch',
		pack: 'center'
	    },
	    padding: 5,
	    border: false,
	    items: {
		layout: 'form',
		labelWidth: 60,
		labelAlign: 'right',
		defaults: {
		    style: {
			marginTop: Ext.isIE ? '1px' : '0px'
		    }
		},
		border: false,
		items: this.formItems
	    }
	});
    }

});
