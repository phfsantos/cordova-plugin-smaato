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


function setupWebview() {
	this.webview = document.createElement("x-ms-webview");

	$(this.webview).css({
		width: "100%",
		height: "100%",
		overflow: "hidden",
        position: "relative",
		"z-index": 2001
	});


	$(this.element).html(this.webview);
};

function requestAd(ad) {
	if (!ad) {
		return false;
	}

	var jqXHR;

	jqXHR = $.get("http://soma.smaato.net/oapi/reqAd.jsp", ad, function (response) {

	    this.options.SomaUserID = jqXHR.getResponseHeader("SomaUserID");
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

			this.webview.navigateToString("<!DOCTYPE html><html><head><title>Smaato Ad page</title> <script src='http://code.jquery.com/jquery-2.1.3.min.js'></script><script src='https://raw.githubusercontent.com/aFarkas/html5shiv/master/src/html5shiv.js'></script><style> #adContent>p { padding: 0; margin: 0; }</style></head><body style='overflow:hidden;margin: 0; padding: 0;'><div id='adContent'>" + response + "</div></body></html>");
		} else {
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
		            content += "<source src='" + $(this).text() + "' type='" + ($(this).attr("type")?$(this).attr("type"):"video/mp4") + "'>";
		        });
		        content += "Your browser does not support the video tag.</video></a>";

                //add beacon to the content string
		        $xml.find("beacon").each(function () {
		            content += "<img src='" + this.textContent + "' width='1' height='1' />";
		        });
			    this.webview.navigateToString("<!DOCTYPE html><html><head><title>Smaato Ad page</title> <script src='http://code.jquery.com/jquery-2.1.3.min.js'></script><script src='https://raw.githubusercontent.com/aFarkas/html5shiv/master/src/html5shiv.js'></script><style> #adContent>p { padding: 0; margin: 0; }</style></head><body style='overflow:hidden;margin: 0; padding: 0;'><div id='adContent'>" + content + "</div></body></html>");
			    return true;
			}


		}
	}.bind(this), "text");
	/*
	 
	 
	jqXHR = $.get(requestUrl, ad, function (response) {
		var somaError = jqXHR.getResponseHeader("SomaError");
		if (somaError) {
			this.options.onerror && this.options.onerror(this, somaError);
			return false;
		}

		this.options.SomaUserID = jqXHR.getResponseHeader("SomaUserID");
		if (this.options.type !== "video") {
			$(this.element).html(response);
		}
	}.bind(this));
	 
	 */
};


module.exports = {
	requestAd: requestAd,
	setupWebview: setupWebview
};

require("cordova/exec/proxy").add("Smaato", module.exports);

