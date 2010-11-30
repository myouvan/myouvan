var Servers = Ext.extend(Ext.util.Observable, {

    constructor: function() {
	this.addEvents([
	    'createdServer',
	    'updatedServer',
	    'updatedServers',
	    'gotServer',
	    'gotServers',
	    'monitorServer',
	    'destroyedMetaData',
	    'addedTag',
	    'destroyedTag',
	    'updatedTags'
	]);

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

	this.filterValue = '';
    },

    createServer: function() {
	var newServerWindow = new Servers.NewServerWindow({
	    action: 'create',
	    submitConfig: {
		url: paths.servers.index,
		method: 'POST',
		waitMsg: 'Creating...',
		success: function(f, action) {
		    var item = action.result.item;
		    this.fireEvent('createdServer', item);
		    this.fireEvent('updatedTags');
		    newServerWindow.close();
		},
		failure: function(f, action) {
		    Ext.MessageBox.alert('Error', 'Failed to create server');
		},
		scope: this
	    }
	});
	newServerWindow.show();
    },

    importServer: function() {
	var newServerWindow = new Servers.NewServerWindow({
	    action: 'import',
	    submitConfig: {
		url: paths.servers.import_,
		method: 'POST',
		waitMsg: 'Importing...',
		success: function(f, action) {
		    var item = action.result.item;
		    this.fireEvent('createdServer', item);
		    this.fireEvent('updatedTags');
		    newServerWindow.close();
		},
		failure: function(f, action) {
		    Ext.MessageBox.alert('Error', 'Failed to create server');
		},
		scope: this
	    }
	});
	newServerWindow.show();
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

    unshowServer: function() {
	this.subcontentTab.hide();
    },

    getServers: function(ids) {
	Ext.Ajax.request({
	    url: paths.servers.index,
	    method: 'GET',
	    params: {
		ids: Ext.encode(ids)
	    },
	    defaultHeaders: {
		Accept: 'application/json'
	    },
	    success: function(res, opts) {
		var items = Ext.decode(res.responseText).items;
		this.fireEvent('gotServers', items);
		this.fireEvent('updatedTags');
	    },
	    failure: function() {
	    },
	    scope: this
	});
    },

    setFilter: function(value) {
	this.filterValue = value;
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

    rebootServer: function(item) {
	this.operateServer(item, 'reboot');
    },

    terminateServer: function(item) {
	this.operateServer(item, 'terminate');
    },

    restartServer: function(item) {
	this.operateServer(item, 'restart');
    },

    migrateServer: function(item) {
	var selectServerWindow = new Servers.SelectServerWindow({
	    except: item.physical_server,
	    submitConfig: {
		url: item.paths.migrate,
		method: 'POST',
		waitMsg: 'Migrating...',
		success: function(f, action) {
		    var item = action.result.item;
		    this.fireEvent('updatedServer', item);
		    selectServerWindow.close();
		},
		failure: function(f, action) {
		    Ext.MessageBox.alert('Error', 'Failed to create server');
		},
		scope: this
	    }
	});
	selectServerWindow.show();
    },

    destroyMetaData: function(item) {
	Ext.Ajax.request({
	    url: item.paths.server,
	    method: 'DELETE',
	    success: function(res, opts) {
		this.fireEvent('destroyedMetaData', item);
		this.fireEvent('updatedTags');
	    },
	    failure: function(res, opts) {
		Ext.MessageBox.alert('Error', 'Failed to destroy metadata');
	    },
	    scope: this
	});
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
	    scope: this
	});
    },

    destroyTag: function(item) {
	Ext.Ajax.request({
	    url: item.paths.tag,
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
	    params: {
		filter_value: this.filterValue
	    },
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
	}, this);

	this.indexPanel.on('createServer', this.createServer.createDelegate(this));
	this.indexPanel.on('importServer', this.importServer.createDelegate(this));
	this.indexPanel.on('showServer', this.showServer.createDelegate(this));
	this.indexPanel.on('unshowServer', this.unshowServer.createDelegate(this));
	this.indexPanel.on('getServers', this.getServers.createDelegate(this));
	this.indexPanel.on('setFilter', this.setFilter.createDelegate(this));
	this.indexPanel.on('suspendServer', this.suspendServer.createDelegate(this));
	this.indexPanel.on('resumeServer', this.resumeServer.createDelegate(this));
	this.indexPanel.on('rebootServer', this.rebootServer.createDelegate(this));
	this.indexPanel.on('terminateServer', this.terminateServer.createDelegate(this));
	this.indexPanel.on('restartServer', this.restartServer.createDelegate(this));
	this.indexPanel.on('migrateServer', this.migrateServer.createDelegate(this));
	this.indexPanel.on('destroyMetaData', this.destroyMetaData.createDelegate(this));

	this.subcontentTab.on('addTag', this.addTag.createDelegate(this));
	this.subcontentTab.on('destroyTag', this.destroyTag.createDelegate(this));
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
