document.addEventListener('DOMContentLoaded', function main() {

    // defaults
    var navTop = document.getElementById("nav-pages-window-top");
    navTop.style.visibility = "hidden";
    var navBottom = document.getElementById("nav-pages-window-bottom");
    navBottom.style.visibility = "hidden";
    if ("currentSearch" in sessionStorage) {
        sessionStorage.removeItem("currentSearch");
    }

    function buildQuery(searchTerm, page) {
        // search filters
        var ks = getAllKeys(searchSchema);
        ks[ks.indexOf('name')] = 'documentPrinterName';
        ks[ks.indexOf('location')] = 'documentPrinterLocation';

        var booleans = ['isInterpolation', 'newRole', 'newPerformer'];

        var searchFilters = [];
        for (var i=0; i<ks.length; i++) {
            if (document.getElementById('checkbox-' + ks[i]).checked) {
                if (ks[i] != 'date') {
                searchFilters.push(document.getElementById('checkbox-' + ks[i]).value);
              }
            }
        }
        if (searchFilters[0] == null) {
            searchFilters = ks.filter(function(x) {if (!booleans.includes(x)) return x;});
        }

        //search term used to be here
        var boolTerms = searchFilters.filter(function(x) {if (booleans.includes(x)) return x;});
        var numFields = ticketingTerms.concat('orderOfPerformance');
        var numTerms = searchFilters.filter(function(x) {if (numFields.includes(x)) return x;});

        var searchDate = document.getElementById('date-search');
        var startDate = document.getElementById('date-start').value;
        var endDate = document.getElementById('date-end').value;

        // search paths
        var searchPaths = getAllSearchPaths();
        searchPaths.documentPrinterName = searchPaths.name;
        searchPaths.documentPrinterLocation = searchPaths['documentPrinter location'];
        searchPaths.location = searchPaths['shows location'];
        delete searchPaths.name;
        delete searchPaths['shows location'];
        delete searchPaths['documentPrinter location'];


        // query
        if (searchDate.style.display == 'block') {
            // dates can only be searched using input elements with ids "date-start" and "date-end"
            // searching for dates as "search-term" in "search-window" will not work
            if (searchFilters.length == 49) {
                var queryString = 'where={"$and":[';
                queryString += '{"$or":[';
            } else {
                var queryString = 'where={"$and":[';
            }
            if (searchTerm !== "" && typeof +searchTerm != 'number') {
            for (var i=0; i<searchFilters.length; i++) {
                queryString += '{"' + searchPaths[searchFilters[i]] + '":' +
                '{"$regex":"(?i).*' + searchTerm + '.*"}},';
            }
            }
            if (+searchTerm) {
              for (var i=0; i<numTerms.length; i++) {
                  queryString += '{"' + searchPaths[searchFilters[i]] + '":' +
                  searchTerm + '},';
              }
            }
            if (searchTerm === "") {
              for (var i=0; i<numTerms.length; i++) {
                  queryString += '{"' + searchPaths[searchFilters[i]] + '":' +
                  '{"$ne":null}},';
              }
            }
            for (var i=0; i<boolTerms.length; i++) {
              queryString += '{"' + searchPaths[boolTerms[i]] + '":' +
              true + '},';
            }
            if (searchFilters.length == 49) {
                queryString = queryString.slice(0, -1);
                queryString += ']},';
                queryString += '{"$and":[';
            }
            if(startDate != '') {
                queryString +=
                '{"' + searchPaths.date + '":' + '{"$gte":"' + startDate + '"}},';
            }
            if(endDate != '') {
                queryString +=
                '{"' + searchPaths.date + '":' + '{"$lte":"' + endDate + '"}},';
            }
            if(endDate == '' && startDate == '') {
                startDate = '0001-01-01';
                queryString +=
                '{"' + searchPaths.date + '":' + '{"$gte":"' + startDate + '"}},'
            }
            if (searchFilters.length == 49) {
                queryString = queryString.slice(0, -1);
                queryString += ']},';
            }
        } else {
            var queryString = 'where={"$or":[';
            for (var i=0; i<searchFilters.length; i++) {
              queryString += '{"' + searchPaths[searchFilters[i]] + '":' +
              '{"$regex":"(?i).*' + searchTerm + '.*"}},';
            }
            if (+searchTerm) {
              for (var i=0; i<numTerms.length; i++) {
                  queryString += '{"' + searchPaths[searchFilters[i]] + '":' +
                  searchTerm + '},';
              }
            }
            if (searchTerm === "") {
              for (var i=0; i<numTerms.length; i++) {
                  queryString += '{"' + searchPaths[searchFilters[i]] + '":' +
                  '{"$ne":null}},';
              }
            }
            for (var i=0; i<boolTerms.length; i++) {
              queryString += '{"' + searchPaths[boolTerms[i]] + '":' +
              true + '},';
            }
        }

        queryString = queryString.slice(0, -1);
        queryString += ']}&projection={';
        for (var i=0; i<searchFilters.length; i++) {
            queryString += '"' + searchPaths[searchFilters[i]] + '":1,';
        }

        queryString += '"ephemeralRecord.shows.date":1,' +
        '"ephemeralRecord.shows.location":1,' +
        '"ephemeralRecord.shows.venue":1,' +
        '"ephemeralRecord.shows.performances.title":1}' +
        '&page=' + page + '&pretty';

        return queryString;
    } // end build query

    function getQuery(searchTerm, source, page) {
        var queryString = buildQuery(searchTerm, page);
        // run query
        var results = JSON.parse(query_documents(queryString))
        var numOfPages = Math.ceil(results._meta.total/results._meta.max_results);
        // handle results based on source
        switch(source) {
            case 'search':
                showResults(searchTerm, numOfPages, results, source, page)
                break;
            case 'count':
                return {'searchTerm':searchTerm,'count': numOfPages, 'results': results,'source':source}
                break;
            case 'store':
                return queryString;
        }
    }

    function showResults(searchTerm, numOfPages, results, source, page) {
        // display results
        var searchResults = document.getElementById('search-results');
        // clear previous page of results
        while (searchResults.firstChild) {
            searchResults.removeChild(searchResults.firstChild);
        }
        if (numOfPages == 0) {
            searchResults.appendChild(document.createTextNode('Your search did not match any documents.'));
        } else if (results._meta.total == 1) {
            searchResults.appendChild(document.createTextNode("Found 1 result"));
            searchResults.appendChild(document.createElement('br'));
            searchResults.appendChild(document.createTextNode("Page " + page + " of " + numOfPages));
        } else {
            searchResults.appendChild(document.createTextNode("Found " + results._meta.total + " results"));
            searchResults.appendChild(document.createElement('br'));
            searchResults.appendChild(document.createTextNode("Page " + page + " of " + numOfPages));
        }

        var mapLink = document.createElement('a');
        mapLink.setAttribute('href', '/map');
        mapLink.appendChild(document.createElement('br'));
        mapLink.appendChild(document.createTextNode('View Results on Map'));
        mapLink.appendChild(document.createElement('br'));
        searchResults.appendChild(mapLink);

        //<a onclick="return createTimedLink(this, myFunction, 2000);" href="http://www.siku-siku.com">Link</a>
        mapLink.onclick = function () {
            if (("currentSearch" in sessionStorage) == false) {
                alert('Loading map points. Please wait a few seconds and try again.');
                return false;
            }
        }
    
        for (var i=0; i<results._items.length; i++) {
            var stringified = JSON.stringify(results._items[i]);
            var p = document.createElement('p');

            // search result heading/link
            var a = document.createElement('a');
            a.setAttribute('href', '/home#' + results._items[i]._id);
            var fname = jsonToFilename(results._items[i]);
            a.appendChild(document.createTextNode(fname.substr(0,fname.lastIndexOf('.'))));
            a.appendChild(document.createElement('br'));
            p.appendChild(a);

            // search result content
            var resultsArray = stringified.split(',"');
            var resultsNode = document.createElement('results');
            for(var j=0; j<(resultsArray.length); j++) {
                if (resultsArray[j].includes('_updated') ||
                    resultsArray[j].includes('_created')) {
                    continue;
                } else if (searchTerm != '' && resultsArray[j].match(new RegExp(searchTerm, "i"))) {
                    var bold = document.createElement('b');
                    bold.appendChild(document.createTextNode(pruning(resultsArray[j])));
                    resultsNode.appendChild(bold);
                    resultsNode.appendChild(document.createElement('br'));
                    p.appendChild(resultsNode);
                } else {
                    resultsNode.appendChild(document.createTextNode(pruning(resultsArray[j])));
                    resultsNode.appendChild(document.createElement('br'));
                    p.appendChild(resultsNode);
                }
            }
            p.appendChild(document.createElement('br'));
            searchResults.appendChild(p);
        }
    } //end showResults

    ////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////
    // Search Results Page Navigation
    //
    function navToNext(searchTerm, page) {
        var ret = getQuery(searchTerm, 'count', page);
        var numOfPages = ret.count;
        if (page<numOfPages) {
            prevTop.style.visibility = "visible";
            prevBot.style.visibility = "visible";
            nextTop.style.visibility = "visible";
            nextBot.style.visibility = "visible";
        }
        if (page === numOfPages) {
            nextTop.style.visibility = "hidden";
            nextBot.style.visibility = "hidden";
        }
        showResults(ret.searchTerm, ret.count, ret.results, ret.source, page);
    }

    function navToPrev(searchTerm, page) {
        var ret = getQuery(searchTerm, 'count', page);
        var numOfPages = ret.count;
        if (page >= 1) {
            prevTop.style.visibility = "visible";
            prevBot.style.visibility = "visible";
            nextTop.style.visibility = "visible";
            nextBot.style.visibility = "visible";
        }
        if(page === 1) {
            prevTop.style.visibility = "hidden";
            prevBot.style.visibility = "hidden";
        }
        showResults(ret.searchTerm, ret.count, ret.results, ret.source, page);
    }

    // takes dictionary and makes an accordian panel with one panel per key
    function buildSearchFilter(dict) {
        for (var key in dict) {
            var list = dict[key];

            var searchFilter = document.getElementById('search-filter');

            var button = document.createElement('button');
            button.setAttribute('class','accordion');
            button.appendChild(document.createTextNode(titleCase(key)));

            var panel = document.createElement('div');
            panel.setAttribute('class','panel');
            panel.id = key + '-panel';

            searchFilter.appendChild(button);
            searchFilter.appendChild(panel);

            var cbcontainer = document.createElement('cb-container');
            cbcontainer.setAttribute('type','ul');

            var container = document.getElementById(key + '-panel');
            container.appendChild(cbcontainer);

            // each checkbox and label are in list elements, can be formatted in rows
            for (var i=0; i < list.length; i++) {
                var li = document.createElement('li');

                var cb = document.createElement('input');
                cb.setAttribute('type', 'checkbox');
                cb.setAttribute('class', 'cb');
                cb.setAttribute('value', list[i]);
                cb.id = "checkbox-" + list[i];

                var cblabel = document.createElement('cb-label');
                cblabel.htmlFor = cb.id;
                cblabel.appendChild(document.createTextNode(titleCase(list[i])));

                cbcontainer.appendChild(li);
                li.appendChild(cb);
                li.appendChild(cblabel);
            }
        }
        // toggle accordian panels
        var buttons = document.getElementsByClassName("accordion");
        for (var i = 0; i < buttons.length; i++) {
            buttons[i].onclick = function(){
                this.classList.toggle("active");
                var panel = this.nextElementSibling;
                if (panel.style.display === "block") {
                    panel.style.display = "none";
                } else {
                    panel.style.display = "block";
                }
            };
        }

        // add event lister to date checkbox
        var dateBox = document.getElementById('checkbox-date');
        var dateSearch = document.getElementById('date-search');
        dateBox.addEventListener('click', function() {
            if(dateBox.checked){
                dateSearch.style.display = 'block';
            } else {
                dateSearch.style.display = 'none';
            }
        });
    }

    ////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////
    // attach event listeners to UI elements
    //

    // clear search
    var clearSearch = document.getElementById('clear-search');
    clearSearch.addEventListener('click', function() {
        location.reload(true);
    });


    var nextTop = document.getElementById('next-page-top');
    var nextBot = document.getElementById('next-page-bottom');
    var prevTop = document.getElementById('prev-page-top');
    var prevBot = document.getElementById('prev-page-bottom');

    var searchRecord = document.getElementById('search-button');
    searchRecord.addEventListener('click', function() {
        var searchTerm = document.getElementById('search-term').value;

        nextTop.style.visibility = "hidden";
        nextBot.style.visibility = "hidden";
        prevTop.style.visibility = "hidden";
        prevBot.style.visibility = "hidden";

        var div = document.getElementById('search-results');
        while (div.firstChild) {
            div.removeChild(div.firstChild);
        }
        var page = 1;
        var ret = getQuery(searchTerm,'count',page);
        if (ret.count>1) {
            nextTop.style.visibility = "visible";
            nextBot.style.visibility = "visible";
        }
        //getQuery('search',page);
        showResults(ret.searchTerm, ret.count, ret.results, ret.source, page);

        //attach event listeners to page navigation buttons
        nextTop.addEventListener('click', function() {
            page = page + 1;
            navToNext(searchTerm,page);
            document.getElementById('prev-page-top').focus();
        });
        nextBot.addEventListener('click', function() {
            page = page + 1;
            navToNext(searchTerm,page);
            document.getElementById('prev-page-top').focus();
        });
        prevTop.addEventListener('click', function() {
            page = page - 1;
            navToPrev(searchTerm,page);
            document.getElementById('next-page-top').focus();
        });
        prevBot.addEventListener('click', function() {
            page = page - 1;
            navToPrev(searchTerm,page);
            document.getElementById('next-page-top').focus();
        });

        var res = [ret.results];

        for (var i = 2; i <= ret.count;  i++) { // i is page number
            var query = buildQuery(searchTerm, i);
            async_query_documents(query, function(x) {
                    var o = JSON.parse(x);
                    res.push(o);
                    //console.log('page ' + o._meta.page + ' processed');
                    //res.push(query_documents(buildQuery(searchTerm, i))); // i is page number
            });
        }

        //setInterval
        function saveSearch() {
            sessionStorage.setItem('currentSearch', JSON.stringify(res));
        }

        var intervalID = setInterval(checkSaveStatus, 1000);

        function checkSaveStatus() {
            if (res.length == ret.count) {
                saveSearch();
                clearInterval(intervalID);
            }
        }

        //setTimeout(saveSearch, 8000);
    }); // end search button function

    ////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////
    // SCHEMA SPECIFIC CODE for search filter
    //

    // query documents by partial string or keyword

    // Search Filter
    // The keys in the searchFields dictionary determine the categories in the
    // search filter. The values in the searchFields dictionary are lists of
    // keys from the schema, each of which will become a checkbox under the
    // category determined by the associated key.

    // get schema
    var req = new XMLHttpRequest();
    req.open("GET", "/schema.json", false);
    req.send();
    var playbillRecord = JSON.parse(req.responseText);

    // helper and shortcut variables
    var searchSchema = playbillRecord.ephemeralRecord.schema;
    var showsSchema = searchSchema.shows.schema.schema;
    var subShow = ['occasions','performances','ticketing'];

    // sort keys into for categories for the accordian
    var documentTerms = Object.keys(searchSchema).filter(function(x){if (!searchSchema[x].hasOwnProperty('schema')) return x; });
    documentTerms.push('documentPrinterName', 'documentPrinterLocation');
    var generalInfo = ['announcements', 'advertisements'];
    var showsTerms = Object.keys(showsSchema).filter(function(x){ if(!subShow.includes(x)) return x; });
    var performanceTerms = getAllKeys(showsSchema.performances);
    var occasionTerms = getAllKeys(showsSchema.occasions);
    var ticketingTerms = getAllKeys(showsSchema.ticketing);

    //build dictionary
    var searchFields = {'documentDetails':documentTerms,
                        'generalInformation':generalInfo,
                        'shows':showsTerms,
                        'performances':performanceTerms,
                        'occasions':occasionTerms,
                        'ticketing':ticketingTerms};

    buildSearchFilter(searchFields);

});
