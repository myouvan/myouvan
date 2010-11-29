Servers.NewServerWindow.FlashPanel = Ext.extend(Ext.Panel, {

    constructor: function() {
	this.makeComponents();

	this.addEvents('setAvatar');
	ovater_set = this.setAvatar;
    },

    makeComponents: function() {
	Servers.NewServerWindow.FlashPanel.superclass.constructor.call(this, {
	    title: 'Create Avatar',
	    itemId: 'flash',
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

    setAvatar: function(thumb, icon) {
	this.fireEvent('setAvatar', thumb, icon);
    }

});

// call from avatar flash
var ovater_set;
