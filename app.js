$(function () {
  var canvas = $("<canvas width='" + 500 +
                 "' height='" + 500 + "'></canvas>");
  $('body').append(canvas);

  // `canvas.get(0)` unwraps the jQuery'd DOM element;
  new Asteroids.Game(500, 500, 10).start(canvas.get(0));
});
