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
