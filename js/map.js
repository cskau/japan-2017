var Map = function() {

  var styleCache = {};
  var gpxFormat = new ol.format.GPX();
  var markerVectorSource = new ol.source.Vector({});

  var defaultMarkerStyle = null;

  var typeIcons = {
    // Icons sourced from the Android emojis.
    'Mountain' : 'img/snow-capped-mountain.png',
    'National Park' : 'img/national-park.png',
    'Island' : 'img/desert-island.png',
    'Beach' : 'img/beach-with-umbrella.png',
    'Onsen' : 'img/hot-springs.png',
    'Temple' : 'img/shinto-shrine.png',
    'Shrine' : 'img/shinto-shrine.png',
    'Start' : 'img/waving-white-flag.png',
    'End' : 'img/waving-black-flag.png'
  };


  /* Public Methods */

  /** . */
  this.addMarker = function(lat, lon, name) {
    markerVectorSource.addFeature(
        new ol.Feature({
            geometry: new ol.geom.Point(
                this.fromLatLon(lat, lon)),
            name: name
          }));
  };

  /** . */
  this.loadGPX = function(url) {
    get(url, function(result) {
      markerVectorSource.addFeatures(
          gpxFormat.readFeatures(
              result,
              {
                dataProjection: 'EPSG:4326',
                featureProjection: 'EPSG:3857'
              }));
    });
  };

  /** . */
  this.setCenter = function(lat, lon, zoom) {
    this.map.getView().setCenter(this.fromLatLon(lat, lon));
    this.map.getView().setZoom(zoom);
  };

  this.fromLatLon = function(lat, lon) {
    //return ol.proj.fromLonLat([lon, lat]);
    return ol.proj.transform([lon, lat],
        'EPSG:4326',
        'EPSG:3857');
  };

  this.toLatLon = function(internalRep) {
    var lonLat = ol.proj.transform(internalRep,
        'EPSG:3857',
        'EPSG:4326');
    return [lonLat[1], lonLat[0]];
  };


  /* Private Methods */

  /**
   * HTTP GET file and call callback with result, otherwise print error
   * to console.
   */
  function get(url, callback) {
    var request = new XMLHttpRequest();
    request.open('get', url);
    request.onreadystatechange = function() {
    if (request.readyState === 4 /* done */) {
      if (request.status === 200 /* HTTP OK */) {
          callback(request.responseText);
        } else {
          console.error('Error: ' + request.status);
        }
      }
    }
    request.send(null);
  }

  function createIconStyle(src) {
    return new ol.style.Style({
      fill: new ol.style.Fill({
        color: [250, 120, 120, 1]
      }),
      stroke: new ol.style.Stroke({
        color: [250, 120, 120, 1],
        width: 2
      }),
      image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
        // The real size of the icon.
        size: [160, 160],
        scale: 0.3,
        anchor: [0.5, 1.0],
        anchorXUnits: 'fraction',
        anchorYUnits: 'fraction',
        opacity: 1.00,
        src: src
      }))
    });
  }

  /**
   * The style function returns an array of styles for the given feature and
   * resolution.
   * Return null to hide the feature.
   */
  function styleFunction(feature, resolution) {
    var level = feature.get('type');

    // if there is no level or its one we don't recognize,
    // return the default style (in an array!)
    if (!level || !typeIcons[level]) {
      return [defaultMarkerStyle];
    }

    // check the cache and create a new style for the income
    // level if its not been created before.
    if (!styleCache[level]) {
      styleCache[level] = createIconStyle(typeIcons[level]);
    }

    // at this point, the style for the current level is in the cache
    // so return it (as an array!)
    return [styleCache[level]];
  }


  /* Constructor */

  defaultMarkerStyle = createIconStyle('img/marker.png');

  var markerLayer = new ol.layer.Vector({
    source: markerVectorSource,
    style: styleFunction
  });

  this.map = new ol.Map({
    target: 'map', // TODO: this should be setable.
    layers: [
      // Base map layer.
      new ol.layer.Tile({
        source: new ol.source.OSM()
      }),
      // Marker layer.
      markerLayer
    ],
    view: new ol.View({
      center: this.fromLatLon(0, 0),
      zoom: 4
    })
  });

  return this;
};
