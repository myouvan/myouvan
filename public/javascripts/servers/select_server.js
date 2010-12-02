Servers.SelectServerWindow = Ext.extend(Ext.Window, {

    constructor: function(config) {
	this.except = config.except;
	this.submitConfig = config.submitConfig;

	this.makeComponents();
    },

    makeComponents: function() {
	this.makeFormItems();
	this.makeForm();

	Servers.SelectServerWindow.superclass.constructor.call(this, {
	    title: 'Migrate Server',
	    modal: true,
	    width: 291,
	    height: 128,
	    layout: 'fit',
	    plain: true,
	    closable: false,
	    items: this.form,
	    buttonAlign: 'center',
	    buttons: [{
		text: 'Migrate',
		handler: function() {
		    this.form.getForm().submit(this.submitConfig);
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
	    xtype: 'storecombobox',
	    name: 'server[zone]',
	    fieldLabel: 'Zone',
	    width: 150,
	    storeConfig: {
		url:paths.servers.zones
	    },
	    listeners: {
		select: function(combo, record, index) {
		    var psCombo = this.form.getComponent('physical_server');
		    psCombo.getStore().baseParams.zone = record.get('value');
		    psCombo.getStore().load();
		    psCombo.reset();
		    psCombo.enable();
		},
		scope: this
	    }
	}, {
	    xtype: 'storecombobox',
	    name: 'server[physical_server]',
	    itemId: 'physical_server',
	    fieldLabel: 'Physical Server',
	    width: 150,
	    disabled: true,
	    storeConfig: {
		url: paths.servers.physical_servers,
		baseParams: {
		    except: this.except
		}
	    }
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
		labelWidth: 90,
		labelAlign: 'right',
		defaults: {
		    style: {
			marginTop: Ext.isIE ? '1px' : '0px'
		    }
		},
		border: false,
		autoScroll: true,
		items: this.formItems
	    }
	});
    },

});
