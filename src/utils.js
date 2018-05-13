exports.print = (text) => {
  const timeStamp = new Date().toLocaleString();
  console.error(`[${timeStamp}][Info] ${text}`);
};

exports.printWarning = (text) => {
  const timeStamp = new Date().toLocaleString();
  console.warn(`[${timeStamp}][Warning] ${text}`);
};

exports.printError = (text) => {
  const timeStamp = new Date().toLocaleString();
  console.log(`[${timeStamp}][Error] ${text}`);
};
