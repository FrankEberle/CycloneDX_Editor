import * as React from 'react';
import SpeedDial from '@mui/material/SpeedDial';
import EditIcon from '@mui/icons-material/Edit';
import Box from '@mui/material/Box';

import MetadataEdit from './MetadataEdit';
import MetadataEditDialog from './MetadataEditDialog';
import * as CycloneDX from './cyclonedx';

export default function MatadataView({metadata, show, bom}) {
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
        metadata={metadata}
        bom={bom}
        open={edit !== undefined}
        saveAction={() => {
          setMeta({...metadata});
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
 
 
 