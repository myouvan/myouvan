Servers.NewServerWindow = Ext.extend(Ext.Window, {

    constructor: function(config) {
	this.action = config.action;
	this.submitConfig = config.submitConfig;

	this.makeComponents(config);
    },

    makeComponents: function() {
	this.makeForm();

	Servers.NewServerWindow.superclass.constructor.call(this, {
	    title: (this.action == 'create' ? 'Create' : 'Import') + ' Server',
	    modal: true,
	    width: 650,
	    height: 497,
	    layout: 'fit',
	    plain: true,
	    closable: false,
	    items: this.form,
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

    makeForm: function() {
	if (this.action == 'import') {
	    this.selectTarget = new Servers.NewServerWindow.SelectTarget();
	    this.selectTarget.on('selectTarget', this.onSelectTarget.createDelegate(this));
	}

	this.selectImage = new Servers.NewServerWindow.SelectImage();
	this.input = new Servers.NewServerWindow.Input({
	    action: this.action
	});

	this.tags = new Servers.NewServerWindow.Tags();

	this.avatar = new Servers.NewServerWindow.Avatar();
	this.avatar.on('setAvatar', this.onSetAvatar.createDelegate(this));

	var cardItems = [
	    this.selectImage,
	    this.input,
	    this.tags,
	    this.avatar
	];

	if (this.action == 'import')
	    cardItems.unshift(this.selectTarget);

	this.form = new Ext.form.FormPanel({
	    layout: 'fit',
	    border: false,
	    items: {
		layout: 'card',
		activeItem: 0,
		border: false,
		items: cardItems
	    }
	});

	this.card = this.form.get(0);
    },

    prevCard: function() {
	var cardId = this.card.layout.activeItem.getItemId();
	if (cardId == 'selectImage') {
	    if (this.action == 'import') {
		this.card.layout.setActiveItem('selectTarget');
		this.prevButton.disable();
	    }
	} else if (cardId == 'input') {
	    this.card.layout.setActiveItem('selectImage');
	    if (this.action == 'create')
		this.prevButton.disable();
	} else if (cardId == 'tags') {
	    this.card.layout.setActiveItem('input');
	} else if (cardId == 'flash') {
	    this.card.layout.setActiveItem('tags');
	    this.nextButton.enable();
	    this.nextButton.setText('Next');
	}
    },

    nextCard: function() {
	var cardId = this.card.layout.activeItem.getItemId();
	if (cardId == 'selectTarget') {
	    if (!this.selectTarget.onNext())
		return;
	    this.card.layout.setActiveItem('selectImage');
	    this.prevButton.enable();
	} else if (cardId == 'selectImage') {
	    if (!this.selectImage.onNext())
		return;
	    this.card.layout.setActiveItem('input');
	    this.prevButton.enable();
	} else if (cardId == 'input') {
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
	    this.form.getForm().submit(this.submitConfig);
	}
    },

    onSelectTarget: function(item) {
	this.input.setTargetValues(item);
    },

    onSetAvatar: function() {
	this.nextButton.enable();
    }

});
