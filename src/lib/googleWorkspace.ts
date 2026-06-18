// Google Workspace integration helper
// Supports Implicit OAuth 2.0 flow for Google Drive and Google Sheets or direct Google Apps Script Webhook

export interface GoogleConnectionConfig {
  clientId: string;
  spreadsheetId: string;
  accessToken: string;
  expiresAt: number; // timestamp ms
  useWebhook: boolean;
  webhookUrl: string;
}

const STORAGE_KEY = "jsp_google_config";

export function loadGoogleConfig(): GoogleConnectionConfig {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      // fallback
    }
  }
  return {
    clientId: "1024094949897-placeholder.apps.googleusercontent.com", // Fallback placeholder
    spreadsheetId: "",
    accessToken: "",
    expiresAt: 0,
    useWebhook: false,
    webhookUrl: "",
  };
}

export function saveGoogleConfig(config: GoogleConnectionConfig) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

// Start standard Implicit OAuth popup flow
export function startGoogleAuth(clientId: string) {
  const scopes = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive.file"
  ];
  const redirectUri = window.location.origin + window.location.pathname;
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
    clientId
  )}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&response_type=token&scope=${encodeURIComponent(
    scopes.join(" ")
  )}&state=jsp_oauth`;

  // Open popup
  const width = 500;
  const height = 600;
  const left = window.screen.width / 2 - width / 2;
  const top = window.screen.height / 2 - height / 2;
  
  return window.open(
    authUrl,
    "jsp_google_signin",
    `width=${width},height=${height},left=${left},top=${top}`
  );
}

// Append a row to a Google Sheet using Sheets API
export async function appendSheetsRow(
  accessToken: string,
  spreadsheetId: string,
  range: string,
  values: any[][]
): Promise<any> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
    range
  )}:append?valueInputOption=USER_ENTERED`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      values: values,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Sheets API Error: ${response.status} - ${errText}`);
  }

  return response.json();
}

// Create a spreadsheet named "JSP_JEE_Selector_Party_DB" and return its ID
export async function createGoogleSpreadsheet(accessToken: string): Promise<string> {
  const url = "https://sheets.googleapis.com/v4/spreadsheets";
  
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      properties: {
        title: "JSP JEE Selector Party Core Logs (IIT Delhi MnC)",
      },
      sheets: [
        {
          properties: {
            title: "TTS Daily Sheets",
          }
        },
        {
          properties: {
            title: "Doubt Solvers & Files",
          }
        }
      ]
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create spreadsheet: ${errorText}`);
  }

  const data = await response.json();
  const sheetId = data.spreadsheetId;

  // Add Headers to both sheets
  try {
    // Headers for TTS sheet
    await appendSheetsRow(accessToken, sheetId, "TTS Daily Sheets!A1", [
      [
        "Log Date",
        "Time Slot",
        "Subject",
        "Topic Description",
        "Lectures Watched",
        "Practice Questions",
        "PYQs Solved",
        "DPP Done",
        "HW Done",
        "Study Hours"
      ]
    ]);

    // Headers for Doubt tracker sheet
    await appendSheetsRow(accessToken, sheetId, "Doubt Solvers!A1", [
      [
        "Date Added",
        "Subject",
        "Chapter / Topic",
        "Question Doubt Detail",
        "Image Link (Google Drive)",
        "Notes / Resolution Hints",
        "Status"
      ]
    ]);
  } catch (err) {
    console.warn("Spreadsheet headers initializing warning", err);
  }

  return sheetId;
}

// Upload a base64 or file-blob to Google Drive and return the webViewLink
export async function uploadFileToDrive(
  accessToken: string,
  file: File,
  folderId?: string
): Promise<{ fileId: string; webViewLink: string }> {
  // First, create the file metadata
  let metadata: any = {
    name: `jsp_doubt_${Date.now()}_${file.name}`,
    mimeType: file.type,
  };
  if (folderId) {
    metadata.parents = [folderId];
  }

  const boundary = "314159265358979323846";
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  // Read file as base64 or arraybuffer
  const reader = new FileReader();
  const filePromise = new Promise<string>((resolve) => {
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1] || result;
      resolve(base64);
    };
    reader.readAsDataURL(file);
  });

  const base64Data = await filePromise;

  const multipartRequestBody =
    delimiter +
    "Content-Type: application/json; charset=UTF-8\r\n\r\n" +
    JSON.stringify(metadata) +
    delimiter +
    `Content-Type: ${file.type}\r\n` +
    "Content-Transfer-Encoding: base64\r\n\r\n" +
    base64Data +
    closeDelimiter;

  const uploadUrl = "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink";
  
  const uploadResponse = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": `multipart/related; boundary=${boundary}`,
    },
    body: multipartRequestBody,
  });

  if (!uploadResponse.ok) {
    const errText = await uploadResponse.text();
    throw new Error(`Drive Upload Error: ${uploadResponse.status} - ${errText}`);
  }

  const data = await uploadResponse.json();

  // Make the file publicly readable by anyone with the link so it renders properly in the app
  try {
    await fetch(`https://www.googleapis.com/drive/v3/files/${data.id}/permissions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        role: "reader",
        type: "anyone",
      }),
    });
  } catch (err) {
    console.warn("Failed to set open reader permission on uploaded file", err);
  }

  // Get direct viewable link or web view link
  const directLink = `https://lh3.googleusercontent.com/u/0/d/${data.id}`;
  const webViewLink = data.webViewLink || `https://drive.google.com/file/d/${data.id}/view`;

  return {
    fileId: data.id,
    webViewLink: webViewLink,
  };
}

// Call a direct Webhook (e.g. Google Apps Script) if set up
export async function sendToWebhook(url: string, payload: any): Promise<boolean> {
  try {
    const response = await fetch(url, {
      method: "POST",
      mode: "no-cors", // Apps Script redirects usually trigger CORS but still succeed
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    return true;
  } catch (e) {
    console.error("Webhook submission error:", e);
    return false;
  }
}
