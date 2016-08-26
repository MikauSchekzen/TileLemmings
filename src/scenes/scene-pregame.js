function Scene_PreGame() {
  this.init.apply(this, arguments);
}

Scene_PreGame.TEXT_OBJECTIVE = "%l Lemmings\n%p% to be saved";

Scene_PreGame.prototype = Object.create(Scene_Base.prototype);
Scene_PreGame.prototype.constructor = Scene_PreGame;

Scene_PreGame.prototype.init = function(src) {
  Scene_Base.prototype.init.call(this);
  this._loading = true;
  if(src) {
    $gameMap = new Game_Map(src, this);
    $gameMap.onCreate.addOnce(this.start, this, [], 10);
  }
}

Scene_PreGame.prototype.start = function() {
  this._loading = false;
  // Add background
  this.background = new Background("bgMainMenu");
  this.stage.addChild(this.background);
  // Add minimap
  this.minimap = new Sprite_Minimap();
  this.minimap.z = 0;
  this.stage.addChild(this.minimap);
  this.updateMinimap();
  // Add description
  this.text = {
    mapName: new Text($gameMap.name),
    objective: new Text(Scene_PreGame.TEXT_OBJECTIVE.replace("%l", $gameMap.totalLemmings).replace("%p", Math.floor($gameMap.needed / $gameMap.totalLemmings * 100)))
  };
  this.text.mapName.position.set(100, 40);
  this.text.objective.position.set(100, 80 + this.text.mapName.height);
  for(var a in this.text) {
    this.stage.addChild(this.text[a]);
  }
  // Fade in
  this.fadeIn();
  Input.mouse.button.LEFT.onPress.add(this.startLevel, this);
}

Scene_PreGame.prototype.update = function() {
  Scene_Base.prototype.update.call(this);
  if(!this._loading) {
    this.updateMinimap();
  }
}

Scene_PreGame.prototype.continue = function() {
  Scene_Base.prototype.continue.call(this);
  Input.mouse.button.LEFT.onPress.add(this.startLevel, this);
  $gameMap.createLevel();
  this.fadeIn();
}

Scene_PreGame.prototype.updateMinimap = function() {
  this.minimap.update();
  // Reposition minimap
  var maxWidth = 360;
  this.minimap.height = (this.minimap.height / this.minimap.width) * maxWidth;
  this.minimap.width = maxWidth;
  this.minimap.position.set(Core.resolution.x - 40 - this.minimap.width, 40);
}

Scene_PreGame.prototype.startLevel = function() {
  Input.mouse.button.LEFT.onPress.remove(this.startLevel, this);
  this.fadeOut(function() {
    SceneManager.push(new Scene_Game());
  }.bind(this));
}
