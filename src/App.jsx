import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import SaveIcon from '@mui/icons-material/Save';
import ClearIcon from '@mui/icons-material/Clear';
import GridViewIcon from '@mui/icons-material/GridView';

import './App.css';

import DrawerMenu from './DrawerMenu';
import GlobalDataView from './GlobalDataView';
import ComponentsView from './ComponentsView';
import MetadataView from './MetadataView';
import SaveDialog from './SaveDialog';
import * as CycloneDX from './cyclonedx';
import ConfigContext from './ConfigContext';

import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';


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
        resolve(reader.result)
      };
      reader.readAsText(files[0]);  
    });
  });
  return p;
}

// utils for functions defined in configuration
const utils = {
  hastProerty: (c, name) => {
    for (let p of c.properties) {
      if (p.name == name) return true;
    }
    return false;
  },

  getProperty: (c, name) => {
    for (let p of c.properties) {
      if (p.name == name) return p.value;
    }
    return undefined;
  },
}


async function loadConfig() {
  // https://react.dev/learn/passing-data-deeply-with-context
  const url = window.location + "/config.js";
  const req = await fetch(url);
  let config;
  try {
    const source = await req.text();
    config = eval(source);
  } catch (error) {
    console.log("Failed to load config: %s", error);
    config = {
    }
  }
  console.log(config);
  if (config["componentProperties"] === undefined) {
    config["componentProperties"] = Array();
  }
  if (config["licenseProperties"] === undefined) {
    config["licenseProperties"] = Array();
  }
  if (config["metaComponentProperties"] === undefined) {
    config["metaComponentProperties"] = Array();
  }
  if (config["componentColorFunc"] === undefined) {
    config["componentColorFunc"] = () => {return undefined};
  }
  if (config["componentsTableColumns"] === undefined) {
    config.componentsTableColumns = Array();
  } else {
    const columns = Array();
    let i = -1;
    for (let col of config.componentsTableColumns) {
      i = i + 1;
      const colDef = {}
      if (col["headerName"] === undefined) {
        console.log("Config error, componentsTableColumns[%d]: 'headerName' is missing", i);
        continue;
      }
      colDef.headerName = col.headerName;
      if (col["func"] !== undefined) {
        if (col["field"] !== undefined) {
          console.log("Config error, componentsTableColumns[%d]: 'field' and 'func' are mutual exclusive", i);
          continue;
        }
        colDef.func = col.func;
        colDef.field = "_computed_func_" + String(columns.length);
      } else if (col.field !== undefined) {
        if (typeof(col.field) != "string") {
          console.log("Config error, componentsTableColumns[%d]: 'field' has invalid type'", i);
          continue;
        }
        if (col.field.includes(".")) {
          colDef.field = "_computed_" + col.field;
          colDef.func = (c) => {return CycloneDX.getValue(c, col.field)};
        } else {
          colDef.field = col.field;
        }
      } else {
        console.log("Config error, componentsTableColumns[%d]: neither 'field' nor 'func' defined", i);
        continue
      }
      columns.push(colDef);
    }
    config.componentsTableColumns = columns;
  }
  return config;
}

async function loadBom(setBom, setErr) {
  const text = await loadTextFile();
  if (text === null) {
    return;
  }
  var bom = null;
  try {
    bom = JSON.parse(text);
    await CycloneDX.validateBom(bom);
  } catch (error) {
    setErr("Failed to load BOM: " + error.name + " / " + error.message);
    return;
  }
  setBom(bom);
}

async function saveBom(bom, filename, setErr) {
  console.log("Save");
  const bomFinalized = CycloneDX.finalizeBom(JSON.parse(JSON.stringify(bom)));
  try {
    await CycloneDX.validateBom(bomFinalized);
  }
  catch (error) {
    setErr("Failed to save BOM: " + error.name + " / " + error.message);
    return;
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

function App() {
  const [bom, setBom] = React.useState(CycloneDX.emptyBom());
  const [view, setView] = React.useState('metadata');
  const [heading, setHeading] = React.useState('Metadata');
  const [showSaveDialog, setShowSaveDialog] = React.useState(false);
  const [config, setConfig] = React.useState(null);
  const [err, setErr] = React.useState(null);

  React.useEffect(() => {
    loadConfig().then((c) => {
      setConfig(c);
    });
  }, []);

  function bomLoaded(newBom) {
    if (newBom["components"] === undefined) bom["components"] = Array();
    CycloneDX.prepareBom(newBom);
    console.log(newBom);
    setBom(newBom);
  }

  function clearBom() {
    setBom(CycloneDX.emptyBom());
  }

  function showErr(text) {
    setErr(text);
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
        action: () => loadBom(bomLoaded, showErr),
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

  if (config == null) {
    return (<></>);
  }

  return (
    <ConfigContext value={config}>
      <>
        <SaveDialog
          open={showSaveDialog}
          saveAction={(data) => {saveBom(bom, data.filename, showErr)}}
          closeAction={() => {setShowSaveDialog(false)}}
        />
        <Dialog
          open={err != null}
          maxWidth={'sm'}
        >
          <DialogTitle sx={{color: 'error.main'}}>
              Error
          </DialogTitle>
          <DialogContent sx={{minWidth: '500px'}}>
            <Typography>
              {err}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setErr(null)}
              color='error'
              variant='contained'
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
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
              <DrawerMenu options={burgerMenuItems}/>
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
    </ConfigContext>
  );
}

export default App
