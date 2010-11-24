var showServers = function() {

    //------------------------------
    //   windows
    //------------------------------

    var newServerWindow = new NewServerWindow();
    var selectServerWindow = new SelectServerWindow();

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
		tableItems = buildTableItems(result.server, result.interfaces);

		description.removeAll();
		description.add(tableItems);

		tab.show();

		Ext.getCmp('content-container').doLayout();
	    },
	    failure: function(res, opts) {
		alert('Error');
	    }
	});

	var store = new itemsStore(record.get('paths').monitor, [
	    'index',
	    'cpu_use'
	]);
	store.load();

	var chart = new Ext.chart.LineChart({
	    store: store,
	    xField: 'index',
	    series: [
		{
		    yField: "cpu_use",
		    style: {
			size: 0
		    }
		}
	    ],
	    extraStyle: {
		animationEnabled: false,
		xAxis: {
		    showLabels:false
		}
	    },
	    xAxis: new Ext.chart.NumericAxis({
		maximum: 49,
		minimum: 0
	    }),
	    yAxis: new Ext.chart.NumericAxis({
		maximum: 100,
		minimum: 0
	    })
	});

	chartContainer.removeAll();
	chartContainer.add(chart);
	chartPanel.store = store;
    };

    var changeStatus = function(record, status) {
	record.set('status', status);
	record.commit();

	var showStatus = Ext.getCmp('show_status');
	if (showStatus)
	    showStatus.update(status);
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

			    if (indexGrid.getSelectionModel().isSelected(record)) {
				var showCmp = Ext.getCmp('show_' + field);
				if (showCmp)
				    showCmp.update(items[id][field]);
			    }
			}
			record.commit();
                    } else {
			deletedRecords.push(record);
                    }
		});
		for (var i = 0; i < deletedRecords.length; ++i) {
                    store.remove(deletedRecords[i]);
		}
            },
            failure: function(res, opts) {
            }
	});
    };

    var updateMonitor = function() {
	if (chartPanel.store)
	    chartPanel.store.reload();
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
    //   subconte-tab
    //------------------------------

    //--- description

    var description = new Ext.Panel({
	layout: 'table',
	defaults: {
	    padding: '3px',
	    border: false
	},
	layoutConfig: {
	    columns: 2
	},
	border: false
    });

    var propPanel = function(id, label, value, colspan) {
	return {
	    items: new Ext.Panel({
		layout: 'hbox',
		width: colspan == 1 ? 340 : 687,
		border: false,
		items: [
		    {
			border: false,
			width: 130,
			bodyStyle: {
			    fontWeight: 'bold',
			    textAlign: 'right'
			},
			html: label + ':'
		    },
		    {
			id: id,
			border: false,
			padding: '0 0 0 10px',
			html: '' + value
		    }
		]
	    }),
	    colspan: colspan
	};
    };

    var buildTableItems = function(server, interfaces) {
	var auto_restart_str = server.auto_restart ? 'Yes' : 'No';
	var tableItems = [
	    propPanel('show_name', 'Name', server.name, 2),
	    propPanel('show_uuid', 'UUID', server.uuid, 2),
	    propPanel('show_title', 'Title', server.title, 2),
	    propPanel('show_status', 'Status', server.status, 1),
	    propPanel('show_auto_restart', 'Auto Restart', auto_restart_str, 1),
	    propPanel('show_zone', 'Zone', server.zone, 1),
	    propPanel('show_virtualization', 'Virtualization', server.virtualization, 1),
	    propPanel('show_physical_server', 'Physical Server', server.physical_server, 1),
	    propPanel('show_pool', 'Pool', server.pool, 1),
	    propPanel('show_storage_iqn', 'Storage IQN', server.storage_iqn, 2),
	    propPanel('show_cpus', 'CPUs', server.cpus, 1),
	    propPanel('show_memory', 'Memory(MB)', server.memory, 1)
	];

	for (var i = 0; i < interfaces.length; ++i) {
	    var iface = interfaces[i];
	    var label_ip_address = 'IP Address(' + (i + 1) + ')';
	    var label_mac_address = 'Mac Address(' + (i + 1) + ')';
	    tableItems.push([
		propPanel('show_ip_address' + i, label_ip_address, iface.ip_address, 1),
		propPanel('show_mac_address' + i, label_mac_address, iface.mac_address, 1)
	    ]);
	}

	avatarImg = '<img src="' + server.paths.avatarThumb + '" width="150" height="150" />';
	tableItems.push([
	    propPanel('show_avatar', 'Avatar', avatarImg, 2)
	]);

	return tableItems;
    };

    //--- chart panel

    var chartContainer = new Ext.Panel({
	layout: "fit",
	border: false,
	width: 400,
	height: 250
    });

    var chartPanel = new Ext.Panel({
	border: false,
	items: [
	    {
		html: 'CPU use',
		bodyStyle: {
		    padding: '3px'
		},
		border: false
	    },
	    chartContainer
	]
    });

    //--- tab

    var tab = new Ext.TabPanel({
	activeTab: 0,
	layoutOnTabChange: true,
	border: false,
	items: [
	    {
		title: 'Description',
		autoScroll: true,
		items: description,
		border: false,
		bodyStyle: 'padding: 10px'
            },
	    {
		title: 'Monitoring',
		autoScroll: true,
		items: chartPanel,
		border: false,
		bodyStyle: 'padding: 10px'
	    }
	]
    });

    //------------------------------
    //   layout
    //------------------------------

    Ext.getCmp('subcontent').show();
    Ext.getCmp('subcontent').removeAll();
    Ext.getCmp('subcontent').add(tab);
    tab.hide();

    Ext.getCmp('content').removeAll();
    Ext.getCmp('content').add(indexPanel);
    Ext.getCmp('content-container').doLayout();
};
