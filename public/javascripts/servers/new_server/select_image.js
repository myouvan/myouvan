Servers.NewServerWindow.SelectImagePanel = Ext.extend(Ext.Panel, {

    constructor: function() {
	this.makeComponents();
	Servers.NewServerWindow.SelectImagePanel.superclass.constructor.call(this, {
	    layout: 'vbox',
	    layoutConfig: {
		align: 'stretch'
	    },
	    border: false,
	    items: [
		{
		    height: 20,
		    html: 'Select Image',
		    bodyStyle: {
			padding: '3px'
		    },
		    border: false
		},
		{
		    flex: 1,
		    layout: 'fit',
		    border: false,
		    items: this.grid
		}
	    ]
	});
    },

    makeComponents: function() {
	this.grid = new Servers.NewServerWindow.SelectImageGrid();
    },

    isSelected: function() {
	return this.grid.isSelected();
    },

    selectedId: function() {
	return this.grid.selectedId();
    },

    resetPanel: function() {
	this.grid.resetGrid();
    }

});
