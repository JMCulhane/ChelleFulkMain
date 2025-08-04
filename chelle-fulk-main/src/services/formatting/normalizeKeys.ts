const toCamelCase = (str: string): string =>
  str
    .replace(/[_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ""))
    .replace(/^./, c => c.toLowerCase());

const normalizeKeys = (data: any[]): any[] => {
  return data.map(row => {
    return Object.keys(row).reduce((acc: any, key: string) => {
      const newKey: string = toCamelCase(key);
      acc[newKey] = row[key];
      return acc;
    }, {});
  });
};

export default normalizeKeys;
