import spdx_schema from './assets/spdx.schema.json';

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

function getExtRefTypes(version) {
  if (version === undefined || version == "1.6") {
    return [
      "vcs",
      "issue-tracker",
      "website",
      "advisories",
      "bom",
      "mailing-list",
      "social",
      "chat",
      "documentation",
      "support",
      "source-distribution",
      "distribution",
      "distribution-intake",
      "license",
      "build-meta",
      "build-system",
      "release-notes",
      "security-contact",
      "model-card",
      "log",
      "configuration",
      "evidence",
      "formulation",
      "attestation",
      "threat-model",
      "adversary-model",
      "risk-assessment",
      "vulnerability-assertion",
      "exploitability-statement",
      "pentest-report",
      "static-analysis-report",
      "dynamic-analysis-report",
      "runtime-analysis-report",
      "component-analysis-report",
      "maturity-report",
      "certification-report",
      "codified-infrastructure",
      "quality-metrics",
      "poam",
      "electronic-signature",
      "digital-signature",
      "rfc-9116",
      "other",
    ].sort();
  }
}

function getHashAlgo(version) {
  if (version === undefined || version == "1.6") {
    return [
      "MD5",
      "SHA-1",
      "SHA-256",
      "SHA-384",
      "SHA-512",
      "SHA3-256",
      "SHA3-384",
      "SHA3-512",
      "BLAKE2b-256",
      "BLAKE2b-384",
      "BLAKE2b-512",
      "BLAKE3"
    ];
  }
}


function getSpdxIDs() {
  return spdx_schema.enum;
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

function setIdIfUndefined(obj) {
  if (obj["_id"] === undefined) {
    obj["_id"] = crypto.randomUUID();
  }
  return obj;
}

function setIfUndefined(obj, key, value) {
  if (obj[key] === undefined) {
    obj[key] = value;
  }
}

function prepareProperty(p) {
  setIdIfUndefined(p);
  return p;
}

function prepareLicense(l) {
  setIdIfUndefined(l);
  if (l["license"] !== undefined) {
    setIfUndefined(l.license, "properties", Array());
    l.license.properties.forEach((p) => {prepareProperty(p)})
  }
  return l;
}

function prepareExtRef(r) {
  setIdIfUndefined(r);
  setIfUndefined(r, "hashes", Array());
  r.hashes.forEach((h) => {prepareHash(h)});
  return r;
}

function prepareHash(r) {
  setIdIfUndefined(r);
  return r;
}

function preparePerson(p) {
  setIdIfUndefined(p);
  return p;
}

function prepareComponent(c, noID) {
    if (noID !== true) {
      c["_id"] = crypto.randomUUID();
    }
    setIfUndefined(c, "properties", Array());
    c.properties.forEach((p) => {prepareProperty(p)})
    setIfUndefined(c, "licenses", Array());
    c.licenses.forEach((l) => {prepareLicense(l)})
    setIfUndefined(c, "externalReferences", Array());
    c.externalReferences.forEach((r) => {prepareExtRef(r)})
    setIfUndefined(c, "hashes", Array());
    c.hashes.forEach((h) => {prepareHash(h)});
    return c;
}

function prepareMetadata(bom) {
  setIfUndefined(bom, "metadata", {});
  let metadata = bom["metadata"];
  setIfUndefined(metadata, "component", {});
  prepareComponent(metadata.component, true);
  setIfUndefined(metadata, "properties", Array());
  metadata.properties.forEach((p) => {prepareProperty(p)})
  setIfUndefined(metadata, "authors", Array());
  metadata.authors.forEach((a) => {preparePerson(a)})
}

function prepareBom(bom) {
  bom["_modified"] = false;
  setIfUndefined(bom, "components", Array());
  prepareMetadata(bom);
  foreachComponent(bom, (c) => {
    prepareComponent(c);
    return [true, undefined];
  });
  return bom;
}

function removeEmptyFields(o) {
  for (const [key, value] of Object.entries(o)) {
    if (key == "_id") {
      delete o[key];
      continue;
    }
    // String
    if (typeof(o[key]) == "string" && value == "") {
      delete o[key];
    }
    // Object
    if (typeof(o[key]) == "object") {
      // Arry
      if (o[key].constructor.name == "Array") {
        // Invoke function for each string element
        for (let i = 0; i < o[key].length; ++i) {
          removeEmptyFields(o[key][i]);
        }
        // Remove entire array when there are no elements
        if (o[key].length == 0) {
          delete o[key];
        }
      } else {
        // Other object
        removeEmptyFields(o[key]);
        // remove object if it is empty
        if (Object.keys(o[key]).length == 0) {
          delete o[key];
        }
      }
    }
  }
  return o;
}

function cleanBom(bom) {
  delete bom._modified;
  removeEmptyFields(bom);
  return bom;
}

function deepCopy(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function replaceArrayElem(array, newElem) {
  for (let i = 0; i < array.length; ++i) {
    if (array[i]._id == newElem._id) {
      array[i] = newElem;
      break;
    }
  }
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
              "id": "FreeImage",
              "url": "https://www.frank-eberle.de/license",
              "acknowledgement": "declared",
            }
          }
        ],
        externalReferences: [
          {
            type: "vcs",
            url: "https://www.frank-eberle.de/vsc",
            hashes: [
              {
                alg: "MD5",
                content: "aMD5hash",
              }
            ]
          }
        ]
      }
    ],
  };
  prepareBom(bom);
  return bom;
}

function getValue(base, name, defaultValue) {
  let value = base;
  const parts = name.split(".");

  for (let i = 0; i < parts.length; ++i) {
    value = value[parts[i]];
    if (value === undefined) {
      return defaultValue;
    }
  }
  return value;
}

export {
  getComponentTypes,
  componentLookup,
  foreachComponent,
  prepareBom,
  prepareComponent,
  emptyBom,
  prepareProperty,
  prepareLicense,
  preparePerson,
  cleanBom,
  deepCopy,
  getSpdxIDs,
  prepareExtRef,
  getExtRefTypes,
  prepareHash,
  getHashAlgo,
  replaceArrayElem,
  getValue,
};