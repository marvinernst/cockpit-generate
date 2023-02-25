#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const {exec} = require('child_process');
dotenv.config();

const API_KEY = process.env.COCKPIT_API_KEY;
const API_BASE_URL = process.env.COCKPIT_API_URL;

const config_path = path.join(process.cwd(), 'cockpit.config.cjs');
const routes = require(config_path);


const  headers = {
  "api-key": "USR-ddad43036e48261a66927f6440027971626494a2",
};

const generateModule = async () => {

  let fileData = `
    import getAll from "./filter";
    const  headers = ${JSON.stringify(headers)};
  `;

  const responses = await Promise.all( routes.map( async (route) => {
    const res = await fetch(`${API_BASE_URL}/api/content/item/${route.name}`, {
      type: 'GET',
      headers
    })
    return res.json();
  }));

  const types = responses.map( (response, index) => {
    const types = jsonToTypeScript(response)
    const typeName = capitalizeFirstLetter(routes[index].name)
    return  `export type ${typeName}=${types};\n\n`
  })

  const typesFilter = responses.map( (response, index) => {
    const types = jsonToTypeScript(response, true)
    const typeName = capitalizeFirstLetter(routes[index].name)
    return  `type ${typeName}Filter={
      where:${types}
    };\n\n`
  })


  const functions =  routes.map((route) => {
    const typeName = capitalizeFirstLetter(route.name)
    const wuffel = `
        ${route.name} : {
          getAll: async (filter?:${typeName}Filter) => {
            const res = await fetch('${API_BASE_URL}/api/content/items/${route.name}', {
              headers,
            });
            const data = await res.json();
            if (filter) {
              return getAll(data, filter) as ${typeName}[];
            }
            return data as ${typeName}[];
          },
          get: async (id:string) => {
            const res = await fetch('${API_BASE_URL}/api/content/item/${route.name}/'+id, {
              headers,
            });
            const data = await res.json();
            return data as ${typeName};
          }
        },
    `;

    return wuffel;
  }, {});
  fileData += types.join(' ');
  fileData += typesFilter.join(' ');
  fileData += ` const client = {`
  fileData += functions.join(' ');
  fileData += `};\n`
  fileData += `export default client`
  return fileData;
};
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function jsonToTypeScript(json, optional) {
  let result = '';
  if(json === null) {
    return
  }
  if (Array.isArray(json)) {
    const type = typeof json[0];
    result += `Array<${type === 'object' ? '{' : ''}${type}${type === 'object' ? '}' : ''}>`;
  } else if (typeof json === 'object') {

    result += '{\n';
    Object?.keys(json)?.forEach(key => {
      result += `  ${optional? key+'?': key}: ${jsonToTypeScript(json[key],optional)};\n`;
    });
    result += '}';
  } else {
    result += typeof json;
  }
  return result;
}



const baum = async () => {
  const data = await generateModule();
  const filePath = path.join(__dirname, '../client.ts');
  fs.writeFileSync(filePath, data);
  console.log(`Generated API module at ${filePath}`);
   exec('tsc', () => {
    exec('rm '+ filePath);
  });
}

baum();

