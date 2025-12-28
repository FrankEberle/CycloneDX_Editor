import * as React from 'react';
import FormControl from '@mui/material/FormControl';
import Stack from '@mui/material/Stack';
import CeTextField from './CeTextField';
import * as CycloneDX from './cyclonedx';

export default function GlobalDataEdit({bom, readOnly}) {
  return (
    <FormControl
      size='small'
      fullWidth
    >
      <Stack spacing={2}>
        <CeTextField
          name="serialNumber"
          label="Serial Number"
          readOnly={readOnly}
          defaultValue={CycloneDX.getValue(bom, "serialNumber")}
        />
        <CeTextField
          name="version"
          label="Version"
          readOnly={readOnly}
          defaultValue={CycloneDX.getValue(bom, "version")}
        />
      </Stack>
    </FormControl>
  );
}