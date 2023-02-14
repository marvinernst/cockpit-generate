#!/usr/bin/env node

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const cockpitConfig = require('../cockpit.config.cjs');


dotenv.config();

const API_KEY = process.env.COCKPIT_API_KEY;
const API_BASE_URL = process.env.COCKPIT_API_BASE_URL;

const config_path = path.join(process.cwd(), 'cockpit.config.cjs');
const routes = require(config_path);

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'api-key': `${API_KEY}`
  }
});


const generateModule = async (routes, client) => {

  let fileData = `
  import axios from 'axios';
  const getAll = require("./filter");
  const api = axios.create({
    baseURL: '${API_BASE_URL}s',
    headers: {
      'api-key': '${API_KEY}'
    }
  });

  `;
  const promises  =  routes.map( (route) => {
    return client.get(route.path);
  })
  const responses = await Promise.all(promises);
  const types = responses.map( (response, index) => {
    const types = jsonToTypeScript(response.data)
    const typeName = capitalizeFirstLetter(routes[index].name)
    return  `export type ${typeName}=${types};\n\n`
  })

  const typesFilter = responses.map( (response, index) => {
    const types = jsonToTypeScript(response.data, true)
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
            if (filter) {
              const { data } = await api.get<${typeName}[]>("stationen");
              return getAll(data, filter) as ${typeName}[];
            }
              const {data} = await api.get<${typeName}[]>('${route.path}');
              return data;
          },
          get: async (id:string) => {
            const {data} = await api.get<${typeName}[]>('${route.path}/'+id);
            return data;
          }
        },
    `;

    return wuffel;
  }, {});
  fileData += types.join(' ');
  fileData += typesFilter.join(' ');
  fileData += `export const client = {`
  fileData += functions.join(' ');
  fileData += `}`
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
  const data = await generateModule(routes, client);
  const filePath = path.join(__dirname, '../client.ts');
  fs.writeFileSync(filePath, data);
  console.log(`Generated API module at ${filePath}`);
}

baum();

