Servers.NewServerWindow.Input = Ext.extend(Ext.Panel, {

    constructor: function(config) {
	this.action = config.action;
	this.loadMaskVisible = false;

	this.makeComponents();
	if (config.item)
	    this.setServerValues(config.item);
    },

    makeComponents: function() {
	this.makeFields();

	Servers.NewServerWindow.Input.superclass.constructor.call(this, {
	    title: 'Input Specifications',
	    itemId: 'input',
	    layout: 'hbox',
	    layoutConfig: {
		align: 'stretch',
		pack: 'center'
	    },
	    padding: 5,
	    border: false,
	    items: {
		layout: 'form',
		width: 424,
		labelWidth: 100,
		labelAlign: 'right',
		border: false,
		autoScroll: true,
		defaults: {
		    style: {
			marginTop: Ext.isIE ? '1px' : '0px'
		    }
		},
		items: this.fields
	    },
	    listeners: {
		activate: function() {
		    if (this.loadMask && this.loadMaskVisible)
			this.loadMask.show();
		},
		resize: function() {
		    if (!this.loadMask) {
			this.loadMask = new Ext.LoadMask(this.getEl());
			if (this.loadMaskVisible)
			    this.loadMask.show();
		    }
		}
	    }
	});
    },

    getField: function(itemId) {
	return this.get(0).getComponent(itemId);
    },

    makeFields: function() {
	this.fields = [{
	    xtype: 'textfield',
	    name: 'server[name]',
	    itemId: 'name',
	    fieldLabel: 'Name',
	    width: 100,
	    readOnly: this.action != 'create',
	    msgTarget: 'qtip'
	}, {
	    xtype: 'textfield',
	    name: 'server[title]',
	    itemId: 'title',
	    fieldLabel: 'Title',
	    width: 200,
	    msgTarget: 'qtip'
	}, {
	    xtype: 'storecombobox',
	    name: 'server[zone]',
	    itemId: 'zone',
	    fieldLabel: 'Zone',
	    width: 150,
	    readOnly: this.action != 'create',
	    storeConfig: {
		url: paths.servers.zones
	    },
	    listeners: {
		select: function(combo, record, index) {
		    var psCombo = this.getField('physical_server');
		    psCombo.getStore().baseParams['zone'] = record.get('value');
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
	    readOnly: this.action != 'create',
	    disabled: this.action == 'create',
	    storeConfig: {
		url: paths.servers.physical_servers
	    }
	}, {
	    xtype: 'storecombobox',
	    name: 'server[pool]',
	    itemId: 'pool',
	    fieldLabel: 'Pool',
	    width: 150,
	    readOnly: this.action != 'create',
	    storeConfig: {
		url: paths.servers.pools
	    }
	}, {
	    xtype: 'storecombobox',
	    name: 'server[virtualization]',
	    itemId: 'virtualization',
	    fieldLabel: 'Virtualization',
	    width: 200,
	    readOnly: this.action != 'create',
	    storeConfig: {
		url: paths.servers.virtualizations
	    }
	}, {
	    xtype: 'numberfield',
	    name: 'server[cpus]',
	    itemId: 'cpus',
	    fieldLabel: 'CPUs',
	    width: 100,
	    readOnly: this.action == 'import',
	    allowDecimals: false,
	    msgTarget: 'qtip'
	}, {
	    xtype: 'numberfield',
	    name: 'server[memory]',
	    itemId: 'memory',
	    fieldLabel: 'Memory(MB)',
	    width: 100,
	    readOnly: this.action == 'import',
	    allowDecimals: false,
	    msgTarget: 'qtip'
	}, {
	    xtype: 'hidden',
	    name: 'interface[0][number]',
	    itemId: 'interface_number0',
	    value: '0'
	}, {
	    xtype: 'textfield',
	    name: 'interface[0][ip_address]',
	    itemId: 'ip_address0',
	    fieldLabel: 'IP Address(1)',
	    width: 150,
	    readOnly: this.action == 'import',
	    msgTarget: 'qtip'
	}, {
	    xtype: 'hidden',
	    name: 'interface[1][number]',
	    itemId: 'interface_number1',
	    value: '1'
	}, {
	    xtype: 'textfield',
	    name: 'interface[1][ip_address]',
	    itemId: 'ip_address1',
	    fieldLabel: 'IP Address(2)',
	    width: 150,
	    readOnly: this.action == 'import',
	    msgTarget: 'qtip'
	}, {
	    xtype: 'textarea',
	    name: 'server[comment]',
	    itemId: 'comment',
	    fieldLabel: 'Comment',
	    width: 300,
	    height: 100
	}, {
	    xtype: 'checkbox',
	    name: 'server[auto_restart]',
	    itemId: 'auto_restart',
	    fieldLabel: 'Auto Restart',
	    boxLabel: 'Restart automatically on unintentional shutdown',
	    style: {
		marginBottom: '0px'
	    },
	    inputValue: 'true'
	}, {
	    xtype: 'hidden',
	    name: 'server[storage_iqn]',
	    itemId: 'storage_iqn',
	}, {
	    xtype: 'hidden',
	    name: 'interface[0][mac_address]',
	    itemId: 'mac_address0'
	}, {
	    xtype: 'hidden',
	    name: 'interface[1][mac_address]',
	    itemId: 'mac_address1'
	}];
    },

    setServerValues: function(item) {
	this.setValues(item);
	this.loadMaskVisible = true;

	Ext.Ajax.request({
	    url: item.paths.server,
	    method: 'GET',
	    success: function(res, opts) {
		var additionalItem = Ext.decode(res.responseText).item;
		this.setValues(additionalItem);
		if (this.loadMask)
		    this.loadMask.hide();
		this.loadMaskVisible = false;
	    },
	    failure: function(res, opts) {
		Ext.MessageBox.alert('Error', 'Failed to get server');
	    },
	    scope: this
	});
    },

    setTargetValues: function(item) {
	this.setValues(item);
	this.loadMaskVisible = true;

	Ext.Ajax.request({
	    url: item.paths.target,
	    method: 'GET',
	    params: {
		physical_server: item.physical_server
	    },
	    success: function(res, opts) {
		var additionalItem = Ext.decode(res.responseText).item;
		this.setValues(additionalItem);
		if (this.loadMask)
		    this.loadMask.hide();
		this.loadMaskVisible = false;
	    },
	    failure: function(res, opts) {
		Ext.MessageBox.alert('Error', 'Failed to get target');
	    },
	    scope: this
	});
    },

    setValues: function(item) {
	for (var field in item) {
	    var cmp = this.getField(field);
	    if (cmp)
		cmp.setValue(item[field]);
	}
    }

});
