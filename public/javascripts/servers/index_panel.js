Servers.IndexPanel = Ext.extend(Ext.Panel, {

    constructor: function() {
	this.makeComponents();

	this.addEvents([
	    'createServer',
	    'importServer',
	    'reloadServer'
	]);

	this.updateTagsDelegate = this.updateTags.createDelegate(this);
    },

    makeComponents: function() {
	this.indexGrid = new Servers.IndexGrid();

	Servers.IndexPanel.superclass.constructor.call(this, {
	    layout: 'fit',
	    border: false,
	    title: 'Servers',
	    headerCssClass: 'ec2-panel-header',
	    tbar: [{
		xtype: 'button',
		text: 'Create Server',
		icon: '/images/icon_create_server.gif',
		handler: function() {
		    this.fireEvent('createServer');
		},
		scope: this
	    }, ' ', {
		xtype: 'button',
		text: 'Import Server',
		icon: '/images/icon_import_server.gif',
		handler: function() {
		    this.fireEvent('importServer');
		},
		scope: this
	    }, '->', {
		xtype: 'tbtext',
		text: 'Tag Filter:',
		style: {
		    fontWeight: 'bold'
		}
	    }, ' ', {
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
	    }, ' ', {
		xtype: 'button',
		text: 'Clear',
		handler: function() {
		    var tfCombo = this.getTopToolbar().getComponent('tagFilterCombo');
		    tfCombo.clearValue();
		    this.indexGrid.setFilter(tfCombo.getValue());
		},
		scope: this
	    }, ' ', {
		xtype: 'button',
		text: 'Reload',
		icon: '/images/icon_reload.gif',
		handler: function() {
		    this.fireEvent('reloadServer');
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
	servers.on('updatedTags', this.updateTagsDelegate);
    },

    removeEventHandlers: function() {
	servers.un('addedTag', this.updateTagsDelegate);
	servers.un('destroyedTag', this.updateTagsDelegate);
	servers.un('updatedTags', this.updateTagsDelegate);
    },

    updateTags: function() {
	this.getTopToolbar().getComponent('tagFilterCombo').getStore().load();
    }

});
