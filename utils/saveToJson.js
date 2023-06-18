const fs = require("fs");

function saveToJson(data, file) {
  const jsonData = JSON.stringify(data, null, 2);
  fs.writeFile(file, jsonData, (err) => {
    if (err) {
      console.log("Error while saving file");
    } else {
      console.log("File saved");
    }
  });
}

function appendToJson(data, filename) {
  let jsonData = [];

  // Check if the file exists
  if (fs.existsSync(filename)) {
    // Read the existing file content
    const fileContent = fs.readFileSync(filename, "utf8");
    if (fileContent) {
      // Parse the existing JSON data
      jsonData = JSON.parse(fileContent);
    }
  }

  // Append the new data to the JSON array
  if (Array.isArray(data)) {
    jsonData = [...data, ...jsonData];
  } else {
    jsonData.push(data);
  }

  // Write the updated JSON data back to the file
  saveToJson(jsonData, filename);
}

module.exports = { saveToJson, appendToJson };
