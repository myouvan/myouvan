Servers.NewServerWindow.FlashPanel = function() {

    this.onSet = function(callback) {
	ovater_set = callback;
    };

    Servers.NewServerWindow.FlashPanel.baseConstructor.apply(this, [{
	layout: 'fit',
	border: false,
	html: '<div id="avatar-flash" />',
	listeners: {
	    beforeshow: function() {
		swfobject.embedSWF('/ova.swf', 'avatar-flash', '630', '400', '9.0.0');
	    }
	}
    }]);

};

Servers.NewServerWindow.FlashPanel.inherit(Ext.Panel);

// call from avatar flash
var ovater_set;
