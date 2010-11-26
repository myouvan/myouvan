Servers.NewServerWindow.TagsPanel = Ext.extend(Ext.Panel, {

    constructor: function() {
	this.makeComponents();
    },

    makeComponents: function() {
	this.tagsGrid = new Servers.NewServerWindow.TagsGrid();
	this.makeAddComponents();

	Servers.NewServerWindow.TagsPanel.superclass.constructor.call(this, {
	    title: 'Add Tags',
	    layout: 'hbox',
	    layoutConfig: {
		align: 'stretch',
		pack: 'center',
	    },
	    border: false,
	    items: {
		width: 300,
		layout: 'vbox',
		layoutConfig: {
		    align: 'stretch'
		},
		defaults: {
		    margins: '5 0 2 0'
		},
		border: false,
		items: [
		    new Ext.Panel({
			flex: 1,
			layout: 'fit',
			border: false,
			items: this.tagsGrid
		    }),
		    new Ext.Panel({
			layout: 'hbox',
			height: 30,
			border: false,
			layoutConfig: {
			    align: 'middle'
			},
			defaults: {
			    margins: '0 2 0 2'
			},
			items: [
			    this.addCombo,
			    this.addButton
			]
		    })
		]
	    }
	});
    },

    makeAddComponents: function() {
	this.addCombo = new Ext.ux.EditableStoreComboBox({
	    flex: 1,
	    storeConfig: {
		url: paths.tags.index
	    }
	});

	this.addButton = new Ext.Button({
	    text: 'Add Tag',
	    width: 70,
	    handler: function() {
		var value = panel.addCombo.getValue();
		if (value == '')
		    return;
		this.tagsGrid.addTag(value);
		this.addCombo.reset();
	    },
	    scope: this
	});
    },

    resetPanel: function() {
	this.tagsGrid.resetGrid();
	this.addCombo.reset();
    },

    tags: function() {
	return this.tagsGrid.tags();
    }
});

Servers.NewServerWindow.TagsGrid = Ext.extend(Ext.grid.GridPanel, {

    constructor: function() {
	this.makeComponents();
    },

    makeComponents: function() {
	this.makeColModel();
	this.makeStore();
	this.makeContextMenu();

	Servers.NewServerWindow.TagsGrid.superclass.constructor.call(this, {
	    colModel: this.colModel,
	    store: this.store,
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
	this.colModel = new Ext.grid.ColumnModel([
	    {
		header: 'Value',
		dataIndex: 'value',
		width: 250,
		sortable: true
	    }
	]);
    },

    makeStore: function() {
	this.store = new Ext.data.ArrayStore({
	    fields: ['value']
	});
    },

    makeContextMenu: function() {
	this.contextMenu = new Ext.menu.Menu({
	    style: {
		overflow: 'visible'
	    },
	    items: [
		{
		    text: 'Delete',
		    handler: function() {
			var record = grid.getSelectionModel().getSelected();
			this.store.remove(record);
		    },
		    scope: this
		}
	    ],
	    scope: this
	});
    },

    addTag: function(value) {
	var RecordType = this.store.recordType;
	var record = new RecordType({
	    value: value
	});
	this.store.add(record);
    },

    resetGrid: function() {
	this.store.removeAll();
    },

    tags: function() {
	var tags = new Array();
	this.store.each(function(record) {
	    tags.push({ value: record.get('value') });
	});
	return tags;
    }

});
