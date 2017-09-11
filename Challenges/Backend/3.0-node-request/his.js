let _getMaxPageIndex = function (pageData) {
	if (!pageData)
		return -1;

	let perPage = pageData.per_page;
	let total   = pageData.total;

	return Math.ceil (total / perPage);
}

let _load = function (curPageIndex, maxPageIndex, eachFunc) {
	return new Promise (function (fulfill, reject){
		if (maxPageIndex >= 0 && curPageIndex > maxPageIndex) fulfill();
		else{
			request (apiBase + "?page=" + curPageIndex, function (err, resp, body){
				if (err) reject (err);
				else{
					var data;
					try{
						data = JSON.parse (body);
					} catch (err) {
						reject (err);
					}

					// if we don't have it yet, get the max page number
					if (maxPageIndex < 0) // NOTE: If want to check page totals after loading each page,
					                      //       would comment this line out.
						maxPageIndex = _getMaxPageIndex (data.pagination);

					// run the each function ...
					eachFunc (data);

					// and load our next page
					_load (curPageIndex + 1, maxPageIndex, eachFunc).then (fulfill, reject);
				}
			});
		}
	});
}
