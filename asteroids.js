// radius attribute for MovingObject.

var Asteroids = (function() {

	// helper method: draw prototypal inheritance
	Function.prototype.inherits = function(SuperClass) {
		function Surrogate() {};
		Surrogate.prototype = SuperClass.prototype;
		this.prototype = new Surrogate();
	}

	// MovingObject contstructor
	function MovingObject(x, y, game, dx, dy, radius) {
		this.x = x;
		this.y = y;
		this.dx = dx;
		this.dy = dy;
		this.game = game;
		this.radius = radius;
	}

	MovingObject.prototype.update = function() {
		this.x += this.dx;
		this.y += this.dy;
	}

	MovingObject.prototype.offScreen = function() {
		return this.offVertical() || this.offHorizontal();
	}

	MovingObject.prototype.offVertical = function() {
		return this.x < 0 || this.x > this.game.xDim;
	}

	MovingObject.prototype.offHorizontal= function() {
		return this.y < 0 || this.y > this.game.yDim;
	}

	MovingObject.prototype.collidesWith = function(other) {

		var xDist2 = Math.pow(this.x - other.x, 2),
		    yDist2 = Math.pow(this.y - other.y, 2);

		return (Math.sqrt(xDist2 + yDist2) < this.radius + other.radius);
	}

	// Asteroid constructor
	function Asteroid(x, y, game, dx, dy) {
		MovingObject.call(this, x, y, game, dx, dy, 10);
	}

	Asteroid.inherits(MovingObject);

	Asteroid.randomAsteroid = function(xDim, yDim, game) {
		return new Asteroid(
			xDim * Math.random(),
			yDim * Math.random(),
			game,
			(Math.random() - .5) * 5,
			(Math.random() - .5) * 5
		);
	}

	Asteroid.prototype.render = function (context) {
		console.log(context);

		context.fillStyle = "black";
		context.beginPath();

		context.arc(
			this.x,
			this.y,
			this.radius,
			0,
			2 * Math.PI,
			false
		);

		context.fill();
	}

	Asteroid.prototype.update = function() {
		MovingObject.prototype.update.call(this);

		if (this.offHorizontal()) {
			this.dy = -this.dy;
		} else if (this.offVertical()) {
			this.dx = -this.dx;
		}
	}

	// Ship constructor.
	function Ship(game) {
		MovingObject.call(this, game.xDim / 2, game.yDim / 2, game, 0.5, 0.5, 10);
		this.accel = 1.0;
		this.drag = 0.95;
		this.firing = false;
	}

	Ship.inherits(MovingObject);

	Ship.prototype.render = function (context) {
		context.fillStyle = "red";

		context.beginPath();

		context.arc(
			this.x,
			this.y,
			this.radius,
			0,
			2 * Math.PI,
			false
		);

		context.fill();
	}

	Ship.prototype.isHit = function() {
		return this.game.asteroids.some(function (asteroid) {
			return asteroid.collidesWith(this);
		}, this);
	}

	Ship.prototype.accelerate = function() {
		if (key.isPressed("up")) {
			this.dy -= this.accel;
		} else {
			this.dy = this.drag * this.dy;
		}
		if (key.isPressed("down")) {
			this.dy += this.accel;
		} else {
			this.dy = this.drag * this.dy;
		}
		if (key.isPressed("left")) {
			this.dx -= this.accel;
		} else {
			this.dx = this.drag * this.dx;
		}
		if (key.isPressed("right")) {
			this.dx += this.accel;
		} else {
			this.dx = this.drag * this.dx;
		}
	}

	Ship.prototype.speed = function() {
		var xDir2 = Math.pow(this.dx, 2),
		    yDir2 = Math.pow(this.dy, 2);

		return Math.sqrt(xDir2 + yDir2);
	}

	Ship.prototype.direction = function() {
		var speed = this.speed();
		return { x: this.dx / speed, y: this.dy / speed }
	}

	Ship.prototype.update = function() {
		this.accelerate();
		this.fire();

		MovingObject.prototype.update.call(this);

		if (this.offHorizontal()) {
			this.dy = this.y > 0 ? -Math.abs(this.dy + 2) : Math.abs(this.dy + 2);
		}
		if (this.offVertical()) {
			this.dx = this.x > 0 ? -Math.abs(this.dx + 2) : Math.abs(this.dx + 2);
		}
	}

	Ship.prototype.fire = function() {
		if (key.isPressed("space") &&
			 !this.firing &&
			  this.game.bullets.length < 60) {
			var bullet = new Bullet(this.game);
			this.game.bullets.push(bullet);
		}
		this.firing = key.isPressed("space");
	}

	function Bullet(game) {
		var x  = game.ship.x,
				y  = game.ship.y,
				dx = game.ship.direction().x * 3,
				dy = game.ship.direction().y * 3;

		MovingObject.call(this, x, y, game, dx, dy, 3);
	}

	Bullet.inherits(MovingObject);

	Bullet.prototype.render = function(context) {
		context.fillStyle = "blue";

		context.beginPath();

		context.arc(
			this.x,
			this.y,
			this.radius,
			0,
			2 * Math.PI,
			false
		);

		context.fill();
	}

	Bullet.prototype.update = function() {
		MovingObject.prototype.update.call(this);
		// If it collides with an asteroid, destroy the asteroid.
	}

	// Game constructor
  function Game(xDim, yDim, numAsteroids) {
    this.xDim = xDim;
    this.yDim = yDim;
		this.ship = new Ship(this);
		this.bullets = [];

    this.asteroids = []
    for (var i = 0; i < numAsteroids; i++) {
      this.asteroids.push(Asteroid.randomAsteroid(xDim, yDim, this));
    }
  }

	Game.prototype.start = function (canvasEl) {
		var context = canvasEl.getContext("2d");

		// ~ 30 FPS.
		var game = this;
    var interval = window.setInterval(function () {
			game.update();
      game.render(context);

			if (game.lose()) {
				alert('Game over!');
				clearInterval(interval);
			} else if (game.win()) {
				alert('You win!');
				clearInterval(interval);
			}
    }, 33);
	}

  Game.prototype.render = function (context) {
    context.clearRect(0, 0, this.xDim, this.yDim);

    for (var i = 0; i < this.asteroids.length; i++) {
      console.log(this.asteroids[i]);
      this.asteroids[i].render(context);
    }
    for (var i = 0; i < this.bullets.length; i++) {
      console.log(this.bullets[i]);
      this.bullets[i].render(context);
    }

		this.ship.render(context);
  };

	Game.prototype.update = function() {
		for (var i = 0; i < this.asteroids.length; i++) {
			var asteroid = this.asteroids[i];
			asteroid.update();
		}

		for (var i = 0; i < this.bullets.length; i++) {
			var bullet = this.bullets[i];
			bullet.update();

			if (bullet.offScreen()) {
				this.bullets.splice(i, 1);
			}

			this.asteroids.forEach(function(asteroid, index) {
				if (bullet.collidesWith(asteroid)) {
					this.asteroids.splice(index, 1);
					this.bullets.splice(i, 1);
				}
			}, this)
		}

		this.ship.update();
	}

	Game.prototype.lose = function() {
		return this.ship.isHit();
	}

	Game.prototype.win = function() {
		return this.asteroids.length == 0;
	}

	return {
		MovingObject: MovingObject,
		Asteroid: Asteroid,
		Game: Game
	}

})();

