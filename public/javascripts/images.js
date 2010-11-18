var showImages = function() {

    //------------------------------
    //   handlers
    //------------------------------

    var newImage = function() {
	formWindow.setTitle('Create Image');
	formWindow.submitButton.setText('Create');
	formWindow.submitButton.setHandler(createImage);

	Ext.Ajax.request({
	    url: paths.images.new,
	    method: 'GET',
	    success: function(res, opts) {
		result = Ext.decode(res.responseText);
		setComboItems('formOs', result.comboItems.os);
		setComboItems('formIqn', result.comboItems.iqn);

		formWindow.show();
	    },
	    failure: function(res, opts) {
		alert('Error');
	    }
	});
    };

    var createImage = function() {
	formWindow.form.getForm().submit({
            url: paths.images.index,
            method: 'post',
            waitMsg: 'Creating...',
            success: function(f, action) {
		var data = action.result.image;
		var store = indexGrid.getStore();

		var RecordType = store.recordType;
		var record = new RecordType(data);
		store.add(record);

		formWindow.form.getForm().reset();
		formWindow.hide();
            },
            failure: function(f, action) {
		Ext.MessageBox.alert('Error', 'Failed to create image');
            }
	});
    };

    var setComboItems = function(comboId, items) {
	var store = Ext.getCmp(comboId).getStore();
	var RecordType = store.recordType;
	for (var i = 0; i < items.length; i++) {
	    var record = new RecordType({ value: items[i] });
	    store.add(record);
	}
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

	var store = new Ext.data.JsonStore({
	    autoDestroy: true,
	    autoLoad: true,
	    autoSave: false,
	    proxy: new Ext.data.HttpProxy({
		url: paths.images.index,
		method: 'GET',
		headers: {
		    Accept: 'application/json'
		}
	    }),
	    root: 'images',
	    fields: [
		'id',
		'title',
		'os',
		'iqn',
		'comment',
		'paths'
	    ]
	});

	var grid = new Ext.grid.GridPanel({
	    colModel: colModel,
	    store: store,
	    autoHeight: true
	});

	return grid;
    })();

    //------------------------------
    //   index panel
    //------------------------------

    var indexPanel = new Ext.Panel({
	items: [
	    createButton,
	    indexGrid
	]
    });

    //------------------------------
    //   form window
    //------------------------------

    var formWindow = (function() {
	var formItems = [
	    {
		xtype: 'textfield',
		name: 'image[title]',
		id: 'formTitle',
		fieldLabel: 'Title',
		width: 200,
		msgTarget: 'qtip'
	    },
	    new Ext.form.ComboBox({
		name: 'image[os]',
		id: 'formOs',
		fieldLabel: 'OS',
		width: 200,
		mode: 'local',
		editable: false,
		forceSelection: false,
		triggerAction: 'all',
		store: new Ext.data.ArrayStore({
		    fields: [{ name: 'value' }]
		}),
		displayField: 'value',
		msgTarget: 'qtip'
	    }),
	    new Ext.form.ComboBox({
		name: 'image[iqn]',
		id: 'formIqn',
		fieldLabel: 'IQN',
		width: 500,
		mode: 'local',
		editable: false,
		forceSelection: false,
		triggerAction: 'all',
		store: new Ext.data.ArrayStore({
		    fields: [{ name: 'value' }]
		}),
		displayField: 'value',
		msgTarget: 'qtip'
	    }),
	    {
		xtype: 'textarea',
		name: 'image[comment]',
		id: 'formComment',
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

	var submitButton = new Ext.Button();

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
		{
		    text: 'Close',
		    handler: function() {
			form.getForm().reset();
			wdw.hide();
		    }
		}
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
