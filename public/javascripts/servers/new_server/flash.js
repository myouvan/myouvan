Servers.NewServerWindow.FlashPanel = Ext.extend(Ext.Panel, {

    constructor: function() {
	Servers.NewServerWindow.FlashPanel.superclass.constructor.call(this, {
	    layout: 'fit',
	    border: false,
	    html: '<div id="avatar-flash" />',
	    listeners: {
		beforeshow: function() {
		    swfobject.embedSWF('/ova.swf', 'avatar-flash', '630', '400', '9.0.0');
		}
	    }
	});
    },

    onSet: function(callback) {
	ovater_set = callback;
    }

});

// call from avatar flash
var ovater_set;
