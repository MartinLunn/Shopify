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
  paginatedURL = apiEndpointURL + apiEndpointURLSuffix + i.toString()
  pages[i] = JSON.parse(httpGet(paginatedURL));
}
