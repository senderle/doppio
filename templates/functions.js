//////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////
// CRUD Operations!
//

var req = new XMLHttpRequest();
req.open("GET", "/schema.json", false);
req.send();
var playbillRecord = JSON.parse(req.responseText);

var xhr = new XMLHttpRequest();

function hmac_hash(data, key) {
    var hash = CryptoJS.HmacSHA256(data, key).toString(CryptoJS.enc.Hex);
    //console.log(hash);
    return hash;
}

function get_ephemeral_record() {
    xhr.open('GET', '/ephemeralRecord', false);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send();
    return xhr.responseText;
}

function get_accounts(userid, hash) {
    xhr.open('GET', '/accounts', true);
    xhr.setRequestHeader('Authorization', userid + ":" + hash);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send();
    return xhr.responseText;
}

function get_accounts_new(username, hash) {
    xhr.open('GET', '/accounts', true);
    xhr.setRequestHeader('Authorization', username + ":" + hash);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send();
    return xhr.responseText;
}

function query_documents(query_params) {
    xhr.open('GET', '/ephemeralRecord' + '?' + query_params, false);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send();
    return xhr.responseText;
}

function async_query_documents(query_params, callback) {
    var xhttp = new XMLHttpRequest;
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            callback(this.responseText);
            console.log(JSON.parse(this.responseText)._meta.page);
        }
    };
    xhttp.open('GET', '/ephemeralRecord' + '?' + query_params, true);
    xhttp.setRequestHeader('Content-Type', 'application/json');
    xhttp.send();
}

function get_document_by_id(document_id) {
    xhr.open('GET', '/ephemeralRecord' + '/' + document_id, false);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send();
    return xhr.responseText;
}

function post_new_document(userid, token, resource_name, data) {
    xhr.open('POST', '/' + resource_name, true);
    var auth = 'Bear ' + token;
    xhr.setRequestHeader('Authorization', auth);
    // xhr.setRequestHeader('Authorization', userid + ":" + hash);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(data);

    var statusAlert = document.getElementById('status-message-window');
    var rst = document.getElementById("reset-after-post");
    xhr.onload = function () {
    if (xhr.status == 201 || xhr.status == 200){
        statusAlert.innerHTML = ("Successfully saved data.").fontcolor("#33cc33"); //green
        rst.click();
    }
    else if (xhr.status == 401) {
        statusAlert.innerHTML = ("Error: " + xhr.statusText).fontcolor("#ff0000");
        if (confirm("An authorization error occurred. Save current record to file and then login to proceed.")) {
        }
        else {
        }
    }
    else {
        statusAlert.innerHTML = ("Error: " + xhr.statusText).fontcolor("#ff0000"); //red
    }
    };
}

function patch_existing_document(userid, token, resource_name, document_id, data) {
    xhr.open('PATCH', '/' + resource_name + '/' + document_id, true);
    var auth = 'Bear ' + token;
    xhr.setRequestHeader('Authorization', auth);
    // xhr.setRequestHeader('Authorization', userid + ":" + hash);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(data);
}

////////////////////////////////////////////////////////////////////////////
// map functions

//placenameToLatLon
function post_loc_as_geocode(place, token) {
    // nominatim geosearch (this is used by the leaflet-geosearch)
    // max one req per sec

    var url = 'http://nominatim.openstreetmap.org/search?q=' + place + '&countrycodes=gb,ie&format=json&email=annamar@seas.upenn.edu';
    fetch(url, {method:'GET'})
    .then(response => {console.log(response); return response.json()})
    .then(json => {var coor = [json[0].lat, json[0].lon]; 
        console.log(coor);
        return coor; })
    .then(coords => {var newGeocode = {'placename': place,
                              'coordinates': {
                                  'lat': coords[0],
                                  'lon': coords[1]}};
                                  return JSON.stringify(newGeocode).toString();})
    .then(geocode => post_new_geocode(geocode, token));

    // var req = new XMLHttpRequest();
    // req.open("GET", 'http://nominatim.openstreetmap.org/search?q=' + place + '&countrycodes=gb,ie&format=json&email=annamar@seas.upenn.edu', false);
    // req.send();
    // var res = JSON.parse(req.responseText);
    // var location = res[0];
    // return [location.lat, location.lon];
}

function post_new_geocode(data, token) {
    console.log(data);
    xhr.open('POST', '/geocodes', true);
    var auth = 'Bear ' + token;
    xhr.setRequestHeader('Authorization', auth);
    // xhr.setRequestHeader('Authorization', 'admin:' + hmac_hash(data,'$2a$12$3hMRHrwRG4mKZLAdjAXG0uQBJr96Cuo1NmL.TqJsfHQwb9BYIj9Mq'));
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(data);
}

function lookupGeocode(placename) {
    xhr.open('GET', '/geocodes?where={"placename":"' + placename + '"}', false);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send();
    return xhr.responseText;
}

//////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////
// Utilities for string manipulation, etc.
//

function insertSpace(match, val) {
    return val + ' ';
}

function upperCase(match, val) {
    return val.toUpperCase();
}

function splitCamel(s) {
    return s.replace(/([a-z](?=[A-Z]))/g, insertSpace)    // Split CamelCase
            .replace(/([a-z](?=[0-9]))/g, insertSpace)    // Separate Digits
            .replace(/([0-9](?=[a-zA-Z]))/g, insertSpace);     // (ditto)
}

function titleCase(s) {
    s = splitCamel(s);
    return s.replace(/(^[a-z])/g, s[0].toUpperCase())     // First Cap
            .replace(/( [a-z])/g, upperCase);                     // Cap After Space
}

function toId(s, prefix) {
    s = splitCamel(s);
    prefix = prefix ? s ? prefix + '_' : prefix : '';
    return prefix + s.replace(/(\s)/g, '-').toLowerCase();
}

function idToList(keys) {
    // Take id keys in the form "yabba-dabba_doo" and convert them to
    // a list of keys in the form `['yabbaDabba', 'doo']`.
    if (typeof keys === 'string') {
        keys = keys.split('_');
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i].split('-');
            for (j = 0; j < key.length; j++) {
                    key[j] = key[j][0].toUpperCase() + key[j].slice(1);
            }
            key = key.join('');
            keys[i] = key[0].toLowerCase() + key.slice(1);
        }
    }
    return keys;
}

function listToId(keyList) {
    // Take a list of keys in the form `['yabbaDabba', 'doo']` and
    // convert them to id keys in the form "yabba-dabba_doo".
    var ids = keyList.map(function (i) { return toId('' + i); });
    return ids.join('_');
}

function singular(s) {
    return s.replace(/(s$)/g, '');
}

function stripNum(s) {
    return s.replace(/([0-9]+\s*$)/g, '');
}

function isPrimitive(val) {
    var vtype = typeof val;
    return (vtype === 'string') ||
           (vtype === 'number') ||
           (vtype === 'boolean') ||
           (val === null) ||
           (val === undefined);
}

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
             .replace(/\\/g, '"')
             .replace(/([a-z](?=[A-Z]))/g, insertSpace);  //camelCase split

}

function jsonToFilename(json) {
    var venue = json.ephemeralRecord.shows[0].venue;
    var date = json.ephemeralRecord.shows[0].date;
    var title = json.ephemeralRecord.shows[0].performances[0].title;
    var cataloger = json.ephemeralRecord.dataCataloger;
    var elements = [date, venue, title, cataloger];
    var tojoin = [];

    for (var i = 0; i < elements.length; i++) {
        if (elements[i] !== '') {
            tojoin.push(elements[i]);
        }
    }

    var filename = toId(tojoin.join(' '));
    filename = filename === '' ? 'empty-record.json' : filename + '.json';
    return filename;
}

//////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////
// Extract keys and search paths from the Schema
//

// get a flat dictionary of keys to search paths
var getAllSearchPaths = function () {
    var dict = {};
    var makeDict = function (obj, path) {
        for (var k in obj) {
            if (k === 'type') {
                continue;
            }
            else if (obj.hasOwnProperty(k)) {
                if (k === 'schema') {
                    makeDict(obj[k], path);
                } else if (obj[k].type=='dict' || (obj[k].type=='list' && obj[k].schema.schema)) {
                    makeDict(obj[k], path + '.' + k);
                } else {
                    if (k === 'location') {
                        descriptivek = path.substr(path.lastIndexOf('.') + 1) + ' ' + k;
                        dict[descriptivek] = path + '.' + k;
                    } else {
                        dict[k] = path + '.' + k;
                    }
                }
            }
        }
    };
    makeDict(playbillRecord.ephemeralRecord,['ephemeralRecord']);
    return dict;
};

//get all keys for any subsection of the schema in a list
var getAllKeys = function (obj) {
    var list = [];
    var makeList = function (obj, list) {
        for (var k in obj) {
            if (k === 'type') {
                continue;
            } else if (k=='schema' || obj[k].type=='dict' || (obj[k].type=='list' && obj[k].schema.schema)) {
                makeList(obj[k], list);
            } else {
                list.push(k);
            }
        }
    };
    makeList(obj, list);
    return list;
};
