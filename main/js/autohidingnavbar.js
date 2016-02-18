  WebFontConfig = {
    google: { families: [ 'Days+One::latin', 'Cherry+Cream+Soda::latin', 'Nobile:400,700:latin', 'Ruda:400,900:latin', 'Open+Sans:400,800:greek,latin' ] }
  };
  (function() {
    var wf = document.createElement('script');
    wf.src = ('https:' == document.location.protocol ? 'https' : 'http') +
      '://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js';
    wf.type = 'text/javascript';
    wf.async = 'true';
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(wf, s);
  })();

/* detect touch */
if("ontouchstart" in window){
    document.documentElement.className = document.documentElement.className + " touch";
}
if(!$("html").hasClass("touch")){
    /* background fix */
    $(".parallax").css("background-attachment", "fixed");
}

/* fix vertical when not overflow
call fullscreenFix() if .fullscreen content changes */
function fullscreenFix(){
    var h = $('body').height();
    // set .fullscreen height
    $(".content-b").each(function(i){
        if($(this).innerHeight() > h){ $(this).closest(".fullscreen").addClass("overflow");
        }
    });
}
$(window).resize(fullscreenFix);
fullscreenFix();

/* resize background images */
function backgroundResize(){
    var windowH = $(window).height();
    $(".background").each(function(i){
        var path = $(this);
        // variables
        var contW = path.width();
        var contH = path.height();
        var imgW = path.attr("data-img-width");
        var imgH = path.attr("data-img-height");
        var ratio = imgW / imgH;
        // overflowing difference
        var diff = parseFloat(path.attr("data-diff"));
        diff = diff ? diff : 0;
        // remaining height to have fullscreen image only on parallax
        var remainingH = 0;
        if(path.hasClass("parallax") && !$("html").hasClass("touch")){
            var maxH = contH > windowH ? contH : windowH;
            remainingH = windowH - contH;
        }
        // set img values depending on cont
        imgH = contH + remainingH + diff;
        imgW = imgH * ratio;
        // fix when too large
        if(contW > imgW){
            imgW = contW;
            imgH = imgW / ratio;
        }
        //
        path.data("resized-imgW", imgW);
        path.data("resized-imgH", imgH);
        path.css("background-size", imgW + "px " + imgH + "px");
    });
}
$(window).resize(backgroundResize);
$(window).focus(backgroundResize);
backgroundResize();

/* set parallax background-position */
function parallaxPosition(e){
    var heightWindow = $(window).height();
    var topWindow = $(window).scrollTop();
    var bottomWindow = topWindow + heightWindow;
    var currentWindow = (topWindow + bottomWindow) / 2;
    $(".parallax").each(function(i){
        var path = $(this);
        var height = path.height();
        var top = path.offset().top;
        var bottom = top + height;
        // only when in range
        if(bottomWindow > top && topWindow < bottom){
            var imgW = path.data("resized-imgW");
            var imgH = path.data("resized-imgH");
            // min when image touch top of window
            var min = 0;
            // max when image touch bottom of window
            var max = - imgH + heightWindow;
            // overflow changes parallax
            var overflowH = height < heightWindow ? imgH - height : imgH - heightWindow; // fix height on overflow
            top = top - overflowH;
            bottom = bottom + overflowH;
            // value with linear interpolation
            var value = min + (max - min) * (currentWindow - top) / (bottom - top);
            // set background-position
            var orizontalPosition = path.attr("data-oriz-pos");
            orizontalPosition = orizontalPosition ? orizontalPosition : "50%";
            $(this).css("background-position", orizontalPosition + " " + value + "px");
        }
    });
}
if(!$("html").hasClass("touch")){
    $(window).resize(parallaxPosition);
    //$(window).focus(parallaxPosition);
    $(window).scroll(parallaxPosition);
    parallaxPosition();
}



/*
 *  Bootstrap Auto-Hiding Navbar - v1.0.4
 *  An extension for Bootstrap's fixed navbar which hides the navbar while the page is scrolling downwards and shows it the other way. The plugin is able to show/hide the navbar programmatically as well.
 *  http://www.virtuosoft.eu/code/bootstrap-autohidingnavbar/
 *
 *  Made by István Ujj-Mészáros
 *  Under Apache License v2.0 License
 */
;(function($, window, document, undefined) {
  var pluginName = 'autoHidingNavbar',
      $window = $(window),
      $document = $(document),
      _scrollThrottleTimer = null,
      _resizeThrottleTimer = null,
      _throttleDelay = 70,
      _lastScrollHandlerRun = 0,
      _previousScrollTop = null,
      _windowHeight = $window.height(),
      _visible = true,
      _hideOffset,
      defaults = {
        disableAutohide: false,
        showOnUpscroll: true,
        showOnBottom: true,
        hideOffset: 'auto', // "auto" means the navbar height
        animationDuration: 200
      };

  function AutoHidingNavbar(element, options) {
    this.element = $(element);
    this.settings = $.extend({}, defaults, options);
    this._defaults = defaults;
    this._name = pluginName;
    this.init();
  }

  function hide(autoHidingNavbar) {
    if (!_visible) {
      return;
    }

    autoHidingNavbar.element.addClass('navbar-hidden').animate({
      top: -autoHidingNavbar.element.height()
    }, {
      queue: false,
      duration: autoHidingNavbar.settings.animationDuration
    });

    $('.dropdown.open .dropdown-toggle', autoHidingNavbar.element).dropdown('toggle');

    _visible = false;
  }

  function show(autoHidingNavbar) {
    if (_visible) {
      return;
    }

    autoHidingNavbar.element.removeClass('navbar-hidden').animate({
      top: 0
    }, {
      queue: false,
      duration: autoHidingNavbar.settings.animationDuration
    });
    _visible = true;
  }

  function detectState(autoHidingNavbar) {
    var scrollTop = $window.scrollTop(),
        scrollDelta = scrollTop - _previousScrollTop;

    _previousScrollTop = scrollTop;

    if (scrollDelta < 0) {
      if (_visible) {
        return;
      }

      if (autoHidingNavbar.settings.showOnUpscroll || scrollTop <= _hideOffset) {
        show(autoHidingNavbar);
      }
    }
    else if (scrollDelta > 0) {
      if (!_visible) {
        if (autoHidingNavbar.settings.showOnBottom && scrollTop + _windowHeight === $document.height()) {
          show(autoHidingNavbar);
        }
        return;
      }

      if (scrollTop >= _hideOffset) {
        hide(autoHidingNavbar);
      }
    }

  }

  function scrollHandler(autoHidingNavbar) {
    if (autoHidingNavbar.settings.disableAutohide) {
      return;
    }

    _lastScrollHandlerRun = new Date().getTime();

    detectState(autoHidingNavbar);
  }

  function bindEvents(autoHidingNavbar) {
    $document.on('scroll.' + pluginName, function() {
      if (new Date().getTime() - _lastScrollHandlerRun > _throttleDelay) {
        scrollHandler(autoHidingNavbar);
      }
      else {
        clearTimeout(_scrollThrottleTimer);
        _scrollThrottleTimer = setTimeout(function() {
          scrollHandler(autoHidingNavbar);
        }, _throttleDelay);
      }
    });

    $window.on('resize.' + pluginName, function() {
      clearTimeout(_resizeThrottleTimer);
      _resizeThrottleTimer = setTimeout(function() {
        _windowHeight = $window.height();
      }, _throttleDelay);
    });
  }

  function unbindEvents() {
    $document.off('.' + pluginName);

    $window.off('.' + pluginName);
  }

  AutoHidingNavbar.prototype = {
    init: function() {
      this.elements = {
        navbar: this.element
      };

      this.setDisableAutohide(this.settings.disableAutohide);
      this.setShowOnUpscroll(this.settings.showOnUpscroll);
      this.setShowOnBottom(this.settings.showOnBottom);
      this.setHideOffset(this.settings.hideOffset);
      this.setAnimationDuration(this.settings.animationDuration);

      _hideOffset = this.settings.hideOffset === 'auto' ? this.element.height() : this.settings.hideOffset;
      bindEvents(this);

      return this.element;
    },
    setDisableAutohide: function(value) {
      this.settings.disableAutohide = value;
      return this.element;
    },
    setShowOnUpscroll: function(value) {
      this.settings.showOnUpscroll = value;
      return this.element;
    },
    setShowOnBottom: function(value) {
      this.settings.showOnBottom = value;
      return this.element;
    },
    setHideOffset: function(value) {
      this.settings.hideOffset = value;
      return this.element;
    },
    setAnimationDuration: function(value) {
      this.settings.animationDuration = value;
      return this.element;
    },
    show: function() {
      show(this);
      return this.element;
    },
    hide: function() {
      hide(this);
      return this.element;
    },
    destroy: function() {
      unbindEvents(this);
      show(this);
      $.data(this, 'plugin_' + pluginName, null);
      return this.element;
    }
  };

  $.fn[pluginName] = function(options) {
    var args = arguments;

    if (options === undefined || typeof options === 'object') {
      return this.each(function() {
        if (!$.data(this, 'plugin_' + pluginName)) {
          $.data(this, 'plugin_' + pluginName, new AutoHidingNavbar(this, options));
        }
      });
    } else if (typeof options === 'string' && options[0] !== '_' && options !== 'init') {
      var returns;

      this.each(function() {
        var instance = $.data(this, 'plugin_' + pluginName);

        if (instance instanceof AutoHidingNavbar && typeof instance[options] === 'function') {
          returns = instance[options].apply(instance, Array.prototype.slice.call(args, 1));
        }
      });

      return returns !== undefined ? returns : this;
    }

  };

})(jQuery, window, document);

$('body').scrollspy({
    target: '.bs-docs-sidebar',
    offset: 40
});
$("#sidebar").affix({
    offset: {
      top: 60
    }
});