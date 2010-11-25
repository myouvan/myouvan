Images.IndexGrid = Ext.extend(Ext.grid.GridPanel, {

    constructor: function() {
	this.contextMenu = this.makeContextMenu();
	Images.IndexGrid.superclass.constructor.call(this, {
	    colModel: this.makeColModel(),
	    store: this.makeStore(),
	    autoHeight: true,
	    listeners: {
		rowcontextmenu: function(grid, row, e) {
		    this.getSelectionModel().selectRow(row);
		    e.stopEvent();
		    this.contextMenu.showAt(e.getXY());
		}
	    }
	});
	this.getStore().load();
    },

    makeColModel: function() {
	return new Ext.grid.ColumnModel([
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
		header: 'IQN',
		dataIndex: 'iqn',
		width: 450,
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
	return itemsStore(paths.images.index, [
	    'id',
	    'title',
	    'os',
	    'iqn',
	    'comment',
	    'paths'
	]);
    },

    makeContextMenu: function() {
	var grid = this;
	return new Ext.menu.Menu({
	    style: {
		overflow: 'visible'
	    },
	    items: [
		{
		    text: 'Edit',
		    handler: function() {
			grid.updateImage();
		    }
		},
		{
		    text: 'Destroy',
		    handler: function() {
			grid.destroyImage();
		    }
		}
	    ]
	});
    },

    selectedId: function() {
	return this.getSelectionModel().getSelected().get('id');
    },

    selectedPaths: function() {
	return this.getSelectionModel().getSelected().get('paths');
    },

    addRecord: function(item) {
	var store = this.getStore();
	var RecordType = store.recordType;
	var record = new RecordType(item);
	store.add(record);
    },

    updateSelectedValues: function(item) {
	var record = grid.getSelectionModel().getSelected();
	for (var field in item) {
	    record.set(field, item[field]);
	    record.commit();
	}
    },

    removeSelected: function() {
	var record = grid.getSelectionModel().getSelected();
	this.getStore().remove(record);
    }

});
