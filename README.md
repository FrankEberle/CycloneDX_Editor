# CycloneDX Editor - A basic CycloneDX editor

## Project Goal

The objective of this project is to develop a CycloneDX editor designed for the manual generation of CycloneDX SBOMs.

The editor only supports a subset of the [CycloneDX](https://cyclonedx.org/) standard. But the subset is sufficient to generate a SBOM compliant with the [Technical Guideline TR-03183-2](https://www.bsi.bund.de/SharedDocs/Downloads/EN/BSI/Publications/TechGuidelines/TR03183/BSI-TR-03183-2_v2_1_0.pdf?__blob=publicationFile&v=5) of the German Federal Office for Information Security (BSI).

Usually a SBOM is generated automatically during the build process of the software based
on meta data of used packages (Maven, NPM, PIP etc.). But especially in the area of small
embedded systems, the software is only based on a small number of dependencies which
are not fulfilled by using packages. In such projects it may be sufficient to create
the SBOM manually, especially if the dependencies do not change frequently.

Even if a SBOM is generated automatically, the editor can be used to review the SBOM or to
enhance it manually.

## Build
To build the software NPM is required. Use the following commands to build the software:
```
cd CycloneDX_Editor
npm install
npm run build
```
The result of the build is stored in the directory *dist*.

To build the Chrome browser extension, use the following command instead:
```
cd CycloneDX_Editor
npm install
npm run build:extension
```
The result is stored in the directory *dist-extension*.

## Development
```
cd CycloneDX_Editor
npm install
npm run dev
```

The repository contains the dockerfile Dockerfile.development to build a simple container
for development purpose.

The container image is build using the following commands:
```
cd CycloneDX_Editor
docker build -f Dockerfile.development -t cyclonedx_editor_dev .
```

The following commands are used to invoke the Vite development sever inside the container:
```
cd CycloneDX_Editor
docker run --rm -t -i -p 5173:5173 -v ${PWD}:/work cyclonedx_editor_dev npm run dev -- --host
```

Use the following commands to build the software:
```
cd CycloneDX_Editor
docker run --rm -t -v ${PWD}:/work cyclonedx_editor_dev npm run build
```

### Custom Data
CycloneDX allows to store custom information as key/value pairs at various
places via the *properties* array.

Example:
```
{
    "bomFormat": "CycloneDX",
    "specVersion": "1.6",
    "metadata": {
      "component": {
        "properties": [
          {
            "name": "prop1",
            "value": "value1"
          },
          {
            "name": "prop2",
            "value": "value2"
          }
        ]
      }
    }
}
```
The CycloneDX Editor can be configured to present additional input fields
for entering custom data which is stored as properties.

The following types of input fields are supported:
* Single line text; with optional input validation
* Multiline text
* Dropdown selection
* Records consisting of multiple fields as described above


## Configuration
The application can be configured via a Javascript file named *config.js*. The file
must be located in the *src* subfolder in a development environment. In a production
environment the file must be stored in the subfolder *assets*.

The configuration file must export a single object providing the configuration options as the object's properties:
```
export default {
}
```

The supported configuration properties are described in the sub-sections below.

### version (string)
Version of the configuration. If specified the version string is shown in the about dialog.

### testBom (string)
The property *testBom* defines an URL of a SBOM. If specified, the menu option *Load Test SBOM*
shows up in the main menu. If selected, the SBOM is loaded from the defined URL. This allows
to load quickly a test SBOM during development of the app (or for other purposes).

**Hint:** For easy deployment the SBOM should be stored in the *public* folder and just be specified via its
filename.

### templates (array of objects)
The property *templates* allows to specify a set of SBOMs which can be used as templates
when authoring SBOMs. When specified the menu option *Load Template* shows up in the
main menu. When the menu option is selected a dialog is displayed. The dialog provides
a list to choose one of the templates to be loaded.

Each object in the array defines one template. The object must contain the following
properties:

* name (string): The name of the template shown in the dialog.
* url (string): The URL of the SBOM (see the hint for the test SBOM above)

Example:
```
[
  {
    name: "Template 1",
    url: "template1.json"
  },
  {
    name: "Template 2",
    url: "template2.json"
  }
]
```

### baseTemplate (object)
The property *baseTemplate* defines a partial CycloneDX BOM object that is merged into every new (empty) SBOM created via the *New* menu option. This allows pre-populating fields such as `specVersion`, `metadata`, or `components` for every newly created SBOM.

The value must be a plain JavaScript object. Its properties are shallow-merged into the new BOM using `Object.assign`, so top-level fields in `baseTemplate` override the corresponding defaults.

Example:
```js
baseTemplate: {
  metadata: {
    supplier: {
      name: "My Company"
    }
  }
}
```

### componentsTableColumns (array of objects)
Defines additional columns to be shown in the components table. Each object defines one column and must contain the following properties:

* `headerName` (string, required): The column header label.
* `field` (string): The name of a component field to display. Supports dot notation to access nested fields (e.g. `manufacturer.name`).
* `func` (function): A function receiving the component object and returning the cell value. Mutually exclusive with `field`.
* `html` (boolean): If `true`, the return value of `func` is rendered as HTML. Only valid in combination with `func`. Defaults to `false`.
* `no_wrap` (boolean): If `true`, the cell content is not wrapped. Defaults to `false`.

The helper object `window.CycloneDX` is available inside `func` and provides the following utilities:
* `hasProperty(component, name)`: Returns `true` if the component has a property with the given name, otherwise `false`.
* `getProperty(component, name)`: Returns the value of the property with the given name, or `undefined`.
* `escapeHTML(str)`: Escapes a string for safe use in HTML output.

Example:
```js
componentsTableColumns: [
  {
    headerName: "PURL",
    field: "purl"
  },
  {
    headerName: "Manufacturer",
    field: "manufacturer.name"
  },
  {
    headerName: "Checked",
    func: (c) => window.CycloneDX.getProperty(c, "my:checked")
  },
  {
    headerName: "Licenses",
    html: true,
    func: (c) => c.licenses.map(l => l.license.id ?? l.license.name).join("<br/>")
  }
]
```

### componentColorFunc (function)
A function that receives a component object and returns a CSS color string. The color is applied to the component name in the components table and components tree. Return `undefined` to use the default color.

Example:
```js
componentColorFunc: (c) => {
  if (c.type === "application") return "#ff0000";
  if (c.purl) return "#00ff00";
}
```

### Properties Configuration
The properties `metaComponentProperties`, `licenseProperties`, and `componentProperties` each accept an array of property definition objects. They control which custom input fields are shown when editing the metadata component, a license, or a component respectively.

Each property definition object supports the following fields:

* `label` (string or array of two strings, required): The label shown next to the input field. For `tuple` type, provide an array with singular and plural form (e.g. `["Product", "Products"]`).
* `name` (string): The CycloneDX property name used as key in the `properties` array. Not used for `tuple` type.
* `type` (string, required): The type of the input field. Supported values:
  * `text`: Single-line text input. Set `multiline: true` for a multi-line text area.
  * `enum`: Dropdown selection. Requires an `options` array.
  * `tuple`: A table of records, each consisting of multiple fields. Requires a `fields` array.
* `required` (boolean): If `true`, the field must not be empty. Defaults to `false`.
* `options` (array of strings): The selectable values. Only used for `enum` type.
* `emptyOpt` (boolean): If `true`, an empty option is added to the dropdown. Only used for `enum` type. Defaults to `false`.
* `multiline` (boolean): If `true`, a multi-line text area is rendered. Only used for `text` type. Defaults to `false`.
* `list` (boolean): If `true`, the property is shown in list views (e.g. the license list). Defaults to `false`.
* `fields` (array of property definition objects): The fields of a tuple record. Only used for `tuple` type. Supported field types within a tuple are `text` and `enum`.

### metaComponentProperties (array of objects)
Defines custom input fields shown when editing the metadata component (i.e. the top-level component describing the product itself). See [Properties Configuration](#properties-configuration) above.

Example:
```js
metaComponentProperties: [
  {
    label: "Product Line",
    name: "my:productLine",
    type: "enum",
    emptyOpt: true,
    options: ["hardware", "software", "firmware"]
  }
]
```

### licenseProperties (array of objects)
Defines custom input fields shown when editing a license entry of a component. See [Properties Configuration](#properties-configuration) above.

Example:
```js
licenseProperties: [
  {
    label: "Approved",
    name: "my:approved",
    type: "enum",
    options: ["no", "yes"],
    list: true
  }
]
```

### componentProperties (array of objects)
Defines custom input fields shown when editing a component. See [Properties Configuration](#properties-configuration) above.

Example:
```js
componentProperties: [
  {
    label: "3rd-Party Type",
    name: "my:3rdPartyType",
    type: "enum",
    emptyOpt: true,
    required: true,
    options: ["oss", "commercial", "internal"]
  },
  {
    label: "Notes",
    name: "my:notes",
    type: "text",
    multiline: true
  },
  {
    label: ["Order Reference", "Order References"],
    type: "tuple",
    fields: [
      {
        label: "Order Number",
        name: "my:orderNumber",
        type: "text",
        required: true
      },
      {
        label: "Product Name",
        name: "my:productName",
        type: "text",
        required: true
      }
    ]
  }
]
```



## Deployment

### Docker Container
The repository contains a dockerfile to build a container image
which can be used to deploy the application.

#### Building the Container Image
Enter the following commands to build the container image:
```
cd CycloneDX_Editor
docker build -f Dockerfile.deployment -t cyclonedx_editor .
```

#### Running the Container Image
The container can be invoked with the following command:
```
docker run --rm -p <PORT>:8080 -v <YOUR_CONFIG_JS>:/var/www/html/assets/config.js cyclonedx_editor
```

Replace *\<PORT>* with the TCP port, the web server should be reachable on. The option *-v* can be
omitted if no configuration file should be used. Otherwise *\<YOUR_CONFIG_JS>* must be replaced
with the fully qualified path of the configuration file.

### Manual Deployment
Any web server which is able to serve static files can be used to deploy the application.
The contents of the directory *dist* must be copied into the document root directory of
the server. The directory structure inside of *dist* must be retained when coping the files.
If the application should be deployed to a subdirectory, the property *base* inside *vite.config.js* must be adopted before building the application.

### Chrome Browser Extension
The application can be deployed as a Chrome browser extension. The extension opens the editor
in a new browser tab when the extension icon is clicked.

To install the extension in Chrome:
1. Build the extension using `npm run build:extension` (see [Build](#build) above).
2. Open Chrome and navigate to `chrome://extensions`.
3. Enable *Developer mode* using the toggle in the top right corner.
4. Click *Load unpacked* and select the *dist-extension* directory.

The extension will appear in the Chrome toolbar. Clicking its icon opens the CycloneDX Editor
in a new tab.

**Note:** When using the extension, the configuration is compiled into the extension bundle.
To change the configuration, edit *src/config.js* and rebuild the extension.