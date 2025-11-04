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

function getValue(obj, key, defaultValue) {
  return obj[key] === undefined ? defaultValue : obj[key];
}


function HashEditDialog({hash, saveAction, closeAction}) {
  function formSubmit(event) {
    event.preventDefault();
    event.stopPropagation();
    const formData = new FormData(event.currentTarget);
    const data = {
      ...hash,
      ...Object.fromEntries(formData.entries()),
    };
    saveAction(data);
  }

  if (hash === undefined) {
    return <></>;
  }
  return (
    <Dialog
      open={true}
      maxWidth="lg"
      fullWidth={true}
      disableRestoreFocus
    >
    <DialogTitle>{hash["_id"] === undefined ? "New" : "Edit"} Hash</DialogTitle>
    <DialogContent>
      <form id="hash-form" onSubmit={formSubmit}>
        <Stack>
          <TextField
              select
              label="Algorithm"
              name="alg"
              variant='standard'
              autoFocus
              sx={{mt: 2}}
              slotProps={{
                  select: {
                      native: true,
                  },
              }}
              defaultValue={getValue(hash, "alg", "")}
          >
              { CycloneDX.getHashAlgo().map((v) => (
                  <option key={v} value={v}>{v}</option>
              ))}
          </TextField>
          <TextField
            label="Content"
            name="content"
            variant="standard"
            size='small'
            sx={{mt: 2}}
            required
            defaultValue={getValue(hash, "content", "")}
          />
        </Stack>
      </form>
    </DialogContent>
     <DialogActions>
          <Button
            type="submit"
            form="hash-form"
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


export default function Hashes({hashes, noTitle, readOnly}) {
  const [edit, setEdit] = React.useState(undefined);
  const [hashList, setHashList] = React.useState([]);

  React.useEffect(() => {
    setHashList(hashes);
  }, [hashes]);

  return (
    <>
      <HashEditDialog
        hash={edit}
        saveAction={(hash) => {
          if (hash["_id"] === undefined) {
            hashes.push(CycloneDX.prepareHash(hash));
          } else {
            CycloneDX.replaceArrayElem(hashes, hash);
          }
          setEdit(undefined);
          setHashList([...hashes]);
        }}
        closeAction={() => {setEdit(undefined)}}
      />
      <EditTable
        title={['Hash', 'Hashes']}
        noTitle={noTitle}
        readOnly={readOnly}
        items={hashList}
        addAction={() => {setEdit({})}}
        editAction={(ref) => {setEdit(ref)}}
        deleteAction={(idx) => {
          hashes.splice(idx, 1);
          setHashList([...hashes]);
        }}
        colSpec={
          [
            {
              label: 'Algorithm',
              getter: 'alg',
              maxWidth: 200,
            },
            {
              label: 'Content',
              getter: 'content',
            }
          ]
        }
      />
    </>
  )
}