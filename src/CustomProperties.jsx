import * as React from 'react';
import FormControl from '@mui/material/FormControl';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Alert from '@mui/material/Alert';
import Collapse from '@mui/material/Collapse';
import Box from '@mui/material/Box';

import CeTextField from './CeTextField';
import CeDropdownField from './CeDropdownField';
import EditTable from './EditTable';
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
  const [warnText, setWarnText] = React.useState("");

  /*
  React.useEffect(() => {
    setWarnText("");
  }, [license]);
  */
  

  function formSubmit(event) {
    event.preventDefault();
    event.stopPropagation();
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
      <Collapse in={warnText != ""}>
        <Alert severity="warning" variant='outlined'>{warnText}</Alert>
      </Collapse>
      <Box sx={{mt: 1}}>
        <form id="tuple-form" onSubmit={formSubmit}>
          <CustomProperies
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
    console.log("propsDict %o", propsDict);
    for (let i = 0; i < maxIdx; ++i) {
      const tuple = {
        _id: String(i),
      };
      let match = false;
      config.fields.forEach((f) => {
        const key = f.name + String(i + 1);
        console.log("key %s", key);
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
  }, [obj]);

  return (
    <>
      <TupleEditDialog
        config={config}
        obj={editTuple}
        closeAction={() => setEditTuple(undefined)}
        saveAction={(data) => {
          const idx = tuples.length + 1;
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
          console.log(idx);
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


export default function CustomProperies({obj, propertiesDef, readOnly}) {

  return (
    <FormControl
      size='small'
      fullWidth
    >
      <Stack spacing={2}>
        { propertiesDef.map((p) => {
          if (p.type == "enum") {
            return (
              <CeDropdownField
                key={p.name}
                label={p.label}
                name={"__prop_" + p.name}
                defaultValue={getProp(obj, p.name, "")}
                readOnly={readOnly}
                options={p.options}
                emptyOpt={p.emptyOpt}
                required={p.required}
              />
            );
          } else if (p.type == "text" && p["multiline"] !== true) {
            return (
              <CeTextField
                key={p.name}
                label={p.label}
                name={"__prop_" + p.name}
                defaultValue={getProp(obj, p.name, "")}
                readOnly={readOnly}
                required={p.required}
              />
            );
          } else if (p.type == "text" && p["multiline"] === true) {
            return (
              <CeTextField
                key={p.name}
                label={p.label}
                name={"__prop_" + p.name}
                defaultValue={getProp(obj, p.name, "")}
                readOnly={readOnly}
                required={p.required}
                rows={4}
              />
            );
          } else if (p.type == "tuple") {
            return (
              <TupleTable
                config={p}
                obj={obj}
                readOnly={readOnly}
              />
            )
          }
        })}
      </Stack>
    </FormControl>
  );
}
