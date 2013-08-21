$(function () {
  var canvas = $("<canvas width='" + 1600 +
                 "' height='" + 900 + "'></canvas>");
  $('body').append(canvas);

  // `canvas.get(0)` unwraps the jQuery'd DOM element;
  new Asteroids.Game(1600, 900, 50).start(canvas.get(0));
});
