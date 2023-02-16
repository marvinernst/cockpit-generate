export default function getAll(data: any, options: any) {
  const { where } = options;
  console.log(data, where);
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
