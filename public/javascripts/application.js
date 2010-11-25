var itemsStore = function(url, fields) {
    return new Ext.data.JsonStore({
	proxy: new Ext.data.HttpProxy({
	    url: url,
	    method: 'GET',
	    headers: {
		Accept: 'application/json'
	    }
	}),
	autoDestroy: true,
	autoLoad: false,
	autoSave: false,
	root: 'items',
	fields: fields
    });
};

var comboItemsStore = function(url) {
    return itemsStore(url, ['value']);
};

Function.prototype.inherit = function(baseClass) {
    var inheritance = function() { };
    inheritance.prototype = baseClass.prototype;

    this.prototype = new inheritance();
    this.prototype.constructor = this;
    this.baseConstructor = baseClass;
    this.superClass = baseClass.prototype;
};

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

Ext.ux.StoreComboBox = Ext.extend(Ext.form.ComboBox, {
    constructor: function(config) {
	if (config.storeConfig) {
	    config.store = new Ext.ux.ItemsStore(config.storeConfig);
	    delete config.storeConfig;
	}

	Ext.applyIf(config, {
	    editable: false,
	    forceSelection: false,
	    triggerAction: 'all',
	    displayField: 'value',
	    msgTarget: 'qtip',
	});

	Ext.ux.StoreComboBox.superclass.constructor.call(this, config);
    }
});

Ext.ux.EdittableStoreComboBox = Ext.extend(Ext.form.ComboBox, {
    constructor: function(config) {
	if (config.storeConfig) {
	    config.store = new Ext.ux.ItemsStore(config.storeConfig);
	    delete config.storeConfig;
	}

	Ext.applyIf(config, {
	    editable: true,
	    forceSelection: true,
	    triggerAction: 'all',
	    displayField: 'value',
	    msgTarget: 'qtip',
	});

	Ext.ux.StoreComboBox.superclass.constructor.call(this, config);
    }
});
