Servers.IndexPanel = Ext.extend(Ext.Panel, {

    constructor: function() {
	this.makeComponents();
	Servers.IndexPanel.superclass.constructor.call(this, {
	    layout: 'vbox',
	    layoutConfig: {
		align: 'stretch'
	    },
	    border: false,
	    items: [
		{
		    layout: 'hbox',
		    height: 32,
		    border: false,
                    layoutConfig: {
                        padding: 3,
                        align: 'middle'
		    },
		    defaults: {
			margins: '0 5 0 0'
		    },
		    items: [
			this.createButton,
			this.importButton,
			{
			    xtype: 'spacer',
			    flex: 1
			},
			{
			    html: 'Tag Filter:',
			    border: false
			},
			this.tagFilterCombo,
			this.clearTagFilterButton
		    ]
		},
		{
		    flex: 1,
		    layout: 'fit',
		    border: false,
		    items: this.indexGrid
		}
	    ],
	    listeners: {
		added: function() {
		    this.onAdded();
		},
		destroy: function() {
		    this.onDestroy();
		}
	    }
	});
    },

    makeComponents: function() {
	this.indexGrid = new Servers.IndexGrid();
	this.makeButtons();
    },

    makeButtons: function() {
	var panel = this;

	this.createButton = new Ext.Button({
	    text: 'Create Server',
	    width: 80,
	    border: false,
	    handler: function() {
		panel.createServer();
	    }
	});

	this.importButton = new Ext.Button({
	    text: 'Import Server',
	    width: 80,
	    border: false,
	    handlers: function() {
		panel.importServer();
	    }
	});

	this.tagFilterCombo = new Ext.ux.StoreComboBox({
	    storeConfig: {
		url: paths.tags.index
	    }
	});

	this.clearTagFilterButton = new Ext.Button({
	    text: 'Clear',
	    width: 40,
	    border: false
	});
    },

    updateTags: function() {
	this.tagFilterCombo.getStore().load();
    }

});
