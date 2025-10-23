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
        [cnt, res] = func(base.components[i], base, i);
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

function setIfUndefined(obj, key, value) {
  if (obj[key] === undefined) {
    obj[key] = value;
  }
}

function prepareProperty(p) {
  if (p["_id"] === undefined) {
    p["_id"] = crypto.randomUUID();
  }
  return p;
}

function prepareLicense(l) {
  if (l["_id"] === undefined) {
    l["_id"] = crypto.randomUUID();
  }
  return l;
}

function prepareComponent(c) {
    c["_id"] = crypto.randomUUID();
    setIfUndefined(c, "properties", Array());
    c.properties.forEach((p) => {prepareProperty(p)})
    setIfUndefined(c, "licenses", Array());
    c.licenses.forEach((l) => {prepareLicense(l)})
    return c;
}

function prepareBom(bom) {
  bom["_modified"] = false;
  foreachComponent(bom, (c) => {
    prepareComponent(c);
    return [true, undefined];
  });
  return bom;
}

function removeEmptyFields(o) {
  for (const [key, value] of Object.entries(o)) {
    if (typeof(o[key]) == "string" && value == "") {
      delete o[key];
    }
    if (typeof(o[key]) == "object" && o[key].constructor.name == "Array" && value.length == 0) {
      delete o[key];
    }
  }
}

function cleanBom(bom) {
  delete bom._modified;
  foreachComponent(bom, (c) => {
    delete c._id;
    c.properties.forEach((p) => {delete p._id});
    c.licensed.forEach((l) => {delete l._id});
    removeEmptyFields(c);
    return [true, undefined];
  });
  removeEmptyFields(bom);
  return bom;
}

function emptyBom() {
  const bom = {
    bomFormat: "CycloneDX",
    specVersion :"1.6",
    components: [
      {
        name: "Foo",
        type: "library",
        version: "0815",
        components: [
          {
            "name": "inner",
            "type": "library",
            "components": []
          }
        ],
        properties: [
          {
            "name": "abc11",
            "value": "ABC",
          },
          {
            "name": "abc222",
            "value": "ABC"
          },
          {
            "name": "abc3",
            "value": "ABC"
          },
        ],
        licenses: [
          {
            "license": {
              "name": "foo"
            }
          },
          {
            "license": {
              "id": "bar",
              "url": "https://www.frank-eberle.de/license"
            }
          }
        ]
      }
    ],
  };
  prepareBom(bom);
  return bom;
}



export {getComponentTypes, componentLookup, foreachComponent, prepareBom, prepareComponent, emptyBom, prepareProperty, cleanBom};