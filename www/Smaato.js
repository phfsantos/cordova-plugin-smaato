/// <reference path="adview.html" />
/// <reference path="adview.html" />

var argscheck = require('cordova/argscheck'),
	exec = require('cordova/exec');

var Smaato = function (element, options) {
	if (!element || typeof element !== "object") {
		throw "element is invalid";
	}

	this.element = element;

	//creates webview
	this.setupWebview();

	$(this.element).css({
		display: "none",
		overflow: "hidden",
		position: "fixed"
	});

	this.options = {};
	this.setOptions(options);

	this.setSize().setPosition().reload();
	this.errorReloads = 0;

	return this;
};

Smaato.prototype.setupWebview = function () {
	this.iframe = document.createElement("iframe");

	$(this.iframe).attr({
		sandbox: "allow-scripts allow-forms allow-top-navigation",
		seamless: "seamless",
		scrolling: "no",
		name: "webview"
	}).css({
		width: "100%",
		height: "100%",
		overflow: "hidden",
		position: "relative",
		"z-index": 2001
	});

	$(this.element).html(this.iframe);
};


/*
 * set options
 * 
 * set options for all ads banner or interstitial or video
 */

Smaato.prototype.setOptions = function (userOptions) {
	//assign defaults for arguments
	userOptions = userOptions || {};

	//set options
	this.options = {
		apiver: 415,
		SomaUserID: this.options.SomaUserID,
		dimension: this.options.dimension,
		dimensionstrict: this.options.dimensionstrict,
		// Options name     |   New Value               |   previous value              |   Default Value   |   Description
		publisherId:        userOptions.publisherId     || this.options.publisherId     || "",              // smaato ad publisherId
		adId:               userOptions.adId            || this.options.adId            || "",              // smaato ad id
		type:               userOptions.type            || this.options.type            || "all",           // all, img, text, richmedia, video
		closeButton:        userOptions.closeButton     || this.options.closeButton     || false,            // if set to true, will show a close button
		overlay:            userOptions.overlay         || this.options.overlay         || false,            // if set to true, will show an overlay the under ad
		autoShow:           userOptions.autoShow        || this.options.autoShow        || true,            // if set to true, no need call show
		autoReload:         userOptions.autoReload      || this.options.autoReload      || false,           // if set to true, no need to call reload
		position:           userOptions.position        || this.options.position        || 8,               // default position
		adSize:             userOptions.adSize          || this.options.adSize          || "LEADERBOARD",   // ad size
		width:              userOptions.width           || this.options.width           || 728,             // banner width, if set adSize to 'CUSTOM'
		height:             userOptions.height          || this.options.height          || 90,              // banner height, if set adSize to 'CUSTOM'
		x:                  userOptions.x               || this.options.x               || 0,               // default X of banner
		y:                  userOptions.y               || this.options.y               || 0,               // default Y of banner
		isTesting:          userOptions.isTesting       || this.options.isTesting       || false,           // if set to true, to receive test ads 
		enableVideo:        userOptions.enableVideo     || this.options.enableVideo     || false,           // if set to true, enable video for interstitial
		session:            userOptions.session         || this.options.session         || "",              // session for ads on this device
		childDirected:      userOptions.childDirected   || this.options.childDirected   || false,           // if set to true, ads are safe for children
		gps:                userOptions.gps             || this.options.gps             || undefined,       // GPS coordinates of the user’s location.
		iosadid:            userOptions.iosadid         || this.options.iosadid         || undefined,       // IOS ad id.
		iosadtracking:      userOptions.iosadtracking   || this.options.iosadtracking   || true,            // IOS ad tracking.
		googleadid:         userOptions.googleadid      || this.options.googleadid      || undefined,       // Google ad id.
		googlednt:          userOptions.googlednt       || this.options.googlednt       || false,           // Google ad tracking.
		onerror:            userOptions.onerror         || this.options.onerror         || function () { }, // Function to call when an error occurs
		onadloaded:         userOptions.onadloaded      || this.options.onadloaded      || function () { }, // Function to call when ad loads
		onadclosed:         userOptions.onadclosed      || this.options.onadclosed      || undefined        // Function to call when close button gets clicked
	};

	if (this.options.autoReload !== undefined) {
		if (this.autoReload) {
			clearInterval(this.autoReload);
		}
		this.autoReload = setInterval(this.reload.bind(this), Math.max(20, this.options.autoReload) * 1000);
	} else {
		clearInterval(this.autoReload);
	}


	return this;
};

/*
 
			iosadid: "",
			iosadtracking: true,
			googleadid: "",
			googlednt: false,
 */

Smaato.prototype.setSize = function () {
	var width, height;
	this.options.dimension = "mma";
	this.options.dimensionstrict = false;
	switch (this.options.adSize) {
		case SMAATO_AD_SIZE.TINY_BANNER: // Phones 120 x 20
			width = 120 + "px";
			height = 20 + "px";
			break;
		case SMAATO_AD_SIZE.PUNY_BANNER: // Phones 168 x 28
			width = 168 + "px";
			height = 28 + "px";
			break;
		case SMAATO_AD_SIZE.LITTLE_BANNER: // Phones 216 x 36
			width = 216 + "px";
			height = 36 + "px";
			break;
		case SMAATO_AD_SIZE.SMALL_BANNER: // Phones and Tablets 300 x 50
			width = 300 + "px";
			height = 50 + "px";
			break;
		case SMAATO_AD_SIZE.BANNER:
			width = 320 + "px";
			height = 50 + "px";
			break;
		case SMAATO_AD_SIZE.MEDIUM_RECTANGLE:
			width = 300 + "px";
			height = 250 + "px";
			this.options.dimension = "medrect";
			this.options.dimensionstrict = true;
			break;
		case SMAATO_AD_SIZE.LEADERBOARD:
			width = 728 + "px";
			height = 90 + "px";
			this.options.dimension = "leader";
			this.options.dimensionstrict = true;
			break;
		case SMAATO_AD_SIZE.SKYSCRAPER:
			width = 120 + "px";
			height = 600 + "px";
			this.options.dimension = "sky";
			this.options.dimensionstrict = true;
			break;
		case SMAATO_AD_SIZE.INTERSTITIAL:
			if ($(window).height() < 1025) {
				width = 320 + "px";
				height = 480 + "px";
				this.options.dimension = "full_320x480";
			} else {
				width = 768 + "px";
				height = 1024 + "px";
				this.options.dimension = "full_768x1024";
			}
			//this.options.type = "video";
			this.options.dimensionstrict = true;
			break;
		default:
			width = this.options.width + "px";
			height = this.options.height + "px";
			this.options.dimensionstrict = false;
			break;
	}

	this.element.style.height = height;
	this.element.style.width = width;

	return this;
};

Smaato.prototype.setPosition = function () {
	var $el = $(this.element);
	var left, top, bottom, right;
	$(this.element).css("position", "fixed");
	switch (this.options.position) {
		case SMAATO_AD_POSITION.POS_XY:
			left = this.options.x;
			top = 0;
			break;
		case SMAATO_AD_POSITION.LEFT:
			left = 0;
			break;
		case SMAATO_AD_POSITION.RIGHT:
			right = 0;
			break;
		case SMAATO_AD_POSITION.CENTER:
			top = ($(window).height() - $el.height()) / 2;
			left = ($(window).width() - $el.width()) / 2;
			break;
		case SMAATO_AD_POSITION.BOTTOM_LEFT:
			bottom = 0;
			left = 0;
			break;
		case SMAATO_AD_POSITION.BOTTOM_RIGHT:
			bottom = 0;
			right = 0;
			break;
		case SMAATO_AD_POSITION.BOTTOM_CENTER:
			bottom = 0;
			left = ($(window).width() - $el.width()) / 2;
			break;
		case SMAATO_AD_POSITION.TOP_CENTER:
			top = 0;
			left = ($(window).width() - $el.width()) / 2;
			break;
		case SMAATO_AD_POSITION.TOP_RIGHT:
			top = 0;
			right = 0;
			break;
		case SMAATO_AD_POSITION.NO_CHANGE:
			left = bottom = right = top = undefined;
			$(this.element).css("position", "relative");
			break;
		case SMAATO_AD_POSITION.TOP_LEFT:
		default:
			left = top = 0;
			break;
	}

	$(this.element).css({
		top: (top !== undefined ? top + "px" : undefined),
		right: (right !== undefined ? right + "px" : undefined),
		bottom: (bottom !== undefined ? bottom + "px" : undefined),
		left: (left !== undefined ? left + "px" : undefined)
	});

	return this;
};

Smaato.prototype.reload = function () {
	var $el = $(this.element);
	var ad = {
		SomaUserID: this.options.SomaUserID,
		pub: this.options.isTesting ? 0 : this.options.publisherId,
		adspace: this.options.isTesting ? 0 : this.options.adId,
		width: $el.width(),
		height: $el.height(),
		format: this.options.type,
		formatstrict: true,
		dimension: this.options.dimension,
		dimensionstrict: this.options.dimensionstrict,
		response: this.options.type === "video" ? "xml" : "html",
		coppa: this.options.childDirected ? 1 : 0,
		gps: this.options.gps,
		javascriptenabled: true,
		screenHeight: $(window).height(),
		screenWidth: $(window).width(),
		session: this.options.session
	};
	
	//requests ad
	this.requestAd(ad);

	return this;
};


Smaato.prototype.requestAd = function (ad) {
	if (!ad) {
		return false;
	}

	var jqXHR;

	jqXHR = $.get("http://soma.smaato.net/oapi/reqAd.jsp", ad, function (response) {
		if (this.options.type !== "video") {
			var somaError = jqXHR.getResponseHeader("SomaError");
			if (somaError) {
				this.options.onerror && this.options.onerror(this, somaError);
				if (this.options.SomaUserID === undefined && (++this.errorReloads <= 100)) {
					console.log("z-index:2000;", this.errorReloads);
					this.reload();
				}
				return false;
			}

			if (this.options.autoShow) {
				this.show();
			}

			this.options.SomaUserID = jqXHR.getResponseHeader("SomaUserID");

			$(this.iframe).attr("srcdoc", "<!DOCTYPE html><html><head><title>Smaato Ad page</title> <script src='http://code.jquery.com/jquery-2.1.3.min.js'></script><script src='https://raw.githubusercontent.com/aFarkas/html5shiv/master/src/html5shiv.js'></script><style> #adContent>p { padding: 0; margin: 0; }</style></head><body style='overflow:hidden;margin: 0; padding: 0;'><div id='adContent'>" + response + "</div></body></html>");
		} else {
			//handle video

			var xml = $.parseXML(response);
			var $xml = $(xml);

			var error = $xml.find("error");
			if (error.find("code").text()) {
				PS.debug("error", error.find("desc").text());
				this.reload();
				return false;
			}

			if (this.options.autoShow) {
				this.show();
			}
			var mediaFile = $xml.find("mediafile");
			var link = $xml.find("link");
			if (mediaFile.length) {
				var content = "<a target='_blank' href='" + (link.text() ? link.text() : "http://google.com/") + "'>";
				//add video with all the sources
				content += " <video width='" + this.options.width + "' height='" + this.options.height + "' autoplay='autoplay'>";
				mediaFile.each(function () {
					content += "<source src='" + $(this).text() + "' type='" + ($(this).attr("type") ? $(this).attr("type") : "video/mp4") + "'>";
				});
				content += "Your browser does not support the video tag.</video></a>";

				//add beacon to the content string
				$xml.find("beacon").each(function () {
					content += "<img src='" + this.textContent + "' width='1' height='1' />";
				});

				$(this.iframe).attr("srcdoc", "<!DOCTYPE html><html><head><title>Smaato Ad page</title> <script src='http://code.jquery.com/jquery-2.1.3.min.js'></script><script src='https://raw.githubusercontent.com/aFarkas/html5shiv/master/src/html5shiv.js'></script><style> #adContent>p { padding: 0; margin: 0; }</style></head><body style='overflow:hidden;margin: 0; padding: 0;'><div id='adContent'>" + content + "</div></body></html>");
				return true;
			}
		}
	}.bind(this));
};

Smaato.prototype.remove = function () {
	clearTimeout(this.autoReload);
	$(this.element).remove();

	return this;
};

Smaato.prototype.hide = function () {
	$(this.element).hide();

	return this;
};

Smaato.prototype.show = function () {
	if (this.options.closeButton) {
		$(this.element).append([
			$("<div/>", { style: "width: 10px;height:10px;background-color: #222; color: #fff; font-size: 8px; position: absolute; top: 0; right: 0;padding: 2px; text-align: center;font-weight: bold;z-index:2002;" }).text("X").click(function (e) {
				e.preventDefault && e.preventDefault();
				e.stopPropagation && e.stopPropagation();
				e.stopImmediatePropagation && e.stopImmediatePropagation();
				if (this.options.onadclosed === undefined || this.options.onadclosed() !== false) {
					this.remove && this.remove();
				}
			}.bind(this))
		]);
	}

	if (this.options.overlay) {
		$(this.element).prepend([
			$("<div/>", { style: "width: 100%;height:100%;background-color: #444;background-color: rgba(0,0,0,0.8); position: fixed; top: 0; left: 0;z-index:2000;" }).click(function (e) {
				e.preventDefault && e.preventDefault();
				e.stopPropagation && e.stopPropagation();
				e.stopImmediatePropagation && e.stopImmediatePropagation();
				if (this.options.onadclosed === undefined || this.options.onadclosed() !== false) {
					this.remove && this.remove();

				}
			}.bind(this))
		]);
	}

	$(this.element).show();

	return this;
};

Smaato.prototype.showAtXY = function (x, y) {
	if (typeof x === 'undefined') x = 0;
	if (typeof y === 'undefined') y = 0;
	this.options.x = x;
	this.options.y = y;
	this._setPosition();


	return this;
};


module.exports = Smaato;


