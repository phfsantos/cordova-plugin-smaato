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

	this.webview.style.width = "100%";
	this.webview.style.height = "100%";
	this.webview.style.overflow = "hidden";
    this.webview.style.position = "relative";
	this.webview.style.zIndex = 2001;
		
	this.element.appendChild(this.webview);
};

function params(){
	var prefix,
		s = [],
		add = function( key, value ) {
			// If value is a function, invoke it and return its value
			value = typeof value == "function" ? value() : ( value == null ? "" : value );
			s[ s.length ] = encodeURIComponent( key ) + "=" + encodeURIComponent( value );
		};

	// If an array was passed in, assume that it is an array of form elements.
	if ( jQuery.isArray( a ) || ( a.jquery && !jQuery.isPlainObject( a ) ) ) {
		// Serialize the form elements
		jQuery.each( a, function() {
			add( this.name, this.value );
		});

	} else {
		// If traditional, encode the "old" way (the way 1.3.2 or older
		// did it), otherwise encode params recursively.
		for ( prefix in a ) {
			buildParams( prefix, a[ prefix ], traditional, add );
		}
	}

	// Return the resulting serialization
	return s.join( "&" ).replace( r20, "+" );
}

function requestAd(ad) {
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
					console.log("success");
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
						console.log("response", xhr.response);
						console.log("responseText", xhr.responseText);
						console.log("responseBody", xhr.responseBody);
						this.webview.navigateToString("<!DOCTYPE html><html><head><title>Smaato Ad page</title> <script src='http://code.jquery.com/jquery-2.1.3.min.js'></script><script src='https://raw.githubusercontent.com/aFarkas/html5shiv/master/src/html5shiv.js'></script><style> #adContent>p { padding: 0; margin: 0; }</style></head><body style='overflow:hidden;margin: 0; padding: 0;'><div id='adContent'>" + xhr.responseText + "</div></body></html>");
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
						    this.webview.navigateToString("<!DOCTYPE html><html><head><title>Smaato Ad page</title> <script src='http://code.jquery.com/jquery-2.1.3.min.js'></script><script src='https://raw.githubusercontent.com/aFarkas/html5shiv/master/src/html5shiv.js'></script><style> #adContent>p { padding: 0; margin: 0; }</style></head><body style='overflow:hidden;margin: 0; padding: 0;'><div id='adContent'>" + content + "</div></body></html>");
						    return true;
						}
					}
                }
                else {					
					console.log("error", xhr.response);
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


module.exports = {
	requestAd: requestAd,
	setupWebview: setupWebview
};

require("cordova/exec/proxy").add("Smaato", module.exports);

