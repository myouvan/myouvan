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
