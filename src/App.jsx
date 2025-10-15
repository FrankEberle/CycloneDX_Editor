import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import SaveIcon from '@mui/icons-material/Save';
import ClearIcon from '@mui/icons-material/Clear';
import GridViewIcon from '@mui/icons-material/GridView';


import Ajv from 'ajv';
import AjvAddFormats from 'ajv-formats';
import AvjAddFormatsDraft2019 from 'ajv-formats-draft2019';

import './App.css';

import DrawerMenu from './DrawerMenu';
import ComponentsView from './ComponentsView';
import * as CycloneDX from './cyclonedx';

// Load json schema
import spdx_schema from './assets/spdx.schema.json';
import jsf_0_82_schema from './assets/jsf-0.82.schema.json';
import { Paper } from '@mui/material';


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


async function loadBom(setBom) {
  const text = await loadTextFile();
  if (text === null) {
    return;
  }
  var bom = null;
  const versions = ["1.2", "1.3", "1.4", "1.5", "1.6"];
  const ajv = new Ajv({strict: false});
  AjvAddFormats(ajv);
  AvjAddFormatsDraft2019(ajv);
  ajv.addSchema(spdx_schema, 'spdx.schema.json');
  ajv.addSchema(jsf_0_82_schema, 'jsf-0.82.schema.json');

  try {
    bom = JSON.parse(text);
    if (bom["specVersion"] === undefined) {
      throw new Error("specVersion not defined");
    }
    if (! versions.includes(bom["specVersion"])) {
      throw new Error("Unsupported specVersion");
    }
    // TODO: fix absolute path
    const schema_url = "/src/assets/bom-" + bom["specVersion"] + ".schema.json";
    const req = await fetch(schema_url);
    const cyclonedx_schema = await req.json();
    const validate = ajv.compile(cyclonedx_schema);
    if (validate(bom) === false) {
      console.log(validate.errors);
      throw new Error(ajv.errorsText(validate.errors));
    }
  } catch (error) {
    console.log("Error: " + error.name + " / " + error.message);
    return;
  }
  setBom(bom);
}

function App() {
  const [bom, setBom] = React.useState(CycloneDX.emptyBom());
  const [view, setView] = React.useState('metadata');

  function bomLoaded(newBom) {
    console.log("bomLoaded()");
    if (newBom["components"] === undefined) bom["components"] = Array();
    CycloneDX.prepareBom(newBom);
    setBom(newBom);
  }

  function clearBom() {
    setBom(CycloneDX.emptyBom());
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
        action: () => loadBom(bomLoaded),
      },
      {
        label: "Save",
        icon: <SaveIcon/>,
        action: () => {},
      },
    ],
    [
      {
        label: "Metadata",
        icon: <GridViewIcon/>,
        action: () => setView("metadata"),
      },
      {
        label: "Components",
        icon: <GridViewIcon/>,
        action: () => setView("components"),
      },
    ]
  ];

  function MetadataView({show}) {
    return (
        <Box sx={{display: show ? 'flex' : 'none', flexDirection: 'row', flexGrow: 1, minHeight: 0, overflow: 'auto'}}>
          Metadata
        </Box>
    );
  }

  return (
    // 1. Haupt-Container (Vertikale Flexbox für AppBar + Content)
    <>
      <Box sx={{display: "none"}}><input type="file" id="__loadFileBtn"/></Box>
      <Box
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          height: '100vh', // Volle Viewport-Höhe
          overflow: 'hidden' // Verhindert Scrollen auf der Hauptebene
        }}
      >
        {/* #1 AppBar (nimmt festen Platz ein) */}
        <AppBar position="static">
          <Toolbar>
            <DrawerMenu options={burgerMenuItems}/>
            <Typography variant="h6" component="div">
              CycloneDX Editor
            </Typography>
          </Toolbar>
        </AppBar>
        <MetadataView
          show={view == "metadata"}
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

export default App
