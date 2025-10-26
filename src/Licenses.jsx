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
import Alert from '@mui/material/Alert';
import Collapse from '@mui/material/Collapse';

import * as CycloneDX from './cyclonedx';
import YesNoDialog from './YesNoDialog';
import Properties from './Properties';
import { ReadOnly } from './helper';


function LicenseEditDialog({license, saveAction, closeAction}) {
  const [warnText, setWarnText] = React.useState("");

  React.useEffect(() => {
    setWarnText("");
  }, [license]);
  

  function formSubmit(event) {
    console.log("debug1");
    event.preventDefault();
    event.stopPropagation();
    const formData = new FormData(event.currentTarget);
    if (formData.get("name") != "" && formData.get("id") != "-") {
      setWarnText("Name and ID are mutual exclusive.");
      return;
    }
    if (formData.get("name") == "" && formData.get("id") == "-") {
      setWarnText("Name or ID is requird.");
      return;
    }

    const data = {
      "_id": license["_id"],
      "license": {
        ...Object.fromEntries(formData.entries()),
        "properties": license.license.properties
      },
    };
    if (data.license.id == "-") {
      delete data.license.id;
    }
    saveAction(data);
    closeAction();
  }

  function getLicValue(key, defaultValue) {
    return license.license[key] === undefined ? defaultValue : license.license[key];
  }

  if (license === undefined) {
    return <></>
  }

  return (
    <Dialog
      open={true}
      maxWidth="lg"
      fullWidth={true}
      disableRestoreFocus
    >
    <DialogTitle>{license["_id"] === undefined ? "New" : "Edit"} License</DialogTitle>
    <DialogContent>
      <Collapse in={warnText != ""}>
        <Alert severity="warning" variant='outlined'>{warnText}</Alert>
      </Collapse>
      <form id="license-form" onSubmit={formSubmit}>
        <Stack>
          <TextField
            label="Name"
            name="name"
            variant="standard"
            size='small'
            sx={{mt: 2}}
            autoFocus
            defaultValue={getLicValue("name", "")}
          />
          <TextField
              select
              label="ID"
              name="id"
              sx={{mt: 2}}
              slotProps={{
                  select: {
                      native: true,
                  },
              }}
              defaultValue={getLicValue("id", "")}
          >
            <option key="-" value="-">Not selected</option>
              { CycloneDX.getSpdxIDs().map((v) => (
                  <option key={v} value={v}>{v}</option>
              ))}
          </TextField>
          <TextField
            label="URL"
            name="url"
            variant="standard"
            sx={{mt: 2, mb: 2}}
            size='small'
            defaultValue={getLicValue("url", "")}
          />
          <Properties
            form_id="license"
            properties={getLicValue("properties", Array())}
            
          />
        </Stack>
      </form>
    </DialogContent>
     <DialogActions>
          <Button
            type="submit"
            form="license-form"
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

export default function Licenses({licenses, readOnly}) {
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
      licenses.push(CycloneDX.prepareLicense(data));
    } else {
      for (let i = 0; i < licenses.length; ++i) {
        if (licenses[i]["_id"] == data["_id"]) {
          licenses[i] = data;
        }
      }
    }
    setLicensesList([...licenses]);
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
      <LicenseEditDialog
        id="license"
        license={editLic}
        saveAction={save}
        closeAction={closeDialog}
      />
      <TableContainer component={Paper}>
        <Table size='small' sx={{tableLayout: 'fixed'}}>
          <TableHead>
            <TableRow>
              <TableCell sx={{fontWeight: 'bolder'}} colSpan={3}>Licenses</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{fontWeight: 'bolder', maxWidth: 200}}>ID / Name</TableCell>
              <TableCell sx={{fontWeight: 'bolder'}}>URL</TableCell>
              <ReadOnly readOnly={readOnly}>
                <TableCell align='right'><IconButton aria-label="Add" onClick={() => {setEditLic({license: {properties: []}})}}><AddIcon/></IconButton></TableCell>
              </ReadOnly>
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
                <ReadOnly readOnly={readOnly}>
                  <TableCell align='right'>
                    <IconButton aria-label="Edit" onClick={() => {setEditLic(l)}}><EditIcon/></IconButton>
                    <IconButton aria-label="Delete" onClick={() => {setDelLic(l._id)}}><DeleteIcon/></IconButton>
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
