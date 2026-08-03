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


import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';

const ELEMENTS = [
  { key: 'identifier',         label: 'Identifier' },
  { key: 'manufacturer',       label: 'Manufacturer' },
  { key: 'supplier',           label: 'Supplier' },
  { key: 'licenses',           label: 'Licenses' },
  { key: 'externalReferences', label: 'External References' },
  { key: 'pedigree',           label: 'Pedigree' },
  { key: 'properties',         label: 'Properties' },
  { key: 'components',         label: 'Children' },
];

export default function ComponentPasteDialog({open, selected, okAction, closeAction}) {
  const [target, setTarget] = React.useState('top');
  const [elements, setElements] = React.useState(() => Object.fromEntries(ELEMENTS.map(({ key }) => [key, true])));

  React.useEffect(() => {
    if (selected === false) {
      setTarget('top');
    }
  }, [selected]);

  function toggleElement(f) {
    setElements((prev) => ({ ...prev, [f]: !prev[f] }));
  }

  const theme = useTheme();

  return (
    <Dialog open={open} onClose={closeAction}>
      <DialogTitle>Paste Component</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Paste component from clipboard
        </DialogContentText>
        <form style={{ marginTop: '16px' }}>
          Target&nbsp;
          <Select value={target} onChange={(e) => setTarget(e.target.value)} size="small">
            <MenuItem value="top">Top</MenuItem>
            <MenuItem value="child" disabled={!selected}>Child</MenuItem>
            <MenuItem value="into" disabled={!selected}>Into</MenuItem>
          </Select>
          <fieldset style={{ borderRadius: '4px', border: `1px solid ${theme.palette.divider}`, marginTop: '12px' }}>
            <legend>Elements</legend>
            <FormGroup sx={{ display: 'grid !important', gridTemplateColumns: '1fr 1fr' }}>
              {ELEMENTS.map(({ key, label }) => (
                <FormControlLabel key={key} label={label}
                  control={<Switch checked={elements[key]} onChange={() => toggleElement(key)} disabled={target !== 'into'} />}
                />
              ))}
            </FormGroup>
          </fieldset>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => okAction({ target, elements })} variant='contained'>OK</Button>
        <Button onClick={closeAction}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}