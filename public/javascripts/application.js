//------------------------------
//   image
//------------------------------

Ext.ux.imgTemplate = new Ext.XTemplate(
    '<img src="{src}" ',
    '<tpl if="id">id="{id}" </tpl>',
    '<tpl if="style">style="{style}" </tpl>',
    'width="{size}" height="{size}" />'
);

Ext.ux.createImg = function(config) {
    Ext.applyIf(config, {
	id: null,
	style: null
    });
    return Ext.ux.imgTemplate.apply(config);
};

Ext.ux.reloadImg = function(id) {
    var elem = Ext.get(id);
    var src = elem.getAttribute('src');
    src = src.replace(/\?.*$/,"");
    elem.set({
	src: src + '?' + (new Date()).getTime()
    });
};


//------------------------------
//   store
//------------------------------

Ext.override(Ext.data.Store, {

    addRecord: function(item) {
	var RecordType = this.recordType;
	var record = new RecordType(item);
	this.add(record);
    },

    updateRecord: function(item) {
	var ri = this.findExact('id', item.id);
	if (ri != -1) {
	    var record = this.getAt(ri);
	    for (var field in item)
		if (record.fields.containsKey(field))
		    record.set(field, item[field]);
	}
	this.commitChanges();
    },

    destroyRecord: function(item) {
	var ri = this.findExact('id', item.id);
	if (ri != -1)
	    this.removeAt(ri);
    }

});


//------------------------------
//   extended JsonStore
//------------------------------

Ext.ux.ItemsStore = Ext.extend(Ext.data.JsonStore, {
    constructor: function(config) {
	if (config.url) {
	    config.proxy = new Ext.data.HttpProxy({
		url: config.url,
		method: 'GET',
		headers: {
		    Accept: 'application/json'
		}
	    });

	    delete config.url;
	}

	Ext.applyIf(config, {
	    autoDestroy: true,
	    autoLoad: false,
	    autoSave: false,
	    root: 'items',
	    fields: ['value']
	});

	Ext.ux.ItemsStore.superclass.constructor.call(this, config);
    }
});


//------------------------------
//   extended ComboBox
//------------------------------

Ext.ux.StoreComboBox = Ext.extend(Ext.form.ComboBox, {
    constructor: function(config) {
	if (config.storeConfig) {
	    config.store = new Ext.ux.ItemsStore(config.storeConfig);
	    delete config.storeConfig;
	}

	Ext.applyIf(config, {
	    editable: false,
	    forceSelection: true,
	    triggerAction: 'all',
	    displayField: 'value',
	    msgTarget: 'qtip',
	});

	Ext.ux.StoreComboBox.superclass.constructor.call(this, config);
    }
});

Ext.ux.EditableStoreComboBox = Ext.extend(Ext.form.ComboBox, {
    constructor: function(config) {
	if (config.storeConfig) {
	    config.store = new Ext.ux.ItemsStore(config.storeConfig);
	    delete config.storeConfig;
	}

	Ext.applyIf(config, {
	    editable: true,
	    forceSelection: false,
	    triggerAction: 'all',
	    displayField: 'value',
	    msgTarget: 'qtip',
	});

	Ext.ux.StoreComboBox.superclass.constructor.call(this, config);
    }
});

Ext.reg('storecombobox', Ext.ux.StoreComboBox);
Ext.reg('editablestorecombobox', Ext.ux.EditableStoreComboBox);
