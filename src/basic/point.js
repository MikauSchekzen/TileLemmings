function Point() {
  this.init.apply(this, arguments);
}

Point.prototype = Object.create(PIXI.Point.prototype);
Point.prototype.constructor = Point;

Point.prototype.init = function(x, y) {
  PIXI.Point.prototype.constructor.call(this, x, y);
}

Point.prototype.clone = function() {
  return new Point(this.x, this.y);
}

Point.prototype.distanceTo = function(toPos) {
  return Math.sqrt(Math.pow(this.x - toPos.x, 2) + Math.pow(this.y - toPos.y, 2));
}

Point.prototype.rotationTo = function(toPos) {
  var delta = new Point(toPos.x - this.x, toPos.y - this.y);
  var radians = Math.atan(delta.y / delta.x);
  return radians;
}
