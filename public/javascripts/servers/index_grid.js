var IndexGrid = function() {

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

    IndexGrid.baseConstructor.apply(this, [{
	colModel: colModel,
	store: store,
	listeners: {
	    rowclick: function() {
		grid.showServer()
	    },
	    rowcontextmenu: function(g, row, e) {
		grid.getSelectionModel().selectRow(row);
		grid.showServer();
		e.stopEvent();
		contextMenu.showAt(e.getXY());
	    }
	}
    }]);

    var grid = this;

    store.load();

    this.isSelected = function() {
	return grid.getSelectionModel().hasSelection();
    };

    this.selectedId = function() {
	return grid.getSelectionModel().getSelected().get('id');
    };

    this.selectedPaths = function() {
	return grid.getSelectionModel().getSelected().get('paths');
    };

    this.addRecord = function(server) {
	var RecordType = store.recordType;
	var record = new RecordType(server);
	store.add(record);
    };

    this.updateSelectedValues = function(item) {
	var record = grid.getSelectionModel().getSelected();
	for (var field in item) {
	    record.set(field, item[field]);
	    record.commit();
	}
    };

    this.updateValues = function(items) {
	var deletedRecords = new Array();
	store.each(function(record) {
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
    };
};

IndexGrid.inherit(Ext.grid.GridPanel);
