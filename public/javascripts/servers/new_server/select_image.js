Servers.NewServerWindow.SelectImagePanel = Ext.extend(Ext.Panel, {

    constructor: function() {
	this.makeComponents();
    },

    makeComponents: function() {
	this.grid = new Servers.NewServerWindow.SelectImageGrid();

	Servers.NewServerWindow.SelectImagePanel.superclass.constructor.call(this, {
	    title: 'Select Image',
	    itemId: 'selectImage',
	    layout: 'fit',
	    border: false,
	    items: this.grid
	});
    },

    isSelected: function() {
	return this.grid.getSelectionModel().hasSelection();
    },

    selectedId: function() {
	return this.grid.getSelectionModel().getSelected().get('id');
    }

});

Servers.NewServerWindow.SelectImageGrid = Ext.extend(Ext.grid.GridPanel, {

    constructor: function() {
	this.makeComponents();
    },

    makeComponents: function() {
	this.makeColModel();
	this.makeStore();

	Servers.NewServerWindow.SelectImageGrid.superclass.constructor.call(this, {
	    colModel: this.colModel,
	    store: this.store,
	    loadMask: true
	});
    },

    makeColModel: function() {
	this.colModel = new Ext.grid.ColumnModel([{
	    header: 'ID',
	    dataIndex: 'id',
	    width: 30,
	    sortable: true
	}, {
	    header: 'Title',
	    dataIndex: 'title',
	    width: 200,
	    sortable: true
	}, {
	    header: 'OS',
	    dataIndex: 'os',
	    width: 150,
	    sortable: true
	}, {
	    header: 'Comment',
	    dataIndex: 'comment',
	    width: 230
	}]);
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
    }

});
