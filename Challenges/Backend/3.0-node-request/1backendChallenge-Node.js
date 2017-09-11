/*
Assumptions:
1. Assuming pagination is consistent between pages with regard to total and per_page
2. Assuming validations are consistent between pages for a given URL or set of pages
3. No property in validations can be called __proto__ or something like that
4. the type field in the provided validation constraints, when provided, only specifies string, number, or boolean. Behavior is undefined.
*/

"use strict";

var request = require('request');

var DEBUG = false;

let output = {invalid_customers: []};

let apiEndpointURL = "https://backend-challenge-winter-2017.herokuapp.com/customers.json?page=";

let pages = [];

let pageCounter = 1;

//figuring out how many pages there are
let calculateTotalPages = function(apiEndpointURL)
{
  /*1st page determines pagination for entire set of pages
  this means if there is inconsistent pagination between pages in a set,
  whatever is on page 0 is the one we go with.
  Given the lack of opportunity to ask for clarification in terms of desired
  behavior for this scenario, this is okay.
  This would also not be difficult to change if necessary. */

  request(apiEndpointURL + pageCounter, function (error, response, body) {
    if (error)
    {
      console.log('error:', error); // Print the error if one occurred
      return;
    }

    if (DEBUG)
      console.log('statusCode:', response && response.statusCode);

    if (DEBUG)
      console.log('body: ', body + "\n\n");

    pages = [];
    pages[0] = JSON.parse(body);

    let numPages = Math.ceil(pages[0].pagination.total / pages[0].pagination.per_page);

    ++pageCounter;

    callback(numPages);
  });
}



let callback = function(numPages)
{
  if (pageCounter <= numPages)
  {
    request(apiEndpointURL + pageCounter, function (error, response, body) {
      if (error)
      {
        console.log('error:', error); // Print the error if one occurred
        return;
      }

      if (DEBUG)
        console.log("pageCounter: " + pageCounter + "\n");

      if (DEBUG)
        console.log('statusCode:', response && response.statusCode);

      if (DEBUG)
        console.log('body: ', body + "\n\n");

      pages[pageCounter - 1] = JSON.parse(body);


      if (DEBUG)
        console.log("pages: " + pages + "\n\n");

      ++pageCounter;

      callback(numPages);

    });

  }
  else {
    console.log(pages);
    return;
  }
}




calculateTotalPages(apiEndpointURL);
/*
//works: Math.ceil(page0.pagination.total / page0.pagination.per_page);
//JSON.parse('{"result":1}')        don't forget the '' outside the braces

let  paginatedURL = "";

for (let i = 1; i < numPages; ++i)
{
  request(apiEndpointURL + i, function (error, response, body) {
    console.log('error:', error); // Print the error if one occurred
    console.log('statusCode:', response && response.statusCode);
    console.log('body: ', body + "\n\n");
    pages[i] = body;
  });
}

console.log(pages);

/*for (let  i = 1; i < numPages; i++)
{
  paginatedURL = apiEndpointURL + apiEndpointURLSuffix + (i + 1).toString();        //i + 1 because the page count starts at 1, whereas indices start at 0
  pages[i] = JSON.parse(httpGet(paginatedURL));
}

//TODO remove
let a = 0;

function validateCustomerPage(page)
{
  if (!page)
  {
    //TODO error handle
    console.log("page is falsy from inside validate customer page.");
    return;
  }

  if (!(page.validations && page.customers && page.pagination))     //if page doesn't have all of these. syntax is such due to faster short-circuit evaluation
  {

    console.log("aa");


    //TODO error handle
    console.log("page object is missing keys or no validations listed from inside validate customer page");
    return;
  }

  for (let i = 0; i < page.customers.length; ++i)   //main loop validating customers
  {

    for (let j = 0; j < page.validations.length; ++j)
    {
      let  nameOfField = Object.keys(page.validations[j])[0];  //get the field name

      let  validation = page.validations[j][nameOfField];

      if (validation.required && !page.customers[i].hasOwnProperty(nameOfField) )  //if field is required and not present. also quick because of short-circuit. note that this DOES NOT work for inherited properties, but is faster than using "in" which is alternate
      {
        //TODO
        //console.log
        reportInvalidCustomerFields(page.customers[i], nameOfField);
      }

      if (validation.length) //length is truthy
      {
        //storing length for more readable code
        //if the customer data is null, cannot get length, therefore must check first
        let strlen;
        page.customers[i][nameOfField] ? strlen = page.customers[i][nameOfField].length : reportInvalidCustomerFields(page.customers[i], nameOfField);
        if (strlen >  validation.length.max || strlen < validation.length.min) //If length is greater than max, or lesser than min. short-circuit works properly
        {
          //TODO
          //console.log
          reportInvalidCustomerFields(page.customers[i], nameOfField);
        }
      }

      else if (validation.type)
      {
        if (validation.type !== typeof(page.customers[i][nameOfField]))    //else if because length assumes string meaning if length exists, it can be assumed to be a string.
        //above statement: if the given validation type constraint matches the type of the customers data
        {
          //TODO
          //console.log
          reportInvalidCustomerFields(page.customers[i], nameOfField);
        }
      }
    }
  }
}

function reportInvalidCustomerFields(customer, field)
{
  if (output.invalid_customers.length > 0 && customer.id === (output.invalid_customers[output.invalid_customers.length - 1].id))
  {
    output.invalid_customers[output.invalid_customers.length - 1].invalid_fields.push(field);
  }
  else
  {
    output.invalid_customers.push({"id": customer.id, "invalid_fields": [field]});
  }
}


for (let i = 0; i < pages.length; ++i)
{
  validateCustomerPage(pages[i]);
}

console.log(output);*/
