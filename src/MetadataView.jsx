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
import SpeedDial from '@mui/material/SpeedDial';
import EditIcon from '@mui/icons-material/Edit';
import Box from '@mui/material/Box';

import MetadataEdit from './MetadataEdit';
import MetadataEditDialog from './MetadataEditDialog';
import * as CycloneDX from './cyclonedx';

export default function MetadataView({metadata, show, bom}) {
  const [meta, setMeta] = React.useState(metadata);
  const [edit, setEdit] = React.useState(undefined);

  React.useEffect(() => {
    setMeta({...metadata});
  }, [metadata]);
  
  return (
    <Box sx={{display: show ? 'flex' : 'none', mt: 1, p: 2, flexDirection: 'row', flexGrow: 1, minHeight: 0, overflow: 'auto', visibility: 'visible'}}>
      <SpeedDial
        ariaLabel='Component Actions'
        sx={{ position: 'absolute', bottom: 20, left: 20 }}
        icon={<EditIcon />}
        open={false}
        onClick={() => {setEdit(CycloneDX.deepCopy(meta))}}
      />
      <MetadataEditDialog
        metadata={edit}
        bom={bom}
        open={edit !== undefined}
        saveAction={() => {
          bom["metadata"] = edit;
          setMeta({...edit});
          setEdit(undefined);
        }}
        closeAction={() => setEdit(undefined)}
      />
      <MetadataEdit
        metadata={meta}
        bom={bom}
        readOnly={true}
      />
    </Box>
  );
}
 
 
 