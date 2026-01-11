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

export default function CeDropdownField({label, name, ref, readOnly, required, defaultValue, emptyOpt, options, parentRef}) {
    const [isValid, setIsValid] = React.useState(true);
    const [helperText, setHelperText] = React.useState(undefined);
    const inputRef = React.useRef(null);

    required = required !== undefined ? required : false;

    React.useImperativeHandle(ref, () => {
        return {
        validate: () => {
            let result = true;
            if (required && inputRef.current.value == "") {
                setHelperText("Input required");
                result = false;
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
                name={name}
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
            select
            label={label + (required ? " *" : "")}
            name={name}
            disabled={readOnly}
            inputRef={inputRef}
            size='small'
            error={!isValid}
            helperText={helperText}
            onChange={onChange}
            slotProps={{
                select: {
                    native: true,
                },
                inputLabel: {
                    shrink: true
                }
            }}
            defaultValue={defaultValue}
        >
            { emptyOpt && <option key='' value=''>-- Please select --</option>}
            { options.map((v) => (
                <option key={v} value={v}>{v}</option>
            ))}
        </TextField>
    );
}
