var SelectServerWindow = function() {

    //--- form

    var zoneCombo = new Ext.form.ComboBox({
	name: 'server[zone]',
	fieldLabel: 'Zone',
	width: 150,
	editable: false,
	forceSelection: false,
	triggerAction: 'all',
	store: comboItemsStore(paths.servers.zones),
	displayField: 'value',
	msgTarget: 'qtip',
	listeners: {
	    select: function(combo, record, index) {
		physicalServerCombo.getStore().baseParams['zone'] = record.get('value');
		physicalServerCombo.getStore().load();
		physicalServerCombo.reset();
		physicalServerCombo.enable();
	    }
	}
    });

    var physicalServerCombo = new Ext.form.ComboBox({
	name: 'server[physical_server]',
	fieldLabel: 'Physical Server',
	width: 150,
	editable: false,
	forceSelection: false,
	triggerAction: 'all',
	store: comboItemsStore(paths.servers.physical_servers),
	displayField: 'value',
	msgTarget: 'qtip'
    });


    var formItems = [
	zoneCombo,
	physicalServerCombo
    ];

    var form = new Ext.form.FormPanel({
	labelWidth: 90,
	labelAlign: 'right',
	bodyStyle: { padding: '5px 10px' },
	border: false,
	autoScroll: true,
	items: formItems
    });

    //--- buttons

    var submitButton = new Ext.Button({
	text: 'Migrate',
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

    //----- window

    SelectServerWindow.baseConstructor.apply(this, [{
	title: 'Migrate Server',
	modal: true,
	width: 291,
	height: 145,
	layout: 'fit',
	plain: true,
	closable: false,
	items: form,
	buttonAlign: 'center',
	buttons: [
	    submitButton,
	    closeButton
	],
	listeners: {
	    beforeshow: function() {
		form.getForm().reset();
		physicalServerCombo.disable();
	    }
	}
    }]);

    var wdw = this;

    //--- submit

    this.setSubmitOpts = function(opts) {
	this.submitOpts = opts;
    };

};

SelectServerWindow.inherit(Ext.Window);
