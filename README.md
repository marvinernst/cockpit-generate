## What is cockpit-generate?

cockpit-generate is a tool for generation of a typesafe javascript client to use with Cockpit CMS.  



## Getting started
The fastest way to get started with cockpit-generate is by following the **Quickstart**.

Add cockpit-generate to yout project.
```
npm install cockpit-generate
```

Add yout API-URL and password to your .env file.
```
COCKPIT_API_KEY=USR-ddad43036e48261a66asdkljksadl7971626494a2
COCKPIT_API_URL=https://cms.cockpit.com
```

Now add a config file in the root of your project and add the routes to yout api endpoint
```
//cockpit.config.cjs
module.exports =  [
  {
    type: "collection",
    name: "tours",
  },
  {
    type: "collection",
    name: "stations",
  },
];

```

Generate your client file
```
npx cockpit-generate
```

## How does it work?
During the genertation process the script will fetch data from the provides routes. This data will be converted to type definitions and generate the functions for getting data.

## How to use it?
To use it import the generated client file to yout project make some calls to yout api.

```
import client from "./.cockpit/client";

const allItems = await client.tours.getAll():
const allItemsFiltered = await client.tours.getAll({
  where: {
    keyToLookFor: "valueToLookFor",
  }
}):
const singleItem = await client.tours.get('itemID')
```
All the response data will have types and autocomplete.
