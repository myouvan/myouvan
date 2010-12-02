Servers.NewServerWindow = Ext.extend(Ext.Window, {

    constructor: function(config) {
	this.action = config.action;
	this.submitConfig = config.submitConfig;

	this.makeComponents(config);
    },

    makeComponents: function() {
	if (this.action == 'import')
	    this.selectTargetPanel = new Servers.NewServerWindow.SelectTargetPanel();

	this.selectImagePanel = new Servers.NewServerWindow.SelectImagePanel();
	this.formPanel = new Servers.NewServerWindow.FormPanel({
	    action: this.action
	});

	this.tagsPanel = new Servers.NewServerWindow.TagsPanel();

	this.flashPanel = new Servers.NewServerWindow.FlashPanel();
	this.flashPanel.on('setAvatar', this.setAvatar.createDelegate(this));

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
	    this.selectImagePanel,
	    this.formPanel,
	    this.tagsPanel,
	    this.flashPanel
	];

	if (this.action == 'import')
	    items.unshift(this.selectTargetPanel);

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
	    if (!this.selectTargetPanel.isSelected()) {
		Ext.MessageBox.alert('Error', 'Select an target');
		return;
	    }
	    var item = this.selectTargetPanel.selectedRecord().data;
	    this.setValues(item);
	    this.card.layout.setActiveItem('selectImage');
	    this.prevButton.enable();
	} else if (cardId == 'selectImage') {
	    if (!this.selectImagePanel.isSelected()) {
		Ext.MessageBox.alert('Error', 'Select an image');
		return;
	    }
	    var id = this.selectImagePanel.selectedId();
	    this.formPanel.setImageId(id);
	    this.card.layout.setActiveItem('form');
	    this.prevButton.enable();
	} else if (cardId == 'form') {
	    this.card.layout.setActiveItem('tags');
	} else if (cardId == 'tags') {
	    this.formPanel.setTags(this.tagsPanel.tags());
	    this.card.layout.setActiveItem('flash');
	    this.nextButton.disable();
	    if (this.action == 'create')
		this.nextButton.setText('Create');
	    else if (this.action == 'import')
		this.nextButton.setText('Import');
	} else if (cardId == 'flash') {
	    this.prevCard();
	    this.prevCard();
	    this.formPanel.submit(this.submitConfig);
	}
    },

    setValues: function(item) {
	this.formPanel.setValues(item);
	this.formPanel.showLoadMask();

	Ext.Ajax.request({
	    url: item.paths.target,
	    method: 'GET',
	    params: {
		physical_server: item.physical_server
	    },
	    success: function(res, opts) {
		var additionalItem = Ext.decode(res.responseText).item;
		this.formPanel.setValues(additionalItem);
		this.formPanel.hideLoadMask();
	    },
	    failure: function(res, opts) {
		Ext.MessageBox.alert('Error', 'Failed to get target');
	    },
	    scope: this
	});
    },

    setAvatar: function(thumb, icon) {
	this.formPanel.setAvatar(thumb, icon);
	this.nextButton.enable();
    }

});
