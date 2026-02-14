/* Copyright (C) 2026  Frank Eberle
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


import { RichTreeView } from '@mui/x-tree-view/RichTreeView';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';

import ComponentEdit from './ComponentEdit';
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


export default function ComponentsTree({bom, componentsList, component, setComponent, setEditComponent, treeApiRef}) {
  const primaryTextColor = useTheme().palette.text.primary;

  function getItemColor(x) {
    let color = primaryTextColor;
    const comp = CycloneDX.componentLookup(bom, x.itemId);
    if (comp !== undefined) {
      color = comp._color;
    }
    return color;
  }

  return (
    <>
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
                userSelect: 'none',
                color: getItemColor(ownerState),
              },
              onDoubleClick: (event) => {
                const c = CycloneDX.componentLookup(bom, ownerState.itemId);
                if (c !== undefined) {
                  event.stopPropagation();
                  setComponent(c);
                  setEditComponent(CycloneDX.deepCopy(c));
                }
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
    </>
  );
}