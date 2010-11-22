var showImages = function() {

    //------------------------------
    //   handlers
    //------------------------------

    var newImage = function() {
	newImageWindow.form.getForm().reset();
	newImageWindow.setTitle('Create Image');
	newImageWindow.submitButton.setText('Create');
	newImageWindow.submitButton.setHandler(createImage);

	newImageWindow.show();
    };

    var createImage = function() {
	newImageWindow.form.getForm().submit({
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
    };

    var editImage = function() {
	newImageWindow.form.getForm().reset();
	newImageWindow.setTitle('Update Image');
	newImageWindow.submitButton.setText('Update');
	newImageWindow.submitButton.setHandler(updateImage);

	var record = indexGrid.selectedRecord();
	Ext.Ajax.request({
	    url: record.get('paths').edit,
	    method: 'GET',
	    success: function(res, opts) {
		result = Ext.decode(res.responseText);

		for (var field in result.values) {
		    var cmp = Ext.getCmp('form_' + field);
		    if (cmp)
			cmp.setValue(result.values[field]);
		}

		newImageWindow.show();
	    },
	    failure: function(res, opts) {
		alert('Error');
	    }
	});
    };

    var updateImage = function() {
	var record = indexGrid.selectedRecord();
	newImageWindow.form.getForm().submit({
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
	items: [
	    {
		region: 'north',
		height: 30,
		items: createButton
	    },
	    new Ext.Panel({
		region: 'center',
		layout: 'fit',
		border: false,
		items: indexGrid
	    })
	],
	listeners: {
	    destroy: function() {
		newImageWindow.destroy();
	    }
	}
    });

    //------------------------------
    //   form window
    //------------------------------

    var newImageWindow = (function() {

	//--- form

	var formItems = [
	    {
		xtype: 'textfield',
		name: 'image[title]',
		id: 'form_title',
		fieldLabel: 'Title',
		width: 200,
		msgTarget: 'qtip'
	    },
	    new Ext.form.ComboBox({
		name: 'image[os]',
		id: 'form_os',
		fieldLabel: 'OS',
		width: 200,
		editable: false,
		forceSelection: false,
		triggerAction: 'all',
		store: comboItemsStore(paths.images.oss),
		displayField: 'value',
		msgTarget: 'qtip'
	    }),
	    new Ext.form.ComboBox({
		name: 'image[iqn]',
		id: 'form_iqn',
		fieldLabel: 'IQN',
		width: 500,
		editable: false,
		forceSelection: false,
		triggerAction: 'all',
		store: comboItemsStore(paths.images.iqns),
		displayField: 'value',
		msgTarget: 'qtip'
	    }),
	    {
		xtype: 'textarea',
		name: 'image[comment]',
		id: 'form_comment',
		fieldLabel: 'Comment',
		width: 300,
		height: 100
	    }
	];

	var form = new Ext.form.FormPanel({
	    labelWidth: 70,
	    bodyStyle: { padding: '5px' },
	    items: formItems
	});

	//--- buttons

	var submitButton = new Ext.Button();
	var closeButton = new Ext.Button({
	    text: 'Close',
	    handler: function() {
		wdw.hide();
	    }
	});

	//--- window

	var wdw = new Ext.Window({
	    modal: true,
	    width: 625,
	    height: 260,
	    layout: 'fit',
	    plain: true,
	    closable: false,
	    items: form,
	    buttonAlign: 'center',
	    buttons: [
		submitButton,
		closeButton
	    ]
	});

	wdw.form = form;
	wdw.submitButton = submitButton;

	return wdw;
    })();

    //------------------------------
    //   layout
    //------------------------------

    Ext.getCmp('subcontent').hide();
    Ext.getCmp('content').removeAll();
    Ext.getCmp('content').add(indexPanel);
    Ext.getCmp('content-container').doLayout();

};
