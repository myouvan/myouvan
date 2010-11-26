Servers.IndexPanel = Ext.extend(Ext.Panel, {

    constructor: function() {
	this.makeComponents();

	this.addEvents('createServer');
	this.addEvents('importServer');
	this.addEvents('showServer');
	this.addEvents('suspendServer');
	this.addEvents('resumeServer');
	this.addEvents('rebootServer');
	this.addEvents('terminateServer');
	this.addEvents('restartServer');
	this.addEvents('migrateServer');

	this.updateTagsDelegate = this.updateTags.createDelegate(this);
    },

    makeComponents: function() {
	this.indexGrid = new Servers.IndexGrid();
	this.makeButtons();

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
		added: this.addEventHandlers,
		beforedestroy: this.removeEventHandlers
	    }
	});
    },

    makeButtons: function() {
	this.createButton = new Ext.Button({
	    text: 'Create Server',
	    width: 80,
	    border: false,
	    handler: function() {
		this.fireEvent('createServer');
	    },
	    scope: this
	});

	this.importButton = new Ext.Button({
	    text: 'Import Server',
	    width: 80,
	    border: false,
	    handlers: function() {
		this.fireEvent('importServer');
	    },
	    scope: this
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

    addEventHandlers: function() {
	servers.on('addedTag', this.updateTagsDelegate);
	servers.on('destroyedTag', this.updateTagsDelegate);
    },

    removeEventHandlers: function() {
	servers.un('addedTag', this.updateTagsDelegate);
	servers.un('destroyedTag', this.updateTagsDelegate);
    },

    updateTags: function() {
	this.tagFilterCombo.getStore().load();
    }

});
