// globals
var canvas = document.getElementById("outside");
var ctx = canvas.getContext("2d");
var intensityPath = [1.0, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1, 0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9];
var lights = [];
var lightCount = 100;
var margin = 10;
var last = new Date();
var intervalId = 0;
var timeout = 5000;

function run() {
  //console.log("intensityPath.length: " + intensityPath.length);
  lights = [];
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (var i=0; i<lightCount; i++) {
    var light = lightModel();
    lights.push(light);
    drawLight(light);
  }
  intervalId = setInterval(updateLights, 100);
}

function lightModel() {
  var light = {
    "interval": getRandomInt(10, 1100),
    "ambientLight": 1,
    "ambientLightIntensity": function() { return 'rgba(0,0,0,' + (1-this.ambientLight) + ')' },
     "intensity": function () { return intensityPath[this.intensityPathIndex]; },
     "intensityPathIndex": getRandomInt(0, intensityPath.length - 1),
     "x": getRandomInt(margin, canvas.width - margin*2),
     "y": getRandomInt(margin, canvas.height - margin*2),
     "r": getRandomInt(0, 255),
     "g": getRandomInt(0, 255),
     "b": getRandomInt(0, 255),
     "a": function() { return (1 - this.intensity()); },
     "color": function() { return 'rgba(' + this.r + ', ' + this.g + ', ' + this.b + ', ' + this.a() + ')'; },
     "radius": getRandomInt(5, 5)
  };
  return light;
}

function drawLight(light) {
  var g = ctx.createRadialGradient(light.x, light.y, 0, light.x, light.y, light.radius);
  g.addColorStop(0, light.color());
  g.addColorStop(1, light.ambientLightIntensity());

  ctx.beginPath();
  ctx.arc(light.x, light.y, light.radius, 0, Math.PI*2, true);
  ctx.fillStyle = g;
  ctx.closePath();
  ctx.fill();
}

function updateLights() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (var i=0; i<lights.length; i++) {
    lights[i].intensityPathIndex =
        lights[i].intensityPathIndex === intensityPath.length - 1
          ? 0
          : lights[i].intensityPathIndex + 1;


    var neighbor = i - 1;
    if (neighbor < 0) { neighbor = lightCount - 1; }
    var n = lights[neighbor];
    if (lights[i].intensityPathIndex == 0) { // 'off'
      if (n.interval > lights[i].interval) {
        lights[i].interval = n.interval;
        lights[i].r = n.r;
        lights[i].g = n.g;
        lights[i].b = n.b;
        lights[i].intensityPathIndex = n.intensityPathIndex;
        console.log("changed color");
        last = new Date;
      }
    }

    drawLight(lights[i]);
  }

  var now = new Date();
  if ( (now - last) > timeout) {
   console.log("reset");
   last = now;
   clearInterval(intervalId);
   run();
  }

}

function getRandomInt(lower, upper) {
  return Math.floor(Math.random() * Math.floor(upper) + lower);
}
