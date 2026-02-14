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
import { DataGrid } from '@mui/x-data-grid';

import ConfigContext from './ConfigContext';
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
  const config = React.useContext(ConfigContext);
  const [tableSelectionModel, setTableSelectionModel] = React.useState(undefined);
  const [tableColumns, setTableColumns] = React.useState(undefined);

  if (tableColumns === undefined) {
    setTableColumns(getComponentsTableColumns(config));
  }


  return(
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
  );
}