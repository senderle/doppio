document.addEventListener('DOMContentLoaded', function main() {

    /////////////Query documents by partial string or keyword///////////////////
    var searchRecord = document.getElementById('search-button');
    var nav = document.getElementById("nav-pages-window");
    nav.style.visibility = "hidden";
    var nextPage = document.getElementById('next-page');
    var previousPage = document.getElementById('prev-page');
    var page = 0;

    function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
    }


    function pruning(json) {
      return json.replace(/{/g, '')
                 .replace(/}/g, '')
                 .replace(/"/g, '')
                 .replace("ephemeralRecord:", '')
                 .replace(/:/g, ': ')
                 .replace(/\[/g, '')
                 .replace(/\]/g, '')
                 .replace(/,/g, ', ')
                 .replace(/[\w]+:/g, function(x){return capitalize(x);})
                 .replace(/([a-z](?=[A-Z]))/g, insertSpace);  //camelCase split

    }


    function getQuery() {
        var searchTerm = document.getElementById('search-term').value;
        var query_string = 'where={"ephemeralRecord.shows.venue":' +
                         '{"$regex":"(?i).*' + searchTerm +
                          '.*"}}&projection={"ephemeralRecord.shows.venue":1,' +
                          '"ephemeralRecord.shows.date":1,' +
                          '"ephemeralRecord.shows.performances.title": 1}' +
                          '&page=' + page + '&pretty';
        var results = JSON.parse(query_documents(query_string));
        var numOfPages = Math.ceil(results._meta.total/results._meta.max_results);
        var searchResults = document.getElementById('search-results');
        if (numOfPages === 0) {
        searchResults.innerHTML = "Your search did not match any documents.";
        } else {
        searchResults.innerHTML = "Found " + results._meta.total + " results<br/>" +
                                  "Page " + page + " of " + numOfPages;
        }
        for (var i=0; i<results._items.length; i++) {
        var stringified = JSON.stringify(results._items[i]);
        //console.log(JSON.stringify(results._items[i].ephemeralRecord.shows[0].venue));
        var p = document.createElement('p');
        var a = document.createElement('a');
        a.setAttribute('href', '/home#' + results._items[i]._id);
        a.appendChild(document.createTextNode(results._items[i]._id));
        a.appendChild(document.createElement('br'));
        p.appendChild(a);

        var resultsArray = stringified.split(',"');
        var resultsNode = document.createElement('results')
        for(var j=0; j<(resultsArray.length); j++) {
          if (resultsArray[j].includes('_id') || resultsArray[j].includes('_updated') ||
              resultsArray[j].includes('_created')) {
          }
          else if (searchTerm != '' && searchTerm != ' ' && resultsArray[j].match(new RegExp(searchTerm, "i"))) {
            var bold = document.createElement('b');
            bold.appendChild(document.createTextNode(pruning(resultsArray[j])));
            resultsNode.appendChild(bold);
            resultsNode.appendChild(document.createElement('br'));
            p.appendChild(resultsNode);
          }
          else {
            resultsNode.appendChild(document.createTextNode(pruning(resultsArray[j])));
            resultsNode.appendChild(document.createElement('br'));
            p.appendChild(resultsNode);
          }
        }
        p.appendChild(document.createElement('br'));
        searchResults.appendChild(p);
        }
        return numOfPages;
    }

    searchRecord.addEventListener('click', function() {
      var div = document.getElementById('search-results');
      while(div.firstChild){
          div.removeChild(div.firstChild);
      }
      page = 1;
      if (getQuery()>1) {
        nextPage.style.visibility = "visible";
      }
    });

    //////////////////// Go to next page ////////////////////////////////////////////////////////////

    nextPage.addEventListener('click', function() {
      var numOfPages = getQuery();
      if (page<numOfPages){
          page = page + 1;
          previousPage.style.visibility = "visible";
          nextPage.style.visibility = "visible";
        }
      if(page === numOfPages) {
          nextPage.style.visibility = "hidden";
      }
      getQuery();
    });


  ///////////////////////Go to previous page//////////////////////////////////////////////////////////

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
                cb.id = "checkbox-" + list[i];

                var cblabel = document.createElement('cb-label')
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
            }
        }
    }

    // get keys recursively
    function accessAllKeys(obj, path) {
        for (var k in obj) {
            if (obj[k].hasOwnProperty('type')) {
                if (['dict','list'].includes(obj[k].type)) {
                    accessAllKeys(obj[k], path + '.' + k);
                } else {
                    console.log(path + '.' + k);
                }
            }
        }
        //console.log(pathDict);
    }

    accessAllKeys(playbillRecord, ['schema']/*, pathDict*/);

    //build dictionary
    var searchSchema = playbillRecord.ephemeralRecord.schema;
    var showsSchema = searchSchema.shows.schema.schema;
    var subShow = ['Occasions','Performances','Ticketing'];

    var documentTerms = Object.keys(searchSchema).filter(function(x){if (!searchSchema[x].hasOwnProperty('schema')) return x; });
    var documentPrinterTerms = Object.keys(searchSchema.documentPrinter.schema);
    var generalInfo = ['Announcements', 'Advertisements'];
    var showsTerms = Object.keys(showsSchema).filter(function(x){ if(!subShow.includes(titleCase(x))) return x; });
    var performanceTerms = Object.keys(showsSchema.performances.schema.schema);
    var occasionTerms = Object.keys(showsSchema.occasions.schema.schema);
    var ticketingTerms = Object.keys(showsSchema.ticketing.schema);

    var searchFields = {'documentDetails':documentTerms,
                        'documentPrinter':documentPrinterTerms,
                        'generalInformation':generalInfo,
                        'shows':showsTerms,
                        'performances':performanceTerms,
                        'occasions':occasionTerms,
                        'ticketing':ticketingTerms}

    buildSearchFilter(searchFields);

});
