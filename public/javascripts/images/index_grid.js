Images.IndexGrid = function() {

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

    var store = itemsStore(paths.images.index, [
	'id',
	'title',
	'os',
	'iqn',
	'comment',
	'paths'
    ]);

    var contextMenu = new Ext.menu.Menu({
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

    Images.IndexGrid.baseConstructor.apply(this, [{
	colModel: colModel,
	store: store,
	autoHeight: true,
	listeners: {
	    rowcontextmenu: function(g, row, e) {
		grid.getSelectionModel().selectRow(row);
		e.stopEvent();
		contextMenu.showAt(e.getXY());
	    }
	}
    }]);

    var grid = this;

    store.load();

    this.selectedId = function() {
	return grid.getSelectionModel().getSelected().get('id');
    };

    this.selectedPaths = function() {
	return grid.getSelectionModel().getSelected().get('paths');
    };

    this.addRecord = function(item) {
	var RecordType = store.recordType;
	var record = new RecordType(item);
	store.add(record);
    };

    this.updateSelectedValues = function(item) {
	var record = grid.getSelectionModel().getSelected();
	for (var field in item) {
	    record.set(field, item[field]);
	    record.commit();
	}
    };

    this.removeSelected = function() {
	var record = grid.getSelectionModel().getSelected();
	store.remove(record);
    };

};

Images.IndexGrid.inherit(Ext.grid.GridPanel);
