var showImages = function() {

    //------------------------------
    //   windows, panels
    //------------------------------

    var newImageWindow = new NewImageWindow();

    //------------------------------
    //   handlers
    //------------------------------

    var newImage = function() {
	newImageWindow.setForCreate({
            url: paths.images.index,
            method: 'POST',
            waitMsg: 'Creating...',
            success: function(f, action) {
		var image = action.result.image;
		var store = indexGrid.getStore();

		var RecordType = store.recordType;
		var record = new RecordType(image);
		store.add(record);

		newImageWindow.hide();
            },
            failure: function(f, action) {
		Ext.MessageBox.alert('Error', 'Failed to create image');
            }
	});
	newImageWindow.show();
    };

    var editImage = function() {
	var record = indexGrid.selectedRecord();
	newImageWindow.setForUpdate({
            url: record.get('paths').image,
            method: 'PUT',
            waitMsg: 'Updating...',
            success: function(f, action) {
		var image = action.result.image;
		for (var field in image)
                    record.set(field, image[field]);
		record.commit();

		newImageWindow.hide();
            },
            failure: function(form, action) {
		alert('Failed to update image');
            }
	});

	Ext.Ajax.request({
	    url: record.get('paths').image,
	    method: 'GET',
	    success: function(res, opts) {
		result = Ext.decode(res.responseText);
		newImageWindow.setValues(result.image);
		newImageWindow.show();
	    },
	    failure: function(res, opts) {
		alert('Error');
	    }
	});
    };

    var destroyImage = function() {
	var record = indexGrid.selectedRecord();
	Ext.Ajax.request({
	    url: record.get('paths').image,
	    method: 'DELETE',
	    success: function(res, opts) {
		indexGrid.getStore().remove(record);
	    },
	    failure: function(res, opts) {
		alert('Error');
	    }
	});
    };

    //------------------------------
    //   create button
    //------------------------------

    var createButton = new Ext.Button({
	text: 'Create Image',
	border: false,
	handler: newImage
    });

    //------------------------------
    //   index grid
    //------------------------------

    var indexGrid = (function() {
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
		    handler: editImage
		},
		{
		    text: 'Destroy',
		    handler: destroyImage
		}
	    ]
	});

	var grid = new Ext.grid.GridPanel({
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
	layout: 'vbox',
	layoutConfig: {
	    align: 'stretch'
	},
	items: [
	    {
		height: 30,
		border: false,
		items: createButton
	    },
	    {
		flex: 1,
		layout: 'fit',
		border: false,
		items: indexGrid
	    }
	],
	listeners: {
	    destroy: function() {
		newImageWindow.destroy();
	    }
	}
    });

    //------------------------------
    //   layout
    //------------------------------

    Ext.getCmp('subcontent').hide();
    Ext.getCmp('content').removeAll();
    Ext.getCmp('content').add(indexPanel);
    Ext.getCmp('content-container').doLayout();

};
