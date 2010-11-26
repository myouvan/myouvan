var Servers = Ext.extend(Ext.util.Observable, {

Servers.prototype.show = function() {

    constructor: function() {
	this.addEvents('createdServer');
	this.addEvents('updatedServer');
	this.addEvents('updatedServers');
	this.addEvents('gotServer');
	this.addEvents('monitorServer');
	this.addEvents('addedTag');
	this.addEvents('destroyedTag');
    },

    createServer: function() {
	this.newServerWindow.setSubmitOpts({
            url: paths.servers.index,
            method: 'POST',
            waitMsg: 'Creating...',
            success: function(f, action) {
		var item = action.result.item;
		this.fireEvent('createdServer', item);
		this.newServerWindow.hide();
            },
            failure: function(f, action) {
		Ext.MessageBox.alert('Error', 'Failed to create server');
            }
	    scope: this
	});
	this.newServerWindow.show();
    };

    showServer: function(item) {
	Ext.Ajax.request({
	    url: item.paths.server,
	    method: 'GET',
	    success: function(res, opts) {
		var item = Ext.decode(res.responseText).item;
		this.fireEvent('gotServers', item);
		subcontentTab.show();
		Ext.getCmp('content-container').doLayout();
	    },
	    failure: function(res, opts) {
		Ext.MessageBox.alert('Error', 'Failed to get server');
	    },
	    scope: this
	});
    };

    operateServer: function(item, operation) {
	Ext.Ajax.request({
	    url: item.paths[operation],
	    method: 'POST',
	    success: function(res, opts) {
		var item = Ext.decode(res.responseText).item;
		this.fireEvent('updatedServer', item);
	    },
	    failure: function(res, opts) {
		Ext.MessageBox.alert('Error', 'Failed to ' + operation + ' server');
	    },
	    scope: this
	});
    };

    suspendServer: function(item) {
	this.operateServer(item, 'suspend');
    };

    resumeServer: function(item) {
	this.operateServer(item, 'resume');
    };

    rebootServer: function() {
	this.operateServer(item, 'reboot');
    };

    terminateServer: function() {
	this.operateServer(item, 'terminate');
    };

    restartServer: function() {
	this.operateServer(item, 'restart');
    };

    migrateServer: function(item) {
	this.selectServerWindow.setSubmitOpts({
            url: item.paths.migrate,
            method: 'POST',
            waitMsg: 'Migrating...',
            success: function(f, action) {
		this.fireEvent('updatedServer', { status: 'Migrating' });
		this.selectServerWindow.hide();
            },
            failure: function(f, action) {
		Ext.MessageBox.alert('Error', 'Failed to create server');
            },
	    scope: this
	});
	selectServerWindow.show();
    };

    addTag: function(tag) {
	Ext.Ajax.request({
	    url: paths.tags.index,
	    method: 'POST',
	    params: tag,
	    success: function(res, opts) {
		var item = Ext.decode(res.responseText).item;
		this.fireEvent('addedTag', item);
	    },
	    failure: function(res, opts) {
		Ext.MessageBox.alert('Error', 'Failed to add tag');
	    },
	    scopt: this
	});
    },

    destroyTag: function(item) {
	Ext.Ajax.request({
	    url: item.tag,
	    method: 'DELETE',
	    success: function(res, opts) {
		var item = Ext.decode(res.responseText).item;
		this.fireEvent('destroyedTag', item);
	    },
	    failure: function(res, opts) {
		Ext.MessageBox.alert('Error', 'Failed to destroy tag');
	    },
	    scope: this
	});
    },

    updateServer: function() {
	Ext.Ajax.request({
            url: paths.servers.status,
            method: 'GET',
            success: function(res, opts) {
		var items = Ext.decode(res.responseText).items;
		this.fireEvent('updatedServers', items);
            },
            failure: function(res, opts) {
            },
	    scope: this
	});
    },

    monitorServer: function() {
	this.fireEvent('monitorServer');
    };

    show: function() {
	var indexPanel = new Servers.IndexPanel();
	var subcontentTab = new Servers.SubcontentTab();
	var newServerWindow = new Servers.NewServerWindow();
	var selectServerWindow = new Servers.SelectServerWindow();

	this.initEventHandlers();

	Ext.getCmp('subcontent').show();
	Ext.getCmp('subcontent').removeAll();
	Ext.getCmp('subcontent').add(subcontentTab);
	subcontentTab.hide();

	Ext.getCmp('content').removeAll();
	Ext.getCmp('content').add(indexPanel);
	Ext.getCmp('content-container').doLayout();
    },

    initEventHandlers: function() {
	this.indexPanel.on('added', function() {
	    this.updateValuesTimer = setInterval(updateValues, 10000);
	    this.updateMonitorTimer = setInterval(updateMonitor, 5000);
	});

	this.indexPanel.on('destroy', function() {
	    clearInterval(this.updateValuesTimer);
	    clearInterval(this.updateMonitorTimer);
	    this.newServerWindow.destroy();
	    this.selectServerWindow.destroy();
	});
    }

};
