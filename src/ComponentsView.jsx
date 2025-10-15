import * as React from 'react';
import Box from '@mui/material/Box';
import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialAction from '@mui/material/SpeedDialAction';
import DeleteIcon from '@mui/icons-material/Delete';
import AddBoxIcon from '@mui/icons-material/AddBox';
import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import { RichTreeView } from '@mui/x-tree-view/RichTreeView';
import { useTreeViewApiRef} from '@mui/x-tree-view/hooks';

import NewComponentDialog from './NewComponentDialog';
import ComponentEdit from './ComponentEdit';
import * as CycloneDX from './cyclonedx';

function treeViewGetItemId(component) {
  return component["_id"];
}

function treeViewGetItemLabel(component) {
  if (component["version"] !== undefined) {
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


function ComponentSpeedDial({addAction, deleteAction}) {
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <SpeedDial
      ariaLabel='Component Actions'
      sx={{ position: 'absolute', bottom: 20, left: 20 }}
      icon={<SpeedDialIcon />}
      open={isOpen}
      onClick={() => {setIsOpen(!isOpen)}}
      onClose={() => {setIsOpen(false)}}
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
  const [newCmpOpen, setNewCmpOpen] = React.useState(false);

  const treeApiRef = useTreeViewApiRef();

  React.useEffect(() => {
    setComponentsList(bom.components);
    if (bom.components.length > 0) {
      setComponent(bom.components[0]);
    }
  }, [bom]);

  function componentChangeValue(key, value) {
    bom._modified = true;
    component[key] = value;
    console.log(bom);
  }

  function refreshTree() {
    setComponentsList([...bom.components]);
  }

  function treeItemClicked(event, id) {
    const c = CycloneDX.componentLookup(bom, id);
    if (c !== undefined) {
      setComponent(c);
    } else {
      console.log("Error: Component not found")
    }
  }

  function newCmpDialogOpen() {
    setNewCmpOpen(true);
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
    let newCmp = {
      _id: crypto.randomUUID(),
      name: formData.get("name"),
      type: formData.get("type"),
    }
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

  function newCmpDialogCancel() {
    setNewCmpOpen(false);
  }

  return (
    <Box sx={{display: show ? 'flex' : 'none', flexDirection: 'row', flexGrow: 1, minHeight: 0, overflow: 'auto', visibility: 'visible'}}>
      <NewComponentDialog open={newCmpOpen} askSub={component != null} okAction={newCmpDialogSave} cancelAction={newCmpDialogCancel}/>
      <ComponentSpeedDial
        addAction={newCmpDialogOpen}

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
          onItemClick={treeItemClicked}
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
          changeValue={componentChangeValue}
          focusLoss={refreshTree}
        />  
      </Box>
    </Box>
  )
}
