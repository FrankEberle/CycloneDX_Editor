import * as React from 'react';
import Box from '@mui/material/Box';
import MetadataEdit from './MetadataEdit';

export default function MatadataView({metadata, show}) {
  return (
    <Box sx={{display: show ? 'flex' : 'none', m: 1, p: 1}}>
      <MetadataEdit metadata={metadata}/>
    </Box>
  );
}
 
 
 