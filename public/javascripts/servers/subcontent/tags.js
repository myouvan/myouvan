Servers.SubcontentTab.TagsPanel = Ext.extend(Ext.Panel, {

    constructor: function() {
	this.makeComponents();
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
	    }
	});
    },

    makeComponents: function() {
	this.makeTagsGridContainer();
	this.makeAddComponents();
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
		var value = panel.addCombo.getValue();
		if (value == '')
		    return;

		panel.addTag(value);
	    }
	});
    },

    showContent: function(item) {
	this.currentItem = item;

	this.tagsGrid = new Servers.SubcontentTab.TagsGrid({
	    url: item.server.paths.tags
	});

	this.tagsGridContainer.removeAll();
	this.tagsGridContainer.add(this.tagsGrid);

	var panel = this;
	this.tagsGrid.destroyTag = function(config) {
	    panel.destroyTag(config);
	}
    },

    addTag: function(value) {
	var panel = this;
	Ext.Ajax.request({
	    url: paths.tags.index,
	    method: 'POST',
	    params: {
		'tag[server_id]': this.currentItem.server.id,
		'tag[value]': value
	    },
	    success: function(res, opts) {
		var result = Ext.decode(res.responseText);
		panel.tagsGrid.addTag(result.item);
		panel.addCombo.reset();
		subcontentTab.updateTags();
	    },
	    failure: function(res, opts) {
		Ext.MessageBox.alert('Error', 'Failed to add tag');
	    }
	});
    },

    destroyTag: function(url) {
	Ext.Ajax.request({
	    url: url,
	    method: 'DELETE',
	    success: function(res, opts) {
		indexPanel.updateTags();
		subcontentTab.updateTags();
	    },
	    failure: function(res, opts) {
		Ext.MessageBox.alert('Error', 'Failed to add tag');
	    }
	});
    }

});

Servers.SubcontentTab.TagsGrid = Ext.extend(Ext.grid.GridPanel, {

    constructor: function(config) {
	this.makeComponents(config);
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

    makeComponents: function(config) {
	this.makeColModel();
	this.makeStore(config);
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

    makeStore: function(config) {
	this.store = new Ext.ux.ItemsStore({
	    url: config.url,
	    autoLoad: true,
	    fields: ['value', 'paths']
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
			grid.destroyTag({
			    url: record.get('paths').tag
			});
			grid.store.remove(record);
		    }
		}
	    ]
	});
    },

    addTag: function(item) {
	Ext.Ajax.request({
	    url: paths.tags.index,
	    method: 'POST',
	    params: {
		'tag[server_id]': this.currentItem.server.id,
		'tag[value]': value
	    },
	    success: function(res, opts) {
		var result = Ext.decode(res.responseText);
		panel.tagsGrid.addTag(result.item);
		panel.addCombo.reset();
		subcontentTab.updateTags();
	    },
	    failure: function(res, opts) {
		Ext.MessageBox.alert('Error', 'Failed to add tag');
	    }
	});

	var RecordType = this.store.recordType;
	var record = new RecordType(item);
	this.store.add(record);
    },

    destroyTag: function() {
	var record = grid.getSelectionModel().getSelected();
	Ext.Ajax.request({
	    url: record.get('paths').tag,
	    method: 'DELETE',
	    success: function(res, opts) {
		grid.store.remove(record);
		grid.updateTags();
	    },
	    failure: function(res, opts) {
		Ext.MessageBox.alert('Error', 'Failed to add tag');
	    }
	});
    }

});
