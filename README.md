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
docker build -f Dockerfile.development -t cyclonedx_editor_dev
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

### Custom Properties
CycloneDX allows to store custom information as key/value pairs at various
places via the *properties* array.

Example:
```
{
    "bomFormat": "CycloneDX",
    "specVersion": "1.6",
    "metadata": {
      "component": {
        "properies": [
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
The CycloneDX Editor can be configured to present additional input fields to
for entering custom data which is stored as properties.

## Configuration
The application can be configured via a Javascript file named *config.js*. The file
must be located in the *src* subfolder in a development environment. In a production
environment the file must be stored in the subfolder *assets*.

The configuration file must export a single object providing the configuration options
as the object's properties:
```
export default {
}
```


## Deployment

### Docker Container
The repository contains a dockerfile to build a container image
which can be used to deploy the application.

#### Building the Container Image
Enter the following commands to build the container image:
```
cd CycloneDX_Editor
docker build -f Dockerfile.deployment -t cyclonedx_editor
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