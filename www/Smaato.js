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
	DMVAST = require('./DMVAST'),
    exec = require('cordova/exec');

console.log("DMVAST", DMVAST);

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

    exec(this.setAdID.bind(this), this.setAdIDError, "Smaato", "getAdInfo", []);

    return this;
};

Smaato.prototype.setAdID = function (deviceAdInfo) {
    if (typeof deviceAdInfo == "object" && deviceAdInfo.googleadid) {
        this.options.googleadid = deviceAdInfo.googleadid;
        this.options.googlednt = deviceAdInfo.isLimitAdTrackingEnabled;
    }

    if (typeof deviceAdInfo == "object" && deviceAdInfo.iosadid) {
        this.options.iosadid = deviceAdInfo.iosadid;
        this.options.iosadtracking = deviceAdInfo.iosadtracking;
    }
};

Smaato.prototype.setAdIDError = function () {
    console.log("Device info did not work...")
};

Smaato.prototype.setupWebview = function () {
    this.iframe = document.createElement("iframe");

    this.iframe.setAttribute("sandbox", "allow-scripts allow-popups allow-forms allow-top-navigation");
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
        apiver: 500,
        SomaUserID: this.options.SomaUserID,
        dimension: this.options.dimension,
        dimensionstrict: this.options.dimensionstrict,
        // Options name     |   New Value               |   previous value              |   Default Value   |   Description
        publisherId: userOptions.publisherId || this.options.publisherId || "",              // smaato ad publisherId
        adId: userOptions.adId || this.options.adId || "",              // smaato ad id
        type: userOptions.type || this.options.type || "all",           // all(img, text, richmedia), img, text, richmedia, vast, native
        closeButton: userOptions.closeButton || this.options.closeButton || false,           // if set to true, will show a close button
        overlay: userOptions.overlay || this.options.overlay || false,           // if set to true, will show an overlay the under ad
        autoShow: userOptions.autoShow || this.options.autoShow || true,            // if set to true, no need call show
        autoReload: userOptions.autoReload || this.options.autoReload || false,           // if set to true, no need to call reload
        position: userOptions.position || this.options.position || 8,               // default position
        adSize: userOptions.adSize || this.options.adSize || "LEADERBOARD",   // ad size
        width: userOptions.width || this.options.width || 728,             // banner width, if set adSize to 'CUSTOM'
        height: userOptions.height || this.options.height || 90,              // banner height, if set adSize to 'CUSTOM'
        x: userOptions.x || this.options.x || 0,               // default X of banner
        y: userOptions.y || this.options.y || 0,               // default Y of banner
        isTesting: userOptions.isTesting || this.options.isTesting || false,           // if set to true, to receive test ads
        session: userOptions.session || this.options.session || "",              // session for ads on this device
        childDirected: userOptions.childDirected || this.options.childDirected || false,           // if set to true, ads are safe for children
        gps: userOptions.gps || this.options.gps || undefined,       // GPS coordinates of the user`s location.
        iosadid: userOptions.iosadid || this.options.iosadid || undefined,       // IOS ad id.
        iosadtracking: userOptions.iosadtracking || this.options.iosadtracking || true,            // IOS ad tracking.
        googleadid: userOptions.googleadid || this.options.googleadid || undefined,       // Google ad id.
        googlednt: userOptions.googlednt || this.options.googlednt || false,           // Google ad tracking.
        onerror: userOptions.onerror || this.options.onerror || function () { }, // Function to call when an error occurs
        onadloaded: userOptions.onadloaded || this.options.onadloaded || function () { }, // Function to call when ad loads
        onadclosed: userOptions.onadclosed || this.options.onadclosed || undefined        // Function to call when close button gets clicked
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
            if (windowHeight < 1025) {
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
        apiver: this.options.apiver,
        SomaUserID: this.options.SomaUserID,
        pub: this.options.isTesting ? 0 : this.options.publisherId,
        adspace: this.options.isTesting ? 0 : this.options.adId,
        width: this.element.offsetWidth,
        height: this.element.offsetHeight,
        format: this.options.type,
        formatstrict: true,
        dimension: this.options.dimension,
        dimensionstrict: this.options.dimensionstrict,
        response: this.options.type === "vast" || this.options.type === "native" ? "xml" : "html",
        coppa: this.options.childDirected ? 1 : 0,
        gps: this.options.gps,
        javascriptenabled: true,
        screenHeight: windowHeight,
        screenWidth: windowWidth,
        session: this.options.session
    };
    if (this.options.type === "vast") {
        ad.vastver = 2;
    } else if (this.options.type === "native") {
        ad.nver = 1;
    }

    //requests ad
    this.requestAd(ad);

    return this;
};

Smaato.prototype.requestAd = function (ad) {
    if (!ad) {
        return false;
    }
    var params = [], key, value, query, url;
    for (key in ad) if (ad.hasOwnProperty(key)) {
        value = ad[key];
        if (typeof value != "undefined" && value != "undefined" && value != "") {
            params[params.length] = encodeURIComponent(key) + "=" + encodeURIComponent(value);
        }
    }
    query = params.join("&").replace(/%20/g, "+");
    url = "http://soma.smaato.net/oapi/reqAd.jsp?" + query;

    if (this.options.type === "vast") {
        this.handleVast(url);
    } else if (this.options.type === "native") {
        this.handleNative(url);
    } else {
        this.handleAll(url);
    }
};
Smaato.prototype.handleVast = function (url) {
    if (this.iframe) {
        this.iframe.parentNode.removeChild(this.iframe);
        this.iframe = undefined;
    }
    if (this.webview) {
        this.webview.parentNode.removeChild(this.webview);
        this.webview = undefined;
    }
    var player = document.createElement("video");
    this.element.appendChild(player);

    //DMVAST handles the rest
    DMVAST.client.get(url, function (response) {
        if (response) {
            console.log("got a respose", response);
            for (var adIdx = 0, adLen = response.ads.length; adIdx < adLen; adIdx++) {
                var ad = response.ads[adIdx];

                for (var creaIdx = 0, creaLen = ad.creatives.length; creaIdx < creaLen; creaIdx++) {
                    var creative = ad.creatives[creaIdx];

                    switch (creative.type) {
                        case "linear":
                            for (var mfIdx = 0, mfLen = creative.mediaFiles.length; mfIdx < mfLen; mfIdx++) {
                                var mediaFile = creative.mediaFiles[mfIdx];
                                if (mediaFile.mimeType != "video/mp4") continue;

                                player.vastTracker = new DMVAST.tracker(ad, creative);
                                player.vastTracker.on('clickthrough', function (url) {
                                    document.location.href = url;
                                });
                                player.on('canplay', function () { this.vastTracker.load(); });
                                player.on('timeupdate', function () { this.vastTracker.setProgress(this.currentTime); });
                                player.on('play', function () { this.vastTracker.setPaused(false); });
                                player.on('pause', function () { this.vastTracker.setPaused(true); });

                                player.href = mediaFile.fileURL;
                                // put player in ad mode
                            }
                            break;

                        case "non-linear":
                            // TODO
                            break;

                        case "companion":
                            for (var cpIdx = 0, cpLen = creative.variations.length; cpIdx < cpLen; cpIdx++) {
                                var companionAd = creative.variations[cpIdx];
                                var docElement = document.createElement("div");
                                var aElement = document.createElement('a');
                                var companionAsset = new Image();
                                aElement.setAttribute('target', '_blank');

                                if (companionAd.type != "image/jpeg") continue;

                                companionAsset.src = creative.variations[cpIdx].staticResource;
                                companionAsset.width = creative.variations[cpIdx].width;
                                companionAsset.height = creative.variations[cpIdx].height;

                                aElement.href = creative.variations[cpIdx].companionClickThroughURLTemplate;
                                aElement.appendChild(companionAsset);

                                docElement.appendChild(aElement);
                                this.element.appendChild(docElement);
                            }

                            break;

                        default:
                            break;
                    }
                }

                if (player.vastTracker) {
                    //show ad
                    if (this.options.autoShow) {
                        this.show();
                    }
                    break;
                }
                else {
                    // Inform ad server we can't find suitable media file for this ad
                    DMVAST.util.track(ad.errorURLTemplates, { ERRORCODE: 403 });
                }
            }
        }

        if (!player.vastTracker) {
            // No pre-roll, start video
            if (player) player.parentNode.removeChild(player);
            if (++this.errorReloads <= 100) {
                this.reload();
            }
            return false;
        }
    }.bind(this));
};

Smaato.prototype.handleNative = function (url) {
    var doneCb = function () { };
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onreadystatechange = function () {
        try {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    //Success
                    this.options.SomaUserID = xhr.getResponseHeader("SomaUserID");
                    var xml = xhr.responseXML;
                    var errors = xml.getElementsByTagName("error");
                    if (errors.length && errors[0].textContent) {
                        console.log("success but no native ads: ", errors[0].textContent);
                        this.reload();
                        return false;
                    }

                    if (this.options.autoShow) {
                        this.show();
                    }
                    var content = "";
                    var links = xml.getElementsByTagName("clickurl");
                    var link = links.length ? links[0] : undefined;
                    if (link) {
                        var = linkStyle = "";
                        var mainimages = xml.getElementsByTagName("mainimage");
                        var mainimage = mainimages.length ? mainimages[0] : undefined;
                        if(mainimage){
                            style = "background-image: url("+ (mainimage.textContent ? mainimage.textContent : "") +");background-size: contain;"
                        }
                        content += "<a target='_blank' style='float:left;"+ style +"' href='" + (link.textContent ? link.textContent : "") + "'>";
                    }

                    var iconimages = xml.getElementsByTagName("iconimage");
                    var iconimage = iconimages.length ? iconimages[0] : undefined;
                    if (iconimage) {
                        content += "<img  style='float:left;' src='" + (iconimage.textContent ? iconimage.textContent : "") + "'/>";
                    }

                    var adtitles = xml.getElementsByTagName("adtitle");
                    var adtitle = adtitles.length ? adtitles[0] : undefined;
                    if (adtitle) {
                        content += "<h1  style='float:left; margin: 6px;'>" + (adtitle.textContent ? adtitle.textContent : "") + "'<h1/>";
                    }

                    var adtexts = xml.getElementsByTagName("adtext");
                    var adtext = adtexts.length ? adtexts[0] : undefined;
                    if (adtext) {
                        content += "<p  style='float:left; margin: 6px;'>" + (adtext.textContent ? adtext.textContent : "") + "'<p/>";
                    }
                    var starratings = xml.getElementsByTagName("starrating");
                    var starrating = starratings.length ? starratings[0] : undefined;
                    if (starrating) {
                        content += "<span style='float:left; margin: 6px;'>Ratting: " + (starrating.textContent ? starrating.textContent : "") + "'<span/>";
                    }
                    var ctatexts = xml.getElementsByTagName("ctatext");
                    var ctatext = ctatexts.length ? ctatexts[0] : undefined;
                    if (ctatext) {
                        content += "<span style='float:right; margin: 6px;'>Ratting: " + (ctatext.textContent ? ctatext.textContent : "") + "'<span/>";
                    }

                    if (link) {
                        content += "</a>";
                    }

                    //add beacon to the content string							
                    var beacons = xml.getElementsByTagName("beacon");
                    if (beacons.length) {
                        for (var i = 0, beacon = beacons[i]; i < beacons.length; i++, beacon = beacons[i]) {
                            content += "<img src='" + beacon.textContent + "' width='1' height='1' />";
                        }
                    }
                    this.updateView("<!DOCTYPE html><html><head><title>Smaato Ad page</title> <script src='http://code.jquery.com/jquery-2.1.3.min.js'></script><script src='https://raw.githubusercontent.com/aFarkas/html5shiv/master/src/html5shiv.js'></script><style> #adContent>p { padding: 0; margin: 0; }</style></head><body style='overflow:hidden;margin: 0; padding: 0;'><div id='adContent'>" + content + "</div></body></html>");
                }
                else {
                    //Error
                    console.log("error on native ads");
                }
            }
        }
        catch (e) {
            //Another Error
        }
        if (xhr.readyState === 4) {
            doneCb();
        }
    }.bind(this);

    xhr.send();
};

Smaato.prototype.handleAll = function (url) {
    var doneCb = function () { };
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onreadystatechange = function () {
        try {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    //Success
                    this.options.SomaUserID = xhr.getResponseHeader("SomaUserID");
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

                    this.updateView("<!DOCTYPE html><html><head><title>Smaato Ad page</title> <script src='http://code.jquery.com/jquery-2.1.3.min.js'></script><script src='https://raw.githubusercontent.com/aFarkas/html5shiv/master/src/html5shiv.js'></script><style> #adContent>p { padding: 0; margin: 0; }</style></head><body style='overflow:hidden;margin: 0; padding: 0;'><div id='adContent'>" + xhr.responseText + "</div></body></html>");
                }
                else {
                    //Error
                }
            }
        }
        catch (e) {
            //Another Error
        }
        if (xhr.readyState === 4) {
            doneCb();
        }
    }.bind(this);

    xhr.send();
};

Smaato.prototype.updateView = function (html) {
    this.iframe.setAttribute("srcdoc", html);
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