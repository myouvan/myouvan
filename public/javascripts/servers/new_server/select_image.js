Servers.NewServerWindow.SelectImagePanel = Ext.extend(Ext.Panel, {

    constructor: function() {
	this.makeComponents();
	Servers.NewServerWindow.SelectImagePanel.superclass.constructor.call(this, {
	    title: 'Select Image',
	    layout: 'fit',
	    layoutConfig: {
		align: 'stretch'
	    },
	    border: false,
	    items: this.grid
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

Servers.NewServerWindow.SelectImageGrid = Ext.extend(Ext.grid.GridPanel, {

    constructor: function() {
	this.makeComponents();
	Servers.NewServerWindow.SelectImageGrid.superclass.constructor.call(this, {
	    colModel: this.colModel,
	    store: this.store
	});
    },

    makeComponents: function() {
	this.makeColModel();
	this.makeStore();
    },

    makeColModel: function() {
	this.colModel = new Ext.grid.ColumnModel([
	    {
		header: 'ID',
		dataIndex: 'id',
		width: 30,
		sortable: true
	    },
	    {
		header: 'Title',
		dataIndex: 'title',
		width: 200,
		sortable: true
	    },
	    {
		header: 'OS',
		dataIndex: 'os',
		width: 150,
		sortable: true
	    },
	    {
		header: 'Comment',
		dataIndex: 'comment',
		width: 230
	    }
	]);
    },

    makeStore: function() {
	this.store = new Ext.ux.ItemsStore({
	    url: paths.images.index,
	    autoLoad: true,
	    fields: [
		'id',
		'title',
		'os',
		'comment'
	    ]
	});
    },

    isSelected: function() {
	return this.getSelectionModel().hasSelection();
    },

    selectedId: function() {
	return this.getSelectionModel().getSelected().get('id');	
    },

    resetGrid: function() {
	this.store.load();
	this.getSelectionModel().clearSelections();
    }

});
