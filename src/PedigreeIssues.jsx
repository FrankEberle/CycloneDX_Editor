import React from 'react';
import Button from '@mui/material/Button';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import { Typography } from '@mui/material';

import * as CycloneDX from './cyclonedx';
import EditTable from './EditTable';
import CeDropdownField from './CeDropdownField'
import CeTextField from './CeTextField';



function PedigreePatchEditDialog({patch, saveAction, closeAction}) {
  function formSubmit(event) {
    event.preventDefault();
    event.stopPropagation();
    const formData = new FormData(event.currentTarget);
    const data = {
      ...patch,
      ...Object.fromEntries(formData.entries()),
    };
    saveAction(data);
  }

  if (patch === undefined) {
    return <></>;
  }
  return (
    <Dialog
      open={true}
      maxWidth="lg"
      fullWidth={true}
      disableRestoreFocus
    >
    <DialogTitle>{patch["_id"] === undefined ? "New" : "Edit"} Patch</DialogTitle>
    <DialogContent>
      <form id="patch-form" onSubmit={formSubmit}>
        <Stack sx={{pt: 1}} spacing={2}>
          <CeDropdownField
            name="type"
            label="Type"
            required={true}
            defaultValue={CycloneDX.getValue(patch, "type", "")}
            emptyOpt={true}
            options={CycloneDX.getPatchTypes()}
          />
          <CeTextField
            name="diff.url"
            label="Diff URL"
            defaultValue={CycloneDX.getValue(patch, "diff.patch")}
          />
          
        </Stack>
      </form>
    </DialogContent>
     <DialogActions>
          <Button
            type="submit"
            form="patch-form"
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


export default function PedigreeIssues({patch, readOnly}) {
  const [edit, setEdit] = React.useState(undefined);
  const [issueList, setIssueList] = React.useState([]);

  React.useEffect(() => {
    setIssueList(patch.resolves);
  }, [patch]);

  console.log("Patch %o", patch);

  return (
    <>
      <PedigreePatchEditDialog
        patch={edit}
        saveAction={(hash) => {
          if (hash["_id"] === undefined) {
            patches.push(CycloneDX.prepareHash(hash));
          } else {
            CycloneDX.replaceArrayElem(patches, hash);
          }
          setEdit(undefined);
          setPatchList([...patches]);
        }}
        closeAction={() => {setEdit(undefined)}}
      />
      <EditTable
        title={['Issue', 'Issues']}
        readOnly={readOnly}
        items={issueList}
        addAction={() => {setEdit({})}}
        editAction={(ref) => {setEdit(ref)}}
        deleteAction={(idx) => {
          patches.splice(idx, 1);
          setPatchList([...patches]);
        }}
        colSpec={
          [
            {
              label: 'ID',
              getter: 'id',
              maxWidth: 200,
            },
            {
              label: 'Type',
              getter: 'type',
            }
          ]
        }
      />
    </>
  )
}