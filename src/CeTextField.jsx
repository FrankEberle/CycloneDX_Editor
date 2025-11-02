import TextField from '@mui/material/TextField';

export default function CeTextField({label, name, defaultValue, required, readOnly}) {
  readOnly = readOnly !== undefined ? readOnly : false;
  required = required !== undefined ? required : false;

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
