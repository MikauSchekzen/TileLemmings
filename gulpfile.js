var gulp = require("gulp");
var concat = require("gulp-concat");
var exec = require("child_process").exec;

var compile = {
  client: {
    sources: [
      "src/header.js",

      "src/shaders/color-replace.js",

      "src/basic/point.js",
      "src/basic/rect.js",
      "src/basic/signal.js",
      "src/basic/animation.js",
      "src/basic/pool.js",
      "src/basic/background.js",
      "src/basic/text.js",
      "src/basic/alarm.js",

      "src/loader/cache.js",
      "src/loader/loader.js",

      "src/core.js",

      "src/data/temp.js",

      "src/input/input.js",
      "src/input/input-key.js",
      "src/input/input-mouse.js",

      "src/managers/audiomanager.js",
      "src/managers/scenemanager.js",
      "src/managers/savemanager.js",
      "src/managers/options.js",

      "src/filters/filter-colorreplace.js",

      "src/sprites/base.js",
      "src/sprites/lemming.js",
      "src/sprites/tile.js",
      "src/sprites/minimap.js",
      "src/sprites/minimap-tile.js",
      "src/sprites/prop.js",
      "src/sprites/ui.js",
      "src/sprites/cursor.js",
      "src/sprites/background.js",

      "src/scenes/scene-base.js",
      "src/scenes/scene-boot.js",
      "src/scenes/scene-menubase.js",
      "src/scenes/scene-mainmenu.js",
      "src/scenes/scene-options.js",
      "src/scenes/scene-pregame.js",
      "src/scenes/scene-game.js",
      "src/scenes/scene-postgame.js",
      "src/scenes/scene-worldmap.js",

      "src/ui/base.js",
      "src/ui/button.js",
      "src/ui/menu-button.js",
      "src/ui/world-button.js",
      "src/ui/checkbox.js",
      "src/ui/slider.js",
      "src/ui/minimap.js",

      "src/map/map.js",
      "src/map/tileset.js",
      "src/map/tile.js",
      "src/map/world.js",
      "src/map/camera.js",

      "src/game/base.js",
      "src/game/lemming.js",
      "src/game/prop.js",

      "src/footer.js"
    ],
    target: {
      fn: "game.js",
      dir: "lib/"
    }
  }
};

function buildClient(platform, arch) {
  exec("electron-packager . tile-lemmings --overwrite --platform=" + platform + " --arch=" + arch + " --out=dist --electron-version=1.6.6 --prune" +
  "--ignore=.gitignore --ignore=Readme.md --ignore=save.json --ignore=.atom-build.json --ignore=config.json --ignore=gulpfile.json --ignore=src" +
  "--ignore=workplace", function(error, stdout, stderr) {
    if(error) console.log(error);
    else console.log("Done building for " + platform + " " + arch + "!");
  });
}

gulp.task("client", function() {
  gulp.src(compile.client.sources)
    .pipe(concat(compile.client.target.fn))
    .pipe(gulp.dest(compile.client.target.dir));
});

gulp.task("build-electron", function() {
  buildClient("linux,win32", "x64,ia32");
});

gulp.task("default", ["client"]);

gulp.task("compile", ["client", "build-electron"]);