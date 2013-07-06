# Android Offline Mapping Demo Using Node.js to Serve Map Tiles

This project is an evolution of my [offline map demo](https://github.com/kaidad/offline_map_demo) which uses Node.js to optionally serve map tiles. The demo runs in two modes: 1)
as a normal PhoneGap app, and 2) in a desktop browser. The app automatically detects whether it is being run in a desktop browser or as a PhoneGap app and issues requests to a sim
ple service running in Node.js to fetch both static content and map tiles. The demo also uses the service to fetch the sample map tiles file when running as a PhoneGap app. The mo
tivation for this project is the simple fact that debugging what is basically a web application through the emulator is very painful whereas running the same app as a web app make
s it possible to use standard development tools.

In order to run this demo, you will need Maven (I use Maven 3) and Node.js installed. Then follow these simple instructions:

1) the Node.js app requires Express.js and SQLite3:
sudo npm install express
sudo npm install sqlite3
2) determine your IP Address - this will be set in the configuration that is used to determine the URL for the Node.js service. On Unix-based machines (including Macs) you can get your IP address by executing "ifconfig" from a shell prompt. Open offlineusingnode/assets/wwww/js/index.js and modify the "serviceUrl". The port is 3000, and this is also set in "node/src/server.js" - you can change it if necessary, just make sure to do so in both places.
3) open a shell prompt and navigate to "node/src", and execute: node server.js
4) open a browser and navigate to http://your.ip.address:3000 OR open app in emulator

Please see "[offline map demo](https://github.com/kaidad/offline_map_demo)" for more information about the offline map project.