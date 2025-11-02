import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';

export default function CeTextField({label, name, defaultValue, required, readOnly}) {
  readOnly = readOnly !== undefined ? readOnly : false;
  required = required !== undefined ? required : false;

  if (readOnly) {
    return (
      <TextField
          size='small'
          label={label}
          value={defaultValue}
          slotProps={{
              input: {
                  readOnly: readOnly,
              },
              inputLabel: {
                shrink: true
              }
            }}
      />
    );
  }

  return (
    <TextField
        size='small'
        label={label}
        name={name}
        required={required}
        defaultValue={defaultValue}
        slotProps={{
            input: {
                readOnly: readOnly,
            },
            inputLabel: {
              shrink: true
            }
          }}
    />
  );
}
