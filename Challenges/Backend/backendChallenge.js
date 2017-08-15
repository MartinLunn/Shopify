/*
Assumptions:
1. Assuming pagination is consistent between pages with regard to total and per_page
2. Assuming validations are consistent between pages for a given URL or set of pages
3. No property in validations can be called __proto__ or something like that
4. the type field in the provided validation constraints, when provided, only specifies string, number, or boolean. Behavior is undefined.
*/

var output = {invalid_customers: []};

var apiEndpointURL = "https://backend-challenge-winter-2017.herokuapp.com/customers.json";

var apiEndpointURLSuffix = "?page=";

//TODO make async
//TODO explore whether we can get async validation as the data comes in
function httpGet(theUrl)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, false ); // false for synchronous request
    xmlHttp.send( null );
    return xmlHttp.responseText;
}

var pages = [];

//getting the 0th page of input data
 pages[0] = JSON.parse(httpGet(apiEndpointURL));

//figuring out how many pages there are
var numPages = Math.ceil(pages[0].pagination.total / pages[0].pagination.per_page);

//works: Math.ceil(page0.pagination.total / page0.pagination.per_page);
//JSON.parse('{"result":1}')        don't forget the '' outside the braces

var paginatedURL = "";

for (var i = 1; i < numPages; i++)
{
  paginatedURL = apiEndpointURL + apiEndpointURLSuffix + (i + 1).toString();        //i + 1 because the page count starts at 1, whereas indices start at 0
  pages[i] = JSON.parse(httpGet(paginatedURL));
}

//TODO remove
var a = 0;

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

  for (var i = 0; i < page.customers.length; ++i)   //main loop validating customers
  {

    for (var j = 0; j < page.validations.length; ++j)
    {
      var nameOfField = Object.keys(page.validations[j])[0];  //get the field name

      var validation = page.validations[j][nameOfField];

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
        var strlen;
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


for (var i = 0; i < pages.length; ++i)
{
  validateCustomerPage(pages[i]);
}

console.log(output);
