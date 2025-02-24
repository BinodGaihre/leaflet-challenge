// Create the 'basemap' tile layer that will be the background of our map.
function createMap(earthquake,tectData){
  let baseMapLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });
// OPTIONAL: Step 2
// Create the 'street' tile layer as a second background of the map
  let streetLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
  attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });

// Create the map object with center and zoom options.
  let myMap = L.map("map", {
    center: [
      39.74, -104.99
    ],
    zoom: 3
  });

// Then add the 'basemap' tile layer to the map.
// baseMapLayer.addTo(myMap);
// OPTIONAL: Step 2
// Create the layer groups, base maps, and overlays for our two sets of data, earthquakes and tectonic_plates.
// Add a control to the map that will allow the user to change which layers are visible.
  let baseMaps = {
    "Street Map":baseMapLayer,
    "Topographical Map": streetLayer
  };
  let overlayMaps = {
    Earthquakes: earthquake,
    Tectonic_Plates : tectData
  };
  L.control.layers(baseMaps,overlayMaps,{collapsed: false}).addTo(myMap);
  // Create a legend control object.
  let legend = L.control({
    position: "bottomright"
  });

  // Then add all the details for the legend
  legend.onAdd = function () {
    let div = L.DomUtil.create("div");

    // Initialize depth intervals and colors for the legend
    let limits = [-10, 10, 30, 50, 70, 90];
    let colors = ['#ffffb2', '#fed976', '#feb24c', '#fd8d3c', '#f03b20', '#bd0026'];
    let labels = [];

    // Loop through our depth intervals to generate a label with a colored square for each interval.
    limits.forEach(function(limit, index) {
      if (index<limits.length-1){
      labels.push( "<li><span style=\"background-color: " + colors[index] + "\"></span>"
        + limit + "-" +limits[index+1]+"</li>")};
    });
    labels.push("<li><span style=\"background-color: " + colors[limits.length - 1] + "\"></span>"
       + limits[limits.length - 1] + "+"+"</li>");

    div.innerHTML = "<ul>" + labels.join("") + "</ul>";

    return div;
  };

  // Finally, add the legend to the map.
  legend.addTo(myMap);
};
// Make a request that retrieves the earthquake geoJSON data.
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(function (data) {

  // This function returns the style data for each of the earthquakes we plot on
  // the map. Pass the magnitude and depth of the earthquake into two separate functions
  // to calculate the color and radius.
  function styleInfo(feature) {
    return {
      fillColor: getColor(feature.geometry.coordinates[2]),
      weight: 1,                           
      opacity: 1,                                       
      fillOpacity: 0.7,                   
      radius: getRadius(feature.properties.mag) 
  };

  }

  // This function determines the color of the marker based on the depth of the earthquake.
  function getColor(depth) {
    if (depth>=-10 && depth<= 10) {
      return '#ffffb2';
    }
    else if (depth <= 30) {
      return '#fed976';
    }
    else if (depth <= 50) {
      return '#feb24c';
    }
    else if (depth <= 70) {
      return '#fd8d3c';
    }
    else if (depth <= 90) {
      return '#f03b20';
    }
    else{
      return '#bd0026';
    }
  }

  // This function determines the radius of the earthquake marker based on its magnitude.
  function getRadius(magnitude) {
    return magnitude * 3;
  }

  // Add a GeoJSON layer to the map once the file is loaded.
  let earthquakeLayer = L.geoJson(data, {
    // Turn each feature into a circleMarker on the map.
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng);

    },
    // Set the style for each circleMarker using our styleInfo function.
    style: styleInfo,
    // Create a popup for each marker to display the magnitude and location of the earthquake after the marker has been created and styled
    onEachFeature: function (feature, layer) {
      layer.bindPopup(`<h3>Magnitude : ${feature.properties.mag}</h3><hr><p>Location : ${feature.properties.place}</p>`);
    }
  });
  
    // OPTIONAL: Step 2
  // Make a request to get our Tectonic Plate geoJSON data.
  d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json").then(function (plate_data) {
    // Save the geoJSON data, along with style information, to the tectonic_plates layer.
    let tectonicPlatesLayer = L.geoJson(plate_data,{
      color:"red",
      weight: 2,
    }
  )
  createMap(earthquakeLayer,tectonicPlatesLayer);
  });
  
});


