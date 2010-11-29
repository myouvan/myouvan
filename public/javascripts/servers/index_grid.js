Servers.IndexGrid = Ext.extend(Ext.grid.GridPanel, {

    constructor: function() {
	this.makeComponents();

	var events = [
	    'showServer',
	    'suspendServer',
	    'resumeServer',
	    'rebootServer',
	    'terminateServer',
	    'restartServer',
	    'migrateServer'
	];
	this.addEvents(events);
	this.enableBubble(events);

	this.addRecordDelegate = this.addRecord.createDelegate(this);
	this.updateRecordDelegate = this.updateRecord.createDelegate(this);
	this.updateRecordsDelegate = this.updateRecords.createDelegate(this);
    },

    makeComponents: function() {
	this.makeColModel();
	this.makeStore();
	this.makeContextMenu();

	Servers.IndexGrid.superclass.constructor.call(this, {
	    colModel: this.colModel,
	    store: this.store,
	    loadMask: true,
	    listeners: {
		rowclick: function(grid, row, e) {
		    this.operateServer('showServer');
		},
		rowcontextmenu: function(grid, row, e) {
		    this.getSelectionModel().selectRow(row);
		    this.operateServer('showServer');
		    e.stopEvent();
		    this.contextMenu.showAt(e.getXY());
		},
		added: this.addEventHandlers.createDelegate(this),
		beforedestroy: this.removeEventHandlers.createDelegate(this),
	    }
	});
    },

    makeColModel: function() {
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

	var img = function(src, w, h) {
	    return '<img src="' + src + '"' +
		   ' width="' + w + '" height="' + h + '"' +
		   ' style="vertical-align: top" />';
	};

	this.colModel = new Ext.grid.ColumnModel([
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
		    var url = record.get('paths').avatarIcon;
		    return img(url, 32, 32) + value;
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
		    return img(url, 16, 16) + value;
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
    },

    makeStore: function() {
	this.store = new Ext.ux.ItemsStore({
	    url: paths.servers.index,
	    autoLoad: true,
	    fields: [
		'id',
		'image_id',
		'name',
		'title',
		'status',
		'physical_server',
		'cpus',
		'memory',
		'comment',
		'tags',
		'paths'
	    ]
	});
    },

    makeContextMenu: function() {
	this.contextMenu = new Ext.menu.Menu({
	    style: {
		overflow: 'visible'
	    },
	    defaults: {
		scope: this
	    },
	    items: [
		{
		    text: 'Suspend',
		    handler: function() {
			this.operateServer('suspendServer')
		    }
		},
		{
		    text: 'Resume',
		    handler: function() {
			this.operateServer('resumeServer')
		    }
		},
		{
		    text: 'Reboot',
		    handler: function() {
			this.operateServer('rebootServer')
		    }
		},
		{
		    text: 'Terminate',
		    handler: function() {
			this.operateServer('terminateServer')
		    }
		},
		{
		    text: 'Restart',
		    handler: function() {
			this.operateServer('restartServer')
		    }
		},
		{
		    text: 'Migrate',
		    handler: function() {
			this.operateServer('migrateServer')
		    }
		}
	    ]
	});
    },

    operateServer: function(operation) {
	var record = this.getSelectionModel().getSelected();
	this.fireEvent(operation, record.data);
    },

    setFilter: function(value) {
	if (value == '')
	    this.store.clearFilter();
	else
	    this.store.filterBy(function(record) {
		return (record.get('tags').indexOf(value) != -1);
	    });
    },

    addEventHandlers: function() {
	servers.on('createdServer', this.addRecordDelegate);
	servers.on('updatedServer', this.updateRecordDelegate);
	servers.on('updatedServers', this.updateRecordsDelegate);
    },

    removeEventHandlers: function() {
	servers.un('createdServer', this.addRecordDelegate);
	servers.un('updatedServer', this.updateRecordDelegate);
	servers.un('updatedServers', this.updateRecordsDelegate);
    },

    addRecord: function(item) {
	var RecordType = this.store.recordType;
	var record = new RecordType(item);
	this.store.add(record);
    },

    updateRecord: function(item) {
	var ri = this.store.findExact('id', item.id);
	if (ri != -1) {
	    var record = this.store.getAt(ri);
	    for (var field in item)
		record.set(field, item[field]);
	    record.commit();
	}
    },

    updateRecords: function(items) {
	var walkedRecords = new Object();
	for (var i = 0; i < items.length; ++i) {
	    var ri = this.store.findExact('id', items[i].id);
	    if (ri == -1) {
		var RecordType = this.store.recordType;
		var record = new RecordType(items[i]);
		this.store.add(record);
		walkedRecords[record.get('id')] = true;
	    } else {
		var record = this.store.getAt(ri);
		for (var field in items[i])
		    record.set(field, items[i][field]);
		record.commit();
		walkedRecords[record.get('id')] = true;
	    }
	}

	var deletedRecords = new Array();
	this.store.each(function(record) {
	    if (!walkedRecords[record.id])
		deletedRecords.push(record);
	});

	for (var i = 0; i < deletedRecords.length; ++i)
	    this.store.remove(deletedRecords[i]);
    }

});
