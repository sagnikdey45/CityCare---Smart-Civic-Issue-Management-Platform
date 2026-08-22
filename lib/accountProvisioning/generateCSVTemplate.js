/**
 * Generates and triggers browser download for Officer and City Admin CSV templates.
 */

export function downloadOfficerCSVTemplate() {
  const headers = [
    "fullName",
    "email",
    "phone",
    "dob",
    "state",
    "city",
    "district",
    "department",
    "role",
    "specialisation",
  ];

  const sampleRows = [
    [
      "Amit Sharma",
      "amit.sharma@example.com",
      "9876543210",
      "1990-05-12",
      "Uttar Pradesh",
      "Varanasi",
      "Varanasi",
      "road",
      "unit_officer",
      "",
    ],
    [
      "Rahul Singh",
      "rahul.singh@example.com",
      "9876543211",
      "1994-07-18",
      "Uttar Pradesh",
      "Varanasi",
      "Varanasi",
      "road",
      "field_officer",
      "Road Maintenance, Asphalt Patching",
    ],
    [
      "Priya Verma",
      "priya.verma@example.com",
      "9876543212",
      "1992-11-25",
      "Uttar Pradesh",
      "Varanasi",
      "Varanasi",
      "water",
      "unit_officer",
      "",
    ],
  ];

  const csvContent =
    "data:text/csv;charset=utf-8," +
    [headers.join(","), ...sampleRows.map((r) => r.map((c) => `"${c}"`).join(","))].join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "CityCare_Officers_Provisioning_Template.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function downloadCityAdminCSVTemplate() {
  const headers = ["fullName", "email", "phone", "dob", "state", "city"];

  const sampleRows = [
    [
      "Ananya Gupta",
      "ananya.gupta@example.com",
      "9876543220",
      "1988-04-15",
      "Uttar Pradesh",
      "Varanasi",
    ],
    [
      "Vikram Malhotra",
      "vikram.malhotra@example.com",
      "9876543221",
      "1985-09-30",
      "Uttar Pradesh",
      "Lucknow",
    ],
  ];

  const csvContent =
    "data:text/csv;charset=utf-8," +
    [headers.join(","), ...sampleRows.map((r) => r.map((c) => `"${c}"`).join(","))].join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "CityCare_CityAdmin_Provisioning_Template.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
