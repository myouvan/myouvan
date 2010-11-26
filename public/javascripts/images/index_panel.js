Images.IndexPanel = Ext.extend(Ext.Panel, {

    constructor: function() {
	this.makeComponents();

	this.addEvents('createImage');
	this.addEvents('updateImage');
	this.addEvents('destroyImage');
    },

    makeComponents: function() {
	this.indexGrid = new Images.IndexGrid();
	this.makeButtons();

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
	    ]
	});
    },

    makeButtons: function() {
	this.createButton = new Ext.Button({
	    text: 'Create Image',
	    width: 80,
	    border: false,
	    handler: function() {
		this.fireEvent('createImage');
	    },
	    scope: this
	});
    }

});
