Images.NewImageWindow = Ext.extend(Ext.Window, {

    constructor: function() {
	this.makeComponents();
    },

    makeComponents: function() {
	this.makeFormItems();
	this.makeForm();

	Images.NewImageWindow.superclass.constructor.call(this, {
	    modal: true,
	    width: 625,
	    height: 260,
	    layout: 'fit',
	    plain: true,
	    closable: false,
	    items: this.form,
	    buttonAlign: 'center',
	    buttons: [{
		itemId: 'submitButton',
		handler: function() {
		    this.form.getForm().submit(this.submitOpts);
		},
		scope: this
	    }, {
		text: 'Close',
		handler: function() {
		    this.hide();
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
	    msgTarget: 'qtip'
	}, {
	    xtype: 'storecombobox',
	    name: 'image[os]',
	    fieldLabel: 'OS',
	    itemId: 'os',
	    width: 200,
	    storeConfig: {
		url: paths.images.oss
	    }
	}, {
	    xtype: 'storecombobox',
	    name: 'image[iqn]',
	    fieldLabel: 'IQN',
	    itemId: 'iqn',
	    width: 500,
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
	    labelWidth: 70,
	    bodyStyle: {
		padding: '5px'
	    },
	    items: this.formItems
	});
    },

    setForCreate: function(submitOpts) {
	this.form.getForm().reset();
	this.setTitle('Create Image');
	this.getComponent('submitButton').setText('Create');
	this.submitOpts = submitOpts;
    },

    setForUpdate: function(submitOpts) {
	this.form.getForm().reset();
	this.setTitle('Update Image');
	this.getComponent('submitButton').setText('Update');
	this.submitOpts = submitOpts;
    },

    setValues: function(image) {
	for (var field in image) {
	    var cmp = this.form.getComponent(field);
	    if (cmp)
		cmp.setValue(image[field]);
	}
    }

});
