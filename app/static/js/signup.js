document.addEventListener('DOMContentLoaded', function main() {

  var signup = document.getElementById("signup-button");
  var elem = document.getElementById("flash-text");

  function parseJSON(json, location) {
    if (json["_status"] == "OK") {
      elem.innerHTML = ("Success!").fontcolor("#33cc33");
      location.href = "/home";
    }
    else if(json["_status"] == "ERR") {
      if (json["_error"].code == 401){
        elem.innerHTML = ("Admin username and password do not match!").fontcolor("#ff0000");
      }
      else if (json["_error"].code == 422) {
        elem.innerHTML = ("Username already exists!").fontcolor("#ff0000");
      }
    }
    else {
      elem.innerHTML = ("Error, please try later").fontcolor("#ff0000");
    }
  }

  signup.addEventListener('click', function() {
    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;
    var confirm_password = document.getElementById("confirm_password").value;
    if (username == "") {
      alert("Please enter a user name.");
      location.reload(true);
    }
    else if (password == "") {
      alert("Please enter a password.");
      location.reload(true);
    }
    else if (confirm_password == "") {
      alert("Please confirm the password.");
    }
    else {
      if (password != confirm_password) {
        elem.innerHTML = ("Passwords don't match.").fontcolor("#ff0000");
        return;
      }
      let url = '/api/accounts';
      let headers = new Headers();
      headers.append('Content-Type', 'application/json');
      headers.append('X-Custom-Header', 'ProcessThisImmediately');
      var auth = 'Bearer ' + localStorage.token;
      headers.append('Authorization', auth);
      fetch(url, {method:'POST',
          headers: headers,
          body: JSON.stringify({'username':username, 'password':password})
       })
      .then(response => response.json())
      .then(json => parseJSON(json, location))
      .catch(error => console.error('There has been a problem with your fetch operation: ', error.message));

    }
  });
});
