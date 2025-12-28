import * as React from 'react';
import SpeedDial from '@mui/material/SpeedDial';
import EditIcon from '@mui/icons-material/Edit';
import Box from '@mui/material/Box';
import GlobalEdit from "./GlobalDataEdit"
import GlobalDataEditDialog from './GlobalDataEditDialog';

export default function GlobalDataView({bom, show}) {
  const [openDialog, setOpenDialog] = React.useState(false);
  if (! show) {
    return <></>;
  }
  return (
    <>
      <SpeedDial
        ariaLabel='Global Data Actions'
        sx={{ position: 'absolute', bottom: 20, left: 20 }}
        icon={<EditIcon />}
        open={false}
        onClick={() => {setOpenDialog(true)}}
      />
      <GlobalDataEditDialog
        open={openDialog}
        bom={bom}
        saveAction={() => {setOpenDialog(false)}}
        closeAction={() => {setOpenDialog(false)}}
        
      />
      <Box sx={{display: show ? 'flex' : 'none', mt: 1, p: 2, flexDirection: 'row', flexGrow: 1, minHeight: 0, overflow: 'auto', visibility: 'visible'}}>
        <GlobalEdit
          bom={bom}
          readOnly={true}
        />
      </Box>
    </>
  );
}