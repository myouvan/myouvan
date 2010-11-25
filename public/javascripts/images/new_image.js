Images.NewImageWindow = Ext.extend(Ext.Window, {

    constructor: function() {
	this.makeComponents();
	Images.NewImageWindow.superclass.constructor.call(this, {
	    modal: true,
	    width: 625,
	    height: 260,
	    layout: 'fit',
	    plain: true,
	    closable: false,
	    items: this.form,
	    buttonAlign: 'center',
	    buttons: [
		this.submitButton,
		this.closeButton
	    ]
	});
    },

    makeComponents: function() {
	this.makeFormItems();
	this.makeForm();
	this.makeButtons();
    },

    makeFormItems: function() {
	this.formItems = {
	    title: new Ext.form.TextField({
		name: 'image[title]',
		fieldLabel: 'Title',
		width: 200,
		msgTarget: 'qtip'
	    }),
	    os: new Ext.form.ComboBox({
		name: 'image[os]',
		fieldLabel: 'OS',
		width: 200,
		editable: false,
		forceSelection: false,
		triggerAction: 'all',
		store: comboItemsStore(paths.images.oss),
		displayField: 'value',
		msgTarget: 'qtip'
	    }),
	    iqn: new Ext.form.ComboBox({
		name: 'image[iqn]',
		fieldLabel: 'IQN',
		width: 500,
		editable: false,
		forceSelection: false,
		triggerAction: 'all',
		store: comboItemsStore(paths.images.iqns),
		displayField: 'value',
		msgTarget: 'qtip'
	    }),
	    comment: new Ext.form.TextArea({
		name: 'image[comment]',
		fieldLabel: 'Comment',
		width: 300,
		height: 100
	    })
	};
    },

    makeForm: function() {
	this.form = new Ext.form.FormPanel({
	    labelWidth: 70,
	    bodyStyle: {
		padding: '5px'
	    },
	    items: [
		this.formItems['title'],
		this.formItems['os'],
		this.formItems['iqn'],
		this.formItems['comment']
	    ]
	});
    },

    makeButtons: function() {
	var wdw = this;

	this.submitButton = new Ext.Button({
	    handler: function() {
		this.form.getForm().submit(wdw.submitOpts);
	    }
	});

	this.closeButton = new Ext.Button({
	    text: 'Close',
	    handler: function() {
		wdw.hide();
	    }
	});
    },

    setForCreate: function(submitOpts) {
	this.form.getForm().reset();
	this.setTitle('Create Image');
	this.submitButton.setText('Create');
	this.submitOpts = submitOpts;
    },

    setForUpdate: function(submitOpts) {
	this.form.getForm().reset();
	this.setTitle('Update Image');
	this.submitButton.setText('Update');
	this.submitOpts = submitOpts;
    },

    setValues: function(image) {
	for (var field in image)
	    if (this.formItems[field])
		this.formItems[field].setValue(image[field]);
    }

});
