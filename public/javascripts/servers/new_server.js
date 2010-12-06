Servers.NewServerWindow = Ext.extend(Ext.Window, {

    constructor: function(config) {
	this.action = config.action;
	this.submitConfig = config.submitConfig;

	this.makeComponents(config);
    },

    makeComponents: function(config) {
	this.makeForm(config);

	Servers.NewServerWindow.superclass.constructor.call(this, {
	    title: (this.action == 'create' ? 'Create' : 'Import') + ' Server',
	    modal: true,
	    width: 650,
	    height: 490,
	    layout: 'fit',
	    plain: true,
	    closable: false,
	    items: this.form,
	    buttonAlign: 'center',
	    buttons: [{
		text: '< Prev',
		disabled: true,
		handler: this.prevCard.createDelegate(this),
		scopt: this
	    }, {
		text: 'Next >',
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

    makeForm: function(config) {
	if (this.action == 'import') {
	    this.selectImportTarget = new Servers.NewServerWindow.SelectImportTarget();
	    this.selectImportTarget.on('selectImportTarget', this.onSelectImportTarget.createDelegate(this));
	}

	if (this.action != 'update')
	    this.selectImage = new Servers.NewServerWindow.SelectImage();

	this.input = new Servers.NewServerWindow.Input({
	    action: config.action,
	    item: config.item
	});
	this.input.on('setPhysicalServer', this.onSetPhysicalServer.createDelegate(this));

	if (this.action != 'update') {
	    this.tags = new Servers.NewServerWindow.Tags();
	    this.failoverTargets = new Servers.NewServerWindow.FailoverTargets();
	}

	this.avatar = new Servers.NewServerWindow.Avatar();
	this.avatar.on('setAvatar', this.onSetAvatar.createDelegate(this));

	var cardItems = null;
	if (this.action == 'create')
	    cardItems = [
		this.selectImage,
		this.input,
		this.tags,
		this.failoverTargets,
		this.avatar
	    ];
	else if (this.action == 'import')
	    cardItems = [
		this.selectImportTarget,
		this.selectImage,
		this.input,
		this.tags,
		this.failoverTargets,
		this.avatar
	    ];
	else
	    cardItems = [
		this.input,
		this.avatar
	    ];

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
	    if (this.action != 'create') {
		this.card.layout.setActiveItem('selectImportTarget');
		this.prevButton.disable();
	    }
	} else if (cardId == 'input') {
	    if (this.action != 'update') {
		this.card.layout.setActiveItem('selectImage');
		if (this.action == 'create')
		    this.prevButton.disable();
	    }
	} else if (cardId == 'tags') {
	    this.card.layout.setActiveItem('input');
	} else if (cardId == 'failoverTargets') {
	    this.card.layout.setActiveItem('tags');
	} else if (cardId == 'avatar') {
	    if (this.action != 'update') {
		this.card.layout.setActiveItem('failoverTargets');
	    } else {
		this.card.layout.setActiveItem('input');
		this.prevButton.disable();
	    }
	    this.nextButton.enable();
	    this.nextButton.setText('Next >');
	}
    },

    nextCard: function() {
	var cardId = this.card.layout.activeItem.getItemId();
	if (cardId == 'selectImportTarget') {
	    if (!this.selectImportTarget.onNext())
		return;
	    this.card.layout.setActiveItem('selectImage');
	    this.prevButton.enable();
	} else if (cardId == 'selectImage') {
	    if (!this.selectImage.onNext())
		return;
	    this.card.layout.setActiveItem('input');
	    this.prevButton.enable();
	} else if (cardId == 'input') {
	    if (!this.input.onNext())
		return;
	    if (this.action != 'update') {
		this.card.layout.setActiveItem('tags');
	    } else {
		this.card.layout.setActiveItem('avatar');
		this.prevButton.enable();
		this.nextButton.setText('Update');
	    }
	} else if (cardId == 'tags') {
	    this.tags.onNext();
	    this.card.layout.setActiveItem('failoverTargets');
	} else if (cardId == 'failoverTargets') {
	    this.failoverTargets.onNext();
	    this.card.layout.setActiveItem('avatar');
	    this.nextButton.disable();
	    if (this.action == 'create')
		this.nextButton.setText('Create');
	    else if (this.action == 'import')
		this.nextButton.setText('Import');
	} else if (cardId == 'avatar') {
	    this.prevCard();
	    this.prevCard();
	    this.form.getForm().submit(this.submitConfig);
	}
    },

    onSelectImportTarget: function(item) {
	this.input.setImportTargetValues(item);
    },

    onSetPhysicalServer: function(config) {
	if (this.action != 'update')
	    this.failoverTargets.setPhysicalServer(config);
    },

    onSetAvatar: function() {
	this.nextButton.enable();
    },

    setValues: function(item) {
	this.input.setValues(item);
    }

});
