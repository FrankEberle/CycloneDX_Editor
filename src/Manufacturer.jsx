import React from 'react';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import FormControl from '@mui/material/FormControl';
import * as CycloneDX from './cyclonedx';

import CeTextField from './CeTextField';
import Persons from './Persons';

export default function Manufacturer({objName, component, readOnly}) {
  const [comp, setComp] = React.useState(component);

  React.useEffect(() => {
    if (component[objName] === undefined) {
      component[objName] = {}
    }
    if (component[objName]["contact"] === undefined) {
      component[objName]["contact"] = Array();
    }
    setComp(component);
  }, [component, objName]);

  return (
    <FormControl fullWidth={true} size="small">
      <Stack spacing={2}>
        <CeTextField
          label="Name"
          name={objName + ".name"}
          readOnly={readOnly}
          defaultValue={CycloneDX.getValue(comp, objName + ".name", "")}
        />
        <CeTextField
          label="Country"
          name={objName + ".address.country"}
          readOnly={readOnly}
          defaultValue={CycloneDX.getValue(comp, objName + ".address.country", "")}
        />
        <CeTextField
          label="Region"
          name={objName + ".address.region"}
          readOnly={readOnly}
          defaultValue={CycloneDX.getValue(comp, objName + ".address.region", "")}
        />
        <CeTextField
          label="Locality"
          name={objName + ".address.locality"}
          readOnly={readOnly}
          defaultValue={CycloneDX.getValue(comp, objName + ".address.locality", "")}
        />
        <CeTextField
          label="Post Office Box Number"
          name={objName + ".address.postOfficeBoxNumber"}
          readOnly={readOnly}
          defaultValue={CycloneDX.getValue(comp, objName + ".address.postOfficeBoxNumber", "")}
        />
        <CeTextField
          label="Postal Code"
          name={objName + ".address.postalCode"}
          readOnly={readOnly}
          defaultValue={CycloneDX.getValue(comp, objName + ".address.postalCode", "")}
        />
        <CeTextField
          label="Street Address"
          name={objName + ".address.streetAddress"}
          readOnly={readOnly}
          defaultValue={CycloneDX.getValue(comp, objName + ".address.streetAddress", "")}
        />
        <Persons
          title={['Contact', 'Contact']}
          readOnly={readOnly}
          persons={CycloneDX.getValue(comp, objName + ".contact", Array())}
        />
      </Stack>
    </FormControl>
  );
}