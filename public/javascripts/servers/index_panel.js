Servers.IndexPanel = Ext.extend(Ext.Panel, {

    constructor: function() {
	this.makeComponents();

	this.addEvents([
	    'createServer',
	    'importServer',
	    'showServer',
	    'suspendServer',
	    'resumeServer',
	    'rebootServer',
	    'terminateServer',
	    'restartServer',
	    'migrateServer'
	]);

	this.addRecordsDelegate = this.addRecords.createDelegate(this);
	this.updateTagsDelegate = this.updateTags.createDelegate(this);
    },

    makeComponents: function() {
	this.indexGrid = new Servers.IndexGrid();

	Servers.IndexPanel.superclass.constructor.call(this, {
	    layout: 'fit',
	    border: false,
	    tbar: [{
		xtype: 'button',
		text: 'Create Server',
		handler: function() {
		    this.fireEvent('createServer');
		},
		scope: this
	    }, '|', {
		xtype: 'button',
		text: 'Import Server',
		handler: function() {
		    this.fireEvent('importServer');
		},
		scope: this
	    }, '->', 'Tag Filter:', {
		xtype: 'storecombobox',
		itemId: 'tagFilterCombo',
		storeConfig: {
		    url: paths.tags.index
		},
		listeners: {
		    select: function(combo, record, index) {
			this.filterValue = combo.getValue();
			this.indexGrid.setFilter(this.filterValue);
		    },
		    scope: this
		}
	    }, {
		xtype: 'button',
		text: 'Clear',
		handler: function() {
		    var tfCombo = this.getTopToolbar().getComponent('tagFilterCombo');
		    tfCombo.clearValue();
		    this.filterValue = tfCombo.getValue();
		    this.indexGrid.setFilter(this.filterValue);
		},
		scope: this
	    }, '|', {
		xtype: 'button',
		text: 'Reload',
		handler: function() {
		    this.indexGrid.store.load();
		},
		scope: this
	    }],
	    items: {
		layout: 'fit',
		border: false,
		items: this.indexGrid
	    },
	    listeners: {
		added: this.addEventHandlers,
		beforedestroy: this.removeEventHandlers
	    }
	});
    },

    addEventHandlers: function() {
	servers.on('gotServers', this.addRecordsDelegate);
	servers.on('addedTag', this.updateTagsDelegate);
	servers.on('destroyedTag', this.updateTagsDelegate);
	servers.on('updatedTags', this.updateTagsDelegate);
    },

    removeEventHandlers: function() {
	servers.un('gotServers', this.addRecordsDelegate);
	servers.un('addedTag', this.updateTagsDelegate);
	servers.un('destroyedTag', this.updateTagsDelegate);
	servers.un('updatedTags', this.updateTagsDelegate);
    },

    addRecords: function(items) {
	var addingItems = new Array();
	for (var i = 0; i < items.length; ++i)
	    if (items[i].tags.indexOf(this.filterValue) != -1)
		addingItems.push(items[i]);
	this.indexGrid.addRecords(addingItems);
    },

    updateTags: function() {
	this.getTopToolbar().getComponent('tagFilterCombo').getStore().load();
    }

});
