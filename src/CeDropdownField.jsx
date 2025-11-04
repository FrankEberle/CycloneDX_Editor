import TextField from '@mui/material/TextField';

export default function CmpDropdownField({label, name, readOnly, defaultValue, emptyOpt, options}) {
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
            label={label}
            name={name}
            required={true}
            disabled={readOnly}
            size='small'
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
