import spdx_schema from './assets/spdx.schema.json';
import jsf_0_82_schema from './assets/jsf-0.82.schema.json';
import cycloneDxSchema12 from './assets/bom-1.2.schema.json?url';
import cycloneDxSchema13 from './assets/bom-1.3.schema.json?url';
import cycloneDxSchema14 from './assets/bom-1.4.schema.json?url';
import cycloneDxSchema15 from './assets/bom-1.5.schema.json?url';
import cycloneDxSchema16 from './assets/bom-1.6.schema.json?url';
import Ajv from 'ajv';
import AjvAddFormats from 'ajv-formats';
import AvjAddFormatsDraft2019 from 'ajv-formats-draft2019';


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

function getPatchTypes(version) {
  if (version === undefined || version == "1.6") {
    return [
      "unofficial",
      "monkey",
      "backport",
      "cherry-pick",
    ];
  }
}

function getSpdxIDs() {
  return spdx_schema.enum;
}

function formatRegEx(format) {
  const regex = {
    "date-time": new RegExp(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(\.\d+)?(Z|([+-]\d{2}):(\d{2}))$/),
  }
  if (regex[format] === undefined) {
    throw Error("Unknown format");
  }
  return regex[format];
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

function preparePatchIssue(i) {
  setIdIfUndefined(i);
  return i;
}

function preparePatch(p) {
  if (p === undefined) {
    p = {}
  } else {
    setIdIfUndefined(p);
  }
  setIfUndefined(p, "diff", {url: ""});
  setIfUndefined(p, "resolves", Array());
  p.resolves.forEach((i) => {
    preparePatchIssue(i);
  });
  return p;
}

function preparePedigree(p) {
  setIfUndefined(p, "patches", Array());
  p.patches.forEach((patch) => {
    preparePatch(patch);
  });
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
    setIfUndefined(c, "pedigree", {});
    preparePedigree(c.pedigree);
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
          {
            "name": "de:frank-eberle:3rdPartyType",
            "value": "internal"
          },
          {
            "name": "de:frank-eberle:orderNumber1",
            "value": "on1"
          },
          {
            "name": "de:frank-eberle:productName1",
            "value": "pn1"
          },
          {
            "name": "de:frank-eberle:orderNumber2",
            "value": "on2"
          },
          {
            "name": "de:frank-eberle:productName2",
            "value": "pn2"
          }

        ],
        licenses: [
          {
            "license": {
              "name": "foo",
              "properties": [
                {
                  "name": "p1",
                  "value": "v1"
                },
                {
                  "name": "de:frank-eberle:selected",
                  "value": "yes"
                }
              ]
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

async function validateBom(bom) {
  const versions = {
    "1.2": cycloneDxSchema12,
    "1.3": cycloneDxSchema13,
    "1.4": cycloneDxSchema14,
    "1.5": cycloneDxSchema15,
    "1.6": cycloneDxSchema16,
  };
  const ajv = new Ajv({strict: false});
  AjvAddFormats(ajv);
  AvjAddFormatsDraft2019(ajv);
  ajv.addSchema(spdx_schema, 'spdx.schema.json');
  ajv.addSchema(jsf_0_82_schema, 'jsf-0.82.schema.json');


  if (bom["specVersion"] === undefined) {
    throw new Error("specVersion not defined in BOM.");
  }
  if (versions[bom["specVersion"]] === undefined) {
    throw new Error("Unsupported CycloneDX version.");
  }
  const req = await fetch(versions[bom["specVersion"]]);
  const cyclonedx_schema = await req.json();
  const validate = ajv.compile(cyclonedx_schema);
  if (validate(bom) === false) {
    throw new Error(ajv.errorsText(validate.errors));
  }
  return true;
}


function formDataCopy(targetObj, formData) {
    formData.entries().forEach(([key, value]) => {
        let target = targetObj;
        const keyParts = key.split(".");
        for (let i = 0; i < keyParts.length -1; i++) {
          if (target[keyParts[i]] === undefined) {
            target[keyParts[i]] = {}
          }
          target = target[keyParts[i]];
        }
        let lastKey = keyParts[keyParts.length - 1];
        if (lastKey.startsWith("__prop_")) {
          lastKey = lastKey.substring(7);
          let found = false;
          if (target["properties"] === undefined) {
            target["properties"] = Array();
          }
          for (let i = 0; i < target["properties"].length; ++i) {
            if (target["properties"][i]["name"] == lastKey) {
              target["properties"][i]["value"] = value;
              found = true;
              break;
            }
          }
          if (! found) {
            target["properties"].push(prepareProperty({
              "name": lastKey,
              "value": value
            }));
          }
        } else {
          target[lastKey] = value;
        }
    });
}


function isCustomProp(name) {
  return name.startsWith("__prop_");
}


function storeCustomProp(properties, name, value) {
  let found = false;
  name = name.substring(7)
  for (let i = 0; i < properties.length; i++) {
    if (properties[i]["name"] == name) {
      properties[i]["value"] = value;
      found = true;
      break;
    }
  }
  if (! found) {
    properties.push({
      "name": name,
      "value": value
    })
  }

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
  formatRegEx,
  validateBom,
  formDataCopy,
  isCustomProp,
  storeCustomProp,
  getPatchTypes,
  preparePatch,
};