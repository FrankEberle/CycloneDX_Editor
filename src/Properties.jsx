import React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';

import * as CycloneDX from './cyclonedx';
import EditTable from './EditTable';


function PropertiesEditDialog({id, prop, saveAction, closeAction}) {
  const formId = id + "-property-edit-form";

  function formSubmit(event) {
    event.preventDefault();
    event.stopPropagation();
    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData.entries());
    if (prop["_id"] !== undefined) {
      data["_id"] = prop["_id"];
    }
    saveAction(data);
    closeAction();
  }

  if (prop === undefined) {
    return <></>
  }

  return (
    <Dialog
      open={true}
      maxWidth="lg"
      fullWidth={true}
      disableRestoreFocus
    >
    <DialogTitle>{prop["_id"] === undefined ? "New" : "Edit"} Property</DialogTitle>
    <DialogContent>
      <form id={formId} onSubmit={formSubmit}>
        <Stack>
          <TextField
            label="Name"
            name="name"
            variant="standard"
            sx={{mt: 2}}
            required
            autoFocus
            defaultValue={prop.name}
          />
          <TextField
            label="Value"
            name="value"
            variant="standard"
            sx={{mt: 2}}
            defaultValue={prop.value}
          />
        </Stack>
      </form>
    </DialogContent>
     <DialogActions>
          <Button
            type="submit"
            form={formId}
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


export default function Properties({form_id, properties, readOnly}) {
  const [props, setProps] = React.useState([]);
  const [editProp, setEditProp] = React.useState(undefined);

  React.useEffect(() => {
    setProps(properties);
  }, [properties]);

  function closeDialog() {
    setEditProp(undefined);
  }

  function save(data) {
    if (data["_id"] === undefined) {
      properties.push(CycloneDX.prepareProperty(data));
    } else {
      CycloneDX.replaceArrayElem(properties, data);
    }
    setProps([...properties]);
  }

  return (
    <>
      <PropertiesEditDialog
        id={form_id}
        prop={editProp}
        saveAction={save}
        closeAction={closeDialog}
      />
      <EditTable
        title={['Property', 'Properties']}
        colSpec={
          [
            {
              label: "Name",
              getter: "name",
              maxWidth: 200,
            },
            {
              label: "Value",
              getter: "value"
            },
          ]
        }
        readOnly={readOnly}
        items={props}
        deleteAction={(idx) => {
          properties.splice(idx, 1);
          setProps([...properties]);
        }}
        addAction={() => {setEditProp({})}}
        editAction={(ref) => {setEditProp(ref)}}
      />
    </>
  );
}
