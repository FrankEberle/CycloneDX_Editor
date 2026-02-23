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
import Box from '@mui/material/Box';
import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialAction from '@mui/material/SpeedDialAction';
import DeleteIcon from '@mui/icons-material/Delete';
import AddBoxIcon from '@mui/icons-material/AddBox';
import EditIcon from '@mui/icons-material/Edit';
import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import GridViewIcon from '@mui/icons-material/GridView';
import { useTreeViewApiRef} from '@mui/x-tree-view/hooks';
import { useTheme } from '@mui/material/styles';

import NewComponentDialog from './NewComponentDialog';
import ComponentEditDialog from './ComponentEditDialog';
import YesNoDialog from './YesNoDialog';
import GlobalStateContext from './GlobalStateContext';
import ComponentsGrid from './ComponentsGrid';
import ComponentsTree from './ComponentsTree';
import { Conditional } from './helper';
import * as CycloneDX from './cyclonedx';


function ComponentSpeedDial({addAction, editAction, deleteAction, viewSwitchAction}) {
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <SpeedDial
      ariaLabel='Component Actions'
      sx={{ position: 'absolute', bottom: 20, left: 20 }}
      icon={<SpeedDialIcon />}
      open={isOpen}
      onClick={() => {setIsOpen(!isOpen)}}
    >
      <SpeedDialAction
        key={'add'}
        icon=<AddBoxIcon/>
        slotProps={{
          tooltip: {
            title: 'Add Component',
          },
        }}
        onClick={() => {
          setIsOpen(false);
          addAction();
        }}
      />
      <SpeedDialAction
      sx={{display: editAction === undefined ? 'none' : 'block'}}
        key={'edit'}
        icon=<EditIcon/>
        slotProps={{
          tooltip: {
            title: 'Edit Component',
          },
        }}
        onClick={() => {
          setIsOpen(false);
          editAction();
        }}
      />
      <SpeedDialAction
          sx={{display: deleteAction === undefined ? 'none' : 'block'}}
          key={'delete'}
          icon=<DeleteIcon/>
          slotProps={{
            tooltip: {
              title: 'Delete Component',
            },
          }}
          onClick={() => {
            setIsOpen(false);
            deleteAction();
          }}
        />
      <SpeedDialAction
          key={'switchView'}
          icon=<GridViewIcon/>
          slotProps={{
            tooltip: {
              title: 'Switch View',
            },
          }}
          onClick={() => {
            setIsOpen(false);
            viewSwitchAction();
          }}
        />

    </SpeedDial>
  );
}

export default function ComponentsView({show, bom}) {
  const {globalState, setGlobalState} = React.useContext(GlobalStateContext);
  const config = globalState.config;
  const [componentsList, setComponentsList] = React.useState(Array());
  const [component, setComponent] = React.useState(null);
  const [editComponent, setEditComponent] = React.useState(undefined);
  const [newCmpOpen, setNewCmpOpen] = React.useState(false);
  const [confirmDelOpen, setConfirmDelOpen] = React.useState(false);
  const [view, setView] = React.useState("table");
  const primaryTextColor = useTheme().palette.text.primary;

  const treeApiRef = useTreeViewApiRef();


  React.useEffect(() => {
    setComponentsList(bom.components);
    setComponent(null);
    bom._flattenedComponents.forEach((c) => {
      const color = getColor(c);
      c._color = color === undefined ? primaryTextColor : color;
    });
    if (bom.components.length > 0) {
      setComponent(bom.components[0]);
      if (treeApiRef.current !== undefined) {
        treeApiRef.current.setItemSelection({
          itemId: bom.components[0]._id,
          shouldBeSelected: true,
        });
      }
    }
  }, [bom]);
  

  function switchView() {
    if (view == "tree") {
      setView("table");
    } else {
      setView("tree");
    }
  }

  function updateBom(refreshTree) {
    CycloneDX.prepareBom(bom);
    if (refreshTree) {
      setComponentsList([...bom.components]);
    }
  }

  function newCmpDialogSave(formData) {
    let target;
    const subCmp = formData.get("subComponent");
    if ( subCmp !== undefined && subCmp == "on") {
      target = component;
      if (treeApiRef.current !== undefined) {
        treeApiRef.current.setItemExpansion({
          itemId: component._id,
          shouldBeExpanded: true,
        });
      }
    } else {
      target = bom;
    }
    if (target["components"] === undefined) {
      target["components"] = new Array();
    }
    let newCmp = CycloneDX.prepareComponent({
      name: formData.get("name"),
      type: formData.get("type"),
    });
    newCmp._color = getColor(newCmp);
    target.components.push(newCmp);
    setNewCmpOpen(false);
    updateBom(true);
    setComponent(newCmp);
    if (treeApiRef.current !== undefined) {
      treeApiRef.current.setItemSelection({
        itemId: newCmp._id,
        shouldBeSelected: true,
      })
    }
  }

  function delComponent() {
    CycloneDX.foreachComponent(bom, (comp, base, idx) => {
      if (comp._id == component._id) {
        base.components.splice(idx, 1);
        return [false, undefined];
      }
      return [true, undefined];
    });
    updateBom(true);
    if (bom.components.length > 0) {
      const selComp = bom.components[0];
      if (treeApiRef.current !== undefined) {
        treeApiRef.current.setItemSelection({
          itemId: selComp._id,
          shouldBeSelected: true,
        });
      }
      setComponent(selComp);
    } else {
      setComponent(undefined);
    }
    setConfirmDelOpen(false);
  }

  function getColor(component) {
    let color = primaryTextColor;
    try {
      color = config["componentColorFunc"](component);
      if (color === undefined) {
        color = primaryTextColor;
      }
    }
    catch(err) {
      console.log("Failed to get color: %o", err);
    }
    return color;
  }

  function storeComponent() {
    let refreshRequired = false;
    if (editComponent["_id"] === undefined) {
      bom["components"].push(CycloneDX.prepareComponent(editComponent));
      refreshRequired = true;
    } else {
      CycloneDX.foreachComponent(bom, (c, a, idx) => {
        if (c["_id"] == editComponent["_id"]) {
          ["name", "version", "type"].forEach((field) => {
            if (c[field] != editComponent[field]) {
              refreshRequired = true;
            }
          });
          let color = getColor(editComponent);
          if (c["_color"] !== color) {
            editComponent["_color"] = color;
            refreshRequired = true;
          }
          a.components[idx] = editComponent;
          setComponent(a.components[idx]);
          return [false, undefined];
        } else {
          return [true, undefined];
        }
      });
    }
    updateBom(refreshRequired);
    setEditComponent(undefined);
  }


  if (! show) {
    return <></>;
  }

  return (
    <Box sx={{display: show ? 'flex' : 'none', flexDirection: 'row', flexGrow: 1, minHeight: 0, overflow: 'auto', visibility: 'visible'}}>
      <NewComponentDialog
        open={newCmpOpen}
        askSub={component != null}
        okAction={newCmpDialogSave}
        cancelAction={() => {setNewCmpOpen(false)}}
      />
      <YesNoDialog
        open={confirmDelOpen}
        title="Confirmation"
        text="Are you sure to delete the component?"
        yesAction={delComponent}
        noAction={() => {setConfirmDelOpen(false)}}
      />
      <ComponentEditDialog
        component={editComponent}
        bom={bom}
        saveAction={storeComponent}
        closeAction={() => setEditComponent(undefined)}
      />
      <ComponentSpeedDial
        addAction={() => {setNewCmpOpen(true)}}
        editAction={component === undefined ? undefined : () => {
          setEditComponent(CycloneDX.deepCopy(component));
        }}
        deleteAction={component === undefined ? undefined : () => {setConfirmDelOpen(true)}}
        viewSwitchAction={switchView}
      />
      <Conditional show={view == "tree"}>
        <ComponentsTree
          bom={bom}
          component={component}
          setComponent={setComponent}
          componentsList={componentsList}
          setEditComponent={setEditComponent}
          treeApiRef={treeApiRef}
      />
      </Conditional>
       <Conditional show={view == "table"}>
        <ComponentsGrid
          bom={bom}
          setComponent={setComponent}
          setEditComponent={setEditComponent}
        />
       </Conditional>
    </Box>
  )
}
