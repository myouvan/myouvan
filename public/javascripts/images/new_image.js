var NewImageWindow = function() {

    //--- form

    var formItems = new Array();

    formItems['title'] = new Ext.form.TextField({
	name: 'image[title]',
	fieldLabel: 'Title',
	width: 200,
	msgTarget: 'qtip'
    });

    formItems['os'] = new Ext.form.ComboBox({
	name: 'image[os]',
	fieldLabel: 'OS',
	width: 200,
	editable: false,
	forceSelection: false,
	triggerAction: 'all',
	store: comboItemsStore(paths.images.oss),
	displayField: 'value',
	msgTarget: 'qtip'
    });

    formItems['iqn'] = new Ext.form.ComboBox({
	name: 'image[iqn]',
	fieldLabel: 'IQN',
	width: 500,
	editable: false,
	forceSelection: false,
	triggerAction: 'all',
	store: comboItemsStore(paths.images.iqns),
	displayField: 'value',
	msgTarget: 'qtip'
    });

    formItems['comment'] = new Ext.form.TextArea({
	name: 'image[comment]',
	fieldLabel: 'Comment',
	width: 300,
	height: 100
    });

    var form = new Ext.form.FormPanel({
	labelWidth: 70,
	bodyStyle: {
	    padding: '5px'
	},
	items: [
	    formItems['title'],
	    formItems['os'],
	    formItems['iqn'],
	    formItems['comment']
	]
    });

    //--- buttons

    var submitButton = new Ext.Button({
	handler: function() {
	    form.getForm().submit(wdw.submitOpts);
	}
    });

    var closeButton = new Ext.Button({
	text: 'Close',
	handler: function() {
	    wdw.hide();
	}
    });

    //--- window

    NewImageWindow.baseConstructor.apply(this, [{
	modal: true,
	width: 625,
	height: 260,
	layout: 'fit',
	plain: true,
	closable: false,
	items: form,
	buttonAlign: 'center',
	buttons: [
	    submitButton,
	    closeButton
	]
    }]);

    var wdw = this;

    this.setForCreate = function(submitOpts) {
	form.getForm().reset();
	this.setTitle('Create Image');
	submitButton.setText('Create');
	this.submitOpts = submitOpts;
    };

    this.setForUpdate = function(submitOpts) {
	form.getForm().reset();
	this.setTitle('Update Image');
	submitButton.setText('Update');
	this.submitOpts = submitOpts;
    };

    this.setValues = function(image) {
	for (var field in image)
	    if (formItems[field])
		formItems[field].setValue(image[field]);
    };

};

NewImageWindow.inherit(Ext.Window);
