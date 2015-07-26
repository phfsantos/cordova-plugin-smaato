<!---

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

-->

# Smaato Cordova Plugin

Present Smaato Ads in Mobile App/Games natively from JavaScript. 

Highlights:
- [x] Easy-to-use APIs. Display Ad with single line of Js code.
- [x] Support Banner, Interstitial Ad, and Video Ad.
- [x] One plugin supports all plataforms.
- [x] Multiple banner size, also support custom size.
- [x] Fixed and overlapped mode.
- [x] Auto fit on orientation change.
- [x] Actively maintained, prompt support.

Compatible with:

* Cordova CLI, v3.5+
* Intel XDK and Crosswalk, r1095+
* IBM Worklight, v6.2+

## How to use? ##

## Quick Start Example Code ##

Step 1: Prepare your MoPub publisher Id for your app, create it in [MoPub website](http://www.mopub.com/)

```javascript
var ad_units = {
	publisherId: "1001000968",    
    iosadid: "",
    iosadtracking: true,
    googleadid: "",
    googlednt: false,
    android: {
        tiny_banner: '101002696', // Phones and Tablets 120 x 20
        puny_banner: '101002695', // Phones and Tablets 168 x 28
        little_banner: '101002694', // Phones and Tablets 216 x 36
        small_banner: '101002693', // Tablets 300 x 50
        banner: '101002692', // Phones and Tablets 320 x 50
        medium_rectangle: '101002697', // Phones and Tablets 300 x 250
        leaderboard: '101002669', // Tablets 728 x 90
        interstitial: '101002659', // Phones and Tablets 100%
        skyscraper: '101002698' // Tablets 120 x 600
    },
    ios: {
        tiny_banner: '101002696', // Phones and Tablets 120 x 20
        puny_banner: '101002695', // Phones and Tablets 168 x 28
        little_banner: '101002694', // Phones and Tablets 216 x 36
        small_banner: '101002693', // Tablets 300 x 50
        banner: '101002692', // Phones and Tablets 320 x 50
        medium_rectangle: '101002697', // Phones and Tablets 300 x 250
        leaderboard: '101002669', // Tablets 728 x 90
        interstitial: '101002659', // Phones and Tablets 100%
        skyscraper: '101002698' // Tablets 120 x 600
    },
    wp8: {
        tiny_banner: '101002675', // Phones and Tablets 120 x 20
        puny_banner: '101002358', // Phones and Tablets 168 x 28
        little_banner: '101002359', // Phones and Tablets 216 x 36
        small_banner: '101002362', // Tablets 300 x 50
        banner: '101002353', // Phones and Tablets 320 x 50
        medium_rectangle: '101002354', // Phones and Tablets 300 x 250
        leaderboard: '101002218', // Tablets 728 x 90
        interstitial: '101002361', // Phones and Tablets 100%
        skyscraper: '101002360' // Tablets 120 x 600
    },
    web: {
        tiny_banner: '101002675', // Phones and Tablets 120 x 20
        puny_banner: '101002358', // Phones and Tablets 168 x 28
        little_banner: '101002359', // Phones and Tablets 216 x 36
        small_banner: '101002362', // Tablets 300 x 50
        banner: '101002353', // Phones and Tablets 320 x 50
        medium_rectangle: '101002354', // Phones and Tablets 300 x 250
        leaderboard: '101002218', // Tablets 728 x 90
        interstitial: '101002361', // Phones and Tablets 100%
        skyscraper: '101002360' // Tablets 120 x 600
    }
};

// select the right Ad Id according to platform
var adid = (/(android)/i.test(navigator.userAgent)) ? ad_units.android : ad_units.ios;
```

Step 2: Create a banner with single line of javascript

```javascript
// it will display leaderboard banner at bottom center, using the default options
var div = document.createElement("div");
document.appendChild(div);
var simpleAd = new Smaato(div, {
    publisherId: ad_units.publisherId,
    adId: adid.leaderboard
});
```

Or, show the banner Ad in some other way:

```javascript
// or, show a default banner at top
var div = document.createElement("div");
document.appendChild(div);
var banner = new Smaato(div, {
    publisherId: ad_units.publisherId,
	adId: adid.banner, 
	position:SMAATO_AD_POSITION.TOP_CENTER, 
    adSize: SMAATO_AD_SIZE.BANNER,
	autoShow: true
});
```

Step 3: Prepare an interstitial, and show it when needed

```javascript
// preppare and load ad resource in background, e.g. at begining of game level
var div = document.createElement("div");
document.appendChild(div);
var interstitial = new Smaato({
    publisherId: ad_units.publisherId,
	adId: adid.interstitial, 
    position: SMAATO_AD_POSITION.CENTER,
    adSize: SMAATO_AD_SIZE.INTERSTITIAL, // ad size
	autoShow: false
});

// show the interstitial later, e.g. at end of game level
interstitial.show();
```

## Javascript API Overview ##

Methods:
```javascript
// set default value for other methods
setOptions(options);
// for banner
show();
showAtXY(x, y);
hide();
remove();
reload();
```

## Detailed Documentation ##

The Options.
```javascript
// Options name    |   Default Value   |   Description
var options = {
    publisherId:        "",              // smaato ad publisherId
    adId:               "",              // smaato ad id
    closeButton:        false,           // if set to true, will show a close button
    overlay:            false,           // if set to true, will show an overlay the under ad
    autoShow:           true,            // if set to true, no need call show
    autoReload:         false,           // if set to true, no need to call reload
    position:           8,               // default position
    adSize:             "LEADERBOARD",   // ad size
    width:              728,             // banner width, if set adSize to 'CUSTOM'
    height:             90,              // banner height, if set adSize to 'CUSTOM'
    x:                  0,               // default X of banner
    y:                  0,               // default Y of banner
    isTesting:          false,           // if set to true, to receive test ads 
    enableVideo:        false,           // if set to true, enable video for interstitial
    session:            "",              // session for ads on this device
    childDirected:      false,           // if set to true, ads are safe for children
    gps:                undefined,       // GPS coordinates of the user`s location.
    iosadid:            undefined,       // IOS ad id.
    iosadtracking:      true,            // IOS ad tracking.
    googleadid:         undefined,       // Google ad id.
    googlednt:          false,           // Google ad tracking.
    onerror:            function () { }, // Function to call when an error occurs
    onadloaded:         function () { }, // Function to call when ad loads
    onadclosed:         function () { }  // Function to call when close button gets clicked
};
```
The Constants.

```javascript
var SMAATO_AD_POSITION = {
    NO_CHANGE: 11,
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

var SMAATO_AD_SIZE = {
    TINY_BANNER:        'TINY_BANNER',      // Phones 120 x 20
    PUNY_BANNER:        'PUNY_BANNER',      // Phones 168 x 28
    LITTLE_BANNER:      'LITTLE_BANNER',    // Phones 216 x 36
    SMALL_BANNER:       'SMALL_BANNER',     // Phones and Tablets 300 x 50
    BANNER:             'BANNER',           // Phones and Tablets 320 x 50
    LEADERBOARD:        'LEADERBOARD',      // Tablets 728 x 90
    SKYSCRAPER:         'SKYSCRAPER',       // Tablets 120 x 600
    MEDIUM_RECTANGLE:   'MEDIUM_RECTANGLE', // Phones and Tablets 300 x 250
    INTERSTITIAL:       'INTERSTITIAL',     // Phones and Tablets 100%
    CUSTOM:             'CUSTOM'            // Phones and Tablets custom width and height
};
```

