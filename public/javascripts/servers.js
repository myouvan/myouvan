var showServers = function() {

    //------------------------------
    //   handlers
    //------------------------------

    var newServer = function() {
	formWindow.show();
    };

    //------------------------------
    //   create button
    //------------------------------

    var createButton = new Ext.Button({
	text: 'Create Server',
	border: false,
	handler: newServer
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
		header: 'Image ID',
		dataIndex: 'image_id',
		width: 60,
		sortable: true
	    },
	    {
		header: 'Name',
		dataIndex: 'name',
		width: 120,
		sortable: true
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
		sortable: true
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

	var grid = new Ext.grid.GridPanel({
	    colModel: colModel,
	    store: store,
	    autoHeight: true
	});

	grid.getStore().load();

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

	//--- select image card

	var imagesGrid = (function() {
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

	var selectImage = new Ext.Panel({
	    border: false,
	    items: [
		{
		    html: 'Select Image',
		    bodyStyle: {
			padding: '3px'
		    },
		    border: false
		},
		imagesGrid
	    ]
	});

	//--- form card

	var formItems = [
	    {
		xtype: 'hidden',
		name: 'server[image_id]',
		id: 'image-id'
	    },
	    {
		xtype: 'textfield',
		name: 'server[name]',
		fieldLabel: 'Name',
		width: 100,
		msgTarget: 'qtip'
	    },
	    {
		xtype: 'textfield',
		name: 'server[title]',
		fieldLabel: 'Title',
		width: 200,
		msgTarget: 'qtip'
	    },
	    new Ext.form.ComboBox({
		name: 'server[zone]',
		fieldLabel: 'Zone',
		width: 150,
		editable: false,
		forceSelection: false,
		triggerAction: 'all',
		store: comboItemsStore(paths.servers.zones),
		displayField: 'value',
		msgTarget: 'qtip'
	    }),
	    new Ext.form.ComboBox({
		name: 'server[physical_server]',
		fieldLabel: 'Physical Server',
		width: 150,
		editable: false,
		forceSelection: false,
		triggerAction: 'all',
		store: comboItemsStore(paths.servers.physical_servers),
		displayField: 'value',
		msgTarget: 'qtip'
	    }),
	    new Ext.form.ComboBox({
		name: 'server[pool]',
		fieldLabel: 'Pool',
		width: 150,
		editable: false,
		forceSelection: false,
		triggerAction: 'all',
		store: comboItemsStore(paths.servers.pools),
		displayField: 'value',
		msgTarget: 'qtip'
	    }),
	    new Ext.form.ComboBox({
		name: 'server[virtualization]',
		fieldLabel: 'Virtualization',
		width: 200,
		editable: false,
		forceSelection: false,
		triggerAction: 'all',
		store: comboItemsStore(paths.servers.virtualizations),
		displayField: 'value',
		msgTarget: 'qtip'
	    }),
	    new Ext.form.NumberField({
		name: 'server[cpus]',
		fieldLabel: 'CPUs',
		width: 100,
		allowDecimals: false,
		msgTarget: 'qtip'
	    }),
	    new Ext.form.NumberField({
		name: 'server[memory]',
		fieldLabel: 'Memory(MB)',
		width: 100,
		allowDecimals: false,
		msgTarget: 'qtip'
	    }),
	    {
		xtype: 'hidden',
		name: 'interface[0][number]',
		value: '0'
	    },
	    {
		xtype: 'textfield',
		name: 'interface[0][ip_address]',
		fieldLabel: 'IP Address(1)',
		width: 150,
		msgTarget: 'qtip'
	    },
	    {
		xtype: 'hidden',
		name: 'interface[1][number]',
		value: '1'
	    },
	    {
		xtype: 'textfield',
		name: 'interface[1][ip_address]',
		fieldLabel: 'IP Address(2)',
		width: 150,
		msgTarget: 'qtip'
	    },
	    {
		xtype: 'textarea',
		name: 'server[comment]',
		fieldLabel: 'Comment',
		width: 300,
		height: 100
	    },
	    {
		xtype: 'hidden',
		name: 'avatar[thumb]',
		id: 'avatar_thumb'
	    },
	    {
		xtype: 'hidden',
		name: 'avatar[icon]',
		id: 'avatar_icon'
	    }
	];

	var form = new Ext.form.FormPanel({
	    labelWidth: 100,
	    bodyStyle: { padding: '5px 113px' },
	    border: false,
	    autoScroll: true,
	    items: formItems
	});

	//--- card

	var activeItem = 0;

	var card = new Ext.Panel({
	    layout: 'card',
	    activeItem: 0,
	    items: [
		selectImage,
		form,
	    ],
	    width: 400
	});

	var prevCard = function() {
	    if (activeItem == 1) {
		card.layout.setActiveItem(0);
		activeItem = 0;
		prevButton.disable();
	    }
	};

	var nextCard = function() {
	    if (activeItem == 0) {
		card.layout.setActiveItem(1);
		activeItem = 1;
		prevButton.enable();
	    }
	};

	//--- buttons

	var prevButton = new Ext.Button({
	    text: 'Prev',
	    disabled: true,
	    handler: prevCard
	});

	var nextButton = new Ext.Button({
	    text: 'Next',
	    handler: nextCard
	});

	var closeButton = new Ext.Button({
	    text: 'Close',
	    handler: function() {
		wdw.hide();
	    }
	});

	//--- window

	var wdw = new Ext.Window({
	    title: 'Create Server',
	    modal: true,
	    width: 650,
	    height: 468,
	    layout: 'fit',
	    plain: true,
	    closable: false,
	    items: card,
	    buttonAlign: 'center',
	    buttons: [
		prevButton,
		nextButton,
		closeButton
	    ],
	    listeners: {
		show: function() {
		    imagesGrid.getStore().load();
		}
	    }
	});

	wdw.form = form;

	return wdw;
    })();

    //------------------------------
    //   layout
    //------------------------------

    Ext.getCmp('subcontent').show();
    Ext.getCmp('content').removeAll();
    Ext.getCmp('content').add(indexPanel);
    Ext.getCmp('content-container').doLayout();

};
