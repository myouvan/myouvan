Servers.Subcontent.Description = Ext.extend(Ext.Panel, {

    constructor: function() {
	this.makeComponents();
	this.initHandlers();
    },

    makeComponents: function() {
	Servers.Subcontent.Description.superclass.constructor.call(this, {
	    layout: 'table',
	    defaults: {
		padding: '3px',
		border: false
	    },
	    layoutConfig: {
		columns: 2
	    },
	    border: false,
	    defaultType: 'proppanel',
	    items: [{
		label: 'Name',
		itemId: 'name',
		colspan: 2
	    }, {
		label: 'UUID',
		itemId: 'uuid',
		colspan: 2
	    }, {
		label: 'Title',
		itemId: 'title',
		colspan: 2
	    }, {
		label: 'Status',
		itemId: 'status',
	    }, {
		label: 'Auto Restart',
		itemId: 'auto_restart',
		renderer: function(value) {
		    return value ? 'Yes' : 'No';
		}
	    }, {
		label: 'User Terminate',
		itemId: 'user_terminate',
		renderer: function(value) {
		    return value ? 'Yes' : 'No';
		}
	    }, {
		label: 'Allow Restart',
		itemId: 'allow_restart',
		renderer: function(value) {
		    return value ? 'Yes' : 'No';
		}
	    }, {
		label: 'Zone',
		itemId: 'zone'
	    }, {
		label: 'Virtualization',
		itemId: 'virtualization'
	    }, {
		label: 'Physical Server',
		itemId: 'physical_server'
	    }, {
		label: 'Pool',
		itemId: 'pool'
	    }, {
		label: 'Storage IQN',
		itemId: 'storage_iqn',
		colspan: 2
	    }, {
		label: 'CPUs',
		itemId: 'cpus'
	    }, {
		label: 'Memory(MB)',
		itemId: 'memory'
	    }, {
		label: 'IP Address(1)',
		itemId: 'ip_address0'
	    }, {
		label: 'Mac Address(1)',
		itemId: 'mac_address0'
	    }, {
		label: 'IP Address(2)',
		itemId: 'ip_address1'
	    }, {
		label: 'Mac Address(2)',
		itemId: 'mac_address1'
	    }, {
		label: 'Avatar',
		itemId: 'avatar'
	    }]
	});
    },

    initHandlers: function() {
	this.setDynamicHandlers({
	    target: servers,
	    handlers: [{
		event: 'gotServer',
		fn: this.showServer
	    }, {
		event: 'updatedServer',
		fn: this.updateServer
	    }, {
		event: 'updatedServers',
		fn: this.updateServers
	    }]
	});
    },

    showServer: function(item) {
	for (var field in item) {
	    var cmp = this.getComponent(field);
	    if (cmp)
		cmp.setValue(item[field]);
	}

	var cmp = this.getComponent('avatar');
	cmp.setValue(Ext.ux.createImg({
	    src: item.paths.avatarThumb,
	    id: 'avatar-thumb-' + item.id,
	    size: 150
	}));

	this.currentItem = item;
    },

    updateServer: function(item) {
	if (this.currentItem) {
	    if (item.id == this.currentItem.id)
		for (var field in item) {
		    var cmp = this.getComponent(field);
		    if (cmp)
			cmp.setValue(item[field]);
		}
	    if (item.avatar_changed)
		Ext.ux.reloadImg('avatar-thumb-' + item.id);
	}
    },

    updateServers: function(items) {
	if (this.currentItem)
	    for (var i = 0; i < items.length; ++i)
		if (items[i].id == this.currentItem.id)
		    for (var field in items[i]) {
			var cmp = this.getComponent(field);
			if (cmp)
			    cmp.setValue(items[i][field]);
		    }
    }

});

Servers.Subcontent.PropPanel = Ext.extend(Ext.Panel, {

    constructor: function(config) {
	Ext.applyIf(config, {
	    colspan: 1
	});

	if (config.renderer)
	    this.renderer = config.renderer;

	Servers.Subcontent.PropPanel.superclass.constructor.call(this, {
	    layout: 'hbox',
	    itemId: config.itemId,
	    colspan: config.colspan,
	    width: config.colspan == 1 ? 340 : 680,
	    border: false,
	    padding: 3,
	    items: [{
		width: 130,
		border: false,
		bodyStyle: {
		    fontWeight: 'bold',
		    textAlign: 'right'
		},
		html: config.label + ':'
	    }, {
		itemId: 'valuePanel',
		padding: '0 0 0 10px',
		border: false
	    }]
	});
    },

    setValue: function(value) {
	var v = null;
	if (this.renderer)
	    v = this.renderer.call(this, value);
	else
	    v = value;

	this.getComponent('valuePanel').update(v);
    }

});

Ext.reg('proppanel', Servers.Subcontent.PropPanel);
