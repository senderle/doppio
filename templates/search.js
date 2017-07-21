document.addEventListener('DOMContentLoaded', function main() {

    /////////////Query documents by partial string or keyword///////////////////
    var searchRecord = document.getElementById('search-button');
    var nav = document.getElementById("nav-pages-window");
    nav.style.visibility = "hidden";
    var nextPage = document.getElementById('next-page');
    var previousPage = document.getElementById('prev-page');
    var page = 0;

    function getQuery() {
        // apply search filters
        var ks = getAllKeys(searchSchema);
        var l = ks[ks.indexOf('name')] = 'documentPrinterName';
        var n = ks[ks.indexOf('location')] = 'documentPrinterLocation';
        var searchPaths = getAllSearchPaths();
        var searchFilters = [];
        for (var i=0; i<ks.length; i++) {
            if (document.getElementById('checkbox-' + ks[i]).checked) {
                searchFilters.push(document.getElementById('checkbox-' + ks[i]).value);
            }
        }
        if (searchFilters[0] == null) {
            searchFilters = ks;
        }
        // query
        var searchTerm = document.getElementById('search-term').value;
        var query_string = [];
        if (searchFilters.length == 1) {
            var query_string = 'where={"' + searchPaths[searchFilters[0]] + '":' +
                               '{"$regex":"(?i).*' + searchTerm +
                               '.*"}}&projection={"'+ searchPaths[searchFilters[0]] + '":1,' +
                               '"ephemeralRecord.shows.date":1,' +
                               '"ephemeralRecord.shows.performances.title": 1}' +
                               '&page=' + page + '&pretty';
        } else {
            var query_string = 'where={"$or":[';
            for (var i=0; i<searchFilters.length; i++) {
                query_string = query_string + '{"' + searchPaths[searchFilters[i]] + '":' +
                '{"$regex":"(?i).*' + searchTerm + '.*"}},';
            }
            query_string = query_string.slice(0, -1);
            query_string = query_string + ']}&projection={';
            for (var i=0; i<searchFilters.length; i++) {
                query_string = query_string + '"' + searchPaths[searchFilters[i]] + '":1,';
            }
            query_string = query_string +
            '"ephemeralRecord.shows.date":1,' +
            '"ephemeralRecord.shows.performances.title":1}' +
            '&page=' + page + '&pretty';
        }
        console.log(query_string);
        var results = JSON.parse(query_documents(query_string));
        var numOfPages = Math.ceil(results._meta.total/results._meta.max_results);
        var searchResults = document.getElementById('search-results');
        if (numOfPages === 0) {
            searchResults.innerHTML = "Your search did not match any documents.";
        } else {
            searchResults.innerHTML = "Found " + results._meta.total + " results<br/>" +
                                      "Page " + page + " of " + numOfPages;
        }
        // display results
        for (var i=0; i<results._items.length; i++) {
            var stringified = JSON.stringify(results._items[i]);
            var p = document.createElement('p');
            var a = document.createElement('a');
            a.setAttribute('href', '/home#' + results._items[i]._id);
            a.appendChild(document.createTextNode(results._items[i]._id));
            a.appendChild(document.createElement('br'));
            p.appendChild(a);

            var resultsArray = stringified.split(',"');
            var resultsNode = document.createElement('results');
            for(var j=0; j<(resultsArray.length); j++) {
                if (resultsArray[j].includes('_id') || resultsArray[j].includes('_updated') ||
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
        if (getQuery()>1) {
            nextPage.style.visibility = "visible";
        }
    });

    //////////////////// Go to next page ///////////////////////////////////////
    nextPage.addEventListener('click', function() {
    var numOfPages = getQuery();
        if (page<numOfPages) {
            page = page + 1;
            previousPage.style.visibility = "visible";
            nextPage.style.visibility = "visible";
        }
        if (page === numOfPages) {
            nextPage.style.visibility = "hidden";
        }
        getQuery();
    });

  ///////////////////////Go to previous page////////////////////////////////////
  previousPage.addEventListener('click', function() {
    var numOfPages = getQuery();
    if ((page-1)>=1) {
      page = page - 1;
      previousPage.style.visibility = "visible";
      nextPage.style.visibility = "visible";
      }
    if(page === 1) {
      previousPage.style.visibility = "hidden";
      }
    getQuery();
    });

    ///////////////////// search filters //////////////////////////////////////////
    // get schema
    var req = new XMLHttpRequest();
    req.open("GET", "/schema.json", false);
    req.send();
    var playbillRecord = JSON.parse(req.responseText);

    // make search filter accordian panel
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
                var panel = this.nextElementSibling;
                if (panel.style.display === "block") {
                    panel.style.display = "none";
                } else {
                    panel.style.display = "block";
                }
            };
        }
    }

    //build dictionary
    var searchSchema = playbillRecord.ephemeralRecord.schema;
    var showsSchema = searchSchema.shows.schema.schema;
    var subShow = ['occasions','performances','ticketing'];

    //sort fields for accordion
    var documentTerms = Object.keys(searchSchema).filter(function(x){if (!searchSchema[x].hasOwnProperty('schema')) return x; });
    documentTerms.push('documentPrinterName', 'documentPrinterLocation');
    var generalInfo = ['announcements', 'advertisements'];
    var showsTerms = Object.keys(showsSchema).filter(function(x){ if(!subShow.includes(x)) return x; });
    var performanceTerms = getAllKeys(showsSchema.performances);
    var occasionTerms = getAllKeys(showsSchema.occasions);
    var ticketingTerms = getAllKeys(showsSchema.ticketing);

    var searchFields = {'documentDetails':documentTerms,
                        'generalInformation':generalInfo,
                        'shows':showsTerms,
                        'performances':performanceTerms,
                        'occasions':occasionTerms,
                        'ticketing':ticketingTerms};

    buildSearchFilter(searchFields);
});
