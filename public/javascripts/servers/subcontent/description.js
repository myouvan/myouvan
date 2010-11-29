Servers.SubcontentTab.DescriptionPanel = Ext.extend(Ext.Panel, {

    constructor: function() {
	this.makeComponents();

	this.showServerDelegate = this.showServer.createDelegate(this);
	this.updateServerDelegate = this.updateServer.createDelegate(this);
	this.updateServersDelegate = this.updateServers.createDelegate(this);
    },

    makeComponents: function() {
	Servers.SubcontentTab.DescriptionPanel.superclass.constructor.call(this, {
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
		itemId: 'items',
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
		itemId: 'status'
	    }, {
		label: 'Auto Restart',
		itemId: 'auto_restart'
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

    showServer: function(item) {
	for (var field in item.server) {
	    var cmp = this.getComponent(field);
	    if (cmp)
		cmp.setValue(item.server[field]);
	}

	for (var i = 0; i < item.interfaces.length; ++i) {
	    var iface = item.interfaces[i];
	    for (var field in iface) {
		var cmp = this.getComponent(field + i);
		if (cmp)
		    cmp.setValue(iface[field]);
	    }
	}

	avatarImg = '<img src="' + item.server.paths.avatarThumb + '"' +
	            ' width="150" height="150" />';
	var cmp = this.getComponent('avatar');
	cmp.setValue(avatarImg);

	this.currentItem = item.server;
    },

    updateServer: function(item) {
	if (this.currentItem)
	    if (item.id == this.currentItem.id)
		for (var field in item) {
		    var cmp = this.getComponent(field);
		    if (cmp)
			cmp.setValue(item[field]);
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

Servers.SubcontentTab.PropPanel = Ext.extend(Ext.Panel, {

    constructor: function(config) {
	Ext.applyIf(config, {
	    colspan: 1
	});

	Servers.SubcontentTab.PropPanel.superclass.constructor.call(this, {
	    layout: 'hbox',
	    itemId: config.itemId,
	    colspan: config.colspan,
	    width: config.colspan == 1 ? 340 : 680,
	    border: false,
	    padding: 3,
	    items: [{
		border: false,
		width: 130,
		bodyStyle: {
		    fontWeight: 'bold',
		    textAlign: 'right'
		},
		html: config.label + ':'
	    }, {
		itemId: 'valuePanel',
		border: false,
		padding: '0 0 0 10px'
	    }]
	});
    },

    setValue: function(value) {
	this.getComponent('valuePanel').update(value);
    }

});

Ext.reg('proppanel', Servers.SubcontentTab.PropPanel);
