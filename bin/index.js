#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
require('isomorphic-fetch');

const {exec} = require('child_process');
dotenv.config();

const API_KEY = process.env.COCKPIT_API_KEY;
const API_BASE_URL = process.env.COCKPIT_API_URL;

const config_path = path.join(process.cwd(), 'cockpit.config.cjs');
const routes = require(config_path);

console.log(API_BASE_URL);

const  headers = {
  "api-key": API_KEY,
};

const generateModule = async () => {

  let fileData = `
    import getAll from "./filter";
    const  headers = ${JSON.stringify(headers)};
  `;

  const responses = await Promise.all( routes.map( async (route) => {
    const url = `${API_BASE_URL}/api/collections/get/${route.name}?token=${API_KEY}`;
    const res = await fetch(url, {
      type: 'GET',
      headers
    })
    const data = await res.json();
    return data.entries[0];
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

    if(1 === 1) {

      const wuffel = ` ${route.name} : {
          getAll: async (filter?:${typeName}Filter) => {
            const res = await fetch('${API_BASE_URL}/api/collections/get/${route.name}?token=${API_KEY}', {
              headers,
            });
            const data = await res.json();
            if (filter) {
              return getAll(data.entries, filter) as ${typeName}[];
            }
            return data.entries as ${typeName}[];
          },
          get: async (id:string) => {
            const res = await fetch('${API_BASE_URL}/api/collections/get/${route.name}?token=${API_KEY}&filter[_id]='+id, {
              headers,
            });
            const data = await res.json();
            const realData = data.entries[0];
            if(realData.image) {
              const urlForAsset =  '${API_BASE_URL}/api/cockpit/assets/?token=${API_KEY}&filter[_id]='+realData.image._id;
              const assetRes = await fetch(urlForAsset);
              const {assets} = await assetRes.json();
               realData.image = assets[0];
            }
            return realData as ${typeName};
          }
        },
        `

        return wuffel;
    }


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
  if (json === null) {
    return;
  }
  if (Array.isArray(json)) {
    const type = json.length > 0 ? jsonToTypeScript(json[0], optional) : 'any';
    result += `Array<${type}>`;
  } else if (typeof json === 'object') {
    result += '{\n';
    Object.keys(json).forEach(key => {
      const optionalKey = optional ? key + '?' : key;
      const type = jsonToTypeScript(json[key], optional);
      result += `  ${optionalKey}: ${type};\n`;
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
  fs.writeFile(filePath, data, () => {
    exec(`cd ${__dirname} && cd .. && tsc`, (e) => {

      console.log(e)
      setTimeout(() => {
        console.log(`Generated API module at ${filePath}`);

        exec('rm '+ filePath);
      }, 2000)
    });
  });
}

baum();

