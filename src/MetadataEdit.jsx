/**
 * Copyright (C) 2026  Frank Eberle
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import React from 'react';
import { FormControl, Stack } from '@mui/material';

import CompAccordion from './CompAccordion';
import Properties from './Properties';
import CeTextField from './CeTextField';
import CeDropdownField from './CeDropdownField';
import Manufacturer from './Manufacturer';
import Persons from './Persons';
import CustomData from './CustomData';
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
            <CustomData
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