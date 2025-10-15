function getComponentTypes(version) {
    if (version === undefined || version == "1.6") {
        return [
            "application",
            "framework",
            "library",
            "container",
            "platform",
            "operating-system",
            "device",
            "device-driver",
            "firmware",
            "machine-learning-model",
            "data",
            "cryptographic-asset",
        ];
    } else {
        throw Error("Unecpected CycloneDX version");
    }
}

function foreachComponent(bom, func) {
  function walk(base) {
    var cnt, res;
    if (base["components"] !== undefined) {
      for (let i = 0; i < base["components"].length; i++) {
        [cnt, res] = func(base.components[i]);
        if (cnt == false) {
          break;
        }
        [cnt, res] = walk(base.components[i])
        if (cnt == false) {
          break;
        }
      }
    }
    return [cnt, res];
  }
  const [, res] = walk(bom);
  return res;
}

function componentLookup(bom, id) {
  const res = foreachComponent(bom, (c) => {
    if (c["_id"] === id) {
      return [false, c];
    }
    return [true, undefined];
  });
  return res;
}

function prepareBom(bom) {
  bom["_modified"] = false;
  foreachComponent(bom, (c) => {
    c["_id"] = crypto.randomUUID();
    return [true, undefined];
  });
}

function emptyBom() {
  const bom = {
    components: [
      {
        name: "Foo",
        type: "library",
        version: "0815",
      }
    ],
  };
  prepareBom(bom);
  return bom;
}



export {getComponentTypes, componentLookup, foreachComponent, prepareBom, emptyBom};