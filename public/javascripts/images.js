var Images = Ext.extend(Ext.util.Observable, {

    constructor: function() {
	this.addEvents([
	    'createdImage',
	    'updatedImage',
	    'destroyedImage'
	]);
    },

    createImage: function() {
	var newImageWindow = new Images.NewImageWindow({
	    action: 'create',
	    submitConfig: {
		url: paths.images.index,
		method: 'POST',
		waitMsg: 'Creating...',
		success: function(f, action) {
		    var image = action.result.image;
		    this.fireEvent('createdImage', image);
		    newImageWindow.close();
		},
		failure: function(f, action) {
		    Ext.MessageBox.alert('Error', 'Failed to create image');
		},
		scope: this
	    }
	});
	newImageWindow.show();
    },

    updateImage: function(image) {
	var newImageWindow = new Images.NewImageWindow({
	    action: 'update',
	    item: image,
	    submitConfig: {
		url: image.paths.image,
		method: 'PUT',
		waitMsg: 'Updating...',
		success: function(f, action) {
		    var image = action.result.image;
		    this.fireEvent('updatedImage', image);
		    newImageWindow.close();
		},
		failure: function(form, action) {
		    alert('Failed to update image');
		},
		scope: this
	    }
	});
	newImageWindow.show();
    },

    destroyImage: function(image) {
	Ext.Ajax.request({
	    url: image.paths.image,
	    method: 'DELETE',
	    success: function(res, opts) {
		var image = Ext.decode(res.responseText).image;
		this.fireEvent('destroyedImage', image);
	    },
	    failure: function(res, opts) {
		alert('Error');
	    },
	    scope: this
	});
    },

    show: function() {
	this.indexPanel = new Images.IndexPanel();

	this.initEventHandlers();

	Ext.getCmp('subcontent').removeAll();
	Ext.getCmp('subcontent').hide();
	Ext.getCmp('content').removeAll();
	Ext.getCmp('content').add(this.indexPanel);
	Ext.getCmp('content-container').doLayout();
    },

    initEventHandlers: function() {
	this.indexPanel.on('createImage', this.createImage.createDelegate(this));
	this.indexPanel.on('updateImage', this.updateImage.createDelegate(this));
	this.indexPanel.on('destroyImage', this.destroyImage.createDelegate(this));
    }

});
