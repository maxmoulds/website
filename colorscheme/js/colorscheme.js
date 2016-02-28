/* The Colorizer OPTIONS object */
	var colorizerOptions = {

		width:	960,
		/* min width 640 */

		height: 500,
		/* min height 500 */

		dark: true,
		/* or true */

		templateURL: 'http://website-maxmoulds.c9users.io/main/color-preview.html',
		/* preview document, must be full URL incl. protocol://domain */
		
		paletteUID: '70Y1N1k7DoD3inN5io1acpMc-slkaya6g6m9dzgPb36Obw3Wk1A4y1K8A1F6j2r5y3-40k435ne98A9W6rbk5lfF5u', // '55p0u0kleqtbzEKgVuIpcmGtdhZ',
		/* my hand-picked initial palette (4-colors in this case) */

		paletteUIDdefault: '70Y1N1k7DoD3inN5io1acpMc-slkaya6g6m9dzgPb36Obw3Wk1A4y1K8A1F6j2r5y3-40k435ne98A9W6rbk5lfF5u',
		/* my hand-picked default palette (to be used for reset) - be sure to use the same model! */

		colorizeMode: 'custom'
		/* possible values: class | less | custom */

		}
		
		
/* OLD -- CODE */

/* Get the button in the DOM */
/*	
	var btn = document.getElementById('col-btn-less');
*/
/* Add onclick event handler */
/* Feel free to use btn.addEventListener() or any other method you prefer */
/*
	btn.onclick = function(e){
		e.preventDefault();
		_paletton.open(colorizerOptions, colorizerCallback);
		};

*/

/* Your custom callback */
/* This one just gets the Colorizer data and dumps them into the page as a readable text */

	function colorizerCallback(data){
		// data = { colorTable, paletteUID, myData }
		// your code here
	
		var res = document.getElementById('res'), html = '';

		if (!data) {
			res.innerHTML = 'cancelled, empty object returned';
			return
			}
		
		colorizerOptions.paletteUID = data.paletteUID;
		/* storing the palette for next time */
		
		function parse(obj,prefix){
		// a dummy recursive parser just to print out the data
			var k, x, str = '{\n';
			for (k in obj) {
				x = obj[k];
				str += prefix + '   ' + k + ': ';
				if (typeof x==='undefined' || x===null) str += 'null';
				else if (typeof x==='object') str += parse(x, prefix + '   ');
				else str += x;
				str += '\n';
				}
			str += prefix + '   ' + '}';
			return str;
			};
	
		html = parse(data,'');
		res.innerHTML = '<b>result</b> = ' + html;

		} // callback
		
$(function(){
// on ready function

	window.addEventListener('message',function(e){
		if (!e || !e.data) return;
		if (e.data.id=='palettonwidget/colorize/class') colorizeClass(e.data.data);
		else if (e.data.id=='palettonwidget/colorize/less') colorizeLess(e.data.data);
		},false);

	var msg = {
		id: 'palettonwidget/previewloaded',
		data: 'null'
		}
	parent.postMessage(msg, '*');



	var cssProps = {
		'bgcol': 'background',
		'col': 'color',
		'bdcol': 'border-color'
		}

	function colorizeClass(colTable){
		var i, key, pkey, c1, c2;
		for (colId in colTable['byPalette']) {
			for (i=0;i<5;i++) {
				for (pkey in cssProps) {
					c1 = colTable['byPalette'][colId][i];
					c2 = colTable['byLum'][colId][i];
					$('.' + pkey + '-' + colId + '-' + i).css( cssProps[pkey], c1 );
					$('.' + pkey + '-' + colId + '-lum-' + i).css( cssProps[pkey], c2 );
					}
				}
			}
		}


	function colorizeLess(colTable){
		var i, tbl, colId, c1, c2,
			lessObj = {};
		for (colId in colTable['byPalette']) {
			for (i=0;i<5;i++) {
				c1 = colTable['byPalette'][colId][i]
				c2 = colTable['byLum'][colId][i]
				lessObj['@col-'+colId+'-'+i] = c1
				lessObj['@col-'+colId+'-lum-'+i] = c2
				}
			}
		less.modifyVars(lessObj);
		}


	});

var _paletton = null;

(function(){

	var k, setup, defaults, options,
		html, body, iframe, overlay,
		init, done, open, colorize,
		callbackDone = null;

		
// Check browser

	function isBadBrowser() {
		var ie, opera, feat, nav = navigator.userAgent.toLowerCase();
		ie = (nav.indexOf('msie') != -1) ? parseInt(nav.split('msie')[1]) : 0;
		opera = !!window.opera;
		feat = typeof window.postMessage=='function' && typeof window.addEventListener=='function';
		return (ie && ie<=9) || opera || !feat; // = bad
		}

	if (isBadBrowser()) {
		_paletton = {
			open: function() {
			// fail instead of open in unsupported browser
				alert('Unfortunatelly, your browser is not supported for Paletton Live Colorizer. A modern browser is required, like IE10+, Chrome, Safari, or Firefox.');
				}
			}
		return;
		}



// SETUP values = private options

	setup = {

		widgetServer: 'http://paletton.com',
		iFramePath: '/widget/widget.html',
		iFrameId: 'paletton-widget-iframe',
		overlayId: 'paletton-widget',

		events: {
			loaded: 'palettonwidget/loaded',		// listen; widget is loaded and ready => init
			done: 'palettonwidget/done',			// listen; widget has to be closed
			pars: 'palettonwidget/pars'				// broadcast; inited, send options/pars to widget
			},

		minWidth: 640,
		minHeight: 500

		}


// DEFAULT options = public options


	defaults = {

	// Editor options

		width: 960,		// colorizer width in pixels, min width 640 (the palette editor is 420px wide, the rest is for preview)
		height: 500,	// colorizer height in pixels, min. height 500
		dark: false,	// false = white Colorizer UI, true = dark Colorizer UI
	
	// Preview templates

		templateURL: '',
		paletteUID: '',

		colorizeMode: 'class',	// class | less | custom

		myData: null,
		
	// Various

		debugMode: false

		}

// /DEFAULT options




// FUNCTIONS


	init = function(){
		var ifr, msg;
		msg = {
			id: setup.events.pars,
			data: options
			}
		ifr = document.getElementById(setup.iFrameId);
		ifr.contentWindow.postMessage(msg, '*');
		}
	
	
	done = function(result){
		overlay.parentNode.removeChild(overlay);
		if (callbackDone && typeof(callbackDone)=='function') callbackDone(result);
		}


	open = function(opt,callback) {

	// generate content

		// shallow options merge 
		options = {}
		for (k in defaults) options[k] = defaults[k]
		for (k in opt) options[k] = opt[k]

		callbackDone = callback;

		var w, h, wh = window.innerHeight,
			bgCol = (options.dark) ? 'rgba(0,0,0,0.85)' : 'rgba(255,255,255,0.85)';
	
		overlay = document.createElement('DIV');
		overlay.id = setup.overlayId;
		with (overlay.style) {
			position = 'absolute';
			zIndex = 99999;
			left = 0;
			top = 0;
			right = 0;
			bottom = 0;
			textAlign = 'center';
			minHeight = '500px';
			background = bgCol;
			}
	
		body = document.getElementsByTagName('BODY')[0];
		body.appendChild(overlay);
		
		iframe = document.createElement('IFRAME');
		iframe.id = setup.iFrameId;
		iframe.src = setup.widgetServer + setup.iFramePath + '#uid=' + options.paletteUID;
		w = Math.max(options.width,setup.minWidth);
		h = Math.max(options.height,setup.minHeight);
		with (iframe.style) {
			width = w + 'px';
			height = h + 'px';
			margin = 'auto';
			marginTop = (wh-h)/2 + 'px';
			border = 'none';
			boxShadow = '3px 3px 15px rgba(0,0,0,0.5)';
			}
	
		overlay.appendChild(iframe);
		}



// INIT

// activate MESSAGES

	window.addEventListener('message',function(e){
		if (!e || !e.data) return;
		if (e.data.id==setup.events.loaded) init();
		else if (e.data.id==setup.events.done) done(e.data.data);
		},false);


// create interface

	_paletton = {
		open: open
		}


	})();
