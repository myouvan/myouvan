Servers.NewServerWindow.Tags = Ext.extend(Ext.Panel, {

    constructor: function() {
	this.makeComponents();
    },

    makeComponents: function() {
	this.tagsGrid = new Servers.NewServerWindow.TagsGrid();
	this.makeAddComponents();

	Servers.NewServerWindow.Tags.superclass.constructor.call(this, {
	    title: 'Add Tags',
	    itemId: 'tags',
	    layout: 'hbox',
	    layoutConfig: {
		align: 'stretch',
		pack: 'center'
	    },
	    padding: 10,
	    items: [{
		xtype: 'container',
		width: 300,
		layout: 'vbox',
		layoutConfig: {
		    align: 'stretch'
		},
		items: [
		    {
			xtype: 'container',
			flex: 1,
			layout: 'fit',
			items: this.tagsGrid
		    },
		    this.addComponents
		]
	    }, {
		xtype: 'container',
		itemId: 'container'
	    }]
	});
    },

    makeAddComponents: function() {
	this.addComponents = {
	    xtype: 'container',
	    layout: 'hbox',
	    layoutConfig: {
		align: 'stretch'
	    },
	    height: 23,
	    margins: '5 0 0 0',
	    items: [{
		flex: 1,
		xtype: 'editablestorecombobox',
		itemId: 'addCombo',
		style: {
		    marginTop: Ext.isIE ? '1px' : '0px'
		},
		storeConfig: {
		    url: paths.tags.index
		}
	    }, {
		width: 70,
		xtype: 'container',
		margins: '0 0 0 5',
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

    onNext: function() {
	var container = this.getComponent('container');
	container.removeAll();

	var tags = this.tagsGrid.getTags();
	for (var i = 0; i < tags.length; ++i) {
	    var tag = tags[i];
	    for (var field in tag)
		container.add({
		    xtype: 'hidden',
		    name: 'tags[][' + field + ']',
		    value: tag[field]
		});
	}

	container.doLayout();
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
		    var record = this.getSelectionModel().getSelected();
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

    getTags: function() {
	var tags = new Array();
	this.store.each(function(record) {
	    tags.push(record.data);
	});
	return tags;
    }

});
