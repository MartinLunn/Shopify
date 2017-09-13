/*
Assumptions:
1. Assuming pagination is consistent between pages with regard to total and per_page
2. Assuming validations are consistent between pages for a given URL or set of pages
3. No property in validations can be called __proto__ or something like that
4. the type field in the provided validation constraints, when provided, only specifies string, number, or boolean. Otherwise, behavior is undefined.
5. If the validation for a field is no present, anything goes.
6. When the field is not required, but the type is specified, null is not a valid value
7. If the field is not required, undefined is the only acceptable non-answer.
*/

//tested on node 6

"use strict";

var request = require('request');

let output = {invalid_customers: []};

//could easily take this as a command line arg/parameter
let apiEndpointURL = "https://backend-challenge-winter-2017.herokuapp.com/customers.json?page=";

//pages is an array where each index represents a page of data from the api endpoint
let pages = [];

//pageCounter is a variable representing which page of the api endpoint
let pageCounter = 1;

//Because I'm using node's async features, all we need to do is call calculateTotalPages
//(done at the end of the file)
//and the rest will chain on. I could put this into a control objects
//for improved adherence to software engineering principles, but
//those depend on context; this has no context really.

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
      console.error('error:', error); // Print the error if one occurred
      return;
    }

    pages = [];
    pages[0] = JSON.parse(body);

    let numPages = Math.ceil(pages[0].pagination.total / pages[0].pagination.per_page);

    ++pageCounter;

    //callback is a function that, given the number of pages, populates the array of pages
    //from the api endpoint, not including the 1st.
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
        console.error('error:', error); // Print the error if one occurred
        return;
      }
      //indexing starts at 0, pages start at 1.
      pages[pageCounter - 1] = JSON.parse(body);
      ++pageCounter;
      callback(numPages);
      //I picked this recursive callback structure because of it's similarity to a while loop
      //which is basically exactly what I wanted.
    });

  }
  //else, for every page, validate the customer page
  else {
    for (let i = 0; i < pages.length; ++i)
    {
      validateCustomerPage(pages[i]);
    }
    printOutput(output);
    return;
  }
}

let validateCustomerPage = function(page)
{
  if (!page)
  {
    console.error("page is falsy from inside validate customer page.");
    return;
  }

  //if page doesn't have all of these. syntax is such due to faster short-circuit evaluation
  if (!(page.validations && page.customers && page.pagination))
  {
    console.error("page object is missing keys or no validations listed from inside validate customer page");
    return;
  }

  for (let i = 0; i < page.customers.length; ++i)   //main loop validating customers
  {
    for (let j = 0; j < page.validations.length; ++j)
    {
      let  nameOfField = Object.keys(page.validations[j])[0];  //get the field name
      let  validation = page.validations[j][nameOfField];
      //if field is required and not present. also quick because of short-circuit.
      //note that this DOES NOT work for inherited properties, but is faster than using "in" which is alternate
      if (validation.required && !page.customers[i].hasOwnProperty(nameOfField) )
      {
        reportInvalidCustomerFields(page.customers[i], nameOfField);
      }

      if (validation.length) //length is truthy
      {
        //storing length for more readable code
        //if the customer data is null, cannot get length, therefore must check first
        let strlen;
        page.customers[i][nameOfField] ? strlen = page.customers[i][nameOfField].length : reportInvalidCustomerFields(page.customers[i], nameOfField);
        //If length is greater than max, or lesser than min. short-circuit works properly
        if (strlen >  validation.length.max || strlen < validation.length.min)
        {
          reportInvalidCustomerFields(page.customers[i], nameOfField);
        }
      }

      else if (validation.type)
      {
        if (validation.type !== typeof(page.customers[i][nameOfField]))    //else if because length assumes string meaning if length exists, it can be assumed to be a string.
        //above statement: if the given validation type constraint matches the type of the customers data
        {
          reportInvalidCustomerFields(page.customers[i], nameOfField);
        }
      }
    }
  }
}

let reportInvalidCustomerFields = function (customer, field)
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

let printOutput = function(output)
/*console.log() wasn't playing nice
it was outputting [Object object] if I passed in anything but exactly one object,
and it was adding newlines at the end of every statement so,
I decided to do my own.*/
{
  if (!output)
  {
    console.error("Output is null from inside printOutput.\n");
    return;
  }

  if (typeof(output) !== "object")
  {
    console.error("Output is not an object from inside printOutput. \n");
    return;
  }

  if (!output.hasOwnProperty("invalid_customers"))
  {
    console.error("Output is not properly formatted from inside printOutput. \n");
    return;
  }

  if (!Array.isArray(output.invalid_customers))
  {
    console.error("Invalid customers is not an array from inside printOutput. \n");
    return;
  }

  if (output.invalid_customers.length === 0)
  {
    console.log("There are no invalid customers.");
  }

  console.log("{\n   \"invalid_customers\": [");

  for (let i = 0; i < output.invalid_customers.length; ++i)
  {
    if (typeof(output.invalid_customers[i]) !== "object")
    {
      console.error("output.invalid_customers[" + i + "] is not an object from inside printOutput.\n")
      continue;
    }

    if (i === output.invalid_customers.length)
    {
      console.log(output.invalid_customers[i]);
    }
    process.stdout.write("      ");
    console.log(output.invalid_customers[i]);
    //couldn't quite get this to work properly. It's missing commas.
	  //The requirements specified an output "similar to" this.
	  //Based on the instructions, I believe this is acceptable.
    //process.stdout.write(",");
  }
  console.log("   ]\n}\n\n");
}


calculateTotalPages(apiEndpointURL);
