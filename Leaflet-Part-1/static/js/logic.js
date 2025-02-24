// Creating the 'basemap' tile layer that will be the background of our map.
let baseMapLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

// Creating the map object with center and zoom options.
let myMap = L.map("map", {
  center: [39.74, -104.99],
  zoom: 5
});

// adding the 'basemap' tile layer to the map.
baseMapLayer.addTo(myMap);

// Making a request that retrieves the earthquake geoJSON data.
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(function (data) {

  // function for the style to represent the data
  function styleInfo(feature) {
    return {
      fillColor: getColor(feature.geometry.coordinates[2]),
      weight: 1,                           
      opacity: 1,                                       
      fillOpacity: 0.7,                   
      radius: getRadius(feature.properties.mag) 
    };

  }

  // this function determines the color of the marker based on the depth of the earthquake.
  function getColor(depth) {
    if (depth>=-10 && depth<= 10) {
      return '#ADD8E6';
    }
    else if (depth <= 30) {
      return '#0000FF';
    }
    else if (depth <= 50) {
      return '#FFD700';
    }
    else if (depth <= 70) {
      return '#FFA500';
    }
    else if (depth <= 90) {
      return '#FF0000';
    }
    else{
      return '#8B0000';
    }
  }

  // this function determines the radius of the earthquake marker based on its magnitude.
  function getRadius(magnitude) {
    return magnitude * 3;
  }

  // Adding a GeoJSON layer to the map once the file is loaded.
  L.geoJson(data, {
    // Turning each feature into a circleMarker on the map.
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng);

    },
    // Seting the style for each circleMarker using our styleInfo function.
    style: styleInfo,
    // Creating a popup for each marker to display the magnitude and location of the earthquake after the marker has been created and styled
    onEachFeature: function (feature, layer) {
      layer.bindPopup(
        `<p>Magnitude : ${feature.properties.mag}<p>
        <p>Location : ${feature.properties.place}</p>
        <p>Depth : ${feature.geometry.coordinates[2]}</p>`);
    }
  }).addTo(myMap);

  // Creating a legend control object.
  let legend = L.control({
    position: "bottomright"
  });

  // adding all the details for the legend
  legend.onAdd = function () {
    let div = L.DomUtil.create("div");

    // Initializing depth intervals and colors for the legend
    let limits = [-10, 10, 30, 50, 70, 90];
    let colors = ['#ADD8E6', '#0000FF', '#FFD700', '#FFA500', '#FF0000', '#8B0000'];
    let labels = [];

    // Looping through our depth intervals to generate a label with a colored square for each interval.
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

  // Finally, adding the legend to the map.
  legend.addTo(myMap);
});
  


