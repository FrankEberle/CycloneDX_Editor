import React from 'react';
import { FormControl, Stack } from '@mui/material';

import CompAccordion from './CompAccordion';
import Properties from './Properties';
import CeTextField from './CeTextField';
import CeDropdownField from './CeDropdownField';
import Manufacturer from './Manufacturer';
import Persons from './Persons';
import CustomProperies from './CustomProperties';
import ConfigContext from './ConfigContext';
import MultiSelect from './MultiSelect';
import * as CycloneDX from './cyclonedx';

export default function MetadataEdit({metadata, readOnly, register, bom}) {
  const config = React.useContext(ConfigContext);
  const compAccRef = React.useRef();
  const miscAccRef = React.useRef();

  if (register === undefined) {
    register = () => {};
  }

  return (
    <Stack>
      <CompAccordion
        title={"Component"}
        defaultExpanded={true}
        ref={compAccRef}
      >
        <FormControl
          fullWidth
        >
          <Stack spacing={2}>
            <CeTextField
              label="Name"
              parentRef={compAccRef}
              name="component.name"
              defaultValue={CycloneDX.getValue(metadata, 'component.name', '')}
              {...register("component.name")}
              required={true}
              readOnly={readOnly}
              autoFocus={true}
            />
            <CeDropdownField
              label="Type"
              name="component.type"
              parentRef={compAccRef}
              {...register("component.type")}
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
            <CustomProperies
              obj={metadata}
              propertiesDef={config.metaComponentProperties}
              readOnly={readOnly}
              register={register}
              parentRef={compAccRef}
            />
            <MultiSelect
                name="component._dependencies"
                label="Dependencies"
                readOnly={readOnly}
                selected={CycloneDX.getValue(metadata, "component._dependencies", "")}
                options={bom._flattenedComponents.map((c) => {return {key: c._id, name: c.name}})}
            />
          </Stack>
        </FormControl>
      </CompAccordion>      
      <CompAccordion
        title={"Miscellaneous"}
        ref={miscAccRef}
      >
        <FormControl
          fullWidth
        >
          <Stack spacing={2}>
            <CeTextField
              label="Timestamp"
              name="timestamp"
              parentRef={miscAccRef}
              readOnly={readOnly}
              defaultValue={CycloneDX.getValue(metadata, 'timestamp', '')}
              {...register("timestamp")}
              regex={CycloneDX.formatRegEx("date-time")}
              errText="Invalid timestamp format"
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