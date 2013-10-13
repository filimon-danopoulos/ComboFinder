function Model(data) {
  var me = this;
  this.combos = [];
  this.queryParams = {};
  this.start = 0;
  this.getComboData = function(callback) {
    console.log("Parameters: "+JSON.stringify(this.queryParams));
    for (var key in this.queryParams) {
      if (this.queryParams.hasOwnProperty(key)) {
        var value = this.queryParams[key];
        if (Object.prototype.toString.apply(value) === '[object Array]') {
          this.queryParams[key] = value.join('|');
        }
      }
    }
    $.getJSON('/api/combos', this.queryParams, function(data) {    
      if (data) {
        me.combos = [];
        for (var i = 0, iLen = data.length; i < iLen; i++) {
          me.combos.push(data[i]);
        }
        callback();
      }
    });
  }
}

function View(model, controller) {
  this.model = model;
  var me = this;
  this.renderCombos = function() {
    var container = $('#search-result');
    container.empty();
    
    if (me.model.combos.length === 0) {    
      container.append('<h4 class="text-center">No combos found!</h4><div class="text-center"><a href="#find" class="btn btn-success">Back to search form!</a></div>');
      window.location.hash = "#combos";
      return;
    }
    
    var html = [];
    var pageController = generatePageControllerHTML();
    html.push(pageController);
    var iBound = ((me.model.start+10) > me.model.combos[0].total ? me.model.combos[0].total : me.model.start+10)
    for (var i = me.model.start; i < iBound; i++) {
      html.push(generateComboHTML(me.model.combos[i]));
    };
    
    html.push('<div class="combo-bottom-menu"><button id="combo-bottom-menu-to-top" class="btn btn-success">Go to top</button></div>');
    container.append(html.join(''));
    window.location.hash = "#combos";
    
    enablePageControllerButtons();
    controller.bindEvents();
  };
  
  ///
  /// Enables or disables the next and previous buttons depending on the current page.
  ///
  var enablePageControllerButtons = function () {
    var startValue = me.model.start;
    var totalCount = me.model.combos[0].total;
    $('.page-info').text('Showing '+(startValue+1)+'-'+((startValue+10) > totalCount ? totalCount : startValue+10)+' of '+totalCount+' combos.');    
    if (startValue !== 0) {
      $('.previous-page-button').removeAttr('disabled');
    }
    else {
      $('.previous-page-button').attr('disabled', 'disabled');
    } 
    if (startValue+10 <= totalCount) {
      $('.next-page-button').removeAttr('disabled');
    }
    else {
      $('.next-page-button').attr('disabled', 'disabled');
    }
  };
  
  ///
  /// Generates the HTML that represent the page-contoller
  ///
  var generatePageControllerHTML = function () {
    var pageController = [];
    pageController.push('<div class="well page-controller">');
    pageController.push('<button disabled class="previous-page-button btn"><i class="icon-backward"></i></button>');
    pageController.push('<div class="page-info">Showing 0 of 0 combos.</div>');
    pageController.push('<button disabled class="next-page-button btn"><i class="icon-forward"></i></button>');
    pageController.push('</div>');
    return pageController.join('');
  };
  
  ///
  /// Generates a div containing all the information of a combo.
  ///
  var generateComboHTML = function(combo) {
    var html = [];
    html.push('<div class="combo-container well">');
    html.push('<div class="combo-container-icons">');
    html.push('<div class="combo-container-icons-left">'+
            combo.types.map(function(x) { return '<img src="media/'+x+'.png" alt="'+x+'" height="30" width="30">';}).join('')+'</div>');
    html.push('<div class="combo-container-icons-right">'+
            combo.colors.map(function(x) { return '<img src="media/'+x+'.png" alt="'+x+'" height="30" width="30">';}).join('')+'</div></div>');
    html.push('<div class="combo-container-cards">');
    html.push('<ul class="unstyled">');
    html.push(combo.cards.reduce(function(previous, current, index, array) {
      var result = '<li>'+current+
                     '<button class="expand-image-button btn btn-small"><i class="icon-plus"></i></button>'+
                     '<div class="card-image hidden">'+
                       '<img src="media/cards/'+current.replace(/'/g, '').replace(/ /g, '_')+'.jpg">'+
                     '</div>'+
                   '</li>'+
                   (index+1 === array.length ? '' : '<div class="horizontal-line"/>');
        return previous+result;                   
      }, ""));
    html.push('</ul>');
    html.push('</div>');
    html.push('<button class="btn btn-info combo-container-expand-button">Toggle explanation</button>');
    html.push('<div class="combo-container-details hidden">');
    if (combo.name) {  
      html.push('<h4 class="text-center">Description</h4>');
      html.push('<div class="combo-container-header">'+combo.name+'</div>');
    }
    html.push('<div class="combo-container-explanation">');
    html.push('<h4 class="text-center">Steps</h4>');
    html.push('<ol><li>'+combo.explanation.join('</li><li>')+'</li></ol></div></div>');
    html.push('</div>');
    return html.join('');
  };
};

function Controller() {
  var me = this;
  this.model = new Model();
  this.view = new View(this.model, this);
  this.bindEvents = function() {
    $(window).on('hashchange', this.onHashChanged);
    $('#search-button > button').off('click').on('click', this.onSearchClicked); 
    $('.next-page-button').off('click').on('click', function() {
        me.model.start += 10;
        me.view.renderCombos();
    });
    $('.previous-page-button').off('click').on('click', function () {
        me.model.start -= 10;
        me.view.renderCombos();
    });
    $('.combo-container-expand-button').off('click').on('click', function() {
      var explanation = $(this).siblings('.combo-container-details');
      if (!explanation.hasClass('open')) {
        explanation.removeClass('hidden');
        explanation.addClass('open');
      }
      else {
        explanation.removeClass('open');
        explanation.addClass('hidden');
      }
    });
    
    $('.expand-image-button').off('click').on('click', function() {
      var me = $(this);
      var icon = me.children('i');
      var container = me.siblings('.card-image');
      if (!container.hasClass('hidden')) {
        container.addClass('hidden');
        icon.removeClass('icon-minus');
        icon.addClass('icon-plus');
      }
      else {      
        container.removeClass('hidden');
        icon.removeClass('icon-plus');
        icon.addClass('icon-minus');
      } 
    });
    
    $('#combo-bottom-menu-to-top').off('click').on('click', function() {
      window.scrollTo(0,0);
    });
  };
  
  this.onHashChanged = function() {
    var find = $('#nav-find'),
        combos = $('#nav-combos'),
        about = $('#nav-about'),
        findContent = $('#search-form'),
        combosContent = $('#search-result'),
        aboutContent = $('#about-content');
    find.removeClass('active');
    findContent.addClass('hidden');
    combos.removeClass('active');
    combosContent.addClass('hidden');
    about.removeClass('active');    
    aboutContent.addClass('hidden');
    window.scrollTo(0,1);
    switch (window.location.hash) {
      case '#combos':
        combos.addClass('active');
        combosContent.removeClass('hidden');    
        break;
      case '#about':
        about.addClass('active');  
        aboutContent.removeClass('hidden');
        break;
      default:
        find.addClass('active');
        findContent.removeClass('hidden');
        break;
    }
  };
  
  this.onSearchClicked = function() {
    me.model.queryParams = {
      colors: [],
      allowOtherColors: false,
      types: [],
      allowOtherTypes: true,
      card: ""
    };
    me.model.start = 0;

    // Get checkbox values
    var colorCheckBoxes = $('.color-selection');
    for (var i = 0, iLen = colorCheckBoxes.length; i < iLen; i++) {
      var colorCheckBox = colorCheckBoxes[i];
      if (colorCheckBox.checked) {
        me.model.queryParams.colors.push(colorCheckBox.value);
      }
    }
    var typeCheckBoxes = $('.type-selection');
    for (var i = 0, iBound = typeCheckBoxes.length; i < iBound; i++) {
      var typeCheckBox = typeCheckBoxes[i];
      if (typeCheckBox.checked) {
        me.model.queryParams.types.push(typeCheckBox.value);
      }
      
    }
    // Get card input values
    var cardInput = $('#search-field');
    me.model.queryParams.card = cardInput.val();
    
    // Get additional options
    me.model.queryParams.allowOtherTypes = $('.type-radio:checked').val();
    me.model.queryParams.allowOtherColors = $('.color-radio:checked').val();
    
    // Retrieve initial page.
    me.model.getComboData((function() {
      var that = me;
      return function() {
        that.view.renderCombos();
      };    
    })());
  };
};

$(function() {
  var controller = new Controller();  
  controller.bindEvents();
  // Set hash to find when page is reloaded.
  // We only want hash in order to have back-button compatibility
  window.location.hash = "#find";
  
  // Load some resources that we need.
  var im1 = new Image();
  var im2 = new Image();
  im1.src = 'lib/bootstrap/img/glyphicons-halflings.png';
  im2.src = 'lib/bootstrap/img/glyphicons-halflings-white.png';
});
