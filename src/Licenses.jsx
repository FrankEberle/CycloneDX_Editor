import React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Collapse from '@mui/material/Collapse';

import * as CycloneDX from './cyclonedx';
import Properties from './Properties';
import EditTable from './EditTable';


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
        ...license.license,
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
              variant="standard"
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

export default function Licenses({licenses, noTitle, readOnly}) {
  const [licensesList, setLicensesList] = React.useState([]);
  const [editLic, setEditLic] = React.useState(undefined);

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
      CycloneDX.replaceArrayElem(licenses, data);
    }
    setLicensesList([...licenses]);
  }

  return (
    <>
      <LicenseEditDialog
        id="license"
        license={editLic}
        saveAction={save}
        closeAction={closeDialog}
      />
      <EditTable
        title={['License', 'Licenses']}
        noTitle={noTitle}
        readOnly={readOnly}
        colSpec={
          [
            {
              label: "ID / Name",
              getter: (license) => {
                if (license.license["name"] !== undefined && license.license.name != "")
                  return license.license.name;
                else
                  return license.license.id
              },
              maxWidth: 200
            },
            {
              label: "URL",
              getter: (license) => {return license.license["url"]},
            },
          ]
        }
        items={licensesList}
        deleteAction={(idx) => {
          licenses.splice(idx, 1);
          setLicensesList([...licenses]);
        }}
        addAction={() => {setEditLic({license: {}})}}
        editAction={(license) => {setEditLic(license)}}
      />    
    </>
  );
}
