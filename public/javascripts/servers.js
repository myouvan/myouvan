var showServers = function() {

    //------------------------------
    //   windows, panels
    //------------------------------

    var newServerWindow = new NewServerWindow();
    var selectServerWindow = new SelectServerWindow();
    var subcontentTab = new SubcontentTab();

    //------------------------------
    //   handlers
    //------------------------------

    var createServer = function() {
	newServerWindow.show();
	newServerWindow.setSubmitOpts({
            url: paths.servers.index,
            method: 'POST',
            waitMsg: 'Creating...',
            success: function(f, action) {
		var server = action.result.server;
		var store = indexGrid.getStore();

		var RecordType = store.recordType;
		var record = new RecordType(server);
		store.add(record);

		newServerWindow.hide();
            },
            failure: function(f, action) {
		Ext.MessageBox.alert('Error', 'Failed to create server');
            }
	});
    };

    var showServer = function() {
	var record = indexGrid.selectedRecord();
	Ext.Ajax.request({
	    url: record.get('paths').server,
	    method: 'GET',
	    success: function(res, opts) {
		result = Ext.decode(res.responseText);

		server = result.server;
		interfaces = result.interfaces;

		var monitorStore = new itemsStore(record.get('paths').monitor, [
		    'index',
		    'cpu_use'
		]);
		monitorStore.load();

		subcontentTab.showContent(server, interfaces, monitorStore);
		subcontentTab.show();

		Ext.getCmp('content-container').doLayout();
	    },
	    failure: function(res, opts) {
		alert('Error');
	    }
	});
    };

    var changeStatus = function(record, status) {
	record.set('status', status);
	record.commit();

	subcontentTab.updateStatus({ status: status });
    };

    var suspendServer = function() {
	var record = indexGrid.selectedRecord();
	Ext.Ajax.request({
	    url: record.get('paths').suspend,
	    method: 'POST',
	    success: function(res, opts) {
		changeStatus(record, 'Suspending');
	    },
	    failure: function(res, opts) {
		Ext.MessageBox.alert('Error', 'Failed to suspend server');
	    }
	});
    };

    var resumeServer = function() {
	var record = indexGrid.selectedRecord();
	Ext.Ajax.request({
	    url: record.get('paths').resume,
	    method: 'POST',
	    success: function(res, opts) {
		changeStatus(record, 'Resuming');
	    },
	    failure: function(res, opts) {
		Ext.MessageBox.alert('Error', 'Failed to resume server');
	    }
	});
    };

    var rebootServer = function() {
	var record = indexGrid.selectedRecord();
	Ext.Ajax.request({
	    url: record.get('paths').reboot,
	    method: 'POST',
	    success: function(res, opts) {
		changeStatus(record, 'Rebooting');
	    },
	    failure: function(res, opts) {
		Ext.MessageBox.alert('Error', 'Failed to reboot server');
	    }
	});
    };

    var terminateServer = function() {
	var record = indexGrid.selectedRecord();
	Ext.Ajax.request({
	    url: record.get('paths').terminate,
	    method: 'POST',
	    success: function(res, opts) {
		changeStatus(record, 'Terminating');
	    },
	    failure: function(res, opts) {
		Ext.MessageBox.alert('Error', 'Failed to terminate server');
	    }
	});
    };

    var restartServer = function() {
	var record = indexGrid.selectedRecord();
	Ext.Ajax.request({
	    url: record.get('paths').restart,
	    method: 'POST',
	    success: function(res, opts) {
		changeStatus(record, 'Restarting');
	    },
	    failure: function(res, opts) {
		Ext.MessageBox.alert('Error', 'Failed to restart server');
	    }
	});
    };

    var migrateServer = function() {
	var record = indexGrid.selectedRecord();
	selectServerWindow.show();
	selectServerWindow.setSubmitOpts({
            url: record.get('paths').migrate,
            method: 'POST',
            waitMsg: 'Migrating...',
            success: function(f, action) {
		changeStatus(record, 'Migrating');
		selectServerWindow.hide();
            },
            failure: function(f, action) {
		Ext.MessageBox.alert('Error', 'Failed to create server');
            }
	});
    };

    var updateStatus = function() {
	Ext.Ajax.request({
            url: paths.servers.status,
            method: 'GET',
            success: function(res, opts) {
		var items = Ext.decode(res.responseText).items;
		var store = indexGrid.getStore();
		var deletedRecords = new Array();
		indexGrid.getStore().each(function(record) {
                    var id = record.get('id');
                    if (items[id]) {
			for (var field in items[id]) {
			    record.set(field, items[id][field]);
			}
			record.commit();
                    } else {
			deletedRecords.push(record);
                    }
		});
		for (var i = 0; i < deletedRecords.length; ++i) {
                    store.remove(deletedRecords[i]);
		}

		if (indexGrid.getSelectionModel().hasSelection()) {
		    var record = indexGrid.selectedRecord();
		    var id = record.get('id');
		    if (items[id])
			subcontentTab.updateStatus(items[id]);
		}
            },
            failure: function(res, opts) {
            }
	});
    };

    var updateMonitor = function() {
	subcontentTab.updateMonitor();
    };

    //------------------------------
    //   create button
    //------------------------------

    var createButton = new Ext.Button({
	text: 'Create Server',
	border: false,
	handler: createServer
    });

    //------------------------------
    //   index grid
    //------------------------------

    var indexGrid = (function() {
	var imagePaths = {
	    Starting: 'status_changing.gif',
	    Running: 'status_running.gif',
	    Suspending: 'status_changing.gif',
	    Paused: 'status_terminated.gif',
	    Resuming: 'status_changing.gif',
	    Rebooting: 'status_changing.gif',
	    Terminating: 'status_changing.gif',
	    Terminated: 'status_terminated.gif',
	    Restarting: 'status_changing.gif',
	    Migrating: 'status_changing.gif',
	    Error: 'status_error.gif',
	};

	var colModel = new Ext.grid.ColumnModel([
	    {
		header: 'ID',
		dataIndex: 'id',
		width: 30,
		sortable: true
	    },
	    {
		header: 'Image ID',
		dataIndex: 'image_id',
		width: 60,
		sortable: true
	    },
	    {
		header: 'Name',
		dataIndex: 'name',
		width: 120,
		sortable: true,
		renderer: function(value, metadata, record) {
		    url = record.get('paths').avatarIcon;
		    return '<img src="' + url + '" width="32" height="32" style="vertical-align: top" /> ' + value;
		}
	    },
	    {
		header: 'Title',
		dataIndex: 'title',
		width: 200,
		sortable: true
	    },
	    {
		header: 'Status',
		dataIndex: 'status',
		width: 100,
		sortable: true,
		renderer: function(value, metadata, record) {
		    var url = '/images/' + imagePaths[value];
		    return '<img src="' + url + '" width="16" height="16" style="vertical-align: top" /> ' + value;
		}
	    },
	    {
		header: 'Physical Server',
		dataIndex: 'physical_server',
		width: 150,
		sortable: true
	    },
	    {
		header: 'CPUs',
		dataIndex: 'cpus',
		width: 50,
		sortable: true
	    },
	    {
		header: 'Memory(MB)',
		dataIndex: 'memory',
		width: 80,
		sortable: true
	    },
	    {
		header: 'Comment',
		dataIndex: 'comment',
		width: 250
	    }
	]);

	var store = itemsStore(paths.servers.index, [
	    'id',
	    'image_id',
	    'name',
	    'title',
	    'status',
	    'physical_server',
	    'cpus',
	    'memory',
	    'comment',
	    'paths'
	]);

	var contextMenu = new Ext.menu.Menu({
	    style: {
		overflow: 'visible'
	    },
	    items: [
		{
		    text: 'Suspend',
		    handler: suspendServer
		},
		{
		    text: 'Resume',
		    handler: resumeServer
		},
		{
		    text: 'Reboot',
		    handler: rebootServer
		},
		{
		    text: 'Terminate',
		    handler: terminateServer
		},
		{
		    text: 'Restart',
		    handler: restartServer
		},
		{
		    text: 'Migrate',
		    handler: migrateServer
		}
	    ]
	});

	var grid = new Ext.grid.GridPanel({
	    colModel: colModel,
	    store: store,
	    listeners: {
		rowclick: showServer,
		rowcontextmenu: function(g, row, e) {
		    grid.getSelectionModel().selectRow(row);
		    showServer();
		    e.stopEvent();
		    contextMenu.showAt(e.getXY());
		}
	    }
	});

	store.load();

	grid.selectedRecord = function() {
	    return grid.getSelectionModel().getSelected();
	};

	return grid;
    })();

    //------------------------------
    //   index panel
    //------------------------------

    var indexPanel = new Ext.Panel({
	layout: 'vbox',
	layoutConfig: {
	    align: 'stretch'
	},
	border: false,
	items: [
	    {
		height: 30,
		border: false,
		items: createButton
	    },
	    {
		flex: 1,
		layout: 'fit',
		border: false,
		items: indexGrid
	    }
	],
	listeners: {
	    added: function() {
		this.updateStatusTimer = setInterval(updateStatus, 10000);
		this.updateMonitorTimer = setInterval(updateMonitor, 5000);
	    },
	    destroy: function() {
		clearInterval(this.updateStatusTimer);
		clearInterval(this.updateMonitorTimer);
		newServerWindow.destroy();
		selectServerWindow.destroy();
	    }
	}
    });

    //------------------------------
    //   layout
    //------------------------------

    Ext.getCmp('subcontent').show();
    Ext.getCmp('subcontent').removeAll();
    Ext.getCmp('subcontent').add(subcontentTab);
    subcontentTab.hide();

    Ext.getCmp('content').removeAll();
    Ext.getCmp('content').add(indexPanel);
    Ext.getCmp('content-container').doLayout();
};
