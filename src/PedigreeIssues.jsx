import React from 'react';
import Button from '@mui/material/Button';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';

import * as CycloneDX from './cyclonedx';
import EditTable from './EditTable';
import CeDropdownField from './CeDropdownField'
import CeTextField from './CeTextField';
import { useFormValidate } from './hooks';


function PedigreePatchEditDialog({issue, saveAction, closeAction}) {
  const {register, validate} = useFormValidate();

  function formSubmit(event) {
    event.preventDefault();
    event.stopPropagation();
    if (validate()) {
      const formData = new FormData(event.currentTarget);
      const data = {
        ...issue,
        ...Object.fromEntries(formData.entries()),
      };
      saveAction(data);
    }
  }

  if (issue === undefined) {
    return <></>;
  }
  return (
    <Dialog
      open={true}
      maxWidth="lg"
      fullWidth={true}
      disableRestoreFocus
    >
    <DialogTitle>{issue["_id"] === undefined ? "New" : "Edit"} Issue</DialogTitle>
    <DialogContent>
      <form id="patch-issue-form" onSubmit={formSubmit}>
        <Stack sx={{pt: 1}} spacing={2}>
          <CeDropdownField
            {...register()}
            name="type"
            label="Type"
            required={true}
            defaultValue={CycloneDX.getValue(issue, "type", "")}
            emptyOpt={true}
            options={CycloneDX.getPatchIssueTypes()}
          />
          <CeTextField
            name="id"
            label="ID"
            defaultValue={CycloneDX.getValue(issue, "id", "")}
          />
        </Stack>
      </form>
    </DialogContent>
     <DialogActions>
          <Button
            type="submit"
            form="patch-issue-form"
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


export default function PedigreeIssues({issues, readOnly}) {
  const [edit, setEdit] = React.useState(undefined);
  const [issueList, setIssueList] = React.useState([]);

  React.useEffect(() => {
    setIssueList(issues);
  }, [issues]);


  return (
    <>
      <PedigreePatchEditDialog
        issue={edit}
        saveAction={(issue) => {
          if (issue["_id"] === undefined) {
            issues.push(CycloneDX.preparePatchIssue(issue));
          } else {
            CycloneDX.replaceArrayElem(issues, issue);
          }
          setEdit(undefined);
          setIssueList([...issues]);
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
          issues.splice(idx, 1);
          setIssueList([...issues]);
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