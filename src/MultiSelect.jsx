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
import Box from '@mui/material/Box';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Chip from '@mui/material/Chip';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

export default function MultiSelect({name, label, selected, options, readOnly}) {
  const [sel, setSel] = React.useState([]);

  React.useEffect(() => {
    setSel(selected == "" ? Array() : selected.split(","));
  }, [selected]);

  function handleChange(event) {
    const {
      target: { value },
    } = event;
    setSel(
      // On autofill we get a stringified value.
      typeof value === 'string' ? value.split(',') : value,
    );
  };

  function lookupName(key) {
    for (let i = 0; i < options.length; ++i) {
      if (options[i].key == key) {
        return options[i].name;
      }
    }
    return undefined;
  }

  return (
    <div>
      <FormControl sx={{ m: 1, width: 300 }}>
        <InputLabel id={'multi-select-label-' + name}>{label}</InputLabel>
        <Select
          labelId={'multi-select-label-' + name}
          id={'multi-select-' + name}
          name={name}
          multiple
          readOnly={readOnly}
          value={sel}
          onChange={handleChange}
          input={<OutlinedInput id={'multi-select-' + name} label={label} />}
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selected.map((key) => (
                <Chip key={key} label={lookupName(key)} />
              ))}
            </Box>
          )}
          MenuProps={MenuProps}
        >
          {options.map((opt) => (
            <MenuItem
              key={opt.key}
              value={opt.key}
            >
              {opt.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
}