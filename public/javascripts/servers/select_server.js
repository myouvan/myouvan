Servers.SelectServerWindow = Ext.extend(Ext.Window, {

    constructor: function() {
	this.makeComponents();
    },

    makeComponents: function() {
	this.makeFormItems();
	this.makeForm();
	this.makeButtons();

	Servers.SelectServerWindow.superclass.constructor.call(this, {
	    title: 'Migrate Server',
	    modal: true,
	    width: 291,
	    height: 145,
	    layout: 'fit',
	    plain: true,
	    closable: false,
	    items: this.form,
	    buttonAlign: 'center',
	    buttons: [
		this.submitButton,
		this.closeButton
	    ],
	    listeners: {
		beforeshow: function() {
		    this.form.getForm().reset();
		    this.formItems['physical_server'].disable();
		}
	    }
	});
    },

    makeFormItems: function() {
	this.formItems = {
	    zone: new Ext.ux.StoreComboBox({
		name: 'server[zone]',
		fieldLabel: 'Zone',
		width: 150,
		storeConfig: {
		    url:paths.servers.zones
		},
		listeners: {
		    select: function(combo, record, index) {
			var psCombo = this.formItems['physical_server'];
			psCombo.getStore().baseParams['zone'] = record.get('value');
			psCombo.getStore().load();
			psCombo.reset();
			psCombo.enable();
		    },
		    scope: this
		}
	    }),
	    physical_server: new Ext.ux.StoreComboBox({
		name: 'server[physical_server]',
		fieldLabel: 'Physical Server',
		width: 150,
		storeConfig: {
		    url: paths.servers.physical_servers
		}
	    })
	};
    },

    makeForm: function() {
	this.form = new Ext.form.FormPanel({
	    labelWidth: 90,
	    labelAlign: 'right',
	    bodyStyle: { padding: '5px 10px' },
	    border: false,
	    autoScroll: true,
	    items: [
		this.formItems['zone'],
		this.formItems['physical_server']
	    ]
	});
    },

    makeButtons: function() {
	this.submitButton = new Ext.Button({
	    text: 'Migrate',
	    handler: function() {
		this.form.getForm().submit(this.submitOpts);
	    },
	    scope: this
	});

	this.closeButton = new Ext.Button({
	    text: 'Close',
	    handler: function() {
		this.hide();
	    },
	    scope: this
	});
    },

    setExcept: function(value) {
	var psCombo = this.formItems['physical_server'];
	psCombo.getStore().baseParams['except'] = value;
    },

    setSubmitOpts: function(opts) {
	this.submitOpts = opts;
    }

});
