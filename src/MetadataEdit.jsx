import { FormControl, Stack } from '@mui/material';

import CompAccordion from './CompAccordion';
import Properties from './Properties';
import CeTextField from './CeTextField';
import Manufacturer from './Manufacturer';

import * as CycloneDX from './cyclonedx';

export default function MetadataEdit({metadata, readOnly}) {
  return (
    <Stack>
      <CompAccordion
        title={"Component"}
        defaultExpanded={true}
      >
        <FormControl
          fullWidth
        >
          <Stack spacing={2}>
            <CeTextField
              label="Name"
              name="name"
              defaultValue={CycloneDX.getValue(metadata, 'name', '')}
              required={true}
              readOnly={readOnly}
            />
            <CeTextField
              label="Version"
              name="version"
              defaultValue={CycloneDX.getValue(metadata, 'version', '')}
              readOnly={readOnly}
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
              readOnly={readOnly}
              defaultValue={CycloneDX.getValue(metadata, 'timestamp', '')}
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
          readOnly={readOnly}
        />
      </CompAccordion>
      <CompAccordion
        title={"Supplier"}
      >
        <Manufacturer
          component={metadata}
          objName={"supplier"}
          readOnly={readOnly}
        />
      </CompAccordion>
      <CompAccordion
        title={"Properties"}
      >
        <Properties
          properties={metadata.properties}
          noTitle={true}
          readOnly={readOnly}
        />
      </CompAccordion>
  </Stack>
  );
}