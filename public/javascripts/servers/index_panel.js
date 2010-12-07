Servers.IndexPanel = Ext.extend(Ext.Panel, {

    constructor: function() {
	this.makeComponents();

	this.addEvents([
	    'createServer',
	    'importServer',
	    'reloadServer'
	]);

	this.initHandlers();
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
		    url: paths.tags.combo_items
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
	    }
	});
    },

    initHandlers: function() {
	this.setDynamicHandlers({
	    target: servers,
	    handlers: [{
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

    updateTags: function() {
	this.getTopToolbar().getComponent('tagFilterCombo').getStore().load();
    }

});
