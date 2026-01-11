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

import React from 'react';
import TextField from '@mui/material/TextField';

export default function CeTextField({label, name, defaultValue, required, readOnly, autoFocus, ref, regex, errText, rows, maxRows, parentRef}) {
  const [isValid, setIsValid] = React.useState(true);
  const [helperText, setHelperText] = React.useState(undefined);
  const inputRef = React.useRef(null);
  readOnly = readOnly !== undefined ? readOnly : false;
  required = required !== undefined ? required : false;
  autoFocus = autoFocus !== undefined ? autoFocus : false;
  

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
          multiline={rows > 1 || maxRows > 1}
          rows={rows}
          maxRows={maxRows}
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
        multiline={rows > 1 || maxRows > 1}
        rows={rows}
        maxRows={maxRows}
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
