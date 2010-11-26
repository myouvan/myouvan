Servers.SubcontentTab.TagsPanel = Ext.extend(Ext.Panel, {

    constructor: function() {
	this.makeComponents();

	this.addEvents('addTag');
	this.enableBubble('addTag');
	this.addEvents('destroyTag');
    },

    makeComponents: function() {
	this.makeTagsGridContainer();
	this.makeAddComponents();

	Servers.SubcontentTab.TagsPanel.superclass.constructor.call(this, {
	    layout: 'fit',
	    width: 300,
	    height: 300,
	    border: false,
	    items: {
		layout: 'vbox',
		layoutConfig: {
		    align: 'stretch'
		},
		border: false,
		items: [
		    this.tagsGridContainer,
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
	    },
	    listeners: {
		added: this.addEventHandlers,
		destroy: this.removeEventHandlers,
	    }
	});
    },

    makeTagsGridContainer: function() {
	this.tagsGridContainer = new Ext.Panel({
	    flex: 1,
	    layout: 'fit',
	    border: false
	});
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
		var value = this.addCombo.getValue();
		if (value == '')
		    return;
		this.fireEvent('addTag', {
		    'tag[server_id]': this.currentItem.server.id,
		    'tag[value]': value
		});
	    },
	    scope: this
	});
    },

    addEventHandlers: function() {
	servers.on('gotServer', this.showTags.createDelegate(this));
	servers.on('addedTag', this.updateTags.createDelegate(this));
	servers.on('destroyedTag', this.updateTags.createDelegate(this));
    },

    removeEventHandlers: function() {
	servers.un('gotServer', this.showTags.createDelegate(this));
	servers.un('addedTag', this.updateTags.createDelegate(this));
	servers.un('destroyedTag', this.updateTags.createDelegate(this));
    },

    showTags: function(item) {
	this.tagsGrid = new Servers.SubcontentTab.TagsGrid({
	    url: item.server.paths.tags
	});

	this.tagsGridContainer.removeAll();
	this.tagsGridContainer.add(this.tagsGrid);

	this.currentItem = item;
    },

    updateTags: function() {
	this.addCombo.getStore().load();
    }

});

Servers.SubcontentTab.TagsGrid = Ext.extend(Ext.grid.GridPanel, {

    constructor: function(config) {
	this.makeComponents(config);

	this.addEvents('destroyTag');
	this.enableBubble('destroyTag');
    },

    makeComponents: function(config) {
	this.makeColModel();
	this.makeStore(config);
	this.makeContextMenu();

	Servers.SubcontentTab.TagsGrid.superclass.constructor.call(this, {
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

    makeStore: function(config) {
	this.store = new Ext.ux.ItemsStore({
	    url: config.url,
	    autoLoad: true,
	    fields: ['value', 'paths']
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
			this.fireEvent('destroyTag', record.data);
		    }
		}
	    ],
	    scope: this
	});
    },

    addEventHandlers: function() {
	servers.on('addedTag', this.addRecord.createDelegate(this));
	servers.on('destroyedTag', this.destroyRecord.createDelegate(this));
    },

    removeEventHandlers: function() {
	servers.on('addedTag', this.addRecord.createDelegate(this));
	servers.on('destroyedTag', this.destroyRecord.createDelegate(this));
    },

    addRecord: function(item) {
	var RecordType = this.store.recordType;
	var record = new RecordType(item);
	this.store.add(record);
    },

    destroyRecord: function(item) {
	var ri = this.store.findExact('id', item.id);
	if (ri != -1)
	    this.store.removeAt(ri);
    }

});
