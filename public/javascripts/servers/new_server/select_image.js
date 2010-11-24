var SelectImagePanel = function() {

    var grid = (function() {
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

    SelectImagePanel.baseConstructor.apply(this, [{
	layout: 'vbox',
	layoutConfig: {
	    align: 'stretch'
	},
	border: false,
	items: [
	    {
		height: 20,
		html: 'Select Image',
		bodyStyle: {
		    padding: '3px'
		},
		border: false
	    },
	    {
		flex: 1,
		layout: 'fit',
		border: false,
		items: grid
	    }
	]
    }]);

    this.isSelected = function() {
	return grid.getSelectionModel().hasSelection();
    };

    this.selectedId = function() {
	return grid.getSelectionModel().getSelected().get('id');	
    };

    this.resetPanel = function() {
	grid.getStore().load();
	grid.getSelectionModel().clearSelections();
    };
};

SelectImagePanel.inherit(Ext.Panel);
