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
import ConfigContext from './ConfigContext';
import CustomProperies from './CustomProperties';


function LicenseEditDialog({license, saveAction, closeAction}) {
  const [warnText, setWarnText] = React.useState("");
  const config = React.useContext(ConfigContext);

  React.useEffect(() => {
    setWarnText("");
  }, [license]);
  

  function formSubmit(event) {
    event.preventDefault();
    event.stopPropagation();
    const formData = new FormData(event.currentTarget);
    // Only license ID or license name is allowed
    if (formData.get("name") != "" && formData.get("id") != "-") {
      setWarnText("Name and ID are mutual exclusive.");
      return;
    }
    // Either license name or license ID is required
    if (formData.get("name") == "" && formData.get("id") == "-") {
      setWarnText("Name or ID is requird.");
      return;
    }
    // Prepare result data
    const data = {
      "_id": license["_id"], // copy old internal _id
      "license": { 
        ...license.license, // copy old license object
      },
    };
    // Copy form data into result data
    formData.entries().forEach(([key, value]) => {
      // Check if form data represent custom property
      if (CycloneDX.isCustomProp(key)) {
        // Yes, store data into properties array
        CycloneDX.storeCustomProp(data.license.properties, key, value);
      } else {
        // No, copy directly into license object
        data["license"][key] = value;
      }
    });
    // No license ID selected in the ID dropdown is repesented by "-".
    // If ID contains "-" remove the entire field
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

  if (license.license["properties"] === undefined) {
    license.license["properties"] = Array();
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
          { config.licenseProperties.length > 0 &&
            <CustomProperies
              obj={license.license}
              propertiesDef={config.licenseProperties}
            />
          }
          <Properties
            form_id="license"
            filter={config.licenseProperties.map((p) => {return p.name})}
            properties={license.license.properties}
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
  const config = React.useContext(ConfigContext);

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

  const colSpec = Array(
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
  );
  config.licenseProperties.forEach((lp) => {
    if (lp["list"] === true) {
      colSpec.push({
        "label": lp.label,
        "getter": (license) => {
          const props = license.license.properties;
          for (let i = 0; i < props.length; i++) {
            if (props[i]["name"] == lp["name"]) {
              return props[i]["value"];
            }
          }
        }
      })
    }

  });

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
        colSpec={colSpec}
        items={licensesList}
        deleteAction={(idx) => {
          licenses.splice(idx, 1);
          setLicensesList([...licenses]);
        }}
        addAction={() => {setEditLic({license: {}})}}
        editAction={(license) => {setEditLic(CycloneDX.deepCopy(license))}}
      />    
    </>
  );
}
