function Loader() {}

Loader._loading = [];
Loader._textureAtlasQueue = [];
Loader.onComplete = new Signal();

Loader.loadJSON = function(key, src) {
  if(key != null) {
    if(this.isLoading("json", key) || Cache.hasJSON(key)) return null;
  }
  var xobj = new XMLHttpRequest();
  xobj.open("GET", src);
  xobj.onreadystatechange = function() {
    if(xobj.readyState === 4 && xobj.status === 200) { // Done loading
      file.onComplete.dispatch();
    }
    else if(xobj.readyState === 4 && xobj.status !== 200) { // Fail loading
      file.onFail.dispatch();
    }
  };
  xobj.send(null);

  var file = {
    key: key,
    src: src,
    type: "json",
    onComplete: new Signal(),
    onFail: new Signal(),
    dataObject: xobj,
    getData: function() { return JSON.parse(this.dataObject.responseText); }
  };
  this._loading.push(file);
  file.onComplete.addOnce(this._finishJSON, this, [file], 10);

  return file;
}

Loader.loadYAML = function(key, src) {
  if(key != null) {
    if(this.isLoading("json", key) || Cache.hasJSON(key)) return null;
  }
  let xobj = new XMLHttpRequest();
  xobj.open("GET", src);
  xobj.onreadystatechange = function() {
    if(xobj.readyState === 4 && xobj.status === 200) { // Done loading
      file.onComplete.dispatch();
    }
    else if(xobj.readyState === 4 && xobj.status !== 200) { // Fail loading
      file.onFail.dispatch();
    }
  };
  xobj.send(null);

  let file = {
    key: key,
    src: src,
    type: "json",
    onComplete: new Signal(),
    onFail: new Signal(),
    dataObject: xobj,
    getData: function() { return jsyaml.load(this.dataObject.responseText); }
  };
  this._loading.push(file);
  file.onComplete.addOnce(this._finishYAML, this, [file], 10);

  return file;
};

Loader.loadAudio = function(key, src) {
  if(key != null) {
    if(this.isLoading("audio", key) || Cache.hasAudio(key)) return null;
  }
  var file;
  var howl = new Howl({
    src: [src],
    onload: function() {
      file.onComplete.dispatch();
    }
  });

  file = {
    key: key,
    src: src,
    type: "audio",
    onComplete: new Signal(),
    onFail: new Signal(),
    dataObject: howl,
    getData: function() { return this.dataObject; }
  };
  this._loading.push(file);
  file.onComplete.addOnce(this._finishAudio, this, [file], 10);

  return file;
}

Loader.loadImage = function(key, src) {
  if(key != null) {
    if(this.isLoading("image", key) || Cache.hasImage(key)) return null;
  }
  var file;
  var loader = new PIXI.loaders.Loader();
  loader.add(key, src);
  loader.on("complete", function(loader, resources) {
    for(var a in resources) {
      if(file.key === a) {
        file.dataObject = resources[a].texture;
        file.onComplete.dispatch();
        break;
      }
    }
  });

  file = {
    key: key,
    src: src,
    type: "image",
    onComplete: new Signal(),
    onFail: new Signal(),
    dataObject: null,
    getData: function() { return this.dataObject; }
  };
  this._loading.push(file);
  file.onComplete.addOnce(this._finishImage, this, [file], 10);
  loader.load();

  return file;
}

Loader.loadTextureAtlas = function(key, src) {
  if(this.isLoading("textureAtlas", key) || Cache.hasTextureAtlas(key)) return null;
  var file;
  var loader = new PIXI.loaders.Loader();
  loader.add(key, src);
  loader.on("complete", function(loader, resources) {
    for(var a in resources) {
      if(a === file.key) file.dataObject = resources[a];
      if(a === file.key || a === file.key + "_image") {
        file.remaining--;
        if(file.remaining <= 0) file.onComplete.dispatch();
      }
    }
  });

  file = {
    key: key,
    src: src,
    type: "textureAtlas",
    onComplete: new Signal(),
    onFail: new Signal(),
    dataObject: null,
    getData: function() { return this.dataObject; },
    remaining: 2
  };
  this._loading.push(file);
  file.onComplete.addOnce(this._finishTextureAtlas, this, [file], 10);
  loader.load();

  // Add to queue
  this._textureAtlasQueue.push(file);

  return file;
};

Loader.loadScript = function(src, callback) {
  let file;
  let loader = new XMLHttpRequest();
  loader.open("GET", src);
  loader.onreadystatechange = function() {
    if(loader.readyState === 4 && loader.status === 200) {
      let contents = loader.responseText;
      eval(contents);
      if(callback != null) callback();
      file.onComplete.dispatch();
    }
  };
  loader.send(null);

  file = {
    src: src,
    type: "script",
    onComplete: new Signal(),
    dataObject: null,
    getData: function() { return this.dataObject.responseText; }
  };
  this._loading.push(file);
  file.onComplete.addOnce(this._finishScript, this, [file], 10);
  return file;
};

Loader.loadMultipleScripts = function(srcArray, callback) {
  let loadingFiles = [];
  let continueFunc = function(index) {
    if(index >= srcArray.length) return;
    let src = srcArray[index];
    loadingFiles.push(src);

    let file = Loader.loadScript(src, function() {
      loadingFiles.splice(loadingFiles.indexOf(src), 1);
      if(loadingFiles.length === 0) callback();
    });
    continueFunc(index + 1);
  };
  continueFunc(0);
};

Loader._finishJSON = function(file) {
  if(file.key != null) {
    Cache.addJSON(file.key, file.getData());
  }
  this._finishFile(file);
}

Loader._finishYAML = function(file) {
  if(file.key != null) {
    Cache.addJSON(file.key, file.getData());
  }
  this._finishFile(file);
}

Loader._finishAudio = function(file) {
  if(file.key != null) {
    Cache.addAudio(file.key, file.getData());
  }
  this._finishFile(file);
}

Loader._finishImage = function(file) {
  if(file.key != null) {
    Cache.addImage(file.key, file.getData());
  }
  this._finishFile(file);
}

Loader._finishTextureAtlas = function(file) {
  if(file.key != null) {
    Cache.addTextureAtlas(file.key, file.getData());
  }
  this._finishFile(file);
}

Loader._finishScript = function(file) {
  this._finishFile(file);
};

Loader._finishFile = function(file) {
  var a = this._loading.indexOf(file);
  if(a !== -1) Loader._loading.splice(a, 1);
  this.checkLoadCompletion();
}

Loader._startLoadingTextureAtlas = function(queueObj) {
}

Loader.checkLoadCompletion = function() {
  if(this._loading.length === 0) this.onComplete.dispatch();
}

Loader.determineKey = function(url) {
  return url;
}

Loader.isLoading = function(type, key) {
  for(let a = 0;a < this._loading.length;a++) {
    var file = this._loading[a];
    if(file.key === key && file.type === type) return true;
  }
  return false;
}
