Servers.IndexGrid = Ext.extend(Ext.grid.GridPanel, {

    constructor: function() {
	this.makeComponents();

	var events = [
	    'showServer',
	    'unshowServer',
	    'getServers',
	    'setFilter',
	    'updateServer',
	    'migrateServer',
	    'operateServer',
	    'destroyMetaData'
	];
	this.addEvents(events);
	this.enableBubble(events);

	this.addRecordDelegate = this.addRecord.createDelegate(this);
	this.addRecordsDelegate = this.addRecords.createDelegate(this);
	this.updateRecordDelegate = this.updateRecord.createDelegate(this);
	this.updateRecordsDelegate = this.updateRecords.createDelegate(this);
	this.destroyRecordDelegate = this.destroyRecord.createDelegate(this);
	this.addTagDelegate = this.addTag.createDelegate(this);
	this.destroyTagDelegate = this.destroyTag.createDelegate(this);
	this.reloadServerDelegate = this.reloadServer.createDelegate(this);

	this.filterValue = '';
    },

    makeComponents: function() {
	this.makeColModel();
	this.makeStore();
	this.makeContextMenu();

	Servers.IndexGrid.superclass.constructor.call(this, {
	    border: false,
	    colModel: this.colModel,
	    store: this.store,
	    autoExpandColumn: 'comment',
	    columnLines: true,
	    stripeRows: true,
	    loadMask: true,
	    listeners: {
		rowclick: function(grid, row, e) {
		    this.showServer();
		},
		rowcontextmenu: function(grid, row, e) {
		    this.menusDisable(this.store.getAt(row));
		    this.getSelectionModel().selectRow(row);
		    this.showServer();
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
	    Creating: 'status_changing.gif',
	    Running: 'status_running.gif',
	    Updating: 'status_changing.gif',
	    Suspending: 'status_changing.gif',
	    Paused: 'status_paused.gif',
	    Resuming: 'status_changing.gif',
	    Rebooting: 'status_changing.gif',
	    'Shutting down': 'status_changing.gif',
	    'Shut down': 'status_terminated.gif',
	    Terminating: 'status_changing.gif',
	    Terminated: 'status_terminated.gif',
	    Restarting: 'status_changing.gif',
	    Migrating: 'status_changing.gif',
	    Error: 'status_error.gif',
	};

	this.colModel = new Ext.grid.ColumnModel([{
	    header: 'ID',
	    dataIndex: 'id',
	    width: 30,
	    sortable: true
	}, {
	    header: 'Image ID',
	    dataIndex: 'image_id',
	    width: 60,
	    sortable: true
	}, {
	    header: 'Name',
	    dataIndex: 'name',
	    width: 180,
	    sortable: true,
	    renderer: function(value, metadata, record) {
		return Ext.ux.createImg({
		    src: record.get('paths').avatarIcon,
		    id: 'avatar-icon-' + record.get('id'),
		    size: 32,
		    style: "vertical-align: top"
		}) + ' ' + value;
	    }
	}, {
	    header: 'Title',
	    dataIndex: 'title',
	    width: 200,
	    sortable: true
	}, {
	    header: 'Status',
	    dataIndex: 'status',
	    width: 100,
	    sortable: true,
	    renderer: function(value, metadata, record) {
		return Ext.ux.createImg({
		    src: '/images/' + imagePaths[value],
		    size: 16,
		    style: "vertical-align: top"
		}) + ' ' + value;
	    }
	}, {
	    header: 'Physical Server',
	    dataIndex: 'physical_server',
	    width: 120,
	    sortable: true
	}, {
	    header: 'CPUs',
	    dataIndex: 'cpus',
	    width: 50,
	    sortable: true
	}, {
	    header: 'Memory(MB)',
	    dataIndex: 'memory',
	    width: 80,
	    sortable: true
	}, {
	    header: 'Comment',
	    dataIndex: 'comment',
	    id: 'comment'
	}]);
    },

    makeStore: function() {
	this.store = new Ext.ux.ItemsStore({
	    url: paths.servers.index,
	    autoLoad: true,
	    root: 'servers',
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
		'user_terminate',
		'allow_restart',
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
	    items: [{
		text: 'Edit Server',
		itemId: 'edit',
		handler: function() {
		    var record = this.getSelectionModel().getSelected();
		    this.fireEvent('updateServer', record.data);
		}
	    }, '-', {
		text: 'Suspend Server',
		itemId: 'suspend',
		handler: function() {
		    this.operateServer('suspend');
		}
	    }, {
		text: 'Resume Server',
		itemId: 'resume',
		handler: function() {
		    this.operateServer('resume');
		}
	    }, '-',{
		text: 'Reboot Server',
		itemId: 'reboot',
		handler: function() {
		    this.operateServer('reboot');
		}
	    }, {
		text: 'Shutdown Server',
		itemId: 'shutdown',
		handler: function() {
		    this.operateServer('shutdown');
		}
	    }, {
		text: 'Restart Server',
		itemId: 'restart',
		handler: function() {
		    this.operateServer('restart');
		}
	    }, '-', {
		text: 'Migrate Server',
		itemId: 'migrate',
		handler: function() {
		    var record = this.getSelectionModel().getSelected();
		    this.fireEvent('migrateServer', record.data);
		}
	    }, '-', {
		text: 'Terminate Server',
		itemId: 'terminate',
		handler: function() {
		    Ext.Msg.confirm(
			'Terminate Server',
			'Terminating server. Are you sure?',
			function(btn) {
			    if (btn == 'yes')
				this.operateServer('terminate');
			}, this);
		}
	    }, '-', {
		text: 'Destroy MetaData',
		itemId: 'destroy',
		handler: function() {
		    Ext.Msg.confirm(
			'Destroy MetaData',
			'Destroying meta data. Are you sure?',
			function(btn) {
			    if (btn == 'yes') {
				var record = this.getSelectionModel().getSelected();
				this.fireEvent('destroyMetaData', record.data);
			    }
			}, this);
		}
	    }]
	});
    },

    menusDisable: function(record) {
	var status = record.get('status');
	var userTerminate = record.get('user_terminate');
	var allowRestart = record.get('allow_restart');

	this.menuDisable('edit', status != 'Running');
	this.menuDisable('suspend', status != 'Running');
	this.menuDisable('resume', status != 'Paused');
	this.menuDisable('reboot', status != 'Running');
	this.menuDisable('shutdown', status != 'Running');
	this.menuDisable('restart', status != 'Shut down' || userTerminate && !allowRestart);
	this.menuDisable('terminate', status != 'Running');
	this.menuDisable('migrate', status != 'Running');
    },

    menuDisable: function(itemId, flag) {
	this.contextMenu.getComponent(itemId).setDisabled(flag);
    },

    showServer: function() {
	var count = this.getSelectionModel().getCount();
	if (count == 0) {
	    this.fireEvent('unshowServer');
	} else if (count == 1) {
	    var record = this.getSelectionModel().getSelected();
	    this.fireEvent('showServer', record.data);
	}
    },

    operateServer: function(operation) {
	var record = this.getSelectionModel().getSelected();
	this.fireEvent('operateServer', record.data, operation);
    },

    setFilter: function(value) {
	this.filterValue = value;
	this.store.setBaseParam('filter_value', value);
	this.reloadServer();

	this.fireEvent('setFilter', value);
    },

    addEventHandlers: function() {
	servers.on('createdServer', this.addRecordDelegate);
	servers.on('gotServers', this.addRecordsDelegate);
	servers.on('updatedServer', this.updateRecordDelegate);
	servers.on('updatedServers', this.updateRecordsDelegate);
	servers.on('destroyedMetaData', this.destroyRecordDelegate);
	servers.on('addedTag', this.addTagDelegate);
	servers.on('destroyedTag', this.destroyTagDelegate);
	servers.on('reloadServer', this.reloadServerDelegate);
    },

    removeEventHandlers: function() {
	servers.un('createdServer', this.addRecordDelegate);
	servers.un('gotServers', this.addRecordsDelegate);
	servers.un('updatedServer', this.updateRecordDelegate);
	servers.un('updatedServers', this.updateRecordsDelegate);
	servers.un('destroyedMetaData', this.destroyRecordDelegate);
	servers.un('addedTag', this.addTagDelegate);
	servers.un('destroyedTag', this.destroyTagDelegate);
	servers.un('reloadServer', this.reloadServerDelegate);
    },

    addRecord: function(item) {
	var ri = this.store.findExact('id', item.id);
	if (ri == -1) {
	    if (this.filterValue == '' || item.tags.indexOf(this.filterValue) != -1) {
		var RecordType = this.store.recordType;
		var record = new RecordType(item);
		this.store.add(record);
	    }
	}
    },

    addRecords: function(items) {
	for (var i = 0; i < items.length; ++i)
	    this.addRecord(items[i]);
    },

    updateRecord: function(item) {
	var ri = this.store.findExact('id', item.id);
	if (ri != -1) {
	    var record = this.store.getAt(ri);
	    for (var field in item)
		record.set(field, item[field]);
	    this.store.commitChanges();

	    if (item.avatar_changed)
		Ext.ux.reloadImg('avatar-icon-' + item.id);
	}
    },

    updateRecords: function(items) {
	var walkedRecords = new Object();
	var addedIds = new Array();
	for (var i = 0; i < items.length; ++i) {
	    var item = items[i];
	    var ri = this.store.findExact('id', item.id);
	    if (ri != -1) {
		var record = this.store.getAt(ri);
		for (var field in item)
		    record.set(field, item[field]);
		walkedRecords[item.id] = true;
	    } else {
		addedIds.push(item.id);
	    }
	}
	this.store.commitChanges();

	if (addedIds.length > 0)
	    this.fireEvent('getServers', addedIds);

	var deletedRecords = new Array();
	this.store.each(function(record) {
	    if (!walkedRecords[record.get('id')])
		deletedRecords.push(record);
	});

	for (var i = 0; i < deletedRecords.length; ++i) {
	    var record = deletedRecords[i];
	    if (this.getSelectionModel().isSelected(record))
		this.fireEvent('unshowServer');
	    this.store.remove(record);
	}
    },

    destroyRecord: function(item) {
	var ri = this.store.findExact('id', item.id);
	if (ri != -1)
	    this.store.removeAt(ri);

	if (!this.getSelectionModel().hasSelection())
	    this.fireEvent('unshowServer');
    },

    addTag: function(item) {
	var ri = this.store.findExact('id', item.server_id);
	if (ri != -1) {
	    var record = this.store.getAt(ri);
	    record.get('tags').push(item.value);
	}
    },

    destroyTag: function(item) {
	var ri = this.store.findExact('id', item.server_id);
	if (ri != -1) {
	    var record = this.store.getAt(ri);
	    var ti = record.get('tags').indexOf(item.value);
	    if (ti != -1) {
		record.get('tags').splice(ti, 1);
		if (this.filterValue == item.value) {
		    ti = record.get('tags').indexOf(item.value);
		    if (ti == -1) {
			this.store.removeAt(ri);
			if (!this.getSelectionModel().hasSelection())
			    this.fireEvent('unshowServer');
		    }
		}
	    }
	}
    },

    reloadServer: function() {
	this.store.load({
	    callback: function() {
		if (!this.getSelectionModel().hasSelection())
		    this.fireEvent('unshowServer');
	    },
	    scope: this
	});
    }

});
