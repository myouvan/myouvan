Servers.NewServerWindow.TagsPanel = Ext.extend(Ext.Panel, {

    constructor: function() {
	this.makeComponents();
	Servers.NewServerWindow.TagsPanel.superclass.constructor.call(this, {
	    layout: 'hbox',
	    layoutConfig: {
		align: 'stretch',
		pack: 'center'
	    },
	    items: {
		width: 300,
		layout: 'vbox',
		layoutConfig: {
		    align: 'stretch'
		},
		border: false,
		items: [
		    {
			height: 20,
			html: 'Add Tags',
			border: false,
			bodyStyle: {
			    padding: '3px'
			}
		    },
		    new Ext.Panel({
			flex: 1,
			layout: 'fit',
			border: false,
			items: this.grid
		    }),
		    new Ext.Panel({
			layout: 'hbox',
			height: 30,
			border: false,
			bodyStyle: {
			    padding: '5px 0 0 0'
			},
			items: [
			    this.addCombo,
			    {
				border: false,
				bodyStyle: {
				    padding: '0 0 0 5px'
				},
				items: this.addButton
			    }
			]
		    })
		]
	    }
	});
    },

    makeComponents: function() {
	this.grid = new Servers.NewServerWindow.TagsGrid();
	this.makeAddComponents();
    },

    makeAddComponents: function() {
	this.addCombo = new Ext.ux.EditableStoreComboBox({
	    flex: 1,
	    storeConfig: {
		url: paths.tags.index
	    }
	});

	var panel = this;

	this.addButton = new Ext.Button({
	    text: 'Add Tag',
	    width: 70,
	    handler: function() {
		var value = panel.addCombo.getValue();
		if (value == '')
		    return;
		panel.grid.addTag(value);
		panel.addCombo.reset();
	    }
	});
    },

    resetPanel: function() {
	this.grid.resetGrid();
	this.addCombo.reset();
    },

    tags: function() {
	return this.grid.tags();
    }
});
