Servers.NewServerWindow.Input = Ext.extend(Ext.Panel, {

    constructor: function(config) {
	this.action = config.action;
	this.loadMaskVisible = false;

	this.makeComponents();
    },

    makeComponents: function() {
	this.makeFields();

	Servers.NewServerWindow.Input.superclass.constructor.call(this, {
	    title: 'Input Specifications',
	    itemId: 'form',
	    layout: 'hbox',
	    layoutConfig: {
		align: 'stretch',
		pack: 'center'
	    },
	    padding: 5,
	    border: false,
	    items: {
		xtype: 'form',
		width: 424,
		labelWidth: 100,
		labelAlign: 'right',
		border: false,
		autoScroll: true,
		defaults: {
		    style: {
			marginBottom: Ext.isIE ? '2px' : '0px'
		    }
		},
		items: this.fields
	    },
	    listeners: {
		afterlayout: function() {
		    this.loadMask = new Ext.LoadMask(this.getEl());
		},
		activate: function() {
		    if (this.loadMaskVisible) {
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
	    xtype: 'hidden',
	    name: 'server[image_id]',
	    itemId: 'image_id',
	}, {
	    xtype: 'textfield',
	    name: 'server[name]',
	    itemId: 'name',
	    fieldLabel: 'Name',
	    width: 100,
	    readOnly: this.action == 'import',
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
	    readOnly: this.action == 'import',
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
	    readOnly: this.action == 'import',
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
	    readOnly: this.action == 'import',
	    storeConfig: {
		url: paths.servers.pools
	    }
	}, {
	    xtype: 'storecombobox',
	    name: 'server[virtualization]',
	    itemId: 'virtualization',
	    fieldLabel: 'Virtualization',
	    width: 200,
	    readOnly: this.action == 'import',
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
	    name: 'interface[0][mac_address]',
	    itemId: 'mac_address0'
	}, {
	    xtype: 'hidden',
	    name: 'interface[1][number]',
	    itemId: 'interface_number1',
	    value: '1'
	}, {
	    xtype: 'hidden',
	    name: 'interface[1][mac_address]',
	    itemId: 'mac_address1'
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
	    name: 'tags',
	    itemId: 'tags',
	}, {
	    xtype: 'hidden',
	    itemId: 'avatar_thumb',
	    name: 'avatar[thumb]'
	}, {
	    xtype: 'hidden',
	    itemId: 'avatar_icon',
	    name: 'avatar[icon]'
	}];
    },

    setImageId: function(id) {
	this.getField('image_id').setValue(id);
    },

    showLoadMask: function() {
	this.loadMaskVisible = true;
    },

    hideLoadMask: function() {
	this.loadMask.hide();
	this.loadMaskVisible = false;
    },

    setValues: function(item) {
	for (var field in item) {
	    var cmp = this.getField(field);
	    if (cmp)
		cmp.setValue(item[field]);
	}
    },

    setTags: function(tags) {
	this.getField('tags').setValue(Ext.encode(tags));
    },

    setAvatar: function(thumb, icon) {
	this.getField('avatar_thumb').setValue(thumb);
	this.getField('avatar_icon').setValue(icon);
    },

    submit: function(submitConfig) {
	this.get(0).getForm().submit(submitConfig);
    }
});
