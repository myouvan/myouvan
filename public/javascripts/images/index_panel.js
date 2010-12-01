Images.IndexPanel = Ext.extend(Ext.Panel, {

    constructor: function() {
	this.makeComponents();

	this.addEvents('createImage');
    },

    makeComponents: function() {
	this.indexGrid = new Images.IndexGrid();

	Images.IndexPanel.superclass.constructor.call(this, {
	    layout: 'fit',
	    title: 'Images',
	    headerCssClass: 'ec2-panel-header',
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
