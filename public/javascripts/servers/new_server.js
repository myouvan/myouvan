Servers.NewServerWindow = Ext.extend(Ext.Window, {

    constructor: function(config) {
	this.action = config.action;
	this.submitConfig = config.submitConfig;

	this.makeComponents(config);
    },

    makeComponents: function() {
	if (this.action == 'import')
	    this.selectTarget = new Servers.NewServerWindow.SelectTarget();

	this.selectImage = new Servers.NewServerWindow.SelectImage();
	this.input = new Servers.NewServerWindow.Input({
	    action: this.action
	});

	this.tags = new Servers.NewServerWindow.Tags();

	this.avatar = new Servers.NewServerWindow.Avatar();
	this.avatar.on('setAvatar', this.setAvatar.createDelegate(this));

	this.makeCard();

	Servers.NewServerWindow.superclass.constructor.call(this, {
	    title: (this.action == 'create' ? 'Create' : 'Import') + ' Server',
	    modal: true,
	    width: 650,
	    height: 497,
	    layout: 'fit',
	    plain: true,
	    closable: false,
	    items: this.card,
	    buttonAlign: 'center',
	    buttons: [{
		text: 'Prev',
		disabled: true,
		handler: this.prevCard.createDelegate(this),
		scopt: this
	    }, {
		text: 'Next',
		handler: this.nextCard.createDelegate(this),
		scopt: this
	    }, {
		text: 'Close',
		handler: function() {
		    this.close();
		},
		scope: this
	    }]
	});

	this.prevButton = this.buttons[0];
	this.nextButton = this.buttons[1];
    },

    makeCard: function() {
	var items = [
	    this.selectImage,
	    this.input,
	    this.tags,
	    this.avatar
	];

	if (this.action == 'import')
	    items.unshift(this.selectTarget);

	this.card = new Ext.Container({
	    layout: 'card',
	    activeItem: 0,
	    width: 400,
	    items: items
	});
    },

    prevCard: function() {
	var cardId = this.card.layout.activeItem.getItemId();
	if (cardId == 'selectImage') {
	    if (this.action == 'import') {
		this.card.layout.setActiveItem('selectTarget');
		this.prevButton.disable();
	    }
	} else if (cardId == 'form') {
	    this.card.layout.setActiveItem('selectImage');
	    if (this.action == 'create')
		this.prevButton.disable();
	} else if (cardId == 'tags') {
	    this.card.layout.setActiveItem('form');
	} else if (cardId == 'flash') {
	    this.card.layout.setActiveItem('tags');
	    this.nextButton.enable();
	    this.nextButton.setText('Next');
	}
    },

    

    nextCard: function() {
	var cardId = this.card.layout.activeItem.getItemId();
	if (cardId == 'selectTarget') {
	    if (!this.selectTarget.isSelected()) {
		Ext.MessageBox.alert('Error', 'Select an target');
		return;
	    }
	    var item = this.selectTarget.selectedRecord().data;
	    this.setValues(item);
	    this.card.layout.setActiveItem('selectImage');
	    this.prevButton.enable();
	} else if (cardId == 'selectImage') {
	    if (!this.selectImage.isSelected()) {
		Ext.MessageBox.alert('Error', 'Select an image');
		return;
	    }
	    var id = this.selectImage.selectedId();
	    this.input.setImageId(id);
	    this.card.layout.setActiveItem('form');
	    this.prevButton.enable();
	} else if (cardId == 'form') {
	    this.card.layout.setActiveItem('tags');
	} else if (cardId == 'tags') {
	    this.input.setTags(this.tags.getTags());
	    this.card.layout.setActiveItem('flash');
	    this.nextButton.disable();
	    if (this.action == 'create')
		this.nextButton.setText('Create');
	    else if (this.action == 'import')
		this.nextButton.setText('Import');
	} else if (cardId == 'flash') {
	    this.prevCard();
	    this.prevCard();
	    this.input.submit(this.submitConfig);
	}
    },

    setValues: function(item) {
	this.input.setValues(item);
	this.input.showLoadMask();

	Ext.Ajax.request({
	    url: item.paths.target,
	    method: 'GET',
	    params: {
		physical_server: item.physical_server
	    },
	    success: function(res, opts) {
		var additionalItem = Ext.decode(res.responseText).item;
		this.input.setValues(additionalItem);
		this.input.hideLoadMask();
	    },
	    failure: function(res, opts) {
		Ext.MessageBox.alert('Error', 'Failed to get target');
	    },
	    scope: this
	});
    },

    setAvatar: function(thumb, icon) {
	this.input.setAvatar(thumb, icon);
	this.nextButton.enable();
    }

});
