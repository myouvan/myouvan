Images.IndexPanel = Ext.extend(Ext.Panel, {

    constructor: function() {
	this.makeComponents();
	Images.IndexPanel.superclass.constructor.call(this, {
	    layout: 'vbox',
	    layoutConfig: {
		align: 'stretch'
	    },
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
			this.createButton
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
		destroy: function() {
		    this.onDestroy();
		}
	    }
	});
    },

    makeComponents: function() {
	this.indexGrid = new Images.IndexGrid();
	this.makeButtons();
    },

    makeButtons: function() {
	var panel = this;
	this.createButton = new Ext.Button({
	    text: 'Create Image',
	    border: false,
	    handler: function() {
		panel.createImage();
	    }
	});
    }

});
