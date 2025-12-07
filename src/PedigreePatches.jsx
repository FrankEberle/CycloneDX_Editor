import React from 'react';
import Button from '@mui/material/Button';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';

import * as CycloneDX from './cyclonedx';
import EditTable from './EditTable';
import CeDropdownField from './CeDropdownField'
import CeTextField from './CeTextField';
import PedigreeIssues from './PedigreeIssues';
import { useFormValidate } from './hooks';


function PedigreePatchEditDialog({patch, saveAction, closeAction}) {
  const {register, validate} = useFormValidate();

  function formSubmit(event) {  
    event.preventDefault();
    event.stopPropagation();
    if (validate()) {
      const formData = new FormData(event.currentTarget);
      CycloneDX.formDataCopy(patch, formData);
      saveAction();
    }
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
            {...register()}
            name="type"
            label="Type"
            required={true}
            defaultValue={CycloneDX.getValue(patch, "type", "")}
            emptyOpt={true}
            options={CycloneDX.getPatchTypes()}
          />
          <CeTextField
            {...register()}
            name="diff.url"
            label="Diff URL"
            defaultValue={CycloneDX.getValue(patch, "diff.url")}
          />
          <PedigreeIssues
            patch={patch}
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


export default function PedigreePatches({patches, noTitle, readOnly}) {
  const [edit, setEdit] = React.useState(undefined);
  const [patchList, setPatchList] = React.useState([]);

  React.useEffect(() => {
    setPatchList(patches);
  }, [patches]);

  return (
    <>
      <PedigreePatchEditDialog
        patch={edit}
        saveAction={() => {
          if (edit["_id"] === undefined) {
            patches.push(CycloneDX.preparePatch(edit));
          } else {
            CycloneDX.replaceArrayElem(patches, edit);
          }
          setEdit(undefined);
          setPatchList([...patches]);
        }}
        closeAction={() => {setEdit(undefined)}}
      />
      <EditTable
        title={['Patch', 'Patches']}
        noTitle={noTitle}
        readOnly={readOnly}
        items={patchList}
        addAction={() => {setEdit(CycloneDX.preparePatch())}}
        editAction={(ref) => {setEdit(ref)}}
        deleteAction={(idx) => {
          patches.splice(idx, 1);
          setPatchList([...patches]);
        }}
        colSpec={
          [
            {
              label: 'Type',
              getter: 'type',
              maxWidth: 200,
            },
            {
              label: 'URL',
              getter: (p) => {return p.diff.url},
            }
          ]
        }
      />
    </>
  )
}