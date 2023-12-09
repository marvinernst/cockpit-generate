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



const generateModule = async () => {

  let fileData = `
    function getAll(data: any, options: any) {
      const { where } = options;
      const filteredData = data.filter((item: any) => {
        // Iterate over the properties in the where object
        for (const prop in where) {
          if (where.hasOwnProperty(prop)) {
            // Check if the property is a nested object
            if (typeof where[prop] === "object") {
              for (const nestedProp in where[prop]) {
                if (where[prop].hasOwnProperty(nestedProp)) {
                  // Check if the nested property matches the item value
                  if (
                    item[prop] &&
                    item[prop][nestedProp] !== where[prop][nestedProp]
                  ) {
                    return false;
                  }
                }
              }
            } else {
              // Check if the property matches the item value
              if (item[prop] !== where[prop]) {
                return false;
              }
            }
          }
        }
        return true;
      });
      return filteredData;
    }


    const  headers = {
      "api-key": process.env.COCKPIT_API_KEY,
    };
  `;

  const responses = await Promise.all( routes.map( async (route) => {
    const url = `${API_BASE_URL}/api/collections/get/${route.name}?token=${API_KEY}`;
    const res = await fetch(url, {
      type: 'GET',
      headers: {
        "api-key": process.env.COCKPIT_API_KEY,
      }
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

      const getAllFunction = ` ${route.name} : {
          getAll: async (filter?:${typeName}Filter) => {
            const res = await fetch(process.env.COCKPIT_API_URL + '/api/collections/get/${route.name}?token=' + process.env.COCKPIT_API_KEY, {
              headers,
            });
            const data = await res.json();
            if (filter) {
              return getAll(data.entries, filter) as ${typeName}[];
            }
            return data.entries as ${typeName}[];
          },
          get: async (id:string) => {
            const res = await fetch(process.env.COCKPIT_API_URL + '/api/collections/get/${route.name}?token='+process.env.COCKPIT_API_KEY+'&filter[_id]='+id, {
              headers,
            });
            const data = await res.json();
            const realData = data.entries[0];
            if(realData?.image) {
              const urlForAsset =  process.env.COCKPIT_API_URL + '/api/cockpit/assets/?token='+process.env.COCKPIT_API_KEY+'&filter[_id]='+realData.image._id;
              const assetRes = await fetch(urlForAsset);
              const {assets} = await assetRes.json();
               realData.image = assets[0];
            }
            return realData as ${typeName};
          }
        },
        `

        return getAllFunction;
    }


    const getAllFunction = `
        ${route.name} : {
          getAll: async (filter?:${typeName}Filter) => {
            const res = await fetch(process.env.COCKPIT_API_URL + '/api/content/items/${route.name}', {
              headers,
            });
            const data = await res.json();
            if (filter) {
              return getAll(data, filter) as ${typeName}[];
            }
            return data as ${typeName}[];
          },
          get: async (id:string) => {
            const res = await fetch(process.env.COCKPIT_API_URL + '/api/content/item/${route.name}/'+id, {
              headers,
            });
            const data = await res.json();
            return data as ${typeName};
          }
        },
    `;

    return getAllFunction;
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




const generateClient = async () => {
  const data = await generateModule();
  const folderPath = path.join(process.cwd(), '.cockpit');
  try {
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath);
    }
  } catch (err) {
    console.error(err);
  }
  const filePath = path.join(folderPath, 'client.ts');
  fs.writeFile(filePath, data, () => {
    exec(`npx tsc ${filePath} --declaration `, (e) => {
      console.log("🚀 ~ Generated API module at :", filePath.replace('.ts', '.js'))
      exec('rm '+ filePath);
    });
  });
}


 // Validate .env variables
if(!process.env.COCKPIT_API_URL) {
  console.error('❗ Oops Woops! ❗ COCKPIT_API_URL missing in your .env file. Declare it and retry. 🔍🌐 #EnvVarReminder');
  return
}

if(!process.env.COCKPIT_API_KEY) {
  console.log('❗ Oops! ❗ COCKPIT_API_KEY missing in your .env file. Declare it and retry. 🔍🔑 #EnvVarReminder')
  return;
}
generateClient();

