document.addEventListener('DOMContentLoaded', function main() {

  var newlogIn = document.getElementById("newlogin-button");
  var elem = document.getElementById("flash-text");

  function parseJSON(json, location) {
    console.log(json);
    if (json["_status"] === undefined && json["_items"].length > 0) {
      var len = json["_items"].length;
      localStorage.setItem("token", json["_items"][len - 1]["token"])
      localStorage.setItem("_etag", json["_items"][len - 1]["_etag"])
      // location.href = "/home";
    }
    else {     
      elem.innerHTML = "Username and password do not match!"; 
      localStorage.removeItem("token");
    }
  }

  newlogIn.addEventListener('click', function() {
    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;
    if (username == "") {
      alert("Please enter a user name.");
      location.reload(true);
    }
    else if (password == "") {
      alert("Please enter a password");
      location.reload(true);
    }
    else {
      let url = '/tokens';
      let headers = new Headers();
      headers.append('Content-Type', 'application/json');
      headers.append('X-Custom-Header', 'ProcessThisImmediately');
      var auth = 'Basic ' + btoa(username + ":" + password);
      headers.append('Authorization', auth);
      console.log(auth);
      fetch(url, {method:'GET',
          headers: headers,
       })
      .then(response => response.json())
      .then(json => parseJSON(json, location))
      .catch(error => console.error('There has been a problem with your fetch operation: ', error.message));
    }
  });
});
