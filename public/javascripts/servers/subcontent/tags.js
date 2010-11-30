Servers.SubcontentTab.TagsPanel = Ext.extend(Ext.Panel, {

    constructor: function() {
	this.makeComponents();

	this.addEvents('addTag');
	this.enableBubble('addTag');
	this.addEvents('destroyTag');

	this.showTagsDelegate = this.showTags.createDelegate(this);
	this.updateTagsDelegate = this.updateTags.createDelegate(this);
    },

    makeComponents: function() {
	this.makeAddComponents();

	Servers.SubcontentTab.TagsPanel.superclass.constructor.call(this, {
	    layout: 'vbox',
	    layoutConfig: {
		align: 'stretch'
	    },
	    width: 300,
	    height: 300,
	    border: false,
	    items: [{
		flex: 1,
		layout: 'fit',
		itemId: 'container',
		border: false
	    }, {
		layout: 'hbox',
		height: 27,
		border: false,
		items: [
		    this.addCombo,
		    this.addButton
		]
	    }],
	    listeners: {
		added: this.addEventHandlers.createDelegate(this),
		beforedestroy: this.removeEventHandlers.createDelegate(this)
	    }
	});
    },

    makeAddComponents: function() {
	this.addCombo = new Ext.ux.EditableStoreComboBox({
	    margins: '5 0 0 0',
	    flex: 1,
	    storeConfig: {
		url: paths.tags.index
	    }
	});

	this.addButton = new Ext.Button({
	    text: 'Add Tag',
	    width: 70,
	    margins: '5 0 0 5',
	    handler: function() {
		var value = this.addCombo.getValue();
		if (value == '')
		    return;
		this.fireEvent('addTag', {
		    'tag[server_id]': this.currentItem.server.id,
		    'tag[value]': value
		});
		this.addCombo.clearValue();
	    },
	    scope: this
	});
    },

    addEventHandlers: function() {
	servers.on('gotServer', this.showTagsDelegate);
	servers.on('addedTag', this.updateTagsDelegate);
	servers.on('destroyedTag', this.updateTagsDelegate);
	servers.on('updatedTags', this.updateTagsDelegate);
    },

    removeEventHandlers: function() {
	servers.un('gotServer', this.showTagsDelegate);
	servers.un('addedTag', this.updateTagsDelegate);
	servers.un('destroyedTag', this.updateTagsDelegate);
	servers.un('updatedTags', this.updateTagsDelegate);
    },

    showTags: function(item) {
	if (this.currentItem && this.currentItem.server.id == item.server.id)
	    return;

	this.tagsGrid = new Servers.SubcontentTab.TagsGrid({
	    url: item.server.paths.tags
	});

	var container = this.getComponent('container');
	container.removeAll();
	container.add(this.tagsGrid);

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

	this.addRecordDelegate =  this.addRecord.createDelegate(this);
	this.destroyRecordDelegate =  this.destroyRecord.createDelegate(this);
    },

    makeComponents: function(config) {
	this.makeColModel();
	this.makeStore(config);
	this.makeContextMenu();

	Servers.SubcontentTab.TagsGrid.superclass.constructor.call(this, {
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
		},
		added: this.addEventHandlers.createDelegate(this),
		beforedestroy: this.removeEventHandlers.createDelegate(this)
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
	    url: config.url,
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

    addEventHandlers: function() {
	servers.on('addedTag', this.addRecordDelegate);
	servers.on('destroyedTag', this.destroyRecordDelegate);
    },

    removeEventHandlers: function() {
	servers.on('addedTag', this.addRecordDelegate);
	servers.on('destroyedTag', this.destroyRecordDelegate);
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
