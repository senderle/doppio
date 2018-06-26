document.addEventListener('DOMContentLoaded', function main() {

  var newlogIn = document.getElementById("newlogin-button");

  function parseJSON(json, location) {
    console.log(json);   
    console.log(typeof json["_status"]);
    if (json["_status"] === undefined) {
      // console.log(json["_items"][0]["token"]); 
      localStorage.setItem("token", json["_items"][0]["token"])
      location.href = "/home";
    }
    else {
      console.log("Error: ", json["_error"]);
      var elem = document.getElementById("flash-text");
      elem.innerHTML = "Username and password do not match!"; 
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
      localStorage.setItem("username", username);
      localStorage.setItem("password", password);
      let url = '/tokens';
      let headers = new Headers();
      headers.append('Content-Type', 'application/json');
      headers.append('X-Custom-Header', 'ProcessThisImmediately');
      var auth = 'Basic ' + btoa(username + ":" + password);
      headers.append('Authorization', auth);
      console.log(auth);
      fetch(url, {method:'GET',
          headers: headers,
          // body: JSON.stringify({'username':username, 'password':password})
       })
      .then(response => response.json())
      .then(json => parseJSON(json, location))
      .catch(error => console.error('There has been a problem with your fetch operation: ', error.message));
    }
  });
});
