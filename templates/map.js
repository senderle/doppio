document.addEventListener('DOMContentLoaded', function main() {

    var searchMap = L.map('search-map').setView([51.505, -0.09], 13);
    L.esri.basemapLayer('Streets').addTo(searchMap);
}); // end DOM event listener
