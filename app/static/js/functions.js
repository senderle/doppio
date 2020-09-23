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
    var statusAlert = document.getElementById('status-message-window');
    var rst = document.getElementById("reset-after-post");

    //fetch approach
    let url = '/' + resource_name;
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    var auth = 'Bear ' + token;
    headers.append('Authorization', auth);
    fetch(url, { method: 'POST', headers: headers, body: data })
        .then(response => {
            if (response.status == 200 || response.status == 201) {
                statusAlert.innerHTML = '<span style="color:green">Record saved</span>';
                rst.click();
            } else if (response.status == 403) {
                statusAlert.innerHTML = '<span style="color:red">Authentication Error</span>';
                confirm("An authorization error occurred. Save current record to file and then login to proceed.");
            } else {
                statusAlert.innerHTML = '<span style="color:red">HTTP Error: ' + response.status + '</span>';
                response.text().then(text => {
                    let msg = "An unexpeted error occurred.";
                    if (text.length > 0) {
                        msg += " The server provided the following details: ";
                        msg += text;
                    }
                    confirm(msg);
                });
            }
        })
        .catch(error => console.error('There has been a problem with your fetch operation: ', error.message));

}

function patch_existing_document(userid, token, resource_name, document_id, data) {
    xhr.open('PATCH', '/' + resource_name + '/' + document_id, true);
    var auth = 'Bear ' + token;
    xhr.setRequestHeader('Authorization', auth);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(data);
}

////////////////////////////////////////////////////////////////////////////
// map functions

//placenameToLatLon
function post_loc_as_geocode(place, token) {
    // nominatim geosearch (this is used by the leaflet-geosearch)
    // max one req per sec
    var url = 'https://nominatim.openstreetmap.org/search?q=' + place + '&countrycodes=gb,ie&format=json&email=annamar@seas.upenn.edu';
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Accept', 'application/json');
    headers.append('Origin','*');
    headers.append('Access-Control-Allow-Origin','*');
    fetch(url, {method:'GET', header: headers, mode:'cors'})
    .then(response => {
        return response.json()})
    .then(json => {var coor = [json[0].lat, json[0].lon];
        return coor; })
    .then(coords => {var newGeocode = {'placename': place,
                              'coordinates': {
                                  'lat': coords[0],
                                  'lon': coords[1]}};
                                  return JSON.stringify(newGeocode).toString();})
    .then(geocode => post_new_geocode(geocode, token))
    .catch(error => console.error('There has been a problem with your fetch operation: ', error.message));
}

function post_new_geocode(data, token) {
    xhr.open('POST', '/geocodes', true);
    var auth = 'Bear ' + token;
    xhr.setRequestHeader('Authorization', auth);
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

function idTail(keys) {
    keys = idToList(keys);
    return keys[keys.length - 1];
}

function idToProjectionName(id) {
    if (!id) {
        return;
    }
    let substr = id.substr(id.lastIndexOf('_') + 1, id.length);
    var key = substr.split('-');
    for (i = 0; i < key.length; i++) {
       key[i] = key[i][0].toUpperCase() + key[i].slice(1);
    }
    key = key.join(' ');
    key = 'All ' + key;
    return key;
}

function listToId(keyList) {
    // Take a list of keys in the form `['yabbaDabba', 'doo']` and
    // convert them to id keys in the form "yabba-dabba_doo".
    var ids = keyList.map(function (i) { return toId('' + i); });
    return ids.join('_');
}

function singular(s) {
    if (s.endsWith('ies')) {
        return s.replace('ies', 'y');
    } else {
        return s.replace(/(s$)/g, '');
    }
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
    // Old naming pattern:

    // var venue = json.ephemeralRecord.shows[0].venue;
    // var date = json.ephemeralRecord.shows[0].date;
    // var title = json.ephemeralRecord.shows[0].performances[0].title;
    // var cataloger = json.ephemeralRecord.dataCataloger;
    // var elements = [date, venue, title, cataloger];
    // var tojoin = [];

    // for (var i = 0; i < elements.length; i++) {
    //     if (elements[i] !== '') {
    //         tojoin.push(elements[i]);
    //     }
    // }

    // var filename = toId(tojoin.join(' '));
    // filename = filename === '' ? 'empty-record.json' : filename + '.json';

    // Date naming pattern:

    // var today = new Date();
    // var dd = String(today.getDate()).padStart(2, '0');
    // var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    // var yyyy = today.getFullYear();
    // var hh = String(today.getHours()).padStart(2, '0');
    // var MM = String(today.getMinutes()).padStart(2, '0');
    // var ss = String(today.getSeconds()).padStart(2, '0');

    // filename = yyyy + '-' + mm + '-' + dd + '-' + hh + '-' + MM + '-' + ss;

    // Simple configurable naming pattern:
    filename = json.ephemeralRecord[EVE_CONFIG.FILENAME_FIELD];
    return filename;
}

//When user is loged in, display sign up a tag
function displayLoginOption() {
    var login = document.getElementById('login');
    var signup = document.getElementById('signup');
    var logout = document.getElementById('logout');
    if (localStorage.token === undefined) {
        signup.style.display = "none";
        logout.style.display = "none";
        login.style.display = "";
    }
    else {
        signup.style.display = "";
        logout.style.display = "";
        login.style.display = "none";
    }
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

/* On click function for map tab in header
*  Reads ids from localStorage and sends them in a POST request
*/
// document.addEventListener('DOMContentLoaded', function main() {
//     document.getElementById('mapping').onclick = () => {
//         // var ids = localStorage.getItem("responseIDs").split(',');
//         // var url = '/mapping?idList=' + ids;
//         // console.log(url);
//         // window.location.href = url;
//         window.location.href = '/mapping';
//     }
// });

// Renders the map using POST request
var renderMap = function() {
    var ids = localStorage.getItem("responseIDs").split(',');
    var xhr = new XMLHttpRequest();
    xhr.open("POST", '/createmap', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({ids}));
}

// Renders the map with projection
var renderProjectedMap = function(jsonList) {
    var objs = jsonList;
    var xhr = new XMLHttpRequest();
    xhr.open("POST", '/createprojectedmap', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({objs}));
}
