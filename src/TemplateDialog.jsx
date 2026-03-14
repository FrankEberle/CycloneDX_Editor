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
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';


export default function TemplateDialog({open, templates, okAction, cancelAction}) {
  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    okAction(formData.get("templateUrl"));
  };

  if (templates === undefined) templates = Array();
  return (
      <Dialog open={open} onClose={cancelAction}>
        <DialogTitle>Load Template</DialogTitle>
        <DialogContent sx={{minWidth: '500px'}}>
            <form onSubmit={handleSubmit} id="template_form">
              <FormControl fullWidth sx={{m: 1}}>
                <InputLabel id="select-label">Select Template</InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="select"
                  defaultValue=""
                  label="Select Template"
                  name="templateUrl"
                  required={true}
                >
                  {
                    templates.map((t) => {
                      return <MenuItem value={t.url} key={t.name}>{t.name}</MenuItem>
                    })
                  }
                </Select>
              </FormControl>
            </form>
        </DialogContent>
        <DialogActions>
          <Button type="submit" form="template_form">OK</Button>
          <Button onClick={cancelAction}>Cancel</Button>
        </DialogActions>
      </Dialog>
  );
}
