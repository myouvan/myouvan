Servers.NewServerWindow.TagsPanel = Ext.extend(Ext.Panel, {

    constructor: function() {
	this.makeComponents();
	Servers.NewServerWindow.TagsPanel.superclass.constructor.call(this, {
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
			items: this.grid
		    }),
		    new Ext.Panel({
			layout: 'hbox',
			height: 30,
			border: false,
			bodyStyle: {
			    padding: '5px 0 0 0'
			},
			items: [
			    this.addCombo,
			    {
				border: false,
				bodyStyle: {
				    padding: '0 0 0 5px'
				},
				items: this.addButton
			    }
			]
		    })
		]
	    }
	});
    },

    makeComponents: function() {
	this.grid = new Servers.NewServerWindow.TagsGrid();
	this.makeAddComponents();
    },

    makeAddComponents: function() {
	this.addCombo = new Ext.ux.EditableStoreComboBox({
	    flex: 1,
	    storeConfig: {
		url: paths.tags.index
	    }
	});

	var panel = this;

	this.addButton = new Ext.Button({
	    text: 'Add Tag',
	    width: 70,
	    handler: function() {
		var value = panel.addCombo.getValue();
		if (value == '')
		    return;
		panel.grid.addTag(value);
		panel.addCombo.reset();
	    }
	});
    },

    resetPanel: function() {
	this.grid.resetGrid();
	this.addCombo.reset();
    },

    tags: function() {
	return this.grid.tags();
    }
});

Servers.NewServerWindow.TagsGrid = Ext.extend(Ext.grid.GridPanel, {

    constructor: function() {
	this.makeComponents();
	Servers.NewServerWindow.TagsGrid.superclass.constructor.call(this, {
	    colModel: this.colModel,
	    store: this.store,
	    listeners: {
		rowcontextmenu: function(grid, row, e) {
		    grid.getSelectionModel().selectRow(row);
		    e.stopEvent();
		    grid.contextMenu.showAt(e.getXY());
		}
	    }
	});
    },

    makeComponents: function() {
	this.makeColModel();
	this.makeStore();
	this.makeContextMenu();
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
	var grid = this;
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
		    }
		}
	    ]
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
