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


import * as React from 'react';
import { DataGrid, useGridApiRef } from '@mui/x-data-grid';

import shajs from 'sha.js';

import GlobalStateContext from './GlobalStateContext';
import * as CycloneDX from './cyclonedx';


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
        colDef["valueGetter"] = (value, row) => {
          try {
            return col.func(row)
          }
          catch (e) {
            console.log("Function for column '%s' failed; %s", col.headerName, e);
            return "!! ERROR !!";
          }
        };
      }
      columns.push(colDef);
    });
    return columns;
}


export default function ComponentsGrid({bom, setComponent, setEditComponent}) {
  const LOCAL_STATE_KEY = "compGrid";
  const globalState = React.useContext(GlobalStateContext);
  const config = globalState.get("config");
  const [tableColumns, setTableColumns] = React.useState(undefined);
  const apiRef = useGridApiRef()
  
  function saveState(what, value) {
    let state = localStorage.getItem(LOCAL_STATE_KEY);
    if (state === null) {
      state = {};
    } else {
      state = JSON.parse(state);
    }
    state[what] = value;
    localStorage.setItem(LOCAL_STATE_KEY, JSON.stringify(state));
  }

  function loadState(what) {
    let result = undefined;
    let state = localStorage.getItem(LOCAL_STATE_KEY);
    if (state !== null) {
      state = JSON.parse(state);
      result = state[what];
    }
    return result;
  }

  if (tableColumns === undefined) {
    const columns = getComponentsTableColumns(config);
    const hash = shajs('sha256').update(JSON.stringify(columns)).digest('hex');
    const oldHash = loadState("oldHash");
    if (hash !== oldHash) {
      localStorage.removeItem(LOCAL_STATE_KEY);
      saveState("oldHash", hash);
    }
    for (let col of columns) {
      const width = loadState("width_" + col.field);
      if (width !== undefined) {
        col.width = width;
      }
    }
    setTableColumns(columns);
  }

  const [colVisModel, setColVisModel] = React.useState(loadState("columnVisibility"))

  return(
    <DataGrid
      apiRef={apiRef}
      getRowId={(r) => {return r._id}}
      sortModel={globalState.get("compGridSortModel")}
      rowSelectionModel={globalState.get("compGridRowSelectionModel")}
      columnVisibilityModel={colVisModel}
      onRowClick={(params) => {setComponent(params.row)}}
      onRowDoubleClick={(params) => {
        apiRef.current.setRowSelectionModel(
          {
            type: "include",
            ids: new Set([params.id]),
          }
        );
        setComponent(params.row);
        setEditComponent(CycloneDX.deepCopy(params.row));
      }}
      columns={tableColumns}
      rows={bom._flattenedComponents}
      onSortModelChange={(model, details) => { // eslint-disable-line no-unused-vars
        globalState.set("compGridSortModel", model);
      }}
      onRowSelectionModelChange={(model, details) => { // eslint-disable-line no-unused-vars
        globalState.set("compGridRowSelectionModel", model);
      }}
      onColumnVisibilityModelChange={(model, details) => { // eslint-disable-line no-unused-vars
        setColVisModel(model);
        saveState("columnVisibility", model);
      }}
      onColumnWidthChange={(param) => {
        saveState("width_" + param.colDef.field, param.colDef.width);
      }}
    />
  );
}