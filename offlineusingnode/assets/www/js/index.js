/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var msg;			// the span to show messages

var config = {
    dbName: 'OSMBrightSLValley.mbtiles',
    //In order to run on the device and connect to local Node.js server,
    //it must have an IP Address rather than 'localhost'
    //Change this to your IP Address!!
    serviceUrl: 'http://192.168.0.4:3000',
    agentType: undefined,
    isPlainBrowser: function () {
        return this.agentType === 'desktop';
    }
};

var app = {
    //save the tileDataLoader - ultimately this may be a collection of
    //loaders which could be shutdown when appropriate
    tileDataLoader: undefined,
    // Application Constructor
    initialize: function () {

        var ua = navigator.userAgent.toLowerCase();
        console.log('User-agent: ' + ua);
        var deviceType;
        if (/android/i.test(ua)) {
            deviceType = "android";
        } else if (/iPad/i.test(ua) || /iPhone OS 3_1_2/i.test(ua) || /iPhone OS 3_2_2/i.test(ua)) {
            deviceType = "ipad";
        } else if (/iPhone/i.test(ua)) {
            deviceType = "iphone";
        } else {
            deviceType = "desktop";
        }
        console.log('Device type: ' + deviceType);
        config.agentType = deviceType;

        if (deviceType === "desktop") {
            console.log('Running on desktop, will use Node.js for database access...');
            $().ready(this.onDeviceReady);
        } else {
            console.log('Running in device as PhoneGap app, loading cordova library and using local SQLite db...');
            var that = this;
            $.getScript('libs/cordova.js', function() {
                console.log('Loaded Cordova JS library...');
                document.addEventListener('deviceready', that.onDeviceReady, false);
            });
        }

    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function () {
        console.log('onDeviceReady called');
        msg = document.getElementById('message');

        msg.innerHTML = 'Building map...';

        this.tileDataLoader = new TileDataLoader(window, config, app.buildMap);
    },
    buildMap: function (tileDataLoader) {
        document.body.removeChild(msg);

        //set bounding box to limit user's ability to zoom out
        var southWest = new L.LatLng(40.4646, -112.1534);
        var northEast = new L.LatLng(40.8434, -111.7249);
        var restrictBounds = new L.LatLngBounds(southWest, northEast);
        var mapOptions = {
            maxBounds: restrictBounds,
            center: new L.LatLng(40.6681, -111.9364),
            zoom: 11,
            tms: true,
            maxZoom: 14,
            minZoom: 11
        };

        var map = new L.Map('map', mapOptions);

        var lyr = new L.TileLayer.MBTiles('', {maxZoom: 14, tms: true}, tileDataLoader);

        map.addLayer(lyr);
    }
};
