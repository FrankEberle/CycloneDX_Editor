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

import * as React from 'react';
import FormControl from '@mui/material/FormControl';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Box from '@mui/material/Box';

import CeTextField from './CeTextField';
import CeDropdownField from './CeDropdownField';
import EditTable from './EditTable';
import { useFormValidate } from './hooks';
import * as CycloneDX from './cyclonedx';



function getProp(obj, name, defaultValue) {
  let result = defaultValue;
  if (obj["properties"] !== undefined) {
    for (let i = 0; i < obj["properties"].length; ++i) {
      if (obj["properties"][i]["name"] == name) {
        result = obj["properties"][i]["value"];
        break;
      }
    }
  }
  return result;
}


function TupleEditDialog({config, obj, saveAction, closeAction}) {
  const {register, validate} = useFormValidate();

  function formSubmit(event) {
    event.preventDefault();
    event.stopPropagation();
    if (validate()) {
      const data = {
        _id: obj["_id"]
      }
      const formData = new FormData(event.currentTarget);
      formData.entries().forEach(([key, value]) => {
        data[key.substring(7)] = value;
      });
      saveAction(data);
      closeAction();
    }
  }

  if (obj === undefined) {
    return <></>
  }

  return (
    <Dialog
      open={true}
      maxWidth="lg"
      fullWidth={true}
      disableRestoreFocus
    >
    <DialogTitle>{obj["_id"] === undefined ? "New" : "Edit"} {config.label[0]}</DialogTitle>
    <DialogContent>
      <Box sx={{mt: 1}}>
        <form id="tuple-form" onSubmit={formSubmit}>
          <CustomData
            register={register}
            obj={obj}
            propertiesDef={config.fields}
          />
        </form>
      </Box>
    </DialogContent>
      <DialogActions>
        <Button
          type="submit"
          form="tuple-form"
        >
          Save
        </Button>
        <Button
          onClick={() => closeAction()}
        >
            Cancel
        </Button>
      </DialogActions>
    </Dialog>
  )
}


function TupleTable({config, obj, readOnly}) {
  const [tuples, setTuples] = React.useState(Array());
  const [editTuple, setEditTuple] = React.useState(undefined);

  function loadTuples() {
    const maxIdx = Math.abs(obj.properties.length / config.fields.length);
    const newTuples = Array();
    const propsDict = {};
    obj.properties.forEach((p) => {
      propsDict[p["name"]] = p["value"];
    });
    for (let i = 0; i < maxIdx; ++i) {
      const tuple = {
        _id: String(i),
      };
      let match = false;
      config.fields.forEach((f) => {
        const key = f.name + String(i + 1);
        if (propsDict[key] !== undefined) {
          tuple[f.name] = propsDict[key];
          match = true;
        }
      });
      if (match) {
        newTuples.push(tuple);
      }
    }
    setTuples(newTuples);
  }

  function deleteTupleProps() {
    // Delete all existing tuple properties
    config.fields.forEach((f) => {
      for (let i = 0; i < obj.properties.length; ++i) {
        if (obj.properties[i].name.startsWith(f.name)) {
          obj.properties.splice(i, 1);
          // https://stackoverflow.com/questions/9882284/looping-through-array-and-removing-items-without-breaking-for-loop
          i = i - 1;
        }
      }
    });
  }

  function createTupleProps() {
    for (let i = 0; i < tuples.length; i++) {
      config.fields.forEach((f) => {
        const key = f.name + String(i + 1);
        obj.properties.push(CycloneDX.prepareProperty(
          {
            "name": key,
            "value": tuples[i][f.name]
          }
        ));
      });
    }
  }

  React.useEffect(() => {
    loadTuples();
  }, [obj]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <TupleEditDialog
        config={config}
        obj={editTuple}
        closeAction={() => setEditTuple(undefined)}
        saveAction={(data) => {
          if (data["_id"] === undefined) {
            tuples.push(data);
          } else {
            CycloneDX.replaceArrayElem(tuples, data);
          }
          deleteTupleProps();
          createTupleProps();
          loadTuples();
        }}
      />
      <EditTable
        title={config.label}
        noTopMargin={true}
        items={tuples}
        readOnly={readOnly}
        colSpec={config.fields.map((f) => {
          return {
            "label": f.label,
            "getter": f.name,
          }
        })}
        addAction={() => setEditTuple({})}
        editAction={(tuple) => {
          const edit = {
            _id: tuple._id,
            properties: Array()
          }
          config.fields.forEach((f) => {
            edit.properties.push({
              "name": f.name,
              "value": tuple[f.name]
            });
          })
          setEditTuple(edit);
        }}
        deleteAction={(idx) => {
          // Delete tuple from local list
          tuples.splice(idx, 1);
          // Delete tuple props from object
          deleteTupleProps();
          // Create new tuple properties from local list
          createTupleProps();
          // Reload local list
          loadTuples();
        }}
      />
    </>
  );
}


export default function CustomData({obj, subPath, propertiesDef, readOnly, register, parentRef}) {
  if ((subPath !== undefined) && (typeof(subPath) != "string")) {
    throw("Parameter subPath is invalid");
  }
  const inner = subPath === undefined ? obj : CycloneDX.getValue(obj, subPath);
  if (subPath === undefined) {
    subPath = ""
  } else {
    subPath = subPath + ".";
  }

  if (register === undefined) {
    register = () => {};
  }
  return (
    <FormControl
      size='small'
      fullWidth
    >
      <Stack spacing={2}>
        { propertiesDef.map((p) => {
          const name = "__prop_" + p.name; 
          if (p.type == "enum") {
            return (
              <CeDropdownField
                {...register(name)}
                parentRef={parentRef}
                key={p.name}
                label={p.label}
                name={subPath + "__prop_" + p.name}
                defaultValue={getProp(inner, p.name, "")}
                readOnly={readOnly}
                options={p.options}
                emptyOpt={p.emptyOpt}
                required={p.required}
              />
            );
          } else if (p.type == "text" && p["multiline"] !== true) {
            return (
              <CeTextField
                {...register(name)}
                parentRef={parentRef}
                key={p.name}
                label={p.label}
                name={subPath + "__prop_" + p.name}
                defaultValue={getProp(inner, p.name, "")}
                readOnly={readOnly}
                required={p.required}
              />
            );
          } else if (p.type == "text" && p["multiline"] === true) {
            return (
              <CeTextField
                {...register(name)}
                parentRef={parentRef}
                key={p.name}
                label={p.label}
                name={subPath + "__prop_" + p.name}
                defaultValue={getProp(inner, p.name, "")}
                readOnly={readOnly}
                required={p.required}
                rows={4}
              />
            );
          } else if (p.type == "tuple") {
            return (
              <TupleTable
                key={"tupleTable_" + p.label[0]}
                config={p}
                obj={inner}
                readOnly={readOnly}
              />
            )
          }
        })}
      </Stack>
    </FormControl>
  );
}
