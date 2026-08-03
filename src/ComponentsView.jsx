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
import { useTreeViewApiRef} from '@mui/x-tree-view/hooks';
import { useTheme } from '@mui/material/styles';

import NewComponentDialog from './NewComponentDialog';
import ChangeParentDialog from './ChangeParentDialog';
import ComponentEditDialog from './ComponentEditDialog';
import YesNoDialog from './YesNoDialog';
import GlobalStateContext from './GlobalStateContext';
import ComponentsGrid from './ComponentsGrid';
import ComponentsTree from './ComponentsTree';
import ComponentSpeedDial from './ComponentSpeedDial';
import ComponentPasteDialog from './ComponentPasteDialog';
import { Conditional } from './helper';
import * as CycloneDX from './cyclonedx';


export default function ComponentsView({show, bom}) {
  const globalState = React.useContext(GlobalStateContext);
  const config = globalState.getObj("config");
  const [componentsList, setComponentsList] = React.useState(Array());
  const [component, setComponent] = React.useState(null);
  const [editComponent, setEditComponent] = React.useState(undefined);
  const [newCmpOpen, setNewCmpOpen] = React.useState(false);
  const [confirmDelOpen, setConfirmDelOpen] = React.useState(false);
  const [pasteObj, setPasteObj] = React.useState(null);
  const [changeParentOpen, setChangeParentOpen] = React.useState(false);
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

  function updateBom(refreshTree, updateColor) {
    CycloneDX.updateBom(bom);
    if (updateColor === true) {
      bom._flattenedComponents.forEach((c) => {c._color = getColor(c)});
      refreshTree = true;
    }
    if (refreshTree) {
      setComponentsList([...bom.components]);
    }
  }

  function insertComponent(target, component) {
    if (target["components"] === undefined) {
      target["components"] = new Array();
    }
    CycloneDX.prepareComponent(component, false, true);
    component._color = getColor(component);
    target.components.push(component);
    updateBom(true, true);
    setComponent(component);
    if (treeApiRef.current !== undefined) {
      treeApiRef.current.setItemSelection({
        itemId: component._id,
        shouldBeSelected: true,
      })
    }
    globalState.set("modified", true);
    return component;
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
    const newCmp = insertComponent(target, {
      name: formData.get("name"),
      type: formData.get("type"),
    });
    setNewCmpOpen(false);
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
    globalState.set("modified", true);
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
      setComponent(null);
    }
    setConfirmDelOpen(false);
  }

  function getColor(component) {
    try {
      return config["componentColorFunc"](component);
    }
    catch(err) {
      console.log("Failed to get color: %o", err);
    }
    return undefined;
  }

  function storeComponent() {
    let refreshRequired = false;
    if (editComponent["_id"] === undefined) {
      // TODO: is this branch still required?
      bom["components"].push(CycloneDX.prepareComponent(editComponent));
      refreshRequired = true;
      globalState.set("modified", true);
    } else {
      CycloneDX.foreachComponent(bom, (c, a, idx) => {
        if (c["_id"] == editComponent["_id"]) {
          if (! CycloneDX.deepCompare(c, editComponent)) {
            globalState.set("modified", true);
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
          }
          return [false, undefined];
        } else {
          return [true, undefined];
        }
      });
    }
    updateBom(refreshRequired);
    setEditComponent(undefined);
  }

  function changeParent(newParentId) {
    // prevent moving a component into one of its own descendants
    if (CycloneDX.isDescendant(component, newParentId)) {
      return;
    }
    // remove component from current parent
    CycloneDX.foreachComponent(bom, (c, base, idx) => {
      if (c._id === component._id) {
        base.components.splice(idx, 1);
        return [false, undefined];
      }
      return [true, undefined];
    });
    // find new parent and add component
    const newParent = CycloneDX.componentLookup(bom, newParentId) ?? bom;
    if (newParent.components === undefined) newParent.components = [];
    newParent.components.push(component);
    updateBom(true);
    globalState.set("modified", true);
    setChangeParentOpen(false);
  }

  async function clipboardCopy(comp) {
    const content = JSON.stringify({
        version: import.meta.env.PACKAGE_VERSION,
        component: CycloneDX.cleanupComponent(CycloneDX.deepCopy(comp)),
    });
    const clipboardItem = new ClipboardItem({ "text/plain": content });
    await navigator.clipboard.write([clipboardItem]);
    console.log("Copied to clipboard: %s", content);
  }

  const clipboardPasteStart = React.useCallback(async (e) => {
    const text = e.clipboardData?.getData('text/plain');
    if (!text) return;
    let parsed;
    try {
      parsed = JSON.parse(text);
      if ((typeof parsed !== 'object') || (parsed === null))
          throw new Error("Paste; object expected");
      if ((parsed.version === undefined) || (parsed.version !== import.meta.env.PACKAGE_VERSION))
          throw new Error("Paste; unexpected or missing version");
      if ((parsed.component === undefined) || (typeof parsed.component !== 'object') || (parsed.component === null))
          throw new Error("Paste; missing component or invalid type");
      const fakeBom = {
        "bomFormat": "CycloneDX",
        "specVersion": "1.6",
        "components": [parsed.component],
      }
      await CycloneDX.validateBom(fakeBom);
    } catch (err) {
      console.log("Paste; failed to parse JSON: %o", err);
      return;
    }
    console.log("Paste: %o", parsed);
    setPasteObj(parsed.component);
  });

  function clipboardPasteFinalize(target, elements) {
    console.log(elements);
    if (target == "top") {
      if (component === null) {
        insertComponent(bom, pasteObj);
      } else {
        insertComponent(CycloneDX.getParent(bom, component), pasteObj);
      }
    } else if (target == "child") {
      insertComponent(component, pasteObj);
    } else if (target == "into") {
      const simple = ["manufacturer", "supplier", "licenses", "externalReferences", "pedigree",
        "properties",
      ];
      for (let p of simple) {
        if (elements[p] && pasteObj[p] !== undefined) {
          component[p] = CycloneDX.deepCopy(pasteObj[p]);
        }
      }
      if (elements["components"] && pasteObj.components !== undefined) {
        component.components = CycloneDX.deepCopy(pasteObj.components);
        CycloneDX.prepareComponent(component, false, true);
        updateBom(true, true);
      }
    } else {
      throw new Error(`Unexpected target: ${target}`);
    }
  }

  const keyCatcherRef = React.useRef(null);

  React.useEffect(() => {
    if (!show) return;
    const keyHandler = (e) => {
      if (keyCatcherRef.current?.contains(document.activeElement)) {
        if (e.ctrlKey && e.key === 'c') {
          clipboardCopy(component);
          e.stopPropagation();
        } else if (e.key === 'Delete') {
          if (component !== null) {
            setConfirmDelOpen(true);
          }
          e.stopPropagation();
        } else if (e.key === 'Insert') {
          setNewCmpOpen(true);
          e.stopPropagation();
        } else {
          console.log(e.key);
        }
      }
    };
    const pasteHandler = (e) => {
      if (keyCatcherRef.current?.contains(document.activeElement)) {
        clipboardPasteStart(e);
        e.stopPropagation();
      }
    };
    document.addEventListener('keydown', keyHandler, true);
    document.addEventListener('paste', pasteHandler, true);
    return () => {
      document.removeEventListener('keydown', keyHandler, true);
      document.removeEventListener('paste', pasteHandler, true);
    };
  }, [show, bom, component]);


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
      <ChangeParentDialog
        open={changeParentOpen}
        componentsList={componentsList}
        currentComponent={component}
        okAction={changeParent}
        cancelAction={() => {setChangeParentOpen(false)}}
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
      <ComponentPasteDialog
        open={pasteObj !== null}
        selected={component !== null}
        okAction={(params) => {
          if (pasteObj !== null) {
            clipboardPasteFinalize(params.target, params.elements);
            setPasteObj(null);
          }
        }}
        closeAction={() => {setPasteObj(null)}}
      />
      <ComponentSpeedDial
        addAction={() => {setNewCmpOpen(true)}}
        editAction={component === null ? undefined : () => {
          setEditComponent(CycloneDX.deepCopy(component));
        }}
        deleteAction={component === null ? undefined : () => {setConfirmDelOpen(true)}}
        changeParentAction={component === null ? undefined : () => {setChangeParentOpen(true)}}
        viewSwitchAction={switchView}
      />
      <Box
        ref={keyCatcherRef}
        tabIndex={0}
        sx={{ display: 'flex', flexGrow: 1, minHeight: 0, overflow: 'hidden', outline: 'none' }}
      >
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
    </Box>
  )
}
