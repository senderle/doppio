//////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////
// CRUD Operations!
//

var userid = 'admin';
var key = '1357924680';
var xhr = new XMLHttpRequest();

function hmac_hash(data, key) {
  var hash = CryptoJS.HmacSHA1(data, key).toString(CryptoJS.enc.Hex);
  console.log(hash);
  return hash;
};

function get_ephemeral_record() {
  xhr.open('GET', 'http://159.203.127.128:5000/ephemeralRecord', false);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send();
  return xhr.responseText;
};


function get_accounts(userid, hash) {
  xhr.open('GET', 'http://159.203.127.128:5000/accounts', true);
  xhr.setRequestHeader('Authorization', userid + ":" + hash);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send();
};

function query_documents(userid, resource_name, query_params, data) {
  data = null;
  xhr.open('GET', 'http://159.203.127.128:5000/' + resource_name + '?' + query_params, true);
  xhr.setRequestHeader('Authorization', userid + ":" + hash);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send(data);
};

function get_document_by_id(document_id) {
  xhr.open('GET', 'http://159.203.127.128:5000/ephemeralRecord' + '/' + document_id, false);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send();
  return xhr.responseText;
};

function post_new_document(userid, hash, resource_name, data) {
  xhr.open('POST', 'http://159.203.127.128:5000/' + resource_name, true);
  xhr.setRequestHeader('Authorization', userid + ":" + hash);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send(data);
};

function patch_existing_document(userid, hash, resource_name, document_id, data) {
  xhr.open('PATCH', 'http://159.203.127.128:5000/' + resource_name + '/' + document_id, true);
  xhr.setRequestHeader('Authorization', userid + ":" + hash);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send(data);
};
