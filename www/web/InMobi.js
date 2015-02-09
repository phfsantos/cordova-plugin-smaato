
var argscheck = require('cordova/argscheck'),
	exec = require('cordova/exec');

var inmobiExport = {};

inmobiExport.AD_SIZE = {
	"120x20": 1, //All Phones (Feature Phones, iOS, Android)
	"168x28": 2, //All Phones (Feature Phones, iOS, Android)
	"216x36" : 3, //All Phones (Feature Phones, iOS, Android)
	"300x50": 4, //All Phones (Feature Phones, iOS, Android)
	"320x48" : 9, //Smartphones and Tablets (iOS, Android, Others)
	"300x250" :10, //Smartphones and Tablets (iOS, Android, Others)
	"728x90": 11, //Smartphones and Tablets (iOS, Android, Others)
	"468x60": 12, //Smartphones and Tablets (iOS, Android, Others)
	"120x600": 13, //Smartphones and Tablets (iOS, Android, Others)
	"320x480": 14, //Smartphones and Tablets (iOS, Android, Others) – Interstitial ads
	"320x50": 15, //Smartphones and Tablets (iOS, Android, Others) – Rich media expandable ads
	"768x1024": 16, //Tablets (iOS and Android) - Portrait interstitial ads
	"800X1280": 17, //Tablets (iOS, only) - Porttrait Interstitial ads
	"1024x768": 33, //Tablets (iOS, Android)– Landscape Interstitial ads
	"1280x800": 34 //Tablets (iOS, only)– Landscape Interstitial ads
};


inmobiExport.AD_POSITION = {
  NO_CHANGE: 0,
  TOP_LEFT: 1,
  TOP_CENTER: 2,
  TOP_RIGHT: 3,
  LEFT: 4,
  CENTER: 5,
  RIGHT: 6,
  BOTTOM_LEFT: 7,
  BOTTOM_CENTER: 8,
  BOTTOM_RIGHT: 9,
  POS_XY: 10
};

/*
 * set options
 * 
 * set options for all ads banner or interstitial
 */

inmobiExport.options = {};

inmobiExport.setOptions = function (userOptions, successCallback, failureCallback) {
	//assign defaults for arguments
	userOptions = userOptions || {};

	//set options
	inmobiExport.options = {
		adId: userOptions.adId || "", // mobfox ad id
		type: userOptions.type || "banner", // banner, intertitial, fullscreen
		autoShow: userOptions.autoShow || true, // if set to true, no need call showBanner or showInterstitial
		position: userOptions.position || 8, // default position
		adSize: userOptions.adSize || 11, // banner type size
		width: userOptions.width || 720, // banner width, if set adSize to 'CUSTOM'
		height: userOptions.height || 90,// banner height, if set adSize to 'CUSTOM'
		x: userOptions.x || 0, // default X of banner
		y: userOptions.y || 0, // default Y of banner
		isTesting: userOptions.isTesting || false, // if set to true, to receive test ads
		enableVideo: userOptions.enableVideo || false // if set to true, enable video for interstitial
	};
};

inmobiExport.createBanner = function(args, successCallback, failureCallback) {
	var options = {};
	if(typeof args === 'object') {
		for(var k in args) if(args.hasOwnProperty(k)){
			if(k === 'success') { if(args[k] === 'function') successCallback = args[k]; }
			else if(k === 'error') { if(args[k] === 'function') failureCallback = args[k]; }
			else {
				options[k] = args[k];
			}
		}
	} else if(typeof args === 'string') {
		options = { adId: args };
	}

	inmobiExport.setOptions(options);

	inmobiExport.removeBanner();
	$("body").append([
		$("<div></div>", { id: "InMobi", style: "display:none; position: fixed;" })
	]);

	inmobiExport._setSize();
	inmobiExport._setPosition();
	inmobiExport._setScript();

	if (inmobiExport.options.autoShow) {
		inmobiExport.showBanner();
	}
};

inmobiExport._setSize = function () {
	var sizes = {
		1: "120x20", //All Phones (Feature Phones, iOS, Android)
		2: "168x28", //All Phones (Feature Phones, iOS, Android)
		3: "216x36", //All Phones (Feature Phones, iOS, Android)
		4: "300x50", //All Phones (Feature Phones, iOS, Android)
		9: "320x48", //Smartphones and Tablets (iOS, Android, Others)
		10: "300x250", //Smartphones and Tablets (iOS, Android, Others)
		11: "728x90", //Smartphones and Tablets (iOS, Android, Others)
		12: "468x60", //Smartphones and Tablets (iOS, Android, Others)
		13: "120x600", //Smartphones and Tablets (iOS, Android, Others)
		14: "320x480", //Smartphones and Tablets (iOS, Android, Others) – Interstitial ads
		15: "320x50", //Smartphones and Tablets (iOS, Android, Others) – Rich media expandable ads
		16: "768x1024", //Tablets (iOS and Android) - Portrait interstitial ads
		17: "800X1280", //Tablets (iOS, only) - Porttrait Interstitial ads
		33: "1024x768", //Tablets (iOS, Android)– Landscape Interstitial ads
		34: "1280x800" //Tablets (iOS, only)– Landscape Interstitial ads
	};

	var wH = sizes[inmobiExport.options.adSize].split("x");
	var height = parseInt(wH[0]);
	var width = parseInt(wH[1]);

	$("#InMobi").css({
		height: (height !== undefined ? height : undefined),
		width: (width !== undefined ? width : undefined)
	});
};

inmobiExport._setPosition = function() {
	var $el = $("#InMobi");
	var left, top, bottom, right;
	switch (inmobiExport.options.position) {
		case inmobiExport.AD_POSITION.POS_XY:
			left = inmobiExport.options.x;
			top = 0;
			break;
		case inmobiExport.AD_POSITION.LEFT:
			left = 0;
			break;
		case inmobiExport.AD_POSITION.RIGHT:
			right = 0;
			break;
		case inmobiExport.AD_POSITION.CENTER:
			top = ($(window).height() - $el.height()) / 2;
			left = ($(window).width() - $el.width()) / 2;
			break;
		case inmobiExport.AD_POSITION.BOTTOM_LEFT:
			bottom = 0;
			left = 0;
			break;
		case inmobiExport.AD_POSITION.BOTTOM_RIGHT:
			bottom = 0;
			right = 0;
			break;
		case inmobiExport.AD_POSITION.BOTTOM_CENTER:
			bottom = 0;
			left = ($(window).width() - $el.width()) / 2;
			break;
		case inmobiExport.AD_POSITION.TOP_CENTER:
			top = 0;
			left = ($(window).width() - $el.width())/2;
			break;
		case inmobiExport.AD_POSITION.TOP_RIGHT:
			top = 0;
			right = 0;
			break;
		case inmobiExport.AD_POSITION.NO_CHANGE:
		case inmobiExport.AD_POSITION.TOP_LEFT:
		default:
			left = top = 0;
			break;
	}

	$("#InMobi").css({
		top: (top !== undefined ? top + "px" : undefined),
		right: (right !== undefined ? right + "px" : undefined),
		bottom: (bottom !== undefined ? bottom + "px" : undefined),
		left: (left !== undefined ? left + "px" : undefined)
	});
};

inmobiExport._setScript = function() {
	inmobi_conf = {
	    siteid: inmobiExport.options.adId,
	    test: inmobiExport.options.isTesting ? true : false,
	    targetWindow : "_blank",
	    slot: inmobiExport.options.adSize,
	    autoRefresh: 40
	};

	var sc = document.createElement("script");
	sc.src = "http://cf.cdn.inmobi.com/ad/inmobi.js";
	sc.type = "text/javascript";
	document.getElementById("InMobi").appendChild(sc);
};

inmobiExport.removeBanner = function(successCallback, failureCallback) {
	$("#InMobi").remove();
};

inmobiExport.hideBanner = function(successCallback, failureCallback) {
	$("#InMobi").hide();
};

inmobiExport.showBanner = function(position, successCallback, failureCallback) {
	$("#InMobi").show();
};

inmobiExport.showBannerAtXY = function(x, y, successCallback, failureCallback) {
	if(typeof x === 'undefined') x = 0;
	if(typeof y === 'undefined') y = 0;
	inmobiExport.options.x = x;
	inmobiExport.options.y = y;
	inmobiExport._setPosition();
};

/*
 <span id="native_ad_1"></span>
<script>
request_native_ad({
html_template:'<li><a href="NATIVEASSET:CLICKURL"><img src="NATIVEASSET:IMAGE:ICON">NATIVEASSET:TEXT:HEADLINE - <span>By NATIVEASSET:TEXT:ADVERTISER - NATIVEASSET:TEXT:CTA</span></a></li></ol></div>',
publisher_id:'2d5420d8b95312e60a7d61567f3c8b80',
ad_num:1
});
</script>
 */

inmobiExport.prepareInterstitial = function(args, successCallback, failureCallback) {
	var options = {};
	if(typeof args === 'object') {
		for(var k in args) {
			if(k === 'success') { if(args[k] === 'function') successCallback = args[k]; }
			else if(k === 'error') { if(args[k] === 'function') failureCallback = args[k]; }
			else {
				options[k] = args[k];
			}
		}
	} else if(typeof args === 'string') {
		options = { adId: args };
	}

	inmobiExport.setOptions(options);

	inmobiExport.removeBanner();
	$("body").append([
		$("<div/>", { id: "InMobi", style: "display:none; position: fixed; width: 100%; height: 100%;top: 0; left: 0;" }).append([
			$("<span></span>", { id: "native_ad_1" })
		])
	]);

	request_native_ad({
		html_template: '<li><a href="NATIVEASSET:CLICKURL"><img src="NATIVEASSET:IMAGE:ICON">NATIVEASSET:TEXT:HEADLINE - <span>By NATIVEASSET:TEXT:ADVERTISER - NATIVEASSET:TEXT:CTA</span></a></li></ol></div>',
		publisher_id: inmobiExport.options.adID,
		ad_num: 1
	});

	if (inmobiExport.options.autoShow) {
		inmobiExport.showInterstitial();
	}
};

inmobiExport.showInterstitial = function(successCallback, failureCallback) {
	$("#InMobi").show();
};

module.exports = inmobiExport;


