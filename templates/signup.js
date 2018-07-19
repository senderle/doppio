document.addEventListener('DOMContentLoaded', function main() {

  displayLoginOption();
  var signup = document.getElementById("signup-button");
  var elem = document.getElementById("flash-text");

  function parseJSON(json, location) {
    console.log(json); 
    if (json["_status"] == "OK") {
      location.href = "/newlogin";
    }
    else if(json["_status"] == "ERR") {
      if (json["_error"].code == 401){
        elem.innerHTML = "Admin username and password do not match!";
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
    if (username == "") {
      alert("Please enter a user name.");
      location.reload(true);
    }
    else if (password == "") {
      alert("Please enter a password");
      location.reload(true);
    }
    else {
      console.log("username is " +  localStorage.getItem("username"));
      console.log("password is " +  localStorage.getItem("password"));
      let url = '/accounts';
      let headers = new Headers();
      headers.append('Content-Type', 'application/json');
      headers.append('X-Custom-Header', 'ProcessThisImmediately');
      var auth = 'Bearer ' + localStorage.token;
      headers.append('Authorization', auth);
      // headers.append('Authorization', 'Basic c3VwZXJ1c2VyOnBhc3N3b3Jk');
      // headers.append('If-Match', 'd043d7141ea190efbb8802b95a7c8ec1424a8dbc');
      // headers.append('Authorization', 'Basic ' + base64.encode(username + ":" + password));
      console.log(auth);
      fetch(url, {method:'POST',
          headers: headers,
          body: JSON.stringify({'username':username, 'password':password})
       })
      .then(response => response.json())
      .then(json => parseJSON(json, location))
      .catch(error => console.error('There has been a problem with your fetch operation: ', error.message));
      // .then(json => console.log(json))
      
    }
  });
});
