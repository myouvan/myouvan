Servers.NewServerWindow.TagsPanel = Ext.extend(Ext.Panel, {

    constructor: function() {
	this.makeComponents();
    },

    makeComponents: function() {
	this.tagsGrid = new Servers.NewServerWindow.TagsGrid();
	this.makeAddComponents();

	Servers.NewServerWindow.TagsPanel.superclass.constructor.call(this, {
	    title: 'Add Tags',
	    itemId: 'tags',
	    layout: 'hbox',
	    layoutConfig: {
		align: 'stretch',
		pack: 'center'
	    },
	    padding: 10,
	    border: false,
	    items: {
		width: 300,
		layout: 'vbox',
		layoutConfig: {
		    align: 'stretch'
		},
		border: false,
		items: [
		    {
			flex: 1,
			layout: 'fit',
			border: false,
			items: this.tagsGrid
		    },
		    this.addComponents
		]
	    }
	});
    },

    makeAddComponents: function() {
	this.addComponents = {
	    layout: 'hbox',
	    layoutConfig: {
		align: 'stretch'
	    },
	    height: 22,
	    border: false,
	    margins: '5 0 0 0',
	    items: [{
		flex: 1,
		layout: 'absolute',
		border: false,
		items: {
		    x: 0,
		    y: Ext.isIE ? 1 : 0,
		    anchor: '100%',
		    xtype: 'editablestorecombobox',
		    itemId: 'addCombo',
		    storeConfig: {
			url: paths.tags.index
		    },
		}
	    }, {
		width: 70,
		margins: '0 0 0 5',
		border: false,
		layout: 'anchor',
		items: {
		    anchor: '100%',
		    xtype: 'button',
		    text: 'Add Tag',
		    handler: function() {
			var addCombo = this.find('itemId', 'addCombo')[0];
			var value = addCombo.getValue();
			if (value == '')
			    return;
			this.tagsGrid.addTag(value);
			addCombo.reset();
		    },
		    scope: this
		}
	    }]
	};
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
	    autoExpandColumn: 'value',
	    stripeRows: true,
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
	this.colModel = new Ext.grid.ColumnModel([{
	    header: 'Tags',
	    dataIndex: 'value',
	    sortable: true,
	    id: 'value'
	}]);
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
	    items: {
		text: 'Delete',
		handler: function() {
		    var record = grid.getSelectionModel().getSelected();
		    this.store.remove(record);
		},
		scope: this
	    },
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

    tags: function() {
	var tags = new Array();
	this.store.each(function(record) {
	    tags.push({ value: record.get('value') });
	});
	return tags;
    }

});
