import * as React from 'react';
import Box from '@mui/material/Box';
import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialAction from '@mui/material/SpeedDialAction';
import DeleteIcon from '@mui/icons-material/Delete';
import AddBoxIcon from '@mui/icons-material/AddBox';
import EditIcon from '@mui/icons-material/Edit';
import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import { RichTreeView } from '@mui/x-tree-view/RichTreeView';
import { useTreeViewApiRef} from '@mui/x-tree-view/hooks';

import NewComponentDialog from './NewComponentDialog';
import ComponentEditDialog from './ComponentEditDialog';
import ComponentEdit from './ComponentEdit';
import YesNoDialog from './YesNoDialog';
import * as CycloneDX from './cyclonedx';

function treeViewGetItemId(component) {
  return component["_id"];
}

function treeViewGetItemLabel(component) {
  if ((component["version"] !== undefined) && (component["version"] != "")) {
    return `${component.name} (${component.version})`;
  }
  return component.name;
}

function treeViewGetItemChildren(component) {
  if (component.components !== undefined) {
    return component.components;
  }
  return new Array();
}


function ComponentSpeedDial({addAction, editAction, deleteAction}) {
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

    </SpeedDial>
  );
}

export default function ComponentsView({show, bom}) {
  const [componentsList, setComponentsList] = React.useState(Array());
  const [component, setComponent] = React.useState(null);
  const [editComponent, setEditComponent] = React.useState(undefined);
  const [newCmpOpen, setNewCmpOpen] = React.useState(false);
  const [confirmDelOpen, setConfirmDelOpen] = React.useState(false);

  const treeApiRef = useTreeViewApiRef();

  React.useEffect(() => {
    setComponentsList(bom.components);
    if (bom.components.length > 0) {
      setComponent(bom.components[0]);
      treeApiRef.current.setItemSelection({
        itemId: bom.components[0]._id,
        shouldBeSelected: true,
      });
    }
  }, [bom]);

  function refreshTree() {
    console.log("refresh tree");
    setComponentsList([...bom.components]);
  }

  function newCmpDialogSave(formData) {
    console.log(formData);
    let target;
    const subCmp = formData.get("subComponent");
    if ( subCmp !== undefined && subCmp == "on") {
      target = component;
      treeApiRef.current.setItemExpansion({
        itemId: component._id,
        shouldBeExpanded: true,
      });
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
    target.components.push(newCmp);
    console.log(target.components);
    setNewCmpOpen(false);
    setComponentsList([...bom.components]);
    setComponent(newCmp);
    treeApiRef.current.setItemSelection({
      itemId: newCmp._id,
      shouldBeSelected: true,
    })
  }

  function delComponent() {
    CycloneDX.foreachComponent(bom, (comp, base, idx) => {
      if (comp._id == component._id) {
        base.components.splice(idx, 1);
        return [false, undefined];
      }
      return [true, undefined];
    });
    refreshTree();
    if (bom.components.length > 0) {
      const selComp = bom.components[0];
      treeApiRef.current.setItemSelection({
        itemId: selComp._id,
        shouldBeSelected: true,
      });
      setComponent(selComp);
    } else {
      setComponent(undefined);
    }
    setConfirmDelOpen(false);
  }

  function storeComponent() {
    if (editComponent["_id"] === undefined) {
      bom["components"].push(CycloneDX.prepareComponent(editComponent));
      refreshTree();
    } else {
      let refreshRequired = false;
      CycloneDX.foreachComponent(bom, (c, a, idx) => {
        if (c["_id"] == editComponent["_id"]) {
          console.log(editComponent);
          ["name", "version", "type"].forEach((field) => {
            if (c[field] != editComponent[field]) {
              refreshRequired = true;
            }
          });
          a.components[idx] = editComponent;
          setComponent(a.components[idx]);
          return [false, undefined];
        } else {
          return [true, undefined];
        }
      });
      if (refreshRequired) refreshTree();
    }
    setEditComponent(undefined);
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
        saveAction={storeComponent}
        closeAction={() => setEditComponent(undefined)}
      />
      <ComponentSpeedDial
        addAction={() => {setNewCmpOpen(true)}}
        editAction={component === undefined ? undefined : () => {
          setEditComponent(CycloneDX.deepCopy(component));
        }}
        deleteAction={component === undefined ? undefined : () => {setConfirmDelOpen(true)}}
      />
      <Box 
        sx={{ 
          width: '30%', 
          borderRight: '1px solid grey', 
          overflow: 'auto',
          p: 2,
        }}
      >
        <RichTreeView
          apiRef={treeApiRef}
          sx={{alignItems: 'left'}}
          items={componentsList}
          getItemId={treeViewGetItemId}
          getItemLabel={treeViewGetItemLabel}
          getItemChildren={treeViewGetItemChildren}
          expansionTrigger='iconContainer'
          onItemFocus={(event, itemId) => {
            // Set item as selected when it is focused, this allows
            // to 'scroll' through the components by keyboard
            treeApiRef.current.setItemSelection({
              itemId: itemId,
              shouldBeSelected: true,
            });
          }}
          onItemSelectionToggle={(event, itemId, isSelected) => {
            if (!isSelected) {
              return;
            }
            const c = CycloneDX.componentLookup(bom, itemId);
            if (c !== undefined) {
              setComponent(c);
            } else {
              console.log("Error: Component not found")
            }
          }}
        />
      </Box>
      <Box
        sx={{ 
          width: '70%', 
          overflow: 'auto',
          p: 1,
          m: 1,
        }}
      >
        <ComponentEdit
          component={component}
          readOnly={true}
        />
      </Box>
    </Box>
  )
}
