Servers.Subcontent.Tags = Ext.extend(Ext.Panel, {

    constructor: function() {
	this.makeComponents();
	this.initHandlers();

	this.addEvents('addTag');
	this.enableBubble('addTag');
    },

    makeComponents: function() {
	this.makeAddComponents();

	Servers.Subcontent.Tags.superclass.constructor.call(this, {
	    layout: 'vbox',
	    layoutConfig: {
		align: 'stretch'
	    },
	    width: 300,
	    height: 300,
	    border: false,
	    items: [
		{
		    flex: 1,
		    xtype: 'container',
		    layout: 'fit',
		    itemId: 'container'
		},
		this.addComponents
	    ]
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
		xtype: 'container',
		layout: 'absolute',
		items: {
		    x: 0,
		    y: Ext.isIE ? 1 : 0,
		    anchor: '100%',
		    xtype: 'editablestorecombobox',
		    itemId: 'addCombo',
		    storeConfig: {
			url: paths.tags.combo_items
		    },
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
			this.fireEvent('addTag', {
			    'tag[server_id]': this.currentItem.id,
			    'tag[value]': value
			});
			addCombo.clearValue();
		    },
		    scope: this
		}
	    }]
	};
    },

    initHandlers: function() {
	this.setDynamicHandlers({
	    target: servers,
	    handlers: [{
		event: 'gotServer',
		fn: this.showTags
	    }, {
		event: 'addedTag',
		fn: this.updateTags
	    }, {
		event: 'destroyedTag',
		fn: this.updateTags
	    }, {
		event: 'updatedTag',
		fn: this.updateTags
	    }]
	});
    },

    showTags: function(item) {
	if (this.currentItem && this.currentItem.id == item.id)
	    return;

	this.tagsGrid = new Servers.Subcontent.TagsGrid({
	    item: item
	});

	var container = this.getComponent('container');
	container.removeAll();
	container.add(this.tagsGrid);

	this.currentItem = item;
    },

    updateTags: function() {
	var addCombo = this.find('itemId', 'addCombo')[0];
	addCombo.getStore().load();
    }

});

Servers.Subcontent.TagsGrid = Ext.extend(Ext.grid.GridPanel, {

    constructor: function(config) {
	this.makeComponents(config);

	this.addEvents('destroyTag');
	this.enableBubble('destroyTag');

	this.initHandlers();
    },

    makeComponents: function(config) {
	this.makeColModel();
	this.makeStore(config);
	this.makeContextMenu();

	Servers.Subcontent.TagsGrid.superclass.constructor.call(this, {
	    colModel: this.colModel,
	    store: this.store,
	    autoExpandColumn: 'value',
	    stripeRows: true,
	    loadMask: true,
	    listeners: {
		rowcontextmenu: function(grid, row, e) {
		    grid.getSelectionModel().selectRow(row);
		    e.stopEvent();
		    grid.contextMenu.showAt(e.getXY());
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

    makeStore: function(config) {
	this.store = new Ext.ux.ItemsStore({
	    url: paths.tags.index,
	    baseParams: {
		server_id: config.item.id
	    },
	    autoLoad: true,
	    fields: [
		'id',
		'value',
		'paths'
	    ],
	    storeId: 'id'
	});
    },

    makeContextMenu: function() {
	this.contextMenu = new Ext.menu.Menu({
	    style: {
		overflow: 'visible'
	    },
	    items: [{
		text: 'Delete',
		handler: function() {
		    var record = this.getSelectionModel().getSelected();
		    this.fireEvent('destroyTag', record.data);
		},
		scope: this
	    }]
	});
    },

    initHandlers: function() {
	this.setDynamicHandlers({
	    target: servers,
	    handlers: [{
		event: 'addedTag',
		fn: this.store.addRecord
	    }, {
		event: 'destroyedTag',
		fn: this.store.destroyRecord
	    }],
	    scope: this.store
	});
    }

});
