Images.IndexPanel = Ext.extend(Ext.Panel, {

    constructor: function() {
	this.makeComponents();

	this.addEvents([
	    'createImage',
	    'updateImage',
	    'destroyImage'
	]);
    },

    makeComponents: function() {
	this.indexGrid = new Images.IndexGrid();

	Images.IndexPanel.superclass.constructor.call(this, {
	    layout: 'fit',
	    tbar: [{
		xtype: 'button',
		text: 'Create Image',
		handler: function() {
		    this.fireEvent('createImage');
		},
		scope: this
	    }, '->', {
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
	    }
	});
    },

});
