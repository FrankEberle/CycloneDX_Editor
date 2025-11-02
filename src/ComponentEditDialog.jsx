import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';

import ComponentEdit from './ComponentEdit';


export default function ComponentEditDialog({component, saveAction, closeAction}) {
  if (component === undefined) {
    return <></>;
  }

  function onSubmit(event) {
    console.log("component edit submit");
  
    event.preventDefault();
    event.stopPropagation();
    const formData = new FormData(event.currentTarget);
    formData.entries().forEach(([key, value]) => {
        const keyParts = key.split(".");
        let target = component;
        for (let i = 0; i < keyParts.length -1; i++) {
          if (target[keyParts[i]] === undefined) {
            target[keyParts[i]] = {}
          }
          target = target[keyParts[i]];
        }
        target[keyParts[keyParts.length - 1]] = value;
    });
    console.log("onSubmit %o", component);
    saveAction();
  }


  return (
    <Dialog open={true} fullScreen={true} maxWidth="1200">
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
              {component["_id"] === undefined ? "New Component" : "Edit Component"}
            </Typography>
            <Button autoFocus color="inherit" type='submit' form='component-edit-form'>
              save
            </Button>
          </Toolbar>
        </AppBar>
        <DialogContent>
          <form id="component-edit-form" onSubmit={onSubmit}>
            <ComponentEdit
              component={component}
            />
          </form>
        </DialogContent>
    </Dialog>
  );
}