import TextField from '@mui/material/TextField';

export default function CmpDropdownField({label, name, readOnly, defaultValue, options}) {
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
            defaultValue={defaultValue}
        >
            { options.map((v) => (
                <option key={v} value={v}>{v}</option>
            ))}
        </TextField>
    );
}
