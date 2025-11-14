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
import Hashes from './Hashes';


function ReferenceEditDialog({reference, saveAction, closeAction}) {
  function formSubmit(event) {
    event.preventDefault();
    event.stopPropagation();
    const formData = new FormData(event.currentTarget);
    const data = {
      ...reference,
      ...Object.fromEntries(formData.entries()),
    };
    saveAction(data);
  }

  function getRefValue(field, defaultValue) {
    if (reference[field] === undefined) {
      return defaultValue;
    }
    return reference[field];
  }

  if (reference === undefined) {
    return <></>;
  }
  if (reference["hashes"] === undefined) {
    reference["hashes"] = Array();
  }
  return (
    <Dialog
      open={true}
      maxWidth="lg"
      fullWidth={true}
      disableRestoreFocus
    >
    <DialogTitle>{reference["_id"] === undefined ? "New" : "Edit"} External Reference</DialogTitle>
    <DialogContent>
      <form id="reference-form" onSubmit={formSubmit}>
        <Stack>
          <TextField
              select
              label="Type"
              name="type"
              variant='standard'
              autoFocus
              sx={{mt: 2}}
              slotProps={{
                  select: {
                      native: true,
                  },
              }}
              defaultValue={getRefValue("type", "")}
          >
              { CycloneDX.getExtRefTypes().map((v) => (
                  <option key={v} value={v}>{v}</option>
              ))}
          </TextField>
          <TextField
            label="URL"
            name="url"
            variant="standard"
            size='small'
            sx={{mt: 2}}
            required
            defaultValue={getRefValue("url", "")}
          />
          <TextField
            label="Comment"
            name="comment"
            variant="standard"
            multiline
            rows={5}
            sx={{mt: 2, mb: 2}}
            size='small'
            defaultValue={getRefValue("comment", "")}
          />
          <Hashes
            hashes={reference["hashes"]}
          />
        </Stack>
      </form>
    </DialogContent>
    <DialogActions>
          <Button
            type="submit"
            form="reference-form"
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

export default function ExternalReferences({references, noTitle, readOnly}) {
  const [edit, setEdit] = React.useState(undefined);
  const [refList, setRefList] = React.useState([]);

  React.useEffect(() => {
    setRefList(references);
  }, [references]);

  return (
    <>
      <ReferenceEditDialog
        reference={edit}
        saveAction={(ref) => {
          if (ref["_id"] === undefined) {
            references.push(CycloneDX.prepareExtRef(ref));
          } else {
            CycloneDX.replaceArrayElem(references, ref);
          }
          setEdit(undefined);
          setRefList([...references]);
        }}
        closeAction={() => {setEdit(undefined)}}
      />
      <EditTable
        title={['External Reference', 'External References']}
        noTitle={noTitle}
        readOnly={readOnly}
        items={refList}
        addAction={() => {setEdit({})}}
        editAction={(ref) => {setEdit(CycloneDX.deepCopy(ref))}}
        deleteAction={(idx) => {
          references.splice(idx, 1);
          setRefList([...references]);
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
              getter: 'url',
            }
          ]
        }
      />
    </>
  )
}