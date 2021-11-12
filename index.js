// globals
var canvas = document.getElementById("outside");
var ctx = canvas.getContext("2d");
var intensityPath = [1.0, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1, 0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9];
var lights = [];
var margin = 5;
var last = new Date();
var lightTimer = 0;

var request = new URLSearchParams(window.location.search);
var params = Object.fromEntries(request.entries());

var random = getParam('random', 'true');
var radius = getParam('radius', 5);
var lightCount = getParam('lightCount', 100);

var timeout = 5000;
var intervalGap = 40;
var intervalGapCloser = 20;
var allowMutation = false;

function getParam(paramName, defaultValue) {
  var p = params[paramName];
  if (typeof p === 'undefined') {
    p = defaultValue;
  }
  return p;
}

function run() {
  lights = [];
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (random==='true') {
    for (var i=0; i<lightCount; i++) {
      var xPos = getRandomInt(margin, canvas.width - margin*2);
      var yPos = getRandomInt(margin, canvas.height - margin*2);
      var light = lightModel(xPos, yPos, radius);
      lights.push(light);
      drawLight(light);
    }
  } else {
    var splitter = Math.sqrt(lightCount);
    var widthSpace = canvas.width/splitter;
    var heightSpace = canvas.height/splitter;
    for (var x=0; x<lightCount/splitter; x++) {
      for (var y=0; y<lightCount/splitter; y++) {
        var xPos = x*widthSpace + margin;
        var yPos = y*heightSpace + margin;
        var light = lightModel(xPos, yPos, radius);
        lights.push(light);
        drawLight(light);
      }
    }
  }
  lightTimer = setInterval(updateLights, 100);
}

function lightModel(x, y, radius) {
  var light = {
    "interval": getRandomInt(10, 1100),
    "ambientLight": 1,
    "ambientLightIntensity": function() { return 'rgba(0,0,0,' + (1-this.ambientLight) + ')' },
     "intensity": function () { return intensityPath[this.intensityPathIndex]; },
     "intensityPathIndex": getRandomInt(0, intensityPath.length - 1),
     "x": x, 
     "y": y,
     "r": getRandomInt(0, 255),
     "g": getRandomInt(0, 255),
     "b": getRandomInt(0, 255),
     "a": function() { return (1 - this.intensity()); },
     "color": function() { return 'rgba(' + this.r + ', ' + this.g + ', ' + this.b + ', ' + this.a() + ')'; },
     "radius": radius
  };
  return light;
}

function drawLight(light) {
  var g = ctx.createRadialGradient(light.x, light.y, 3, light.x, light.y, light.radius);
  g.addColorStop(0, light.color());
  g.addColorStop(1, light.ambientLightIntensity());

  ctx.beginPath();
  ctx.arc(light.x, light.y, light.radius, 0, Math.PI*2, true);
  ctx.fillStyle = g;
  ctx.closePath();
  ctx.fill();
}

function getNextIntensityPathIndex(currentIndex) {
  var idx = 
    currentIndex === intensityPath.length - 1
      ? 0
      : currentIndex + 1;

  return idx;
}

function updateLights() {

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (var i=0; i<lights.length; i++) {

    var current = lights[i];
    current.intensityPathIndex = getNextIntensityPathIndex(current.intensityPathIndex);

    var neighborIndex = i - 1;
    if (neighborIndex < 0) { neighborIndex = lightCount - 1; }
    var neighbor = lights[neighborIndex];
    
    if (current.intensity() === 1) { // 1 indicates light is 'off' because of calc that subtracts intensity
      if (neighbor.interval > current.interval) {
        if (neighbor.interval - current.interval < intervalGap) {
          current.interval = neighbor.interval;
          current.r = neighbor.r;
          current.g = neighbor.g;
          current.b = neighbor.b;
          //// Join the neighbor, but one step off so that a wave forms
          //current.intensityPathIndex = getNextIntensityPathIndex(neighbor.intensityPathIndex);
          current.intensityPathIndex = neighbor.intensityPathIndex;
          last = new Date;
        }
        else {
          current.interval += intervalGapCloser;
        }
      }
    }

    drawLight(current);
  }

  var now = new Date();
  if ( ((now - last) > timeout) && lights[0].intensity() === 1) {
   last = now;
   clearInterval(lightTimer);
   run();
  }
}

function getRandomInt(lower, upper) {
  return Math.floor(Math.random() * Math.floor(upper) + lower);
}
