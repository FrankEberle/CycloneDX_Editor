import FormControl from '@mui/material/FormControl';
import Stack from '@mui/material/Stack';

import CeTextField from './CeTextField';
import CeDropdownField from './CeDropdownField';



function getProp(obj, name, defaultValue) {
  let result = defaultValue;
  if (obj["properties"] !== undefined) {
    for (let i = 0; i < obj["properties"].length; ++i) {
      if (obj["properties"][i]["name"] == name) {
        result = obj["properties"][i]["value"];
        break;
      }
    }
  }
  return result;
}

export default function CustomProperies({obj, propertiesDef, readOnly}) {

  return (
    <FormControl
      size='small'
      fullWidth
    >
      <Stack spacing={2}>
        { propertiesDef.map((p) => {
          if (p.type == "enum") {
            return (
              <CeDropdownField
                key={p.name}
                label={p.label}
                name={"__prop_" + p.name}
                defaultValue={getProp(obj, p.name, "")}
                readOnly={readOnly}
                options={p.options}
                emptyOpt={p.emptyOpt}
                required={p.required}
              />
            );
          }
        })}
      </Stack>
    </FormControl>
  );
}
