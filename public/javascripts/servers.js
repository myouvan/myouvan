var showServers = function() {

    //------------------------------
    //   handlers
    //------------------------------

    var newServer = function() {
	newServerWindow.show();
    };

    var createServer = function() {
	newServerWindow.form.getForm().submit({
            url: paths.servers.index,
            method: 'POST',
            waitMsg: 'Creating...',
            success: function(f, action) {
		var server = action.result.server;
		var store = indexGrid.getStore();

		var RecordType = store.recordType;
		var newRecord = new RecordType(server);
		store.add(newRecord);

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

    var terminateServer = function() {
	var record = indexGrid.selectedRecord();
	Ext.Ajax.request({
	    url: record.get('paths').terminate,
	    method: 'POST',
	    success: function(res, opts) {
		record.set('status', 'Terminating');
		record.commit();
	    },
	    failure: function(res, opts) {
		Ext.MessageBox.alert('Error', 'Failed to terminate server');
	    }
	});
    };

    var migrateSelectServer = function() {
	migrateSelectServerWindow.show();
    };

    var migrateServer = function() {
	var record = indexGrid.selectedRecord();
	migrateSelectServerWindow.form.getForm().submit({
            url: record.get('paths').migrate,
            method: 'POST',
            waitMsg: 'Migrating...',
            success: function(f, action) {
		record.set('status', 'Migrating');
		record.commit();

		migrateSelectServerWindow.hide();
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
			for (var field in items[id])
			    record.set(field, items[id][field]);
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
	handler: newServer
    });

    //------------------------------
    //   index grid
    //------------------------------

    var indexGrid = (function() {
	var imagePaths = {
	    Starting: 'status_changing.gif',
	    Running: 'status_running.gif',
	    Terminating: 'status_changing.gif',
	    Terminated: 'status_terminated.gif',
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
		    text: 'Reboot'
		},
		{
		    text: 'Terminate',
		    handler: terminateServer
		},
		{
		    text: 'Migrate',
		    handler: migrateSelectServer
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
	layout: 'border',
	items: [
	    {
		region: 'north',
		height: 30,
		items: createButton
	    },
	    new Ext.Panel({
		region: 'center',
		layout: 'fit',
		border: false,
		items: indexGrid
	    })
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
		migrateSelectServerWindow.destroy();
	    }
	}
    });

    //------------------------------
    //   form window
    //------------------------------

    var newServerWindow = (function() {

	//--- select image card

	var imagesGrid = (function() {
	    var colModel = new Ext.grid.ColumnModel([
		{
		    header: 'ID',
		    dataIndex: 'id',
		    width: 30,
		    sortable: true
		},
		{
		    header: 'Title',
		    dataIndex: 'title',
		    width: 200,
		    sortable: true
		},
		{
		    header: 'OS',
		    dataIndex: 'os',
		    width: 150,
		    sortable: true
		},
		{
		    header: 'Comment',
		    dataIndex: 'comment',
		    width: 250
		}
	    ]);

	    var store = itemsStore(paths.images.index, [
		'id',
		'title',
		'os',
		'comment'
	    ]);

	    var grid = new Ext.grid.GridPanel({
		colModel: colModel,
		store: store,
		autoHeight: true
	    });

	    grid.selectedRecord = function() {
		return grid.getSelectionModel().getSelected();
	    };

	    return grid;
	})();

	var selectImage = new Ext.Panel({
	    border: false,
	    items: [
		{
		    html: 'Select Image',
		    bodyStyle: {
			padding: '3px'
		    },
		    border: false
		},
		imagesGrid
	    ]
	});

	//--- form card

	var formItems = [
	    {
		xtype: 'hidden',
		name: 'server[image_id]',
		id: 'image-id'
	    },
	    {
		xtype: 'textfield',
		name: 'server[name]',
		id: 'form_name',
		fieldLabel: 'Name',
		width: 100,
		msgTarget: 'qtip'
	    },
	    {
		xtype: 'textfield',
		name: 'server[title]',
		id: 'form_title',
		fieldLabel: 'Title',
		width: 200,
		msgTarget: 'qtip'
	    },
	    new Ext.form.ComboBox({
		name: 'server[zone]',
		id: 'form_zone',
		fieldLabel: 'Zone',
		width: 150,
		editable: false,
		forceSelection: false,
		triggerAction: 'all',
		store: comboItemsStore(paths.servers.zones),
		displayField: 'value',
		msgTarget: 'qtip',
		listeners: {
		    select: function(combo, record, index) {
			var psCombo = Ext.getCmp('form_physical_server');
			psCombo.getStore().baseParams['zone'] = record.get('value');
			psCombo.getStore().load();
			psCombo.reset();
			psCombo.enable();
		    }
		}
	    }),
	    new Ext.form.ComboBox({
		name: 'server[physical_server]',
		id: 'form_physical_server',
		fieldLabel: 'Physical Server',
		width: 150,
		disabled: true,
		editable: false,
		forceSelection: false,
		triggerAction: 'all',
		store: comboItemsStore(paths.servers.physical_servers),
		displayField: 'value',
		msgTarget: 'qtip'
	    }),
	    new Ext.form.ComboBox({
		name: 'server[pool]',
		id: 'form_pool',
		fieldLabel: 'Pool',
		width: 150,
		editable: false,
		forceSelection: false,
		triggerAction: 'all',
		store: comboItemsStore(paths.servers.pools),
		displayField: 'value',
		msgTarget: 'qtip'
	    }),
	    new Ext.form.ComboBox({
		name: 'server[virtualization]',
		id: 'form_virtualization',
		fieldLabel: 'Virtualization',
		width: 200,
		editable: false,
		forceSelection: false,
		triggerAction: 'all',
		store: comboItemsStore(paths.servers.virtualizations),
		displayField: 'value',
		msgTarget: 'qtip'
	    }),
	    new Ext.form.NumberField({
		name: 'server[cpus]',
		id: 'form_cpus',
		fieldLabel: 'CPUs',
		width: 100,
		allowDecimals: false,
		msgTarget: 'qtip'
	    }),
	    new Ext.form.NumberField({
		name: 'server[memory]',
		id: 'form_memory',
		fieldLabel: 'Memory(MB)',
		width: 100,
		allowDecimals: false,
		msgTarget: 'qtip'
	    }),
	    {
		xtype: 'hidden',
		name: 'interface[0][number]',
		value: '0'
	    },
	    {
		xtype: 'textfield',
		name: 'interface[0][ip_address]',
		id: 'form_ip_address0',
		fieldLabel: 'IP Address(1)',
		width: 150,
		msgTarget: 'qtip'
	    },
	    {
		xtype: 'hidden',
		name: 'interface[1][number]',
		value: '1'
	    },
	    {
		xtype: 'textfield',
		name: 'interface[1][ip_address]',
		id: 'form_ip_address1',
		fieldLabel: 'IP Address(2)',
		width: 150,
		msgTarget: 'qtip'
	    },
	    {
		xtype: 'textarea',
		name: 'server[comment]',
		id: 'form_comment',
		fieldLabel: 'Comment',
		width: 300,
		height: 100
	    },
	    {
		xtype: 'hidden',
		name: 'avatar[thumb]',
		id: 'avatar_thumb'
	    },
	    {
		xtype: 'hidden',
		name: 'avatar[icon]',
		id: 'avatar_icon'
	    }
	];

	var form = new Ext.form.FormPanel({
	    labelWidth: 100,
	    bodyStyle: { padding: '5px 113px' },
	    border: false,
	    autoScroll: true,
	    items: formItems
	});

	//--- flash panel

	var flash = new Ext.Panel({
	    layout: 'fit',
	    border: false,
	    html: '<div id="avatar-flash" />'
	});

	var showAvatarFlash = function() {
	    swfobject.embedSWF('/ova.swf', 'avatar-flash', '630', '400', '9.0.0');
	};

	var setAvatar = function(thumb, icon) {
	    Ext.getCmp('avatar_thumb').setValue(thumb);
	    Ext.getCmp('avatar_icon').setValue(icon);
	    nextButton.enable();
	};

	ovater_set = setAvatar;

	//--- card

	var activeItem = 0;

	var card = new Ext.Panel({
	    layout: 'card',
	    activeItem: 0,
	    items: [
		selectImage,
		form,
		flash
	    ],
	    width: 400
	});

	var prevCard = function() {
	    if (activeItem == 1) {
		prevButton.disable();

		card.layout.setActiveItem(0);
		activeItem = 0;
	    } else if (activeItem == 2) {
		nextButton.setText('Next');
		nextButton.enable();

		card.layout.setActiveItem(1);
		activeItem = 1;
	    }
	};

	var nextCard = function() {
	    if (activeItem == 0) {
		if (!imagesGrid.getSelectionModel().hasSelection()) {
		    Ext.MessageBox.alert('Error', 'Select an image');
		    return;
		}
		var id = imagesGrid.getSelectionModel().getSelected().get('id');
		Ext.getCmp('image-id').setValue(id);

		prevButton.enable();

		card.layout.setActiveItem(1);
		activeItem = 1;
	    } else if (activeItem == 1) {
		showAvatarFlash();

		nextButton.setText('Create');
		nextButton.disable();

		card.layout.setActiveItem(2);
		activeItem = 2;
	    } else if (activeItem == 2) {
		prevCard();
		createServer();
	    }
	};

	//--- buttons

	var prevButton = new Ext.Button({
	    text: 'Prev',
	    handler: prevCard
	});

	var nextButton = new Ext.Button({
	    text: 'Next',
	    handler: nextCard
	});

	var closeButton = new Ext.Button({
	    text: 'Close',
	    handler: function() {
		wdw.hide();
	    }
	});

	//--- window

	var wdw = new Ext.Window({
	    title: 'Create Server',
	    modal: true,
	    width: 650,
	    height: 468,
	    layout: 'fit',
	    plain: true,
	    closable: false,
	    items: card,
	    buttonAlign: 'center',
	    buttons: [
		prevButton,
		nextButton,
		closeButton
	    ],
	    listeners: {
		beforeshow: function() {
		    activeItem = 0;
		    card.layout.setActiveItem(0);

		    prevButton.disable();
		    nextButton.setText('Next');
		    nextButton.enable();

		    imagesGrid.getStore().load();
		    imagesGrid.getSelectionModel().clearSelections();
		    form.getForm().reset();
		    Ext.getCmp('form_physical_server').disable();
		}
	    }
	});

	wdw.form = form;

	return wdw;
    })();

    //------------------------------
    //   migrate select server form
    //------------------------------

    var migrateSelectServerWindow = (function() {
	
	//----- form

	var formItems = [
	    new Ext.form.ComboBox({
		name: 'physical_server',
		fieldLabel: 'Physical Server',
		width: 150,
		editable: false,
		forceSelection: false,
		triggerAction: 'all',
		store: comboItemsStore(paths.servers.physical_servers),
		displayField: 'value',
		msgTarget: 'qtip'
	    }),
	];

	var form = new Ext.form.FormPanel({
	    labelWidth: 100,
	    bodyStyle: { padding: '5px 10px' },
	    border: false,
	    autoScroll: true,
	    items: formItems
	});

	//--- buttons

	var submitButton = new Ext.Button({
	    text: 'Migrate',
	    handler: migrateServer
	});
	var closeButton = new Ext.Button({
	    text: 'Close',
	    handler: function() {
		wdw.hide();
	    }
	});

	//----- window

	var wdw = new Ext.Window({
	    title: 'Migrate Server',
	    modal: true,
	    width: 291,
	    height: 119,
	    layout: 'fit',
	    plain: true,
	    closable: false,
	    items: form,
	    buttonAlign: 'center',
	    buttons: [
		submitButton,
		closeButton
	    ],
	    listeners: {
		beforeshow: function() {
		    form.getForm().reset();
		}
	    }
	});

	wdw.form = form;

	return wdw;
    })();

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
	    columns: 4
	},
	border: false
    });

    var titleCell = function(str) {
	return '<p style="font-weight: bold; width: 150px; text-align: right">' + str + '</p>';
    };

    var valueCell = function(str) {
	return '<p style="width: 180px">' + str + '</p>';
    };

    var buildTableItems = function(server, interfaces) {
	var tableItems = [
	    { html: titleCell('Name:') },
	    { html: server.name, colspan: 3 },
	    { html: titleCell('UUID') },
	    { html: server.uuid, colspan: 3 },
	    { html: titleCell('Title:') },
	    { html: server.title, colspan: 3 },
	    { html: titleCell('Zone:') },
	    { html: valueCell(server.zone) },
	    { html: titleCell('Virtualization:') },
	    { html: valueCell(server.virtualization) },
	    { html: titleCell('Physical Server:') },
	    { html: valueCell(server.physical_server) },
	    { html: titleCell('Pool:') },
	    { html: valueCell(server.pool) },
	    { html: titleCell('Storage IQN:') },
	    { html: server.storage_iqn, colspan: 3 },
	    { html: titleCell('CPUs:') },
	    { html: valueCell(server.cpus) },
	    { html: titleCell('Memory(MB):') },
	    { html: valueCell(server.memory) }
	];

	for (var i = 0; i < interfaces.length; ++i) {
	    tableItems.push([
		{ html: titleCell('IP Address(' + (i + 1) + '):') },
		{ html: valueCell(interfaces[i].ip_address) },
		{ html: titleCell('Mac Address(' + (i + 1) + '):') },
		{ html: valueCell(interfaces[i].mac_address) },
	    ]);
	}

	tableItems.push([
	    { html: titleCell('Avatar:') },
	    {
		html: valueCell('<img src="' + server.paths.avatarThumb + '" width="150" height="150" />'),
		colspan: 3
	    }
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

// call from avatar flash
var ovater_set;
