Servers.NewServerWindow.TagsGrid = Ext.extend(Ext.grid.GridPanel, {

    constructor: function() {
	this.makeComponents();
	Servers.NewServerWindow.TagsGrid.superclass.constructor.call(this, {
	    colModel: this.colModel,
	    store: this.store,
	    listeners: {
		rowcontextmenu: function(grid, row, e) {
		    grid.getSelectionModel().selectRow(row);
		    e.stopEvent();
		    grid.contextMenu.showAt(e.getXY());
		}
	    }
	});
    },

    makeComponents: function() {
	this.makeColModel();
	this.makeStore();
	this.makeContextMenu();
    },

    makeColModel: function() {
	this.colModel = new Ext.grid.ColumnModel([
	    {
		header: 'Value',
		dataIndex: 'value',
		width: 250,
		sortable: true
	    }
	]);
    },

    makeStore: function() {
	this.store = new Ext.data.ArrayStore({
	    fields: ['value']
	});
    },

    makeContextMenu: function() {
	var grid = this;
	this.contextMenu = new Ext.menu.Menu({
	    style: {
		overflow: 'visible'
	    },
	    items: [
		{
		    text: 'Delete',
		    handler: function() {
			var record = grid.getSelectionModel().getSelected();
			this.store.remove(record);
		    }
		}
	    ]
	});
    },

    addTag: function(value) {
	var RecordType = this.store.recordType;
	var record = new RecordType({
	    value: value
	});
	this.store.add(record);
    },

    resetGrid: function() {
	this.store.removeAll();
    },

    tags: function() {
	var tags = new Array();
	this.store.each(function(record) {
	    tags.push({ value: record.get('value') });
	});
	return tags;
    }

});
