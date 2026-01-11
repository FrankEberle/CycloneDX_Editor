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


export default function Properties({form_id, properties, filter, noTitle, readOnly}) {
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
        filter={filter}
        filterCol="name"
        readOnly={readOnly}
        noTitle={noTitle}
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
