import React from 'react';
import TextField from '@mui/material/TextField';

export default function CeTextField({label, name, defaultValue, required, readOnly, autoFocus, ref, regex, errText, rows, parentRef}) {
  const [isValid, setIsValid] = React.useState(true);
  const [helperText, setHelperText] = React.useState(undefined);
  const inputRef = React.useRef(null);
  readOnly = readOnly !== undefined ? readOnly : false;
  required = required !== undefined ? required : false;
  autoFocus = autoFocus !== undefined ? autoFocus : false;
  rows = rows !== undefined ? rows : 1;

  React.useImperativeHandle(ref, () => {
    return {
      validate: () => {
        let result = true;
        if (required && inputRef.current.value == "") {
          setHelperText("Input required");
          result = false;
        }
        if (regex !== undefined) {
          if ((inputRef.current.value != "") && (!regex.test(inputRef.current.value))) {
            setHelperText(errText);
            result = false;
          }
        }
        setIsValid(result);
        if (! result) {
          if (parentRef !== undefined) {
            parentRef.current.showFailedValidation();
          }
        }
        return result;
      }
    };
  }, []);

  function onChange() {
    setHelperText(undefined);
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
        label={label + (required ? " *" : "")}
        name={name}
        defaultValue={defaultValue}
        autoFocus={autoFocus}
        error={!isValid}
        inputRef={inputRef}
        onChange={onChange}
        multiline={rows > 1}
        rows={rows}
        helperText={helperText}
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
