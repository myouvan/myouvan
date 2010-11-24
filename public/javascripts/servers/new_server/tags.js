var TagsPanel = function() {

    var grid = (function() {
	var colModel = new Ext.grid.ColumnModel([
	    {
		header: 'Value',
		dataIndex: 'value',
		width: 250,
		sortable: true
	    }
	]);

	var store = new Ext.data.ArrayStore({
	    fields: ['value']
	});

	var contextMenu = new Ext.menu.Menu({
	    style: {
		overflow: 'visible'
	    },
	    items: [
		{
		    text: 'Delete',
		    handler: function() {
			var store = grid.getStore();
			var record = grid.getSelectionModel().getSelected();
			store.remove(record);
		    }
		}
	    ]
	});

	var grid = new Ext.grid.GridPanel({
	    colModel: colModel,
	    store: store,
	    listeners: {
		rowcontextmenu: function(g, row, e) {
		    grid.getSelectionModel().selectRow(row);
		    e.stopEvent();
		    contextMenu.showAt(e.getXY());
		}
	    }
	});

	return grid;
    })();

    var addCombo = new Ext.form.ComboBox({
	flex: 1,
	editable: true,
	triggerAction: 'all',
	store: comboItemsStore(paths.tags.index),
	displayField: 'value'
    });

    var addButton = new Ext.Button({
	text: 'Add Tag',
	width: 70,
	handler: function() {
	    var value = addCombo.getValue();
	    if (value == '')
		return;

	    var store = grid.getStore();
	    var RecordType = store.recordType;
	    var record = new RecordType({
		value: value
	    });
	    store.add(record);
	    addCombo.reset();
	}
    });

    TagsPanel.baseConstructor.apply(this, [{
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
		    items: grid
		}),
		new Ext.Panel({
		    layout: 'hbox',
		    height: 30,
		    border: false,
		    bodyStyle: {
			padding: '5px 0 0 0'
		    },
		    items: [
			addCombo,
			{
			    border: false,
			    bodyStyle: {
				padding: '0 0 0 5px'
			    },
			    items: addButton
			}
		    ]
		})
	    ]
	}
    }]);

    this.resetPanel = function() {
	grid.getStore().removeAll();
	addCombo.reset();
    };

    this.tags = function() {
	var tags = new Array();
	grid.getStore().each(function(record) {
	    tags.push({ value: record.get('value') });
	});
    };
};

TagsPanel.inherit(Ext.Panel);
