"use strict";

// globals
window.onerror = function (errMessage) {
  alert("Error: " + errMessage);
}

var canvas = document.getElementById("outside");
canvas.onclick = function () { canvasClick(); }
var ctx = canvas.getContext("2d");
var intensityPath = getIntensityPath();
var lights = [];
var margin = 5;
var last = new Date();
var lightTimer = 0;

var request = new URLSearchParams(window.location.search);
var params = Object.fromEntries(request.entries());

var random = getParam("random", "true");
var radius = parseInt(getParam("radius", 4), 10);
var lightCount = parseInt(getParam("lightCount", 1000), 10);
var intervalGap = parseInt(getParam("intervalGap", 100), 10);
var intervalGapCloser = parseInt(getParam("intervalGapCloser", 100), 10);
var flow = getParam("flow", "false");
var timeout = 5000;

// TODO: Make different intensity path easing functions
// TODO: Make mutation (+1 on interval?  random color change?) and make it configurable //var allowMutation = false;
// TODO: Make random vs. ordered toggleable?  I.e. assign a grid position to all lights as well as a random position?

// TODO: Use onerror method to deal with browsers that don't support URLSearchParams?  I.e. declare vars outside,
//       attempt to read, onerror set values?
// TODO: In the alternative, parse using an older approach that is more-browser compatible, eg. console.log("search: " + window.location.search);

// main
function run() {

  lights = [];

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (random === "true") {
    for (var i = 0; i < lightCount; i++) {
      var xPos = getRandomInt(margin, canvas.width - margin * 2);
      var yPos = getRandomInt(margin, canvas.height - margin * 2);
      var light = lightModel(xPos, yPos, radius);
      lights.push(light);
      drawLight(light);
    }
  } else {
    var splitter = Math.sqrt(lightCount);
    var widthSpace = canvas.width / splitter;
    var heightSpace = canvas.height / splitter;
    for (var x = 0; x < lightCount / splitter; x++) {
      for (var y = 0; y < lightCount / splitter; y++) {
        var xPos = x * widthSpace + margin;
        var yPos = y * heightSpace + margin;
        var light = lightModel(xPos, yPos, radius);
        lights.push(light);
        drawLight(light);
      }
    }
  }

  lightTimer = setInterval(updateLights, 100);
}

// lights
function lightModel(x, y, radius) {
  var light = {
    "interval": getRandomInt(10, 1100),
    "ambientLight": 1,
    "ambientLightIntensity": function () { return "rgba(0,0,0," + (1 - this.ambientLight) + ")" },
    "intensity": function () { return intensityPath[this.intensityPathIndex]; },
    "intensityPathIndex": getRandomInt(0, intensityPath.length - 1),
    "x": x,
    "y": y,
    "r": getRandomInt(0, 255),
    "g": getRandomInt(0, 255),
    "b": getRandomInt(0, 255),
    "a": function () { return (1 - this.intensity()); },
    "color": function () { return "rgba(" + this.r + ", " + this.g + ", " + this.b + ", " + this.a() + ")"; },
    "radius": radius
  };
  return light;
}

function drawLight(light) {
  var g = ctx.createRadialGradient(light.x, light.y, radius / 2, light.x, light.y, light.radius);
  g.addColorStop(0, light.color());
  g.addColorStop(1, light.ambientLightIntensity());

  ctx.beginPath();
  ctx.arc(light.x, light.y, light.radius, 0, Math.PI * 2, true);
  ctx.fillStyle = g;
  ctx.closePath();
  ctx.fill();
}

function updateLights() {

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (var i = 0; i < lights.length; i++) {

    var current = lights[i];
    current.intensityPathIndex = getNextIntensityPathIndex(current.intensityPathIndex);

    var neighborIndex = i - 1;
    if (neighborIndex < 0) { neighborIndex = lightCount - 1; }
    var neighbor = lights[neighborIndex];

    if (current.intensity() === 1) { // 1 indicates light is "off" because of calc that subtracts intensity
      if (neighbor.interval > current.interval) {
        if (neighbor.interval - current.interval < intervalGap) {
          current.interval = neighbor.interval;
          current.r = neighbor.r;
          current.g = neighbor.g;
          current.b = neighbor.b;
          if (flow === "true") { // instead of taking exact neighbor index, take +1
            current.intensityPathIndex = getNextIntensityPathIndex(neighbor.intensityPathIndex);
          } else {
            current.intensityPathIndex = neighbor.intensityPathIndex;
          }
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
  if (((now - last) > timeout) && lights[0].intensity() === 1) {
    last = now;
    clearInterval(lightTimer);
    run();
  }
}

// utility functions
function getIntensityPath() {
  return [1.0, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1, 0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9];
}

function getParam(paramName, defaultValue) {
  var p = params[paramName];
  if (typeof p === "undefined") {
    p = defaultValue;
  }
  if (p === "") {
    p = defaultValue;
  }
  console.log(paramName + ": " + p + "; defaultValue: " + defaultValue);
  return p;
}

function getRandomInt(lower, upper) {
  return Math.floor(Math.random() * Math.floor(upper) + lower);
}

function getNextIntensityPathIndex(currentIndex) {
  var idx =
    currentIndex === intensityPath.length - 1
      ? 0
      : currentIndex + 1;

  return idx;
}

function canvasClick() {
  //alert('click');
  last = new Date();
  clearInterval(lightTimer);
  run();
}