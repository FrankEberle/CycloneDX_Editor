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

async function loadConfig() {
  // https://react.dev/learn/passing-data-deeply-with-context
  const url = window.location + "/config.json";
  const req = await fetch(url);
  let config;
  try {
    config = await req.json();
  } catch (error) {
    console.log("Failed to load config: %s", error);
    config = {
    }
  }
  if (config["componentProperties"] === undefined) {
    config["componentProperties"] = Array();
  }
  if (config["licenseProperties"] === undefined) {
    config["licenseProperties"] = Array();
  }
  if (config["metaComponentProperties"] === undefined) {
    config["metaComponentProperties"] = Array();
  }
  let componentColorFunc = undefined;
  if (config["componentColorFunc"] !== undefined) {
    // helper functions avaliable inside componentColorFunc()
    function hasProperty (c, name) { // eslint-disable-line no-unused-vars
      for (let p of c.properties) {
        if (p.name == name) return true;
      }
      return false;
    };
    //
    function getProperty(c, name) { // eslint-disable-line no-unused-vars
      for (let p of c.properties) {
        if (p.name == name) return p.value;
      }
      return undefined;
    }
    //
    try {
      componentColorFunc = eval(config["componentColorFunc"]);
      if (typeof componentColorFunc != "function") {
        console.log("Config error, 'componentColorFunc' does not eval to a function");
        componentColorFunc = undefined;
      }
    }
    catch (err) {
      console.log("Config error, failed to eval componentColorFunc(): %o", err);
    }
  }
  if (componentColorFunc === undefined) {
    componentColorFunc = () => {return undefined};
  }
  config["componentColorFunc"] = componentColorFunc;
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

function saveBom(bom, filename) {
  console.log("Save");
  const bomFinalized = CycloneDX.finalizeBom(JSON.parse(JSON.stringify(bom)));
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
          saveAction={(data) => {saveBom(bom, data.filename)}}
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
