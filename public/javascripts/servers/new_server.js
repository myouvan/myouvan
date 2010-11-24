//------------------------------
//   form window
//------------------------------

var NewServerWindow = function() {

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
		items: imagesGrid
	    }
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
	    id: 'form_name',
	    fieldLabel: 'Name',
	    width: 100,
	    msgTarget: 'qtip'
	},
	{
	    xtype: 'textfield',
	    name: 'server[title]',
	    id: 'form_title',
	    fieldLabel: 'Title',
	    width: 200,
	    msgTarget: 'qtip'
	},
	new Ext.form.ComboBox({
	    name: 'server[zone]',
	    id: 'form_zone',
	    fieldLabel: 'Zone',
	    width: 150,
	    editable: false,
	    forceSelection: false,
	    triggerAction: 'all',
	    store: comboItemsStore(paths.servers.zones),
	    displayField: 'value',
	    msgTarget: 'qtip',
	    listeners: {
		select: function(combo, record, index) {
		    var psCombo = Ext.getCmp('form_physical_server');
		    psCombo.getStore().baseParams['zone'] = record.get('value');
		    psCombo.getStore().load();
		    psCombo.reset();
		    psCombo.enable();
		}
	    }
	}),
	new Ext.form.ComboBox({
	    name: 'server[physical_server]',
	    id: 'form_physical_server',
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
	    id: 'form_pool',
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
	    id: 'form_virtualization',
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
	    id: 'form_cpus',
	    fieldLabel: 'CPUs',
	    width: 100,
	    allowDecimals: false,
	    msgTarget: 'qtip'
	}),
	new Ext.form.NumberField({
	    name: 'server[memory]',
	    id: 'form_memory',
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
	    id: 'form_ip_address0',
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
	    id: 'form_ip_address1',
	    fieldLabel: 'IP Address(2)',
	    width: 150,
	    msgTarget: 'qtip'
	},
	{
	    xtype: 'textarea',
	    name: 'server[comment]',
	    id: 'form_comment',
	    fieldLabel: 'Comment',
	    width: 300,
	    height: 100
	},
	{
	    xtype: 'checkbox',
	    name: 'server[auto_restart]',
	    id: 'form_auto_restart',
	    fieldLabel: 'Auto Restart',
	    boxLabel: 'Restart automatically on unintentional shutdown',
	    inputValue: 'true'
	},
	{
	    xtype: 'hidden',
	    name: 'tags',
	    id: 'form_tags'
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
	width: 424,
	labelWidth: 100,
	labelAlign: 'right',
	bodyStyle: {
	    padding: '5px 0',
	},
	border: false,
	autoScroll: true,
	items: formItems
    });

    var formPanel = new Ext.Panel({
	layout: 'hbox',
	layoutConfig: {
	    align: 'stretch',
	    pack: 'center',
	},
	border: false,
	items: form
    });

    //--- tags panel

    var tagsGrid = (function() {
	var colModel = new Ext.grid.ColumnModel([
	    {
		header: 'Value',
		dataIndex: 'value',
		width: 250,
		sortable: true
	    }
	]);

	var store = new Ext.data.ArrayStore({
	    fields: ['value']
	});

	var contextMenu = new Ext.menu.Menu({
	    style: {
		overflow: 'visible'
	    },
	    items: [
		{
		    text: 'Delete',
		    handler: function() {
			var store = tagsGrid.getStore();
			store.remove(tagsGrid.selectedRecord());
		    }
		}
	    ]
	});

	var grid = new Ext.grid.GridPanel({
	    colModel: colModel,
	    store: store,
	    listeners: {
		rowcontextmenu: function(g, row, e) {
		    grid.getSelectionModel().selectRow(row);
		    e.stopEvent();
		    contextMenu.showAt(e.getXY());
		}
	    }
	});

	grid.selectedRecord = function() {
	    return grid.getSelectionModel().getSelected();
	};

	return grid;
    })();

    var addTagCombo = new Ext.form.ComboBox({
	flex: 1,
	editable: true,
	triggerAction: 'all',
	store: comboItemsStore(paths.tags.index),
	displayField: 'value'
    });

    var addTagButton = new Ext.Button({
	text: 'Add Tag',
	width: 70,
	handler: function() {
	    var value = addTagCombo.getValue();
	    if (value == '')
		return;

	    var store = tagsGrid.getStore();
	    var RecordType = store.recordType;
	    var record = new RecordType({
		value: value
	    });
	    store.add(record);
	    addTagCombo.reset();
	}
    });

    var tagsPanel = new Ext.Panel({
	layout: 'hbox',
	layoutConfig: {
	    align: 'stretch',
	    pack: 'center'
	},
	items: {
	    width: 300,
	    layout: 'vbox',
	    layoutConfig: {
		align: 'stretch'
	    },
	    border: false,
	    items: [
		{
		    height: 20,
		    html: 'Add Tags',
		    border: false,
		    bodyStyle: {
			padding: '3px'
		    }
		},
		new Ext.Panel({
		    flex: 1,
		    layout: 'fit',
		    border: false,
		    items: tagsGrid
		}),
		new Ext.Panel({
		    layout: 'hbox',
		    height: 30,
		    border: false,
		    bodyStyle: {
			padding: '5px 0 0 0'
		    },
		    items: [
			addTagCombo,
			{
			    border: false,
			    bodyStyle: {
				padding: '0 0 0 5px'
			    },
			    items: addTagButton
			}
		    ]
		})
	    ]
	}
    });

    //--- flash panel

    var flash = new Ext.Panel({
	layout: 'fit',
	border: false,
	html: '<div id="avatar-flash" />'
    });

    var showAvatarFlash = function() {
	swfobject.embedSWF('/ova.swf', 'avatar-flash', '630', '400', '9.0.0');
    };

    var setAvatar = function(thumb, icon) {
	Ext.getCmp('avatar_thumb').setValue(thumb);
	Ext.getCmp('avatar_icon').setValue(icon);
	nextButton.enable();
    };

    ovater_set = setAvatar;

    //--- card

    var activeItem = 0;

    var card = new Ext.Panel({
	layout: 'card',
	activeItem: 0,
	items: [
	    selectImage,
	    formPanel,
	    tagsPanel,
	    flash
	],
	width: 400
    });

    var prevCard = function() {
	if (activeItem == 1) {
	    prevButton.disable();

	    card.layout.setActiveItem(0);
	    activeItem = 0;
	} else if (activeItem == 2) {
	    card.layout.setActiveItem(1);
	    activeItem = 1;
	} else if (activeItem == 3) {
	    nextButton.setText('Next');
	    nextButton.enable();

	    card.layout.setActiveItem(1);
	    activeItem = 1;
	}
    };

    var nextCard = function() {
	if (activeItem == 0) {
	    if (!imagesGrid.getSelectionModel().hasSelection()) {
		Ext.MessageBox.alert('Error', 'Select an image');
		return;
	    }
	    var id = imagesGrid.getSelectionModel().getSelected().get('id');
	    Ext.getCmp('image-id').setValue(id);

	    prevButton.enable();

	    card.layout.setActiveItem(1);
	    activeItem = 1;
	} else if (activeItem == 1) {
	    card.layout.setActiveItem(2);
	    activeItem = 2;
	} else if (activeItem == 2) {
	    var tags = new Array();
	    tagsGrid.getStore().each(function(record) {
		tags.push({ value: record.get('value') });
	    });
	    Ext.getCmp('form_tags').setValue(Ext.encode(tags));

	    showAvatarFlash();

	    nextButton.setText('Create');
	    nextButton.disable();

	    card.layout.setActiveItem(3);
	    activeItem = 3;
	} else if (activeItem == 3) {
	    prevCard();
	    createServer();
	}
    };

    //--- buttons

    var prevButton = new Ext.Button({
	text: 'Prev',
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
	    beforeshow: function() {
		activeItem = 0;
		card.layout.setActiveItem(0);

		prevButton.disable();
		nextButton.setText('Next');
		nextButton.enable();

		imagesGrid.getStore().load();
		imagesGrid.getSelectionModel().clearSelections();

		form.getForm().reset();
		Ext.getCmp('form_physical_server').disable();

		tagsGrid.getStore().removeAll();
		addTagCombo.reset();
	    }
	}
    });

    this.form = form;
    this.show = function() { wdw.show(); };
    this.hide = function() { wdw.hide(); };
    this.destroy = function() { wdw.destroy(); };
};
