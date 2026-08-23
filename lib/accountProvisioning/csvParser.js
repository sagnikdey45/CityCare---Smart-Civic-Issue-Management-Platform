/**
 * Header normalization and robust client-side CSV parser
 */

const HEADER_ALIASES = {
  fullname: "fullName",
  full_name: "fullName",
  name: "fullName",
  officer_name: "fullName",
  officers_full_name: "fullName",
  officer_full_name: "fullName",

  email: "email",
  email_address: "email",

  phone: "phone",
  mobile: "phone",
  phone_number: "phone",
  mobile_number: "phone",
  contact_number: "phone",
  contact_no: "phone",
  contact: "phone",

  dob: "dob",
  date_of_birth: "dob",
  birth_date: "dob",

  state: "state",
  city: "city",
  district: "district",
  region: "district",

  department: "department",
  dept: "department",

  role: "role",
  officer_role: "role",

  specialisation: "specialisation",
  specialization: "specialisation",
  skills: "specialisation",
  experience_level_experience: "specialisation",
  experience_level: "specialisation",
  experience: "specialisation",
  role_specialization: "specialisation",
  role_specialisation: "specialisation",
};

/**
 * Normalizes raw CSV header string
 */
export function normalizeCSVHeader(headerStr) {
  if (!headerStr) return "";
  const cleaned = headerStr
    .toLowerCase()
    .trim()
    .replace(/[\s\-\/\.]+/g, "_")
    .replace(/[^a-z0-9_]/g, "");

  return HEADER_ALIASES[cleaned] || cleaned;
}

/**
 * Native CSV parser supporting quoted cells and linebreaks
 */
export function parseCSVString(csvText) {
  const lines = [];
  let currentLine = [];
  let currentCell = "";
  let insideQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentCell += '"';
        i++; // skip escaped quote
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === "," && !insideQuotes) {
      currentLine.push(currentCell.trim());
      currentCell = "";
    } else if ((char === "\r" || char === "\n") && !insideQuotes) {
      if (char === "\r" && nextChar === "\n") {
        i++; // skip \n
      }
      currentLine.push(currentCell.trim());
      if (currentLine.some((cell) => cell.length > 0)) {
        lines.push(currentLine);
      }
      currentLine = [];
      currentCell = "";
    } else {
      currentCell += char;
    }
  }

  if (currentCell.length > 0 || currentLine.length > 0) {
    currentLine.push(currentCell.trim());
    if (currentLine.some((cell) => cell.length > 0)) {
      lines.push(currentLine);
    }
  }

  if (lines.length < 2) {
    return { headers: [], rows: [] };
  }

  const rawHeaders = lines[0];
  const normalizedHeaders = rawHeaders.map(normalizeCSVHeader);

  const parsedRows = [];
  for (let r = 1; r < lines.length; r++) {
    const rowCells = lines[r];
    const rowObj = {};
    normalizedHeaders.forEach((header, colIdx) => {
      if (header) {
        const val = (rowCells[colIdx] || "").trim();
        if (val) {
          if (rowObj[header]) {
            rowObj[header] = `${rowObj[header]}, ${val}`;
          } else {
            rowObj[header] = val;
          }
        } else if (!rowObj[header]) {
          rowObj[header] = "";
        }
      }
    });

    // Only add non-empty rows
    if (Object.values(rowObj).some((val) => val && val.trim().length > 0)) {
      parsedRows.push({
        rowNumber: r + 1,
        data: rowObj,
      });
    }
  }

  return {
    headers: normalizedHeaders,
    rows: parsedRows,
  };
}
