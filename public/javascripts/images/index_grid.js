Images.IndexGrid = Ext.extend(Ext.grid.GridPanel, {

    constructor: function() {
	this.makeComponents();
	this.initHandlers();

	var events = [
	    'updateImage',
	    'destroyImage'
	];
	this.addEvents(events);
	this.enableBubble(events);
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
		}
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
		text: 'Edit Image',
		handler: function() {
		    var record = this.getSelectionModel().getSelected();
		    this.fireEvent('updateImage', record.data);
		}
	    }, {
		text: 'Destroy MetaData',
		handler: function() {
		    var record = this.getSelectionModel().getSelected();
		    this.fireEvent('destroyImage', record.data);
		}
	    }]
	});
    },

    initHandlers: function() {
	this.setDynamicHandlers({
	    target: images,
	    handlers: [{
		event: 'createdImage',
		fn: this.store.addRecord
	    }, {
		event: 'updatedImage',
		fn: this.store.updateRecord
	    }, {
		event: 'destroyedImage',
		fn: this.store.destroyRecord
	    }],
	    scope: this.store
	});
    }

});
