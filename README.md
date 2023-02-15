## What is cockpit-generate?

Cockpit-generate is a tool for generation of a typesafe javascript client to use with Cockpit CMS.

## Getting started
The fastest way to get started with Prisma is by following the **Quickstart**.

Add cockpit-generate to yout project.
```
npm install cockpit-generate
```

Add yout API-URL and password to your .env file.
```
COCKPIT_API_KEY=USR-ddad43036e48261a66asdkljksadl7971626494a2
COCKPIT_API_BASE_URL=https://cms.cockpit.me/api/content/item
```


Now add a config file in the root of your project and add the routes to yout api endpoint
```
//cockpit.config.cjs
module.exports =  [
  {
    path: "tour",
    name: "tours",
  },
  {
    path: "stations",
    name: "stations",
  },
];

```

Generate your client file
```
npx cockpit-generate
```
