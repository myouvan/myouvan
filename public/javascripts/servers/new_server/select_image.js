Servers.NewServerWindow.SelectImage = Ext.extend(Ext.Panel, {

    constructor: function() {
	this.makeComponents();
    },

    makeComponents: function() {
	this.grid = new Servers.NewServerWindow.SelectImageGrid();

	Servers.NewServerWindow.SelectImage.superclass.constructor.call(this, {
	    title: 'Select Image',
	    itemId: 'selectImage',
	    layout: 'fit',
	    border: false,
	    items: [this.grid, {
		xtype: 'hidden',
		name: 'server[image_id]',
		itemId: 'image_id'
	    }]
	});
    },

    onNext: function() {
	if (this.grid.getSelectionModel().hasSelection()) {
	    var id = this.grid.getSelectionModel().getSelected().get('id');
	    this.getComponent('image_id').setValue(id);
	    return true;
	} else {
	    Ext.MessageBox.alert('Error', 'Select an image');
	    return false;
	}
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
	    border: false,
	    colModel: this.colModel,
	    store: this.store,
	    autoExpandColumn: 'comment',
	    columnLines: true,
	    stripeRows: true,
	    loadMask: true,
	    sm: new Ext.grid.RowSelectionModel({
		singleSelect: true
	    })
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
	    id: 'comment'
	}]);
    },

    makeStore: function() {
	this.store = new Ext.ux.ItemsStore({
	    url: paths.images.index,
	    autoLoad: true,
	    root: 'images',
	    fields: [
		'id',
		'title',
		'os',
		'comment'
	    ]
	});
    }

});
