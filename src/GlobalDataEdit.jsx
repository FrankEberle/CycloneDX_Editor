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
import FormControl from '@mui/material/FormControl';
import Stack from '@mui/material/Stack';
import CeTextField from './CeTextField';
import CompAccordion from './CompAccordion';
import GlobalStateContext from './GlobalStateContext';
import * as CycloneDX from './cyclonedx';

export default function GlobalDataEdit({bom, readOnly}) {
  const globalState = React.useContext(GlobalStateContext);
  const config = globalState.getObj("config");
  return (
    <FormControl
      size='small'
      fullWidth
    >
      <CompAccordion
        title={"Miscellaneous"}
        defaultExpanded={true}
        helpText={readOnly !== true && config.help?.global?.miscellaneous}
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
      </CompAccordion>
    </FormControl>
  );
}