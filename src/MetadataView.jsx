import * as React from 'react';
import SpeedDial from '@mui/material/SpeedDial';
import EditIcon from '@mui/icons-material/Edit';
import Box from '@mui/material/Box';
import MetadataEdit from './MetadataEdit';
import MetadataEditDialog from './MetadataEditDialog';

export default function MatadataView({metadata, show}) {
  const [meta, setMeta] = React.useState(metadata);
  const [editOpen, setEditOpen] = React.useState(false);

  React.useEffect(() => {
    setMeta({...metadata});
  }, [metadata]);
  
  return (
    <Box sx={{display: show ? 'flex' : 'none', m: 1, p: 1}}>
      <SpeedDial
        ariaLabel='Component Actions'
        sx={{ position: 'absolute', bottom: 20, left: 20 }}
        icon={<EditIcon />}
        open={false}
        onClick={() => {setEditOpen(true)}}
      />
      <MetadataEditDialog
        metadata={metadata}
        open={editOpen}
        saveAction={() => {
          setMeta({...metadata});
          setEditOpen(false)
        }}
        closeAction={() => setEditOpen(false)}
      />
      <MetadataEdit
        metadata={meta}
        readOnly={true}
      />
    </Box>
  );
}
 
 
 