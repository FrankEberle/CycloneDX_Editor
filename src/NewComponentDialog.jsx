/**
 * Copyright (C) 2026  Frank Eberle
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

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
