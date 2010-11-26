var Servers = Ext.extend(Ext.util.Observable, {

    constructor: function() {
	this.addEvents('createdServer');
	this.addEvents('updatedServer');
	this.addEvents('updatedServers');
	this.addEvents('gotServer');
	this.addEvents('monitorServer');
	this.addEvents('addedTag');
	this.addEvents('destroyedTag');

	this.tasks = {
	    updateServer: {
		run: this.updateServers,
		interval: 10000,
		scope: this
	    },
	    monitorServer: {
		run: this.monitorServer,
		interval: 5000,
		scope: this
	    }
	};
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
            },
	    scope: this
	});
	this.newServerWindow.show();
    },

    importServer: function() {
	this.newServerWindow.setSubmitOpts({
            url: paths.servers.index,
            method: 'POST',
            waitMsg: 'Importing...',
            success: function(f, action) {
		var item = action.result.item;
		this.fireEvent('createdServer', item);
		this.newServerWindow.hide();
            },
            failure: function(f, action) {
		Ext.MessageBox.alert('Error', 'Failed to create server');
            },
	    scope: this
	});
	this.newServerWindow.show();
    },

    showServer: function(item) {
	Ext.Ajax.request({
	    url: item.paths.server,
	    method: 'GET',
	    success: function(res, opts) {
		var item = Ext.decode(res.responseText).item;
		this.fireEvent('gotServer', item);
		this.subcontentTab.show();
		Ext.getCmp('content-container').doLayout();
	    },
	    failure: function(res, opts) {
		Ext.MessageBox.alert('Error', 'Failed to get server');
	    },
	    scope: this
	});
    },

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
    },

    suspendServer: function(item) {
	this.operateServer(item, 'suspend');
    },

    resumeServer: function(item) {
	this.operateServer(item, 'resume');
    },

    rebootServer: function() {
	this.operateServer(item, 'reboot');
    },

    terminateServer: function() {
	this.operateServer(item, 'terminate');
    },

    restartServer: function() {
	this.operateServer(item, 'restart');
    },

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
    },

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

    updateServers: function() {
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
    },

    show: function() {
	this.indexPanel = new Servers.IndexPanel();
	this.subcontentTab = new Servers.SubcontentTab();
	this.newServerWindow = new Servers.NewServerWindow();
	this.selectServerWindow = new Servers.SelectServerWindow();

	this.initEventHandlers();

	Ext.getCmp('subcontent').show();
	Ext.getCmp('subcontent').removeAll();
	Ext.getCmp('subcontent').add(this.subcontentTab);
	this.subcontentTab.hide();

	Ext.getCmp('content').removeAll();
	Ext.getCmp('content').add(this.indexPanel);
	Ext.getCmp('content-container').doLayout();
    },

    initEventHandlers: function() {
	this.indexPanel.on('added', function() {
	    this.startTasks();
	}, this);

	this.indexPanel.on('destroy', function() {
	    this.stopTasks();
	    this.newServerWindow.destroy();
	    this.selectServerWindow.destroy();
	}, this);

	this.indexPanel.on('createServer', this.createServer.createDelegate(this));
	this.indexPanel.on('importServer', this.importServer.createDelegate(this));
	this.indexPanel.on('showServer', this.showServer.createDelegate(this));
	this.indexPanel.on('suspendServer', this.suspendServer.createDelegate(this));
	this.indexPanel.on('resumeServer', this.resumeServer.createDelegate(this));
	this.indexPanel.on('rebootServer', this.rebootServer.createDelegate(this));
	this.indexPanel.on('terminateServer', this.terminateServer.createDelegate(this));
	this.indexPanel.on('restartServer', this.restartServer.createDelegate(this));
	this.indexPanel.on('migrateServer', this.migrateServer.createDelegate(this));
    },

    startTasks: function() {
	for (var taskName in this.tasks)
	    Ext.TaskMgr.start(this.tasks[taskName]);
    },

    stopTasks: function() {
	for (var taskName in this.tasks)
	    Ext.TaskMgr.stop(this.tasks[taskName]);
    }

});
