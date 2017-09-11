'use strict';

//var request = request("request");

const https = require('https');
const fs = require('fs');


let keepLogs = true;

//should take command line arg generally speaking instead of hard-coding
let APIEndpointURL = "https://backend-challenge-winter-2017.herokuapp.com/customers.json?page=";

let APIEndpointURLIDX = 0;  //TODO reallyused?? maybe remove

let input = [];

let output = undefined;

const req = https.request( (APIEndpointURL + APIEndpointURLIDX) , (res) => {
  let now = Date.now();

  if (keepLogs)
  {
    fs.appendFile(
      "logs.txt",
      "Date: " + now + "\n" +
      'Response Status Code: ' + res.statusCode + "\n" +
      'Response Headers: ' + JSON.stringify(res.headers, null, "\t") + "\n" +
      "end of log at: " + now + "\n\n",

      function (err) {
        if (err) {
          console.log("Could not write to logfile.")
          throw err;
        }

      console.log("\nLog for " + now + " Saved!\n");
    });
  }



  res.on('data', (d) => {
    process.stdout.write(d);                                //TODO
    input[0] = (JSON.parse(d));
    //console.log("\n\nThis is my input: " + JSON.stringify(input[0]) + "\n");

    //callback call for calculate pagination
    calculatePagination(input[0]);
  });
});

req.on('error', (e) => {
  console.error(e);
});
req.end();

let calculatePagination = function(page1)
{
  let numPages = Math.ceil(page1.pagination.total / page1.pagination.per_page);

  //callback for loop
  load(numPages);
}

let load = function(numPages)
{
  for (let i = 1; i < numPages; ++i)
  {



    input[i] = https.request( (APIEndpointURL + i) , (res) => {
      let now = Date.now();

      console.log("Date: " + now);

      if (keepLogs)
      {
        fs.appendFile(
          "logs.txt",
          "Date: " + now + "\n" +
          'Response Status Code: ' + res.statusCode + "\n" +
          'Response Headers: ' + JSON.stringify(res.headers, null, "\t") + "\n" +
          "end of log at: " + now + "\n\n",

          function (err) {
            if (err) {
              console.log("Could not write to logfile.")
              throw err;
            }

          console.log("\nLog for " + now + " Saved!\n");
        });
      }



      res.on('data', (d) => {
        process.stdout.write(d);                                //TODO
        input[i] = (JSON.parse(d));

        console.log('\nin the loop: ' + i + '\n\n\n');
        for (let j = 0; j < input.length; ++j)
        {
          console.log("j: " + j + "\n");
          console.log("input[j]: " + JSON.stringify(input[j], null, "\t") + "\n\n" );
        }

        //console.log("\n\nThis is my input: " + JSON.stringify(input[0]) + "\n");
      });
    });

    req.on('error', (e) => {
      console.error(e);
    });
    req.end();
  }
}
