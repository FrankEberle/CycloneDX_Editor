import React from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';

import * as CycloneDX from './cyclonedx';
import YesNoDialog from './YesNoDialog';


function PropertiesEditDialog({id, prop, saveAction, closeAction}) {
  const formId = id + "-property-edit-form";

  function formSubmit(event) {
    event.preventDefault();
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
    <DialogTitle>{prop["_id"] === undefined ? "New" : "Edit"} License</DialogTitle>
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


export default function Licenses({licenses, changeValue}) {
  const [licensesList, setLicensesList] = React.useState([]);
  const [editLic, setEditLic] = React.useState(undefined);
  const [delLic, setDelLic] = React.useState(undefined);

  React.useEffect(() => {
    setLicensesList(licenses);
  }, [licenses]);

  function closeDialog() {
    setEditLic(undefined);
  }

  function save(data) {
    if (data["_id"] === undefined) {
      properties.push(CycloneDX.prepareProperty(data));
    } else {
      for (let i = 0; i < properties.length; ++i) {
        if (properties[i]._id == data._id) {
          properties[i] = data;
        }
      }
    }
    setProps([...properties]);
  }

  function delLicense() {
    for (let i = 0; i < licenses.length; ++i) {
      if (licenses[i]["_id"] == delLic) {
        licenses.splice(i, 1);
        break;
      }
    }
    setDelLic(undefined);
    setLicensesList([...licenses]);
    changeValue("licenses", licenses);
  }

  return (
    <Box>
      <YesNoDialog 
        open={delLic !== undefined}
        title="Confirmation"
        text="Are you sure to delete the license?"
        yesAction={() => {delLicense()}}
        noAction={() => {setDelLic(undefined)}}
      />
      <PropertiesEditDialog
        id="license"
        prop={editLic}
        saveAction={save}
        closeAction={closeDialog}
      />
      <TableContainer component={Paper}>
        <Table size='small'>
          <TableHead>
            <TableRow>
              <TableCell sx={{fontWeight: 'bolder'}} colSpan={3}>Licenses</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{fontWeight: 'bolder'}}>ID / Name</TableCell>
              <TableCell sx={{fontWeight: 'bolder'}}>URL</TableCell>
              <TableCell align='right'><IconButton aria-label="Add" onClick={() => {setEditLic({name: "", value: ""})}}><AddIcon/></IconButton></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
          { licensesList.map((l) => {
            if (l["license"] === undefined) {
              return <></>
            }
            return (
              <TableRow key={l._id}>
                <TableCell>{l.license["id"] !== undefined ? "ID: " + l.license.id : "Name: " + l.license.name}</TableCell>
                <TableCell>{l.license["url"] !== undefined ? l.license.url : ""}</TableCell>
                <TableCell align='right'>
                  <IconButton aria-label="Edit" onClick={() => {setEditLic(l)}}><EditIcon/></IconButton>
                  <IconButton aria-label="Delete" onClick={() => {setDelLic(l._id)}}><DeleteIcon/></IconButton>
                </TableCell>
              </TableRow>
            );
          })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
