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
		    height: 30,
		    border: false,
		    items: this.createButton
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
	    border: false,
	    handler: function() {
		panel.createServer();
	    }
	});
    }
});
