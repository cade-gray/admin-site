export function downloadCsv(csvData, filename) {
  const csvString = csvData;

  // Create a Blob object with the CSV data
  const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });

  // Create a download link
  const link = document.createElement("a");
  if (link.download !== undefined) {
    // Set the link's href attribute to the Blob's URL
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);

    // Trigger a click event on the link to initiate the download
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } else {
    // Fallback for older browsers that don't support the download attribute
    alert(
      "Your browser does not support the download feature. Please try another browser."
    );
  }
}
