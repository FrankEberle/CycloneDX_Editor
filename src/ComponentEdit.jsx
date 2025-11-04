import FormControl from '@mui/material/FormControl';
import Stack from '@mui/material/Stack';

import * as CycloneDX from './cyclonedx';
import Properties from './Properties';
import Licenses from './Licenses';
import ExternalReferences from './ExternalReferences';
import Hashes from './Hashes';
import CompAccordion from './CompAccordion';
import Manufacturer from './Manufacturer';
import CeTextField from './CeTextField';
import CeDropdownField from './CeDropdownField';

export default function ComponentEdit({component, readOnly}) {
    const typeValues = CycloneDX.getComponentTypes();

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
            >
                <FormControl
                    size='small'
                    fullWidth
                >
                    <Stack spacing={2}>
                        <CeTextField
                            label='Name'
                            name='name'
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
                id="properties-accordion"
                title="Properties"
            >
                <Properties form_id="component" properties={component.properties} noTitle={true} readOnly={readOnly}/>
            </CompAccordion>
            </>

    );
}