import React from 'react';
import TextField from '@mui/material/TextField';

export default function CeTextField({label, name, defaultValue, required, readOnly, autoFocus, ref, regex, rows}) {
  const [isValid, setIsValid] = React.useState(true);
  const inputRef = React.useRef(null);
  readOnly = readOnly !== undefined ? readOnly : false;
  required = required !== undefined ? required : false;
  autoFocus = autoFocus !== undefined ? autoFocus : false;
  rows = rows !== undefined ? rows : 1;

  React.useImperativeHandle(ref, () => {
    return {
      validate: () => {
        let result = true;
        if (regex !== undefined) {
          if ((inputRef.current.value != "") && (!regex.test(inputRef.current.value))) {
            result = false;
          }
        }
        setIsValid(result);
        return result;
      }
    };
  }, []);

  function onChange() {
    setIsValid(true);
  }

  if (readOnly) {
    return (
      <TextField
          size='small'
          label={label}
          value={defaultValue}
          multiline={rows != 0}
          rows={rows}
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
        pattern="abc.*"
        defaultValue={defaultValue}
        autoFocus={autoFocus}
        error={!isValid}
        inputRef={inputRef}
        onChange={onChange}
        multiline={rows > 1}
        rows={rows}
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
