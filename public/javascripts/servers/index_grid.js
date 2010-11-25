Servers.IndexGrid = Ext.extend(Ext.grid.GridPanel, {

    constructor: function() {
	this.makeComponents();
	Servers.IndexGrid.superclass.constructor.call(this, {
	    colModel: this.colModel,
	    store: this.store,
	    listeners: {
		rowclick: function(grid, row, e) {
		    this.showServer();
		},
		rowcontextmenu: function(grid, row, e) {
		    this.getSelectionModel().selectRow(row);
		    this.showServer();
		    e.stopEvent();
		    this.contextMenu.showAt(e.getXY());
		}
	    }
	});
	this.store.load();
    },

    makeComponents: function() {
	this.makeColModel();
	this.makeStore();
	this.makeContextMenu();
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
	this.store = Ext.ux.ItemsStore({
	    url: paths.servers.index,
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
		'paths'
	    ]
	});
    },

    makeContextMenu: function() {
	var grid = this;
	this.contextMenu = new Ext.menu.Menu({
	    style: {
		overflow: 'visible'
	    },
	    items: [
		{
		    text: 'Suspend',
		    handler: function() {
			grid.suspendServer();
		    }
		},
		{
		    text: 'Resume',
		    handler: function() {
			grid.resumeServer();
		    }
		},
		{
		    text: 'Reboot',
		    handler: function() {
			grid.rebootServer();
		    }
		},
		{
		    text: 'Terminate',
		    handler: function() {
			grid.terminateServer();
		    }
		},
		{
		    text: 'Restart',
		    handler: function() {
			grid.restartServer();
		    }
		},
		{
		    text: 'Migrate',
		    handler: function() {
			grid.migrateServer();
		    }
		}
	    ]
	});
    },

    isSelected: function() {
	return this.getSelectionModel().hasSelection();
    },

    selectedId: function() {
	return this.getSelectionModel().getSelected().get('id');
    },

    selectedPaths: function() {
	return this.getSelectionModel().getSelected().get('paths');
    },

    addRecord: function(item) {
	var RecordType = this.store.recordType;
	var record = new RecordType(item);
	this.store.add(record);
    },

    updateSelectedValues: function(item) {
	var record = this.getSelectionModel().getSelected();
	for (var field in item) {
	    record.set(field, item[field]);
	    record.commit();
	}
    },

    updateValues: function(items) {
	var deletedRecords = new Array();
	this.store.each(function(record) {
	    var id = record.get('id');
	    if (items[id]) {
		for (var field in items[id])
		    record.set(field, items[id][field]);
		record.commit();
	    } else {
		deletedRecords.push(record);
	    }
	});
	for (var i = 0; i < deletedRecords.length; ++i)
	    this.store.remove(deletedRecords[i]);
    }

});
