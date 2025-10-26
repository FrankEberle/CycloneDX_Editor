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
import Portal from '@mui/material/Portal';

import * as CycloneDX from './cyclonedx';
import YesNoDialog from './YesNoDialog';
import { ReadOnly } from './helper';


function PropertiesEditDialog({id, prop, saveAction, closeAction}) {
  const formId = id + "-property-edit-form";

  function formSubmit(event) {
    console.log("hallo");
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
    <Portal>
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
    </Portal>
  )
}


export default function Properties({form_id, properties, readOnly}) {
  const [props, setProps] = React.useState([]);
  const [editProp, setEditProp] = React.useState(undefined);
  const [delProp, setDelProp] = React.useState(undefined);

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
      for (let i = 0; i < properties.length; ++i) {
        if (properties[i]._id == data._id) {
          properties[i] = data;
        }
      }
    }
    setProps([...properties]);
  }

  function delProperty() {
    for (let i = 0; i < properties.length; ++i) {
      if (properties[i]["_id"] == delProp) {
        properties.splice(i, 1);
        break;
      }
    }
    setDelProp(undefined);
    setProps([...properties]);
  }

  function confirmDelProperty(id) {
    setDelProp(id);
  }

  return (
    <Box>
      <YesNoDialog 
        open={delProp !== undefined}
        title="Confirmation"
        text="Are you sure to delete the property?"
        yesAction={() => {delProperty()}}
        noAction={() => {setDelProp(undefined)}}
      />
      <PropertiesEditDialog
        id={form_id}
        prop={editProp}
        saveAction={save}
        closeAction={closeDialog}
      />
      <TableContainer component={Paper}>
        <Table size='small' sx={{tableLayout: 'fixed'}}>
          <TableHead>
            <TableRow>
              <TableCell sx={{fontWeight: 'bolder'}} colSpan={3}>Properties</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{fontWeight: 'bolder', maxWidth: 200}}>Name</TableCell>
              <TableCell sx={{fontWeight: 'bolder'}}>Value</TableCell>
              <ReadOnly readOnly={readOnly}>
                <TableCell align='right'><IconButton aria-label="Add" onClick={() => {setEditProp({name: "", value: ""})}}><AddIcon/></IconButton></TableCell>
              </ReadOnly>
            </TableRow>
          </TableHead>
          <TableBody>
          { props.map((p) => {
            return (
              <TableRow key={p._id}>
                <TableCell>{p.name}</TableCell>
                <TableCell>{p.value}</TableCell>
                <ReadOnly readOnly={readOnly}>
                  <TableCell align='right'>
                    <IconButton aria-label="Edit" onClick={() => {setEditProp(p)}}><EditIcon/></IconButton>
                    <IconButton aria-label="Delete" onClick={() => {confirmDelProperty(p._id)}}><DeleteIcon/></IconButton>
                  </TableCell>
                </ReadOnly>
              </TableRow>
            );
          })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
