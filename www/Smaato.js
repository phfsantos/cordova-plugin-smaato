/*

Copyright 2015 Pedro Santos

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

var argscheck = require('cordova/argscheck'),
	exec = require('cordova/exec');



var Smaato = function (element, options) {
	if (!element || typeof element !== "object") {
		throw "element is invalid";
	}

	this.element = element;

	//creates webview
	this.setupWebview();

	this.element.style.display = "none";
	this.element.style.overflow = "hidden";
	this.element.style.position = "fixed";

	this.options = {};
	this.setOptions(options);

	this.setSize().setPosition().reload();
	this.errorReloads = 0;

	return this;
};

Smaato.prototype.setupWebview = function () {
	this.iframe = document.createElement("iframe");
	
	this.iframe.setAttribute("sandbox", "allow-scripts allow-forms allow-top-navigation");
	this.iframe.setAttribute("seamless", "seamless");
	this.iframe.setAttribute("scrolling", "no");
	this.iframe.setAttribute("name", "webview");	
	this.iframe.style.width = "100%";
	this.iframe.style.height = "100%";
	this.iframe.style.overflow = "hidden";
	this.iframe.style.position = "relative";
	this.iframe.style.zIndex = 2001;

	this.element.appendChild(this.iframe);
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
		gps:                userOptions.gps             || this.options.gps             || undefined,       // GPS coordinates of the user�s location.
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
			var windowHeight = "innerHeight" in window ? window.innerHeight : document.documentElement.offsetHeight; 
			if ( windowHeight < 1025) {
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
	var left, top, bottom, right;
	var windowHeight = "innerHeight" in window ? window.innerHeight : document.documentElement.offsetHeight; 
	var windowWidth = "innerWidth" in window ? window.innerWidth : document.documentElement.offsetWidth; 
	this.element.style.position = "fixed";
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
			top = (windowHeight - this.element.offsetHeight) / 2;
			left = (windowWidth - this.element.offsetWidth) / 2;
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
			left = (windowWidth - this.element.offsetWidth) / 2;
			break;
		case SMAATO_AD_POSITION.TOP_CENTER:
			top = 0;
			left = (windowWidth - this.element.offsetWidth) / 2;
			break;
		case SMAATO_AD_POSITION.TOP_RIGHT:
			top = 0;
			right = 0;
			break;
		case SMAATO_AD_POSITION.NO_CHANGE:
			left = bottom = right = top = undefined;
			this.element.style.position = "relative";
			break;
		case SMAATO_AD_POSITION.TOP_LEFT:
		default:
			left = top = 0;
			break;
	}

	this.element.style.top = (top !== undefined ? top + "px" : undefined);
	this.element.style.right = (right !== undefined ? right + "px" : undefined);
	this.element.style.bottom = (bottom !== undefined ? bottom + "px" : undefined);
	this.element.style.left = (left !== undefined ? left + "px" : undefined);

	return this;
};

Smaato.prototype.reload = function () {
	var windowHeight = "innerHeight" in window ? window.innerHeight : document.documentElement.offsetHeight; 
	var windowWidth = "innerWidth" in window ? window.innerWidth : document.documentElement.offsetWidth; 
	var ad = {
		SomaUserID: this.options.SomaUserID,
		pub: this.options.isTesting ? 0 : this.options.publisherId,
		adspace: this.options.isTesting ? 0 : this.options.adId,
		width: this.element.offsetWidth,
		height: this.element.offsetHeight,
		format: this.options.type,
		formatstrict: true,
		dimension: this.options.dimension,
		dimensionstrict: this.options.dimensionstrict,
		response: this.options.type === "video" ? "xml" : "html",
		coppa: this.options.childDirected ? 1 : 0,
		gps: this.options.gps,
		javascriptenabled: true,
		screenHeight: windowHeight,
		screenWidth: windowWidth,
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
	var params = [], key, value, query;
	for(key in ad)if(ad.hasOwnProperty(key)){
		value = ad[key];
		params[params.length] = encodeURIComponent( key ) + "=" + encodeURIComponent( value );
	}
	query = params.join( "&" ).replace( /%20/g, "+" );
	var doneCb = function(){};
    var xhr = new XMLHttpRequest();
    xhr.open('GET', "http://soma.smaato.net/oapi/reqAd.jsp?" + query, true);
    xhr.onreadystatechange = function() {
        try {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
					//Success
				    this.options.SomaUserID = xhr.getResponseHeader("SomaUserID");
					if (this.options.type !== "video") {						
						var somaError = xhr.getResponseHeader("SomaError");
						if (somaError) {
							this.options.onerror && this.options.onerror(this, somaError);
							if (this.options.SomaUserID === undefined && (++this.errorReloads <= 100)) {
								this.reload();
							}
							return false;
						}
			
						if (this.options.autoShow) {
							this.show();
						}
			
						this.options.SomaUserID = xhr.getResponseHeader("SomaUserID");
			
						this.iframe.setAttribute("srcdoc", "<!DOCTYPE html><html><head><title>Smaato Ad page</title> <script src='http://code.jquery.com/jquery-2.1.3.min.js'></script><script src='https://raw.githubusercontent.com/aFarkas/html5shiv/master/src/html5shiv.js'></script><style> #adContent>p { padding: 0; margin: 0; }</style></head><body style='overflow:hidden;margin: 0; padding: 0;'><div id='adContent'>" + xhr.responseText + "</div></body></html>");
					} else {
						var xml = xhr.responseXML;
						var errors = xml.getElementsByTagName("error");
						if (errors.length && errors[0].textContent) {
						    this.reload();
						    return false;
						}
			
						if (this.options.autoShow) {
						    this.show();
						}
						
						var mediaFiles = xml.getElementsByTagName("mediafile");
						var links = xml.getElementsByTagName("link");
						var link = links.length?links[0]:{};
					    if (mediaFiles.length) {							
					        var content = "<a target='_blank' href='" + (link.textContent ? link.textContent : "") + "'>";
					        //add video with all the sources
					        content += " <video width='" + this.options.width + "' height='" + this.options.height + "' autoplay='autoplay'>";
							for(var i = 0, mediaFile = mediaFiles[i]; i < mediaFiles.length; i++, mediaFile = mediaFiles[i]){
								content += "<source src='" + mediaFile.textContent + "' type='" + (mediaFile.getAttribute("type")?mediaFile.getAttribute("type"):"video/mp4") + "'>";
							}
					        content += "Your browser does not support the video tag.</video></a>";
			
			                //add beacon to the content string							
							var beacons = xml.getElementsByTagName("beacon");
						    if (beacons.length) {
								for(var i = 0, beacon = beacons[i]; i < beacons.length; i++, beacon = beacons[i]){
									content += "<img src='" + beacon.textContent + "' width='1' height='1' />";
						        }			
							}
							this.iframe.setAttribute("srcdoc", "<!DOCTYPE html><html><head><title>Smaato Ad page</title> <script src='http://code.jquery.com/jquery-2.1.3.min.js'></script><script src='https://raw.githubusercontent.com/aFarkas/html5shiv/master/src/html5shiv.js'></script><style> #adContent>p { padding: 0; margin: 0; }</style></head><body style='overflow:hidden;margin: 0; padding: 0;'><div id='adContent'>" + content + "</div></body></html>");
						    return true;
						}
					}
                }
                else {
					//Error
                }
            }
        }
        catch (e) {
            //Another Error
        }
        if (xhr.readyState === 4){
            doneCb();
		}
    }.bind(this);
	
    xhr.send();
};

Smaato.prototype.remove = function () {	
    if (this.autoReload) clearTimeout(this.autoReload);
    if (this.element) this.element.parentNode.removeChild(this.element);

	return this;
};

Smaato.prototype.hide = function () {
	this.element.style.display = "none";

	return this;
};

Smaato.prototype.show = function () {
	var close, bg, text;
	if (this.options.closeButton) {
		close = document.createElement("div");
		text = document.createTextNode("X");
		close.setAttribute("style", "width: 10px;height:10px;background-color: #222; color: #fff; font-size: 8px; position: absolute; top: 0; right: 0;padding: 2px; text-align: center;font-weight: bold;z-index:2002;");
		close.appendChild(text);
		close.onclick = function (e) {
			e.preventDefault && e.preventDefault();
			e.stopPropagation && e.stopPropagation();
			e.stopImmediatePropagation && e.stopImmediatePropagation();
			if (this.options.onadclosed === undefined || this.options.onadclosed() !== false) {
				this.remove && this.remove();
			}
		}.bind(this);
		this.element.appendChild(close);
	}

	if (this.options.overlay) {
		bg = document.createElement("div");
		bg.setAttribute("style", "width: 100%;height:100%;background-color: #444;background-color: rgba(0,0,0,0.8); position: fixed; top: 0; left: 0;z-index:2000;");
		bg.onclick = function (e) {
			e.preventDefault && e.preventDefault();
			e.stopPropagation && e.stopPropagation();
			e.stopImmediatePropagation && e.stopImmediatePropagation();
			if (this.options.onadclosed === undefined || this.options.onadclosed() !== false) {
				this.remove && this.remove();
			}
		}.bind(this);
		this.element.insertBefore(bg, this.element.firstChild);
	}

	this.element.style.display = "block";

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


