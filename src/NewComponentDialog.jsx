import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';

import * as CycloneDX from './cyclonedx';

export default function NewComponentDialog({open, askSub, okAction, cancelAction}) {
  const handleSubmit = (event) => {
    event.preventDefault();
    okAction(new FormData(event.currentTarget));
  };

  return (
      <Dialog open={open} onClose={cancelAction}>
        <DialogTitle>New Component</DialogTitle>
        <DialogContent>
            <DialogContentText></DialogContentText>
            <form onSubmit={handleSubmit} id="new_component_form">
                <FormControlLabel control={<Switch name='subComponent' value="on" />} label="Sub-Component" labelPlacement='start'/>
                <TextField
                    autoFocus
                    required
                    margin="dense"
                    id="new_component_name"
                    name="name"
                    label="Name"
                    fullWidth
                />
                <TextField
                    select
                    required
                    margin="dense"
                    label="Type"
                    name="type"
                    fullWidth
                    slotProps={{
                        select: {
                            native: true,
                        },
                    }}
                >
                    { ["", ...CycloneDX.getComponentTypes()].map((v) => (
                        <option key={v} value={v}>{v}</option>
                    ))}
                </TextField>
            </form>
        </DialogContent>
        <DialogActions>
          <Button type="submit" form="new_component_form">Save</Button>
          <Button onClick={cancelAction}>Cancel</Button>
        </DialogActions>
      </Dialog>
  );
}
