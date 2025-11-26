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
import * as CycloneDX from './cyclonedx';
import { useFormValidate } from './hooks';


export default function ComponentEditDialog({component, saveAction, closeAction}) {
  const {register, validate} = useFormValidate();

  if (component === undefined) {
    return <></>;
  }

  function onSubmit(event) {
    event.preventDefault();
    event.stopPropagation();
    if (validate()) {
      const formData = new FormData(event.currentTarget);
      CycloneDX.formDataCopy(component, formData);
      saveAction();
    }
  }

  return (
    <Dialog
      open={true}
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
              register={register}
            />
          </form>
        </DialogContent>
    </Dialog>
  );
}