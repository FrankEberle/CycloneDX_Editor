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

import * as React from 'react';
import FormControl from '@mui/material/FormControl';
import Stack from '@mui/material/Stack';

import * as CycloneDX from './cyclonedx';
import Properties from './Properties';
import Licenses from './Licenses';
import ExternalReferences from './ExternalReferences';
import Hashes from './Hashes';
import PedigreePatches from './PedigreePatches';
import CompAccordion from './CompAccordion';
import Manufacturer from './Manufacturer';
import CeTextField from './CeTextField';
import CeDropdownField from './CeDropdownField';
import ConfigContext from './ConfigContext';
import CustomProperies from './CustomProperties';
import MultiSelect from './MultiSelect';

export default function ComponentEdit({component, bom, readOnly, register}) {
    const config = React.useContext(ConfigContext);
    const identAccRef = React.useRef();
    const customAccRef = React.useRef();
    const typeValues = CycloneDX.getComponentTypes();

    if (register === undefined) {
        register = () => {};
    }

    if (readOnly === undefined) readOnly = false;
    if (component == null) {
        return <></>
    }
    return (
      <>
        <CompAccordion
            defaultExpanded={true}
            id="identification-accordion"
            title="Identification"
            ref={identAccRef}
        >
            <FormControl
                size='small'
                fullWidth
            >
                <Stack spacing={2}>
                    <CeTextField
                        label='Name'
                        name='name'
                        {...register("name")}
                        parentRef={identAccRef}
                        required={true}
                        readOnly={readOnly}
                        autoFocus={true}
                        defaultValue={CycloneDX.getValue(component, "name", "")}
                    />
                    <CeDropdownField
                        label='Type'
                        name='type'
                        readOnly={readOnly}
                        defaultValue={CycloneDX.getValue(component, "type", "")}
                        options={typeValues}
                    />
                    <CeTextField
                        label='Version'
                        name='version'
                        readOnly={readOnly}
                        defaultValue={CycloneDX.getValue(component, "version", "")}
                    />
                    <CeTextField
                        label='PURL'
                        name='purl'
                        readOnly={readOnly}
                        defaultValue={CycloneDX.getValue(component, "purl", "")}
                    />
                    <CeTextField
                        label='CPE'
                        name='cpe'
                        readOnly={readOnly}
                        defaultValue={CycloneDX.getValue(component, "cpe", "")}
                    />
                </Stack>
            </FormControl>
        </CompAccordion>
        <CompAccordion
            id="mandufacturer-accordion"
            title="Manufacturer"
        >
            <Manufacturer
                readOnly={readOnly}
                objName="manufacturer"
                component={component}
            />
        </CompAccordion>
        <CompAccordion
            id="supplier-accordion"
            title="Supplier"
        >
            <Manufacturer
                readOnly={readOnly}
                objName="supplier"
                component={component}
            />
        </CompAccordion>
        <CompAccordion
            id="licenses-accordion"
            title="Licenses"
        >
            <Licenses licenses={component.licenses} noTitle={true} readOnly={readOnly}/>
        </CompAccordion>
        <CompAccordion
            id="external-references-accordion"
            title="External References"
        >
            <ExternalReferences references={component.externalReferences} noTitle={true} readOnly={readOnly}/>
        </CompAccordion>
        <CompAccordion
            id="hashes-accordion"
            title="Hashes"
        >
            <Hashes hashes={component.hashes} noTitle={true} readOnly={readOnly}/>
        </CompAccordion>
        <CompAccordion
            id="pedigree-accordion"
            title="Pedigree"
        >
            <Stack spacing={2}>
                <CeTextField
                    label="Notes"
                    name="pedigree.notes"
                    defaultValue={CycloneDX.getValue(component, "pedigree.notes", "")}
                    maxRows={5}
                    readOnly={readOnly}
                />
            </Stack>
            <PedigreePatches patches={component.pedigree.patches} readOnly={readOnly} />
        </CompAccordion>

        <CompAccordion
            id="properties-accordion"
            title="Properties"
        >
            <Properties
                form_id="component"
                properties={component.properties}
                filter={config.componentProperties.map((p) => {return p.name})}
                noTitle={true} readOnly={readOnly}
            />
        </CompAccordion>
        <CompAccordion
            id="dependencies-accordion"
            title="Dependencies"
        >
            <MultiSelect
                name="_dependencies"
                label="Components"
                readOnly={readOnly}
                selected={CycloneDX.getValue(component, "_dependencies", "")}
                options={bom._flattenedComponents.map((c) => {return {key: c._id, name: c.name}})}
            />
        </CompAccordion>
        { config.componentProperties.length > 0 &&
          <CompAccordion
              id="custom-accordion"
              title="Custom"
              ref={customAccRef}
          >
                <CustomProperies
                    obj={component}
                    propertiesDef={config.componentProperties}
                    readOnly={readOnly}
                    register={register}
                    parentRef={customAccRef}
                />
          </CompAccordion>
        }
    </>
  );
}