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
import { RichTreeView } from '@mui/x-tree-view/RichTreeView';
import { useTreeViewApiRef} from '@mui/x-tree-view/hooks';
import { DataGrid } from '@mui/x-data-grid';

import NewComponentDialog from './NewComponentDialog';
import ComponentEditDialog from './ComponentEditDialog';
import ComponentEdit from './ComponentEdit';
import YesNoDialog from './YesNoDialog';
import ConfigContext from './ConfigContext';
import { Conditional } from './helper';
import * as CycloneDX from './cyclonedx';

const defaultColor = '#000000';

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

function getComponentsTableColumns(config) {
    const columns = [
      {
        field: "_level",
        headerName: "Level",
      },
      {
        field: "name",
        headerName: "Name",
        renderCell: (params) => {
          return (<span style={{color: params.row._color}}>{params.value}</span>)
        },
      },
      {
        field: "type",
        headerName: "Type",
      },
      {
        field: "version",
        headerName: "Version",
      }
    ];
    config.componentsTableColumns.forEach((col) => {
      const colDef = {
        headerName: col.headerName,
        field: col.field,
      }
      if (col["func"] !== undefined) {
        colDef["valueGetter"] = (value, row) => {return col.func(row)};
      }
      columns.push(colDef);
    });
    return columns;
}

export default function ComponentsView({show, bom}) {
  const config = React.useContext(ConfigContext);
  const [componentsList, setComponentsList] = React.useState(Array());
  const [component, setComponent] = React.useState(null);
  const [editComponent, setEditComponent] = React.useState(undefined);
  const [newCmpOpen, setNewCmpOpen] = React.useState(false);
  const [confirmDelOpen, setConfirmDelOpen] = React.useState(false);
  const [view, setView] = React.useState("table");
  const [tableSelectionModel, setTableSelectionModel] = React.useState(undefined);
  const [tableColumns, setTableColumns] = React.useState(undefined);

  const treeApiRef = useTreeViewApiRef();

  if (tableColumns === undefined) {
    setTableColumns(getComponentsTableColumns(config));
  }

  React.useEffect(() => {
    setComponentsList(bom.components);
    bom._flattenedComponents.forEach((c) => {
      const color = getColor(c);
      c._color = color === undefined ? defaultColor : color;
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
    /*
    bom._flattenedComponents.forEach((component) => {
        config.componentsTableColumns.forEach((column) => {
          if (column.field.startsWith("_computed_")) {
            try {
              component[column.field] = column.func(component);
            }
            catch(err) {
              console.log("Components table; error getting field '%s': %o", column.field, err);
              component[column.field] = "";
            }
          }
        });
    });
    */
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
    let color = defaultColor;
    try {
      color = config["componentColorFunc"](component);
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

  function getItemColor(x) {
    let color = defaultColor;
    const comp = CycloneDX.componentLookup(bom, x.itemId);
    if (comp !== undefined) {
      color = comp._color;
    }
    return color;
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
            slotProps={{
              item: (ownerState) => ({
                style: {
                  color: getItemColor(ownerState)
                }
              })
            }}
            getItemId={treeViewGetItemId}
            getItemLabel={treeViewGetItemLabel}
            getItemChildren={treeViewGetItemChildren}
            expansionTrigger='iconContainer'
            onItemFocus={(event, itemId) => {
              // Set item as selected when it is focused, this allows
              // to 'scroll' through the components by keyboard
              // TODO: makes it slow for large BOMs, but it's more the rendering
              // of the right frame
              /*
              treeApiRef.current.setItemSelection({
                itemId: itemId,
                shouldBeSelected: true,
              });
              */
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
            bom={bom}
            readOnly={true}
          />
        </Box>
      </Conditional>
       <Conditional show={view == "table"}>
        <DataGrid
          getRowId={(r) => {return r._id}}
          rowSelectionModel={tableSelectionModel}
          onRowSelectionModelChange={(newSelectionModel) => {
            setTableSelectionModel(newSelectionModel);
          }}
          onRowClick={(params) => {setComponent(params.row)}}
          onRowDoubleClick={(params) => {
            setTableSelectionModel({
              type: "include",
              ids: new Set([params.id]),
            });
            setComponent(params.row);
            setEditComponent(CycloneDX.deepCopy(params.row));
          }}
          columns={tableColumns}
          rows={bom._flattenedComponents}
        />

       </Conditional>
    </Box>
  )
}
