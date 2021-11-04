// globals
var canvas = document.getElementById("outside");
var ctx = canvas.getContext("2d");
var intensityPath = [1.0, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1, 0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9];
//var fadeOutPath = [1.0, 0.8, 0.6, 0.4, 0.2, 0];
//var fadeInPath = [0.2, 0.4, 0.6, 0.8, 1.0];
var lights = [];
var lightCount = 100;
var margin = 10;
var last = new Date();
var lightTimer = 0;
var timeout = 5000;

function run() {
  lights = [];
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (var i=0; i<lightCount; i++) {
    var light = lightModel();
    lights.push(light);
    drawLight(light);
  }
  lightTimer = setInterval(updateLights, 100);
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
     "radius": getRandomInt(5, 5),
     "resetNextPass": false
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

function updateLights() {

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (var i=0; i<lights.length; i++) {

    var current = lights[i];
    current.intensityPathIndex =
        current.intensityPathIndex === intensityPath.length - 1
          ? 0
          : current.intensityPathIndex + 1;

    var neighborIndex = i - 1;
    if (neighborIndex < 0) { neighborIndex = lightCount - 1; }
    var neighbor = lights[neighborIndex];
    
    //if (current.intensityPathIndex === 1) { // switch while 'on' to reduce flicker 
    if (current.intensity() === 1) {
      if (neighbor.interval > current.interval) {
        if (neighbor.interval - current.interval < 50) {
          current.interval = neighbor.interval;
          current.r = neighbor.r;
          current.g = neighbor.g;
          current.b = neighbor.b;
          current.intensityPathIndex = neighbor.intensityPathIndex;
          last = new Date;
        }
        else {
          current.interval += 50;//Math.floor(neighbor.interval/2);// 10; //neighbor.interval;
        }
      }
    }

    drawLight(current);

  }

  var now = new Date();
  //console.log("lights[0].intensity: " + lights[0].intensity());
  if ( ((now - last) > timeout) &&  lights[0].intensity() === 1) {
  //if ( (now - last) > timeout ) {
   last = now;
   clearInterval(lightTimer);
   //console.log("ctx.globalAlpha: " + ctx.globalAlpha);
   run();
  }
}

function getRandomInt(lower, upper) {
  return Math.floor(Math.random() * Math.floor(upper) + lower);
}
