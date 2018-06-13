document.addEventListener('DOMContentLoaded', function main() {

  var signup = document.getElementById("signup-button");

  signup.addEventListener('click', function() {
    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;
    let url = '/accounts';
    let h = new Headers();
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
      // location.href = "/newlogin";
      console.log("username is " +  localStorage.getItem("username"));
      console.log("password is " +  localStorage.getItem("password"));
      h.append('Content-Type', 'text/plain');
      h.append('X-My-Custom-Header', 'value-v');
      h.append('Authorization', 'Basic c3VwZXJ1c2VyOnBhc3N3b3Jk');
      h.append('If-Match', 'd043d7141ea190efbb8802b95a7c8ec1424a8dbc');
      // headers.append('Authorization', 'Basic ' + base64.encode(username + ":" + password));
      console.log(h);
      // location.href = "/user.html";
          // console.log("wocaonimabi " +  headers.get('Authorization'));
      fetch(url, {method:'GET',
          mode: 'no-cors',
          headers: h
          //credentials: 'user:passwd'
       })
      .then(response => response.json())
      .then(json => console.log(json));
      //.done();
    }
  });
});
