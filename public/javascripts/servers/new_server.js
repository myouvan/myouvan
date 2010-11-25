Servers.NewServerWindow = Ext.extend(Ext.Window, {

    constructor: function() {
	this.makeComponents();
	Servers.NewServerWindow.superclass.constructor.call(this, {
	    title: 'Create Server',
	    modal: true,
	    width: 650,
	    height: 468,
	    layout: 'fit',
	    plain: true,
	    closable: false,
	    items: this.card,
	    buttonAlign: 'center',
	    buttons: [
		this.prevButton,
		this.nextButton,
		this.closeButton
	    ],
	    listeners: {
		beforeshow: function() {
		    this.activeItem = 0;
		    this.card.layout.setActiveItem(this.activeItem);

		    this.prevButton.disable();
		    this.nextButton.enable();
		    this.nextButton.setText('Next');

		    this.selectImagePanel.resetPanel();
		    this.formPanel.resetPanel();
		    this.tagsPanel.resetPanel();
		}
	    }
	});
    },

    makeComponents: function() {
	this.selectImagePanel = new Servers.NewServerWindow.SelectImagePanel();
	this.formPanel = new Servers.NewServerWindow.FormPanel();
	this.tagsPanel = new Servers.NewServerWindow.TagsPanel();
	this.flashPanel = new Servers.NewServerWindow.FlashPanel();

	var wdw = this;
	this.flashPanel.onSet(function(thumb, icon) {
	    wdw.formPanel.setAvatar(thumb, icon);
	    wdw.nextButton.enable();
	});

	this.makeCard();
	this.makeButtons();
    },

    makeCard: function() {
	this.activeItem = 0;
	this.card = new Ext.Panel({
	    layout: 'card',
	    activeItem: 0,
	    width: 400,
	    items: [
		this.selectImagePanel,
		this.formPanel,
		this.tagsPanel,
		this.flashPanel
	    ]
	});
    },

    makeButtons: function() {
	var wdw = this;

	this.prevButton = new Ext.Button({
	    text: 'Prev',
	    handler: function() {
		wdw.prevCard();
	    }
	});

	this.nextButton = new Ext.Button({
	    text: 'Next',
	    handler: function() {
		wdw.nextCard();
	    }
	});

	this.closeButton = new Ext.Button({
	    text: 'Close',
	    handler: function() {
		wdw.hide();
	    }
	});
    },

    prevCard: function() {
	if (this.activeItem > 0) {
	    if (this.activeItem == 1) {
		this.prevButton.disable();
	    } else if (this.activeItem == 3) {
		this.nextButton.setText('Next');
		this.nextButton.enable();
	    }

	    this.activeItem--;
	    this.card.layout.setActiveItem(this.activeItem);
	}
    },

    nextCard: function() {
	if (this.activeItem < 3) {
	    if (this.activeItem == 0) {
		if (!this.selectImagePanel.isSelected()) {
		    Ext.MessageBox.alert('Error', 'Select an image');
		    return;
		}
		var id = this.selectImagePanel.selectedId();
		this.formPanel.setImageId(id);

		this.prevButton.enable();
	    } else if (this.activeItem == 2) {
		this.formPanel.setTags(this.tagsPanel.tags);

		this.nextButton.setText('Create');
		this.nextButton.disable();
	    }

	    this.activeItem++;
	    this.card.layout.setActiveItem(this.activeItem);
	} else if (this.activeItem == 3) {
	    this.prevCard();
	    this.prevCard();
	    this.formPanel.submit();
	}
    },

    setSubmitOpts: function(opts) {
	this.formPanel.setSubmitOpts(opts);
    }

});
