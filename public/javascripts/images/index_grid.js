Images.IndexGrid = Ext.extend(Ext.grid.GridPanel, {

    constructor: function() {
	this.makeComponents();

	var events = [
	    'updateImage',
	    'destroyImage'
	];
	this.addEvents(events);
	this.enableBubble(events);

	this.addRecordDelegate = this.addRecord.createDelegate(this);
	this.updateRecordDelegate = this.updateRecord.createDelegate(this);
	this.destroyRecordDelegate = this.destroyRecord.createDelegate(this);
    },

    makeComponents: function() {
	this.makeColModel();
	this.makeStore();
	this.makeContextMenu();

	Images.IndexGrid.superclass.constructor.call(this, {
	    border: false,
	    colModel: this.colModel,
	    store: this.store,
	    autoExpandColumn: 'comment',
	    columnLines: true,
	    stripeRows: true,
	    loadMask: true,
	    listeners: {
		rowcontextmenu: function(grid, row, e) {
		    this.getSelectionModel().selectRow(row);
		    e.stopEvent();
		    this.contextMenu.showAt(e.getXY());
		},
		added: this.addEventHandlers.createDelegate(this),
		beforedestroy: this.removeEventHandlers.createDelegate(this)
	    }
	});
    },

    makeColModel: function() {
	this.colModel = new Ext.grid.ColumnModel([{
	    header: 'ID',
	    dataIndex: 'id',
	    width: 30,
	    sortable: true
	}, {
	    header: 'Title',
	    dataIndex: 'title',
	    width: 200,
	    sortable: true
	}, {
	    header: 'OS',
	    dataIndex: 'os',
	    width: 150,
	    sortable: true
	}, {
	    header: 'IQN',
	    dataIndex: 'iqn',
	    width: 450,
	    sortable: true
	}, {
	    header: 'Comment',
	    dataIndex: 'comment',
	    id: 'comment'
	}]);
    },

    makeStore: function() {
	this.store = new Ext.ux.ItemsStore({
	    url: paths.images.index,
	    autoLoad: true,
	    fields: [
		'id',
		'title',
		'os',
		'iqn',
		'comment',
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
		text: 'Edit',
		handler: function() {
		    var record = this.getSelectionModel().getSelected();
		    this.fireEvent('updateImage', record.data);
		}
	    }, {
		text: 'Destroy',
		handler: function() {
		    var record = this.getSelectionModel().getSelected();
		    this.fireEvent('destroyImage', record.data);
		}
	    }]
	});
    },

    addEventHandlers: function() {
	images.on('createdImage', this.addRecordDelegate);
	images.on('updatedImage', this.updateRecordDelegate);
	images.on('destroyedImage', this.destroyRecordDelegate);
    },

    removeEventHandlers: function() {
	images.un('createdImage', this.addRecordDelegate);
	images.un('updatedImage', this.updateRecordDelegate);
	images.un('destroyedImage', this.destroyRecordDelegate);
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
	}
	this.store.commitChanges();
    },

    destroyRecord: function(item) {
	var ri = this.store.findExact('id', item.id);
	if (ri != -1)
	    this.store.removeAt(ri);
    }

});
