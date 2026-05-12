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
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Alert from '@mui/material/Alert';
import Collapse from '@mui/material/Collapse';
import { RichTreeView } from '@mui/x-tree-view/RichTreeView';

import * as CycloneDX from './cyclonedx';

export default function ChangeParentDialog({open, componentsList, currentComponent, okAction, cancelAction}) {
  const [selected, setSelected] = React.useState(undefined);
  const [errMsg, setErrMsg] = React.useState(undefined);

  React.useEffect(() => {
    setSelected(undefined);
    setErrMsg(undefined);
  }, [open]);

  function onSave() {
    if (selected === undefined) {
      setErrMsg("No parent selected");
      return;
    }
    if (selected === currentComponent["_id"]) {
      setErrMsg("Cannot set component as its own parent");
      return;
    }
    if (CycloneDX.isDescendant(currentComponent, selected)) {
      setErrMsg("Cannot move component into one of its own descendants");
      return;
    }
    okAction(selected);
  }

  const isTopLevel = componentsList.some((c) => c._id === currentComponent?._id);

  if (open === false) {
    return (<></>);
  }
  return (
      <Dialog
        open={true}
        onClose={cancelAction}
        maxWidth="md"
        fullWidth={true}
      >
        <DialogTitle>Change Parent</DialogTitle>
        <DialogContent>
          <Collapse in={errMsg !== undefined}>
            <Alert severity="warning" onClose={() => {setErrMsg(undefined)}}>{errMsg}</Alert>
          </Collapse>
          <RichTreeView
            sx={{mt: 1, alignItems: 'left', height: 300, overflowY: 'auto'}}
            items={componentsList}
            expansionTrigger='iconContainer'
            getItemId={CycloneDX.treeViewGetItemId}
            getItemLabel={CycloneDX.treeViewGetItemLabel}
            getItemChildren={CycloneDX.treeViewGetItemChildren}
            onItemSelectionToggle={(event, itemId, isSelected) => {
              if (isSelected) {
                setSelected(itemId);
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          {!isTopLevel && <Button onClick={() => okAction(null)} color="secondary">Move to Top Level</Button>}
          <Box sx={{flexGrow: 1}}/>
          <Button onClick={onSave}>Save</Button>
          <Button onClick={cancelAction}>Cancel</Button>
        </DialogActions>
      </Dialog>
  );
}