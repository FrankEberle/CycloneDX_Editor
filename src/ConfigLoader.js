/**
 * Copyright (C) 2026  Frank Eberle
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import * as CycloneDX from './cyclonedx';


// utils for functions defined in configuration
const utils = {
  hastProperty: (c, name) => {
    for (let p of c.properties) {
      if (p.name == name) return true;
    }
    return false;
  },

  getProperty: (c, name) => {
    for (let p of c.properties) {
      if (p.name == name) return p.value;
    }
    return undefined;
  },
}
window.CycloneDX = utils;


async function loadConfig() {
  // https://react.dev/learn/passing-data-deeply-with-context
  let config;
  try {
    const config_file = "config";
    const module = await import(/* @vite-ignore */ `./${config_file}.js`);
    config = module.default;
  }
  catch (error) {
    console.log("Failed to load configuration: %o", error);
    config = {};
  }
  if (config["componentProperties"] === undefined) {
    config["componentProperties"] = Array();
  }
  if (config["licenseProperties"] === undefined) {
    config["licenseProperties"] = Array();
  }
  if (config["metaComponentProperties"] === undefined) {
    config["metaComponentProperties"] = Array();
  }
  if (config["componentColorFunc"] === undefined) {
    config["componentColorFunc"] = () => {return undefined};
  }
  if (config["componentsTableColumns"] === undefined) {
    config.componentsTableColumns = Array();
  } else {
    const columns = Array();
    let i = -1;
    for (let col of config.componentsTableColumns) {
      i = i + 1;
      const colDef = {}
      if (col["headerName"] === undefined) {
        console.log("Config error, componentsTableColumns[%d]: 'headerName' is missing", i);
        continue;
      }
      colDef.headerName = col.headerName;
      if (col["func"] !== undefined) {
        if (col["field"] !== undefined) {
          console.log("Config warning, componentsTableColumns[%d]: 'field' and 'func' are mutual exclusive", i);
        }
        colDef.func = col.func;
        colDef.field = "_computed_func_" + String(columns.length);
      } else if (col.field !== undefined) {
        if (typeof(col.field) != "string") {
          console.log("Config error, componentsTableColumns[%d]: 'field' has invalid type'", i);
          continue;
        }
        if (col.field.includes(".")) {
          colDef.field = "_computed_" + col.field;
          colDef.func = (c) => {return CycloneDX.getValue(c, col.field)};
        } else {
          colDef.field = col.field;
        }
      } else {
        console.log("Config error, componentsTableColumns[%d]: neither 'field' nor 'func' defined", i);
        continue
      }
      columns.push(colDef);
    }
    config.componentsTableColumns = columns;
  }
  return config;
}

export {
  loadConfig,
}