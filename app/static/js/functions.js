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

function get_document_by_id(document_id) {
    xhr.open('GET', '/api/' + [EVE_CONFIG.EVE_MAIN_COLLECTION] + '/' + document_id, false);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send();
    return xhr.responseText;
}

function post_new_document(userid, token, resource_name, data) {
    var statusAlert = document.getElementById('status-message-window');
    var rst = document.getElementById("reset-after-post");

    let url = '/api/' + resource_name;
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
                alert("An authorization error occurred. Please save the current record to a file and then login to proceed.");
            } else if (response.status == 401) {
                statusAlert.innerHTML = '<span style="color:red">Authentication Error</span>';
                localStorage.removeItem("token")
                localStorage.removeItem("_etag")
                alert("Your session has expired. Please save the current record to a file and then login to proceed.");
            } else {
                statusAlert.innerHTML = '<span style="color:red">HTTP Error: ' + response.status + '</span>';
                response.text().then(text => {
                    let msg = "An unexpected error occurred.";
                    if (text.length > 0) {
                        msg += " The server provided the following details: ";
                        msg += text;
                    }
                    alert(msg);
                });
            }
        })
        .catch(error => console.error('There has been a problem with your fetch operation: ', error.message));

}

function patch_existing_document(userid, token, resource_name, document_id, etag, data) {
    var statusAlert = document.getElementById('status-message-window');

    let url = '/api/' + resource_name + '/' + document_id;
    let headers = new Headers();
    headers.append('Authorization', 'Bear ' + token);
    headers.append('If-Match', etag);
    headers.append('Content-Type', 'application/json');
    fetch(url, { method: 'PATCH', headers: headers, body: data })
        .then(response => {
            if (response.status == 200 || response.status == 201) {
                statusAlert.innerHTML = '<span style="color:green">Record updated</span>';
            } else if (response.status == 412) {
                statusAlert.innerHTML = '<span style="color:red">Submission Error</span>';
                alert("Another user has modified this record. Please save the current record to a file and reload the page to view the most up-to-date version.");
            } else if (response.status == 403) {
                statusAlert.innerHTML = '<span style="color:red">Authentication Error</span>';
                alert("An authorization error occurred. Please save the current record to a file and then login to proceed.");
            } else if (response.status == 401) {
                statusAlert.innerHTML = '<span style="color:red">Authentication Error</span>';
                localStorage.removeItem("token")
                localStorage.removeItem("_etag")
                alert("Your session has expired. Please save the current record to file and then login to proceed.");
            } else {
                statusAlert.innerHTML = '<span style="color:red">HTTP Error: ' + response.status + '</span>';
                response.text().then(text => {
                    let msg = "An unexpected error occurred.";
                    if (text.length > 0) {
                        msg += " The server provided the following details: ";
                        msg += text;
                    }
                    alert(msg);
                });
            }
        })
        .catch(error => console.error('There has been a problem with your fetch operation: ', error.message));

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
// Functions shared among main.js, search.js, and projection.js
//

function isLeaf(obj) {
    leafTypes = ['string', 'number', 'integer', 'boolean', 'datetime'];
    return leafTypes.includes(obj.type);
}

function wrapWith(tagname, el, attribs) {
    var tag = document.createElement(tagname);
    for (var key in attribs) {
        tag.setAttribute(key, attribs[key]);
    }
    tag.appendChild(el);
    return tag;
}

function focusRendered() {
    var rendered = document.querySelectorAll('.newly-rendered');

    for (var i = 0; i < rendered.length; i++) {
        var node = rendered[i];
        if (i === 0) {
            node.focus();
        }
        node.classList.remove('newly-rendered');
    }
}

function focusTop() {
    focusRendered();

    var inputs = document.querySelectorAll('.main-form-input');
    if (inputs.length > 0) {
        inputs[0].focus();
    }
}

// Currently, leaves are always placed after higher-level
// containers unless a specific order is given. However, that
// doesn't work for some projects. We need to update this.
function formKeySortCmp(formSpec) {
    return function(a, b) {
        if (formSpec[a].hasOwnProperty('order') &&
            formSpec[b].hasOwnProperty('order')) {
            var ao = formSpec[a].order;
            var bo = formSpec[b].order;
            return ao < bo ? -1 : ao == bo ? 0 : 1;
        } else if (isLeaf(formSpec[a])) {
            if (!isLeaf(formSpec[b])) {
                return -1;
            }
        } else {
            if (isLeaf(formSpec[b])) {
                return 1;
            }
        }
        return a < b ? -1 : a == b ? 0 : 1;
    }
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

function jsonToFilename(json) {
    // Old naming pattern:

    // var venue = json[EVE_CONFIG.EVE_MAIN_COLLECTION].shows[0].venue;
    // var date = json[EVE_CONFIG.EVE_MAIN_COLLECTION].shows[0].date;
    // var title = json[EVE_CONFIG.EVE_MAIN_COLLECTION].shows[0].performances[0].title;
    // var cataloger = json[EVE_CONFIG.EVE_MAIN_COLLECTION].dataCataloger;
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
    filename = json[EVE_CONFIG.EVE_MAIN_COLLECTION][EVE_CONFIG.FILENAME_FIELD];
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