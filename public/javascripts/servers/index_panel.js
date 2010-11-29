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
	    }, {
		xtype: 'button',
		text: 'Import Server',
		handlers: function() {
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
			this.indexGrid.setFilter(combo.getValue());
		    },
		    scope: this
		}
	    }, {
		xtype: 'button',
		text: 'Clear',
		handler: function() {
		    var tfCombo = this.getTopToolbar().getComponent('tagFilterCombo');
		    tfCombo.clearValue();
		    this.indexGrid.setFilter(tfCombo.getValue());
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
	servers.on('addedTag', this.updateTagsDelegate);
	servers.on('destroyedTag', this.updateTagsDelegate);
    },

    removeEventHandlers: function() {
	servers.un('addedTag', this.updateTagsDelegate);
	servers.un('destroyedTag', this.updateTagsDelegate);
    },

    updateTags: function() {
	this.getTopToolbar().getComponent('tagFilterCombo').getStore().load();
    }

});
