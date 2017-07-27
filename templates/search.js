document.addEventListener('DOMContentLoaded', function main() {

    /////////////Query documents by partial string or keyword///////////////////
    var searchRecord = document.getElementById('search-button');
    var navTop = document.getElementById("nav-pages-window-top");
    navTop.style.visibility = "hidden";
    var navBottom = document.getElementById("nav-pages-window-bottom");
    navBottom.style.visibility = "hidden";
    var nextTop = document.getElementById('next-page-top');
    var nextBot = document.getElementById('next-page-bottom');
    var prevTop = document.getElementById('prev-page-top');
    var prevBot = document.getElementById('prev-page-bottom');
    var page = 0;

    function buildQuery() {
        // search filters
        var ks = getAllKeys(searchSchema);
        ks[ks.indexOf('name')] = 'documentPrinterName';
        ks[ks.indexOf('location')] = 'documentPrinterLocation';
        var searchFilters = [];
        for (var i=0; i<ks.length; i++) {
            if (document.getElementById('checkbox-' + ks[i]).checked) {
                console.log(ks[i]);
                searchFilters.push(document.getElementById('checkbox-' + ks[i]).value);
            }
        }
        if (searchFilters[0] == null) {
            searchFilters = ks;
        }


        // search term
        var searchTerm = document.getElementById('search-term').value;
        var searchDate = document.getElementById('date-search');
        var startDate = document.getElementById('date-start').value;
        var endDate = document.getElementById('date-end').value;

        var booleans = ['isInterpolation', 'newRole', 'newPerformer'];
        var boolTerms = searchFilters.filter(function(x) {if (booleans.includes(x)) return x});
        console.log(boolTerms);

        // search paths
        var searchPaths = getAllSearchPaths();
        searchPaths['documentPrinterName'] = searchPaths ['name'];
        searchPaths['documentPrinterLocation'] = searchPaths ['documentPrinter location'];
        searchPaths['location'] = searchPaths ['shows location'];
        delete searchPaths['name'];
        delete searchPaths['shows location'];
        delete searchPaths['documentPrinter location'];

        // query
        var queryString = [];
            var queryString = 'where={"$or":[';
            for (var i=0; i<searchFilters.length; i++) {
                queryString = queryString + '{"' + searchPaths[searchFilters[i]] + '":' +
                '{"$regex":"(?i).*' + searchTerm + '.*"}},';
            }
            if (searchDate.style.display == 'block') {
              queryString = queryString + '{"$and":[' +
              '{"' + searchPaths['date'] + '":' + '{"$gte":"' + startDate + '"}},'+
              '{"' + searchPaths['date'] + '":' + '{"$lte":"' + endDate + '"}}]'+'},';
            } // dates can only be searched using input elements with ids "date-start" and "date-end"
              // searching for dates as "search-term" in "search-window" will not work

            if (typeof searchTerm == 'number') {
                for (var i=0; i<searchFilters.length; i++) {
                    queryString = queryString + '{"' + searchPaths[searchFilters[i]] + '":' +
                    searchTerm + '},';
                }
            }
            for (var i=0; i<boolTerms.length; i++) {
                console.log(searchPaths[boolTerms[i]]);
                queryString = queryString + '{"' + searchPaths[boolTerms[i]] + '":' +
                true + '},';
            }
            queryString = queryString.slice(0, -1);
            queryString = queryString + ']}&projection={';
            for (var i=0; i<searchFilters.length; i++) {
                queryString = queryString + '"' + searchPaths[searchFilters[i]] + '":1,';
            }
            queryString = queryString +
            '"ephemeralRecord.shows.date":1,' +
            '"ephemeralRecord.shows.performances.title":1}' +
            '&page=' + page + '&pretty';
    return queryString;
    }


    function getQuery() {

        // run query
        var results = JSON.parse(query_documents(buildQuery()));
        var numOfPages = Math.ceil(results._meta.total/results._meta.max_results);

        // display results
        var searchResults = document.getElementById('search-results');
        if (numOfPages === 0) {
            searchResults.innerHTML = "Your search did not match any documents.";
        } else {
            searchResults.innerHTML = "Found " + results._meta.total + " results<br/>" +
                                      "Page " + page + " of " + numOfPages;
        }

        for (var i=0; i<results._items.length; i++) {
            var stringified = JSON.stringify(results._items[i]);
            var p = document.createElement('p');
            var a = document.createElement('a');
            a.setAttribute('href', '/home#' + results._items[i]._id);
            var fname = jsonToFilename(results._items[i]);
            a.appendChild(document.createTextNode(fname.substr(0,fname.lastIndexOf('.'))));
            //a.appendChild(document.createTextNode(results._items[i]._id));
            a.appendChild(document.createElement('br'));
            p.appendChild(a);

            var resultsArray = stringified.split(',"');
            var resultsNode = document.createElement('results');
            for(var j=0; j<(resultsArray.length); j++) {
                if (resultsArray[j].includes('_updated') ||
                    resultsArray[j].includes('_created')) {
                    continue;
                }/*else if (searchTerm != '' && searchTerm != ' ' && resultsArray[j].match(new RegExp(searchTerm, "i"))) {
                    var bold = document.createElement('b');
                    bold.appendChild(document.createTextNode(pruning(resultsArray[j])));
                    resultsNode.appendChild(bold);
                    resultsNode.appendChild(document.createElement('br'));
                    p.appendChild(resultsNode);
                }*/else {
                    resultsNode.appendChild(document.createTextNode(pruning(resultsArray[j])));
                    resultsNode.appendChild(document.createElement('br'));
                    p.appendChild(resultsNode);
                }
            }
            p.appendChild(document.createElement('br'));
            searchResults.appendChild(p);
        }
        return numOfPages;
    } //end getQuery

    searchRecord.addEventListener('click', function() {
        var div = document.getElementById('search-results');
        while (div.firstChild) {
            div.removeChild(div.firstChild);
        }
        page = 1;
        var t0 = performance.now();
        if (getQuery()>1) {
            var t1 = performance.now();
            nextTop.style.visibility = "visible";
            nextBot.style.visibility = "visible";
        }
        console.log(t1-t0);
    });

    var clearSearch = document.getElementById('clear-search');
    clearSearch.addEventListener('click', function() {
      location.reload(true);
    });

    ////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////
    // Search Results Page Navigation
    //
    function navToNext() {
        var numOfPages = getQuery(prevTop, prevBot, nextTop, nextBot);
            if (page<numOfPages) {
                page = page + 1;
                prevTop.style.visibility = "visible";
                prevBot.style.visibility = "visible";
                nextTop.style.visibility = "visible";
                nextBot.style.visibility = "visible";
            }
            if (page === numOfPages) {
                nextTop.style.visibility = "hidden";
                nextBot.style.visibility = "hidden";
            }
            getQuery();
    }

    function navToPrev() {
        var numOfPages = getQuery(prevTop, prevBot, nextTop, nextBot);
        if ((page-1)>=1) {
            page = page - 1;
            prevTop.style.visibility = "visible";
            prevBot.style.visibility = "visible";
            nextTop.style.visibility = "visible";
            nextBot.style.visibility = "visible";
        }
        if(page === 1) {
            prevTop.style.visibility = "hidden";
            prevBot.style.visibility = "hidden";
        }
        getQuery();
    }

    //attach event listeners to page navigation buttons
    nextTop.addEventListener('click', function(prevTop, prevBot, nextTop, nextBot) {
        navToNext();
    });
    nextBot.addEventListener('click', function(prevTop, prevBot, nextTop, nextBot) {
        navToNext();
    });
    prevTop.addEventListener('click', function(prevTop, prevBot, nextTop, nextBot) {
        navToPrev();
    });
    prevBot.addEventListener('click', function(prevTop, prevBot, nextTop, nextBot) {
        navToPrev();
    });

    ////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////
    // search filters
    //

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
        var dateBox = document.getElementById('checkbox-date');
        var dateSearch = document.getElementById('date-search');
        dateBox.addEventListener('click', function() {
          if(dateBox.checked){
          dateSearch.style.display = 'block';

        }
        else {
          dateSearch.style.display = 'none';
        }
      });
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
    }



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
