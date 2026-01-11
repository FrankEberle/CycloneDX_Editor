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
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';


export default function SaveDialog({open, filename, saveAction, closeAction}) {
  function formSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData.entries());
    saveAction(data);
    closeAction();
  }

  if (! open) {
    return <></>
  }
  return (
    <Dialog
      open={true}
      maxWidth="md"
      fullWidth={true}
      disableRestoreFocus
    >
      <DialogTitle>Save BOM</DialogTitle>
      <DialogContent dividers>
        <form id="bom-save-dialog" onSubmit={formSubmit}>
        <Stack>
          <TextField
            label="Filename"
            name="filename"
            variant="standard"
            sx={{mt: 2}}
            required
            autoFocus
            defaultValue={filename}
          />
        </Stack>
      </form>
      </DialogContent>
      <DialogActions>
        <Button
          type="submit"
          form="bom-save-dialog"
        >
          Save
        </Button>
        <Button onClick={closeAction}>Cancel</Button>
      </DialogActions>
    </Dialog>
  )
}