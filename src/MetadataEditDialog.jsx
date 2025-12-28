import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';

import MetadataEdit from './MetadataEdit';
import * as CycloneDX from './cyclonedx';
import { useFormValidate } from './hooks';


export default function MetadataEditDialog({metadata, bom, open, saveAction, closeAction}) {
  const {register, validate} = useFormValidate();
  if (metadata === undefined) {
    return <></>;
  }
  
  function onSubmit(event) {
    event.preventDefault();
    event.stopPropagation();
    if (validate()) {
      CycloneDX.formDataCopy(metadata, new FormData(event.currentTarget));
      saveAction();
    }
  }


  return (
    <Dialog open={open}
      fullScreen={true}
      disableRestoreFocus
    >
      <AppBar sx={{ position: 'relative' }}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={closeAction}
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
            <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
              Edit Metadata
            </Typography>
            <Button autoFocus color="inherit" type='submit' form='metadata-edit-form'>
              save
            </Button>
          </Toolbar>
        </AppBar>
        <DialogContent>
          <form id="metadata-edit-form" onSubmit={onSubmit}>
            <MetadataEdit
              register={register}
              metadata={metadata}
              bom={bom}
            />
          </form>
        </DialogContent>
    </Dialog>
  );
}