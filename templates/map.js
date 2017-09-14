document.addEventListener('DOMContentLoaded', function main() {

    ////////////////////////////////////////////////////////////////////////////
    // create map
    var searchMap = L.map('search-map').setView([53.75, -2.75], 5.5); //[53.75, -2.75], 6

    // color map
    L.esri.basemapLayer('Streets').addTo(searchMap);

    // grayscale map -- if using this option comment out grayscale map
    /*L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy;' +
        '<a href="https://carto.com/attribution">CARTO</a>'
    }).addTo(searchMap);*/

    ////////////////////////////////////////////////////////////////////////////
    // map search results

    function addPreview(obj, target) {
        var title = jsonToFilename(obj);
        var date = obj.ephemeralRecord.shows[0].date;
        var venue = obj.ephemeralRecord.shows[0].venue;
        var place = obj.ephemeralRecord.shows[0].location;

        var br = document.createElement('br');

        var p = document.createElement('p');
        var bold = document.createElement('b');
        bold.appendChild(document.createTextNode(title));
        p.appendChild(bold);
        p.appendChild(document.createElement('br'));
        p.appendChild(document.createTextNode('Date: ' + date));
        p.appendChild(document.createElement('br'));
        p.appendChild(document.createTextNode('Venue: ' + venue));
        p.appendChild(document.createElement('br'));
        p.appendChild(document.createTextNode('Location: ' + place));
        target.appendChild(p);
    }

    function map(items) {

        // add test for if there is more than one show and more than one location
        for (var i = 0; i < items.length; i++) {

            var preview = document.getElementById('search-preview');
            addPreview(items[i], preview);

            var place = items[i].ephemeralRecord.shows[0].location;
            if (place !== undefined) { // check for no location
                if (JSON.parse(lookupGeocode(place))._items[0] == undefined) {
                    var coords = placenameToLatLon(place);
                    var newGeocode = {'placename': place,
                                      'coordinates': {
                                          'lat': coords[0],
                                          'lon': coords[1]}};
                    console.log(newGeocode);
                    post_new_geocode(JSON.stringify(newGeocode).toString());
                }

                var co = JSON.parse(lookupGeocode(place))._items[0].coordinates;
                L.circleMarker([co.lat, co.lon],{radius:4,stroke:false,fillOpacity:1}).addTo(searchMap);
            }
        }
    }

    var s = JSON.parse(sessionStorage.getItem('currentSearch'));
    if (s[0] == null) {
        console.log('There are no search results to map.');
    } else {
        for (var i = 0; i < s.length; i++) {
            var res = s[i];
            map(res._items);
        }
    }
}); // end DOM event listener
