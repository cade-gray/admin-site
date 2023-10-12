export function jsonToCsv(jsonData) {
  // Create an empty array to store the CSV lines
  const csvLines = [];

  // Extract the headers (assuming the JSON data has a consistent structure)
  const headers = Object.keys(jsonData[0]);

  // Add the headers as the first line of the CSV
  csvLines.push(headers.join(","));

  // Loop through the JSON data and convert each object to a CSV line
  for (const item of jsonData) {
    const values = headers.map((header) => {
      // Handle escaping of values if needed (e.g., if they contain commas or double quotes)
      let value = item[header];
      if (typeof value === "string") {
        value = `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    });

    // Add the CSV line to the array
    csvLines.push(values.join(","));
  }

  // Join the CSV lines with newline characters to create the CSV string
  const csvString = csvLines.join("\n");

  return csvString;
}
