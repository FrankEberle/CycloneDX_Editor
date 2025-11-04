import React from 'react';
import Button from '@mui/material/Button';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Collapse from '@mui/material/Collapse';
import Box from '@mui/material/Box';

import * as CycloneDX from './cyclonedx';
import EditTable from './EditTable';
import CeTextField from './CeTextField';

function PersonEditDialog({person, title, saveAction, closeAction}) {
  const [errMsg, setErrMsg] = React.useState(undefined);

  function formSubmit(event) {
    event.preventDefault();
    event.stopPropagation();
    const formData = Object.fromEntries(new FormData(event.currentTarget).entries());
    console.log(formData);
    if (formData.name == "" && formData.email == "" && formData.phone == "") {
      setErrMsg("Please fill in at least one field.");
      return;
    }
    const data = {
      ...person,
      ...formData,
    };
    saveAction(data);
  }

  React.useEffect(() => {
    setErrMsg(undefined);
  }, [person]);

  if (person === undefined) {
    return <></>;
  }
  return (
    <Dialog
      open={true}
      maxWidth="md"
      fullWidth={true}
      disableRestoreFocus
    >
    <DialogTitle>{person["_id"] === undefined ? "New" : "Edit"} {title}</DialogTitle>
    <DialogContent>

      <Collapse in={errMsg !== undefined}>

        <Alert severity="warning" onClose={() => {setErrMsg(undefined)}}>{errMsg}</Alert>
      </Collapse>

      <form id="person-form" onSubmit={formSubmit}>
        <Stack sx={{mt: 2}} spacing={2}>
          <CeTextField
            label="Name"
            name="name"
            autoFocus={true}
            defaultValue={CycloneDX.getValue(person, 'name', '')}
          />
          <CeTextField
            label="Email"
            name="email"
            defaultValue={CycloneDX.getValue(person, 'email', '')}
          />
          <CeTextField
            label="Phone"
            name="phone"
            defaultValue={CycloneDX.getValue(person, 'phone', '')}
          />
        </Stack>
      </form>
    </DialogContent>
      <DialogActions>
        <Button
          type="submit"
          form="person-form"
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
  );
}


export default function Persons({persons, title, noTitle, readOnly}) {
  const [edit, setEdit] = React.useState(undefined);
  const [personList, setPersonList] = React.useState([]);

  React.useEffect(() => {
    setPersonList(persons);
  }, [persons]);

  return (
    <>
      <PersonEditDialog
        person={edit}
        title={title[0]}
        saveAction={(person) => {
          if (person["_id"] === undefined) {
            persons.push(CycloneDX.preparePerson(person));
          } else {
            CycloneDX.replaceArrayElem(persons, person);
          }
          setEdit(undefined);
          setPersonList([...persons]);
        }}
        closeAction={() => {setEdit(undefined)}}
      />
      <EditTable
        title={title}
        noTitle={noTitle}
        readOnly={readOnly}
        items={personList}
        addAction={() => {setEdit({})}}
        editAction={(ref) => {setEdit(ref)}}
        deleteAction={(idx) => {
          persons.splice(idx, 1);
          setPersonList([...persons]);
        }}
        colSpec={
          [
            {
              label: 'Name',
              getter: 'name',
            },
            {
              label: 'Email',
              getter: 'email',
            },
            {
              label: 'Phone',
              getter: 'phone',
            }
          ]
        }
      />
    </>
  )
}