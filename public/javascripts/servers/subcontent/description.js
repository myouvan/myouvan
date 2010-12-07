Servers.Subcontent.Description = Ext.extend(Ext.Panel, {

    constructor: function() {
	this.makeComponents();

	this.showServerDelegate = this.showServer.createDelegate(this);
	this.updateServerDelegate = this.updateServer.createDelegate(this);
	this.updateServersDelegate = this.updateServers.createDelegate(this);
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
		itemId: 'interfaces-0-ip_address'
	    }, {
		label: 'Mac Address(1)',
		itemId: 'interfaces-0-mac_address'
	    }, {
		label: 'IP Address(2)',
		itemId: 'interfaces-1-ip_address'
	    }, {
		label: 'Mac Address(2)',
		itemId: 'interfaces-1-mac_address'
	    }, {
		label: 'Avatar',
		itemId: 'avatar'
	    }],
	    listeners: {
		added: this.addEventHandlers.createDelegate(this),
		beforedestroy: this.removeEventHandlers.createDelegate(this)
	    }
	});
    },

    addEventHandlers: function() {
	servers.on('gotServer', this.showServerDelegate);
	servers.on('updatedServer', this.updateServerDelegate);
	servers.on('updatedServers', this.updateServersDelegate);
    },

    removeEventHandlers: function() {
	servers.un('gotServer', this.showServerDelegate);
	servers.un('updatedServer', this.updateServerDelegate);
	servers.un('updatedServers', this.updateServersDelegate);
    },

    showServer: function(server) {
	this.setValues(server);

	var cmp = this.getComponent('avatar');
	cmp.setValue(Ext.ux.createImg({
	    src: server.paths.avatarThumb,
	    id: 'avatar-thumb-' + server.id,
	    size: 150
	}));

	this.currentServer = server;
    },

    setValues: function(item, prefix) {
	if (!Ext.isDefined(prefix))
	    prefix = '';

	for (var field in item) {
	    var value = item[field];
	    if (Ext.isArray(value) || Ext.isObject(value)) {
		this.setValues(value, prefix + field + '.');
	    } else {
		var cmp = this.getComponent(prefix + field);
		if (cmp)
		    cmp.setValue(item[field]);
	    }
	}
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
