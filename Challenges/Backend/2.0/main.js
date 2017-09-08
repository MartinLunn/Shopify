'use strict';

//var request = request("request");

const https = require('https');
const fs = require('fs');

let APIEndpointURL = "https://backend-challenge-winter-2017.herokuapp.com/customers.json?page=";

let APIEndpointURLIDX = 0;

let input = undefined;

let output = undefined;

const req = https.request( (APIEndpointURL + APIEndpointURLIDX) , (res) => {
  let now = Date.now();
  fs.appendFile(
    "logs.txt",
    "Date: " + now + "\n" +
    'Response Status Code: ' + res.statusCode + "\n" +
    'Response Headers: ' + JSON.stringify(res.headers) + "\n" +
    "end of log at: " + now + "\n\n",

    function (err) {
      if (err) {
        console.log("Could not write to logfile.")
        throw err;
      }
    console.log("\nLog for " + now + " Saved!\n");
  });

  res.on('data', (d) => {
    input = JSON.parse(d);
    process.stdout.write(d);                                //TODO
    console.log("\n\nThis is my input: " + input + "\n");
  });
});

req.on('error', (e) => {
  console.error(e);
});
req.end();
