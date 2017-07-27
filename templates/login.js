document.addEventListener('DOMContentLoaded', function main() {

  var loadFile = document.getElementById("user-load");
  var logIn = document.getElementById("login-button");

  loadFile.addEventListener('change', function(evt) {
    var files = evt.target.files;
    var file = files[0];
    var reader = new FileReader();

    reader.addEventListener('load', function(evt) {
        var result = evt.target.result;
        result = result.replace(/' '+/g, '');
        result = result.replace(/(\r\n|\n|\r|\t)/gm, '');
        localStorage.setItem("key", result);
    });
    reader.readAsText(file);
  });
  logIn.addEventListener('click', function() {
    var userId = document.getElementById("user-id").value;
    if (userId == "") {
      alert("Please enter a user ID.");
      location.reload(true);
    }
    else if (loadFile.files.length == 0) {
      alert("Please select a file.");
      location.reload(true);
    }
    else {
      localStorage.setItem("userid", userId);
      location.href = "/home";
    }
  });
});
