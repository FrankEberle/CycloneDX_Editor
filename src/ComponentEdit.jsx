import React from 'react';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';

import * as CycloneDX from './cyclonedx';
import Properties from './Properties';
import Licenses from './Licenses';

export default function ComponentEdit({component, saveAction, readOnly}) {
    const typeValues = CycloneDX.getComponentTypes();

/*
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

*/

    if (readOnly === undefined) readOnly = false;
    console.log(readOnly);


    function CmpTextField({label, name, required}) {
        return (
            <TextField
                size='small'
                label={label}
                name={name}
                required={required}
                defaultValue={component[name] !== undefined ? component[name] : ""}
                slotProps={{
                    input: {
                        readOnly: readOnly,
                    },
                 }}
            />
        );
    }

    function CmpDropdownField({label, name, options}) {
        if (readOnly) {
            return (
                <TextField
                    size='small'
                    label={label}
                    name={name}
                    defaultValue={component[name] !== undefined ? component[name] : ""}
                    slotProps={{
                        input: {
                            readOnly: readOnly,
                        },
                    }}
                />
            );
        }

        return (
            <TextField
                select
                label={label}
                name={name}
                required={true}
                disabled={readOnly}
                slotProps={{
                    select: {
                        native: true,
                    },
                }}
                defaultValue={component[name] !== undefined ? component[name] : ""}
            >
                { options.map((v) => (
                    <option key={v} value={v}>{v}</option>
                ))}
            </TextField>
        );
    }

    if (component == null) {
        return <></>
    }


    return (
        <FormControl
            size='small'
            fullWidth
        >
            <Stack spacing={2}>
                <CmpTextField label='Name' name='name' required={true} />
                <CmpDropdownField label='Type' name='type' options={typeValues}/>
                <CmpTextField label='Version' name='version'/>
                <CmpTextField label='PURL' name='purl'/>
                <CmpTextField label='CPE' name='cpe'/>
                <Licenses licenses={component.licenses} readOnly={readOnly}/>
                <Properties form_id="component" properties={component.properties} readOnly={readOnly}/>
            </Stack>
        </FormControl>
    );
}