import { FormControl, Stack } from '@mui/material';
import CompAccordion from './CompAccordion';
import Properties from './Properties';

import CeTextField from './CeTextField';
import Manufacturer from './Manufacturer';

export default function MetadataEdit({metadata, readonly}) {
  return (
    <Stack>
      <CompAccordion
        title={"Component"}
      >
        <FormControl
          fullWidth
        >
          <Stack spacing={2}>
            <CeTextField
              label="Name"
              name="name"
              required={true}
            />
            <CeTextField
              label="Version"
              name="version"
              required={true}
            />
          </Stack>
        </FormControl>
      </CompAccordion>      
      <CompAccordion
        title={"Miscellaneous"}
      >
        <FormControl
          fullWidth
        >
          <Stack spacing={2}>
            <CeTextField
              label="Timestamp"
              name="timestamp"
            />
          </Stack>
        </FormControl>
      </CompAccordion>

      <CompAccordion
        title={"Manufacturer"}
      >
        <Manufacturer
          component={metadata}
          objName={"manufacturer"}
        />
      </CompAccordion>
      <CompAccordion
        title={"Supplier"}
      >
        <Manufacturer
          component={metadata}
          objName={"supplier"}
        />
      </CompAccordion>
      <CompAccordion
        title={"Properties"}
      >
        <Properties
          properties={metadata.properties}
          noTitle={true}
        />
      </CompAccordion>
  </Stack>
  );
}