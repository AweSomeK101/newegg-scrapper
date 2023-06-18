const { readFile } = require("fs");

function jsonToObj(file) {
  readFile(file, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading file:", err);
      return;
    }

    try {
      // Parse the JSON data into a JavaScript object
      const jsonObject = JSON.parse(data);
      return jsonObject;
      // Use the JavaScript object as needed
    } catch (err) {
      console.error("Error parsing JSON:", err);
    }
  });
}

module.exports = jsonToObj;
