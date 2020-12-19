function run() {
  /*
    https://stackoverflow.com/questions/10396991/clearing-circular-regions-from-html5-canvas
    .arc, .clip(), .clearRect() to clear whole canvas but only clipped area will change
    (also has what may be a cool app in the comments with link to http://jsfiddle.net/HADky/, ambient lights)
  */
  var canvas = document.getElementById("outside");
  var ctx = canvas.getContext("2d");

  var lights = [];
  var lightCount = 100;

  for (var i=0; i<lightCount; i++) {
    var light = lightModel(canvas.width, canvas.height);
    lights.push(light);
    drawLight(ctx, light);
  }

  setInterval(function() { updateLights(ctx, lights, canvas); }, 300);
}

function lightModel(canvasWidth, canvasHeight) {
  var light = {
    "interval": getRandomInt(100, 1000),
    "ambientLight": 1,
    "ambientLightIntensity": function() { return 'rgba(0,0,0,' + (1-this.ambientLight) + ')' },
     "intensity": getRandomInt(0, 2),
     "x": getRandomInt(0, canvasWidth),
     "y": getRandomInt(0, canvasHeight),
     "r": getRandomInt(0, 255),
     "g": getRandomInt(0, 255),
     "b": getRandomInt(0, 255),
     "a": function() { return (1-this.intensity); },
     "color": function() { return 'rgba(' + this.r + ', ' + this.g + ', ' + this.b + ', ' + this.a() + ')'; },
     "radius": getRandomInt(5, 5)
  };
  return light;
}

function drawLight(ctx, light) {
  var g = ctx.createRadialGradient(light.x, light.y, 0, light.x, light.y, light.radius);
  g.addColorStop(0, light.color());
  g.addColorStop(1, light.ambientLightIntensity());

  ctx.beginPath();
  ctx.arc(light.x, light.y, light.radius, 0, Math.PI*2, true);
  ctx.fillStyle = g;
  ctx.closePath();
  ctx.fill();
}

function updateLights(ctx, lights, canvas) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (var i=0; i<lights.length; i++) {

    if (getRandomInt(0, 2) == 1) {
      // don't all blink at the same time
      lights[i].intensity = lights[i].intensity === 0 ? 1 : 0;
    }

    drawLight(ctx, lights[i]);
  }
}

function getRandomInt(lower, upper) {
  return Math.floor(Math.random() * Math.floor(upper) + lower);
}
