document.addEventListener('DOMContentLoaded', function main() {
  var results = JSON.parse(get_ephemeral_record());
  var searchResults = document.getElementById('search-results');
  for (var i=0; i<results._items.length; i++) {
    searchResults.innerHTML = searchResults.innerHTML + "<p>" +
    '<a href="http://159.203.127.128:5000/index#' + results._items[i]._id + '">link</a>' + "<br/>" +
    JSON.stringify(results._items[i]) + "</p>";
  }
});
