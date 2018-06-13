document.addEventListener('DOMContentLoaded', function main() {

  var newlogIn = document.getElementById("newlogin-button");

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
      location.href = "/home";
    }
  });
});
