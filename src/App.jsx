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
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import SaveIcon from '@mui/icons-material/Save';
import ClearIcon from '@mui/icons-material/Clear';
import ScienceIcon from '@mui/icons-material/Science';
import ListAltIcon from '@mui/icons-material/ListAlt';
import GridViewIcon from '@mui/icons-material/GridView';
import { ConfirmProvider } from 'material-ui-confirm'
import { useConfirm } from "material-ui-confirm";

import './App.css';

import DrawerMenu from './DrawerMenu';
import GlobalDataView from './GlobalDataView';
import ComponentsView from './ComponentsView';
import MetadataView from './MetadataView';
import SaveDialog from './SaveDialog';
import TemplateDialog from './TemplateDialog';
import ErrorDialog from './ErrorDialog';
import GlobalStateProvider from './GlobalStateProvider';
import GlobalStateContext from './GlobalStateContext';
import { loadConfig} from './ConfigLoader';
import * as CycloneDX from './cyclonedx';


function loadTextFile() {
  const loadBtn = document.getElementById("__loadFileBtn");
  loadBtn.click();
  const p = new Promise(function(resolve) {
    loadBtn.addEventListener("cancel", () => {
      resolve(null);
    });
    loadBtn.addEventListener("change", () => {
      const files = loadBtn.files;
      if (files.length == 0) {
        resolve(null);
      }
      const reader = new FileReader();
      reader.onload = () => {
        loadBtn.value = "";
        resolve(reader.result);
      };
      reader.readAsText(files[0]);  
    });
  });
  return p;
}


async function loadTextFileFromUrl(url) {
  const response = await fetch(url);
  if (response.status != 200) {
    throw new Error(`Failed to load SBOM: Server returned status code ${response.status} (${response.statusText})`);
  }
  const text = await response.text();
  return text;
}


async function saveBom(bom, filename) {
  const bomFinalized = CycloneDX.finalizeBom(JSON.parse(JSON.stringify(bom)));
  try {
    await CycloneDX.validateBom(bomFinalized);
  }
  catch (error) {
    throw new Error("Failed to save BOM: " + error.name + " / " + error.message);
  }
  const json = JSON.stringify(bomFinalized, null, "  ");
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}


function Inner() {
  const [bom, setBom] = React.useState(CycloneDX.emptyBom());
  const [view, setView] = React.useState('metadata');
  const [heading, setHeading] = React.useState('Metadata');
  const [showSaveDialog, setShowSaveDialog] = React.useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = React.useState(false);
  const [err, setErr] = React.useState(undefined);
  const confirm = useConfirm();
  
  const globalState = React.useContext(GlobalStateContext);

  React.useEffect(() => {
    loadConfig().then((c) => {
      globalState.set("config", c);
    });
  }, []);

  if (! globalState.has("config")) {
    return (<></>);
  }

  async function confirmModified() {
    if (globalState.getBool("modified")) {
      const { confirmed } = await confirm({
          title: "Confirmation",
          description: "There are unsaved changes, continue?",
      });
      if (! confirmed) {
        return false;
      }
    }
    return true;
  }

  async function clearBom() {
    if (await confirmModified()) {
      setBom(CycloneDX.emptyBom());
      globalState.set("modified", false);
    }
  }

  async function loader(func) {
    if (! await confirmModified()) {
      return;
    }
    try {
      const json_text = await func();
      if ((json_text === undefined) || (json_text === null)) {
        return;
      }
      const bom = JSON.parse(json_text)
      await CycloneDX.validateBom
      if (bom["components"] === undefined) bom["components"] = Array();
      CycloneDX.prepareBom(bom);
      setBom(bom);
      globalState.set("modified", false);
    }
    catch (error) {
      setErr(error.message);
    }
  }

  const burgerMenuItems = [
    [
      {
        label: "New",
        icon: <ClearIcon/>,
        action: () => clearBom(),
      },
      {
        label: "Load",
        icon: <FolderOpenIcon/>,
        action: () => {loader(loadTextFile)}
      },
      {
        label: "Save",
        icon: <SaveIcon/>,
        action: () => {setShowSaveDialog(true)},
      },
    ],
    [
      {
        label: "Global Data",
        icon: <GridViewIcon/>,
        action: () => {
          setView("global");
          setHeading("Global Data");
        },
      },
      {
        label: "Metadata",
        icon: <GridViewIcon/>,
        action: () => {
          setView("metadata");
          setHeading("Metadata");
        },
      },
      {
        label: "Components",
        icon: <GridViewIcon/>,
        action: () => {
          setView("components");
          setHeading("Components");
        },
      },
    ]
  ];
  if (globalState.getObj("config").templates !== undefined) {
    burgerMenuItems[0].push(
      {
        label: "Load Template",
        icon: <ListAltIcon/>,
        action: () => {setShowTemplateDialog(true)},
      }
    );
  }
  if (globalState.getObj("config").testBom !== undefined) {
    burgerMenuItems[0].push(
      {
        label: "Load Test SBOM",
        icon: <ScienceIcon/>,
        action: () => {loader(async () => {return await loadTextFileFromUrl(globalState.getObj("config").testBom)})},
      }
    );
  }

  return (
    <>
      <ErrorDialog
        err={err}
        closeAction={() => {setErr(undefined)}}
      />
      <SaveDialog
        open={showSaveDialog}
        saveAction={async (data) => {
          try {
             await saveBom(bom, data.filename);
            globalState.set("modified", false);
          }
          catch (error) {
            setErr(error.message);
          }
        }}
        closeAction={() => {setShowSaveDialog(false)}}
      />
      <TemplateDialog
        open={showTemplateDialog}
        templates={globalState.getObj("config").templates}
        okAction={(templateUrl) => {
          setShowTemplateDialog(false);
          loader(async () => {return await loadTextFileFromUrl(templateUrl)});
        }}
        cancelAction={() => {setShowTemplateDialog(false)}}
      />
      <Box sx={{display: "none"}}><input type="file" id="__loadFileBtn"/></Box>
      <Box
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          height: '100vh', // Volle Viewport-Höhe
          overflow: 'hidden' // Verhindert Scrollen auf der Hauptebene
        }}
      >
        <AppBar position="static">
          <Toolbar>
            <DrawerMenu
              options={burgerMenuItems}
              indicator={globalState.getBool("modified")}
            />
            <Typography variant="h6" component="div">
              CycloneDX Editor - {heading}
            </Typography>
          </Toolbar>
        </AppBar>
        <GlobalDataView
          show={view == "global"}
          bom={bom}
        />
        <MetadataView
          show={view == "metadata"}
          metadata={bom.metadata}
          bom={bom}
        />
        <ComponentsView
          show={view == "components"}
          bom={bom}
        />
      </Box>
    </>
  );
}

export default function App() {
  return (
    <GlobalStateProvider>
      <ConfirmProvider>
        <Inner/>
      </ConfirmProvider>
    </GlobalStateProvider>
  );
}