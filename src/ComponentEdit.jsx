import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import React from 'react';

import * as CycloneDX from './cyclonedx';

export default function ComponentEdit({component, changeValue, focusLoss}) {
    const typeValues = CycloneDX.getComponentTypes();
    const formRef = React.useRef(null);

    function CmpTextField({label, field, value, required}) {
        const [error, setError] = React.useState(false)
        const [helperText, setHelperText] = React.useState("")
        const inputRef = React.useRef(null);
        return (
            <TextField
                inputRef={inputRef}
                id={"component_field_" + field}
                size='small'
                label={label}
                defaultValue={value}
                error={error}
                helperText={helperText}
                onBlur={(e) => {
                    if (required === true) {
                        if (e.target.value == "") {
                            inputRef.current.focus();
                            e.preventDefault();
                            setError(true);
                            setHelperText("Input required");
                            return;
                        }
                    }
                    changeValue(field, e.target.value);
                    setError(false);
                    setHelperText("");
                }}
            />
        );
    }

    function CmpDropdownField({label, field, value, options}) {
        return (
            <TextField
                id={"component_field_" + field}
                select
                label={label}
                slotProps={{
                    select: {
                        native: true,
                    },
                }}
                defaultValue={value}
                onBlur={(e) => {
                    changeValue(field, e.target.value);
                }}
            >
                { options.map((v) => (
                    <option value={v}>{v}</option>
                ))}
            </TextField>
        );
    }

    function formOnBlur(e) {
        // Check if the next focused element is outside of the form
        if (formRef.current && !formRef.current.contains(e.relatedTarget)) {
            focusLoss();
        }
    }

    if (component == null) {
        return <></>
    }

    return (
        <FormControl
            size='small'
            fullWidth
        >
            <Stack spacing={2} component="form" ref={formRef} onBlur={formOnBlur}>
                <CmpTextField label='Name' required={true} field='name' value={component.name}/>
                <CmpDropdownField label='Type' field='type' value={component.type} options={typeValues}/>
                <CmpTextField label='Version' field='version' value={component["version"]}/>
                <CmpTextField label='PURL' field='purl' value={component["purl"]}/>
                <CmpTextField label='CPE' field='cpe' value={component["cpe"]}/>
            </Stack>
        </FormControl>
    );
}