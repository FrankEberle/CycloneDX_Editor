import { FormControl, Stack } from '@mui/material';

import CompAccordion from './CompAccordion';
import Properties from './Properties';
import CeTextField from './CeTextField';
import CeDropdownField from './CeDropdownField';
import Manufacturer from './Manufacturer';
import Persons from './Persons';
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
              name="component.name"
              defaultValue={CycloneDX.getValue(metadata, 'component.name', '')}
              required={true}
              readOnly={readOnly}
              autoFocus={true}
            />
            <CeDropdownField
              label="Type"
              name="component.type"
              required={true}
              readOnly={readOnly}
              defaultValue={CycloneDX.getValue(metadata, 'component.type', '')}
              options={CycloneDX.getComponentTypes()}
              emptyOpt={true}
            />
            <CeTextField
              label="Version"
              name="component.version"
              defaultValue={CycloneDX.getValue(metadata, 'component.version', '')}
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
        title={"Authors"}
      >
        <Persons
          persons={metadata.authors}
          title={['Author', 'Authors']}
          noTitle={true}
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