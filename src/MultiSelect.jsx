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