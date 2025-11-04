import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';

import MetadataEdit from './MetadataEdit';


export default function MetadataEditDialog({metadata, open, saveAction, closeAction}) {
  if (metadata === undefined) {
    return <></>;
  }

  function onSubmit(event) {
    event.preventDefault();
    event.stopPropagation();
    const formData = new FormData(event.currentTarget);
    formData.entries().forEach(([key, value]) => {
        const keyParts = key.split(".");
        let target = metadata;
        for (let i = 0; i < keyParts.length -1; i++) {
          if (target[keyParts[i]] === undefined) {
            target[keyParts[i]] = {}
          }
          target = target[keyParts[i]];
        }
        target[keyParts[keyParts.length - 1]] = value;
    });
    console.log(metadata);
    saveAction();
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
              metadata={metadata}
            />
          </form>
        </DialogContent>
    </Dialog>
  );
}