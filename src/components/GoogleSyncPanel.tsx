import React, { useState, useEffect } from "react";
import { Link2, Sparkles, Check, AlertCircle, FileText, Database, Shield, Zap, Settings, RefreshCw } from "lucide-react";
import { loadGoogleConfig, saveGoogleConfig, startGoogleAuth, createGoogleSpreadsheet, GoogleConnectionConfig } from "../lib/googleWorkspace";

export default function GoogleSyncPanel() {
  const [config, setConfig] = useState<GoogleConnectionConfig>(loadGoogleConfig);
  const [clientId, setClientId] = useState(config.clientId || "");
  const [spreadsheetId, setSpreadsheetId] = useState(config.spreadsheetId || "");
  const [webhookUrl, setWebhookUrl] = useState(config.webhookUrl || "");
  const [useWebhook, setUseWebhook] = useState(config.useWebhook || false);
  
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // Check if token is valid
    const isTokenValid = config.accessToken && config.expiresAt > Date.now();
    setIsAuthorized(!!isTokenValid);

    // Listen for OAuth successes from popup
    const handleSyncUpdate = () => {
      const refreshed = loadGoogleConfig();
      setConfig(refreshed);
      setSpreadsheetId(refreshed.spreadsheetId);
      setClientId(refreshed.clientId);
      setIsAuthorized(!!(refreshed.accessToken && refreshed.expiresAt > Date.now()));
      setStatusMessage({ text: "Authorized successfully! Connect or Auto-Create a Sheet below.", type: "success" });
    };

    window.addEventListener("jsp_google_sync_updated", handleSyncUpdate);
    return () => window.removeEventListener("jsp_google_sync_updated", handleSyncUpdate);
  }, [config]);

  const handleOAuthConnect = () => {
    if (!clientId.trim()) {
      setStatusMessage({ text: "Please enter a valid Google Client ID first.", type: "error" });
      return;
    }
    
    // Save current client ID
    const updated = { ...config, clientId: clientId.trim() };
    saveGoogleConfig(updated);
    setConfig(updated);

    setStatusMessage({ text: "Opening Google Auth popup...", type: "info" });
    startGoogleAuth(clientId.trim());
  };

  const handleAutoCreateSpreadsheet = async () => {
    if (!isAuthorized) {
      setStatusMessage({ text: "Please authorize with Google OAuth first.", type: "error" });
      return;
    }

    setIsLoading(true);
    setStatusMessage({ text: "Initializing a brand new secure Google Sheet in your Drive...", type: "info" });

    try {
      const createdId = await createGoogleSpreadsheet(config.accessToken);
      const updated = { ...config, spreadsheetId: createdId };
      saveGoogleConfig(updated);
      setConfig(updated);
      setSpreadsheetId(createdId);
      setStatusMessage({ text: "Spreadsheet created! Linked successfully: 'JSP Study Logs & Doubts'", type: "success" });
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ text: `Creation failed: ${err.message || err}`, type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateConfig = () => {
    const updated: GoogleConnectionConfig = {
      ...config,
      spreadsheetId: spreadsheetId.trim(),
      useWebhook: useWebhook,
      webhookUrl: webhookUrl.trim(),
    };
    saveGoogleConfig(updated);
    setConfig(updated);
    setStatusMessage({ text: "Integration settings saved successfully!", type: "success" });
  };

  const handleDisconnect = () => {
    const cleared: GoogleConnectionConfig = {
      clientId: clientId,
      spreadsheetId: "",
      accessToken: "",
      expiresAt: 0,
      useWebhook: false,
      webhookUrl: "",
    };
    saveGoogleConfig(cleared);
    setConfig(cleared);
    setSpreadsheetId("");
    setWebhookUrl("");
    setUseWebhook(false);
    setIsAuthorized(false);
    setStatusMessage({ text: "Spreadsheet disconnected. Reverted to secure offline mode.", type: "info" });
  };

  return (
    <div className="bg-slate-950 border border-slate-850 rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-blue-400" />
          <h3 className="text-sm font-black text-slate-100 uppercase tracking-wider font-mono">
            Google Workspace Sync Panel
          </h3>
        </div>
        <span className={`text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded ${
          isAuthorized || (useWebhook && webhookUrl)
            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
            : "bg-amber-500/10 text-amber-500 border border-amber-500/15 animate-pulse"
        }`}>
          {isAuthorized || (useWebhook && webhookUrl) ? "● Cloud Connected" : "● Offline Local Storage Active"}
        </span>
      </div>

      <p className="text-[11px] text-slate-400 leading-relaxed font-sans mt-1">
        Connect your study records and doubts log directly to your private Google Drive and Google Sheets! Double security: records are persisted locally and instantly appended to your spreadsheets with permission from you.
      </p>

      {statusMessage && (
        <div className={`p-3 rounded-lg text-xs leading-5 flex items-start gap-2 border ${
          statusMessage.type === "success"
            ? "bg-emerald-950/20 border-emerald-600/30 text-emerald-400"
            : statusMessage.type === "error"
            ? "bg-red-950/20 border-red-600/30 text-red-400"
            : "bg-blue-950/20 border-blue-600/30 text-blue-400"
        }`}>
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <p className="font-mono">{statusMessage.text}</p>
        </div>
      )}

      {/* Selector between OAuth & Webhook */}
      <div className="grid grid-cols-2 gap-2 bg-slate-900/50 p-1 rounded-lg border border-slate-850">
        <button
          onClick={() => { setUseWebhook(false); setStatusMessage(null); }}
          className={`py-1.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase transition-all ${
            !useWebhook ? "bg-blue-600 text-white shadow" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          🔑 Google OAuth 2.0
        </button>
        <button
          onClick={() => { setUseWebhook(true); setStatusMessage(null); }}
          className={`py-1.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase transition-all ${
            useWebhook ? "bg-blue-600 text-white shadow" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          ⚡ Apps Script Webhook
        </button>
      </div>

      {!useWebhook ? (
        <div className="space-y-4">
          {/* STEP 1: Client ID & Connect */}
          <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-850/60 space-y-3.5">
            <div>
              <span className="text-[8px] font-mono text-blue-400 uppercase tracking-widest font-bold">STEP 1: Client Identity Settings</span>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Use our pre-configured Client ID or drop your private Google GCP Client ID setup.
              </p>
            </div>
            
            <div className="flex flex-col md:flex-row gap-3">
              <input
                type="text"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                placeholder="Paste Client ID.apps.googleusercontent.com"
                className="flex-1 bg-slate-950 border border-slate-800 text-xs text-slate-300 p-2.5 rounded-lg focus:outline-none focus:border-blue-600 font-mono"
              />
              <button
                onClick={handleOAuthConnect}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-500 text-slate-100 font-bold text-xs font-mono px-4 py-2.5 rounded-lg transition-all shadow-md shadow-blue-600/10 flex items-center justify-center gap-1.5"
              >
                <Shield className="w-3.5 h-3.5" />
                {isAuthorized ? "Re-Authorize" : "Authorize Google"}
              </button>
            </div>
          </div>

          {/* STEP 2: Spreadsheet linking */}
          <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-850/60 space-y-3.5">
            <div>
              <span className="text-[8px] font-mono text-blue-400 uppercase tracking-widest font-bold">STEP 2: Spreadsheet Connection</span>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Enter an existing Google Sheets ID from your browser url, or click auto-create to generate one!
              </p>
            </div>

            <div className="flex flex-col md:flex-row gap-3">
              <input
                type="text"
                value={spreadsheetId}
                onChange={(e) => setSpreadsheetId(e.target.value)}
                placeholder="Google Sheet ID (eg: 1_abc123xyz...)"
                className="flex-1 bg-slate-950 border border-slate-800 text-xs text-slate-300 p-2.5 rounded-lg focus:outline-none focus:border-blue-600 font-mono"
              />
              <button
                onClick={handleAutoCreateSpreadsheet}
                disabled={isLoading || !isAuthorized}
                className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-900 disabled:text-slate-500 disabled:border-transparent text-slate-100 font-bold text-xs font-mono px-4 py-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5"
              >
                {isLoading ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                Auto-Create Sheet
              </button>
            </div>

            <div className="flex justify-end gap-2.5 pt-1.5 border-t border-slate-900/50">
              <button
                onClick={handleUpdateConfig}
                className="text-[10px] bg-slate-900 text-slate-300 font-mono hover:bg-slate-850 px-3.5 py-1.5 rounded transition"
              >
                Save Linked ID
              </button>
              {(spreadsheetId || isAuthorized) && (
                <button
                  onClick={handleDisconnect}
                  className="text-[10px] text-red-400 font-mono hover:bg-red-950/10 px-2.5 py-1.5 rounded transition"
                >
                  Clear Link
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Webhook url inputs */
        <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-850/60 space-y-3.5">
          <div>
            <span className="text-[8px] font-mono text-purple-400 uppercase tracking-widest font-bold">Google Apps Script Webhook Integration</span>
            <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">
              Create a script on your sheet to accept row posts. No cookie/token logs, stays active forever!
            </p>
          </div>

          <div className="space-y-3">
            <input
              type="text"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="Paste Apps Script Web App Deployment Exec URL..."
              className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-300 p-2.5 rounded-lg focus:outline-none focus:border-indigo-600 font-mono"
            />
            
            {/* Guide block */}
            <div className="bg-slate-950 p-2.5 rounded border border-slate-900 text-[10px] text-slate-400 space-y-1">
              <span className="text-slate-400 font-bold block">💡 Standard Google Apps Script:</span>
              <p>1. Open Google Sheets, hit Extensions &gt; Apps Script.</p>
              <p>2. Paste a simple <code className="text-indigo-400 font-mono">doPost(e)</code> implementation to append values.</p>
              <p>3. Deploy as "Web App" accessible to "Anyone" and copy URL here.</p>
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-1 border-t border-slate-900/50">
            <button
              onClick={handleUpdateConfig}
              className="text-[10px] bg-indigo-600 hover:bg-indigo-500 text-white font-mono px-3.5 py-1.5 rounded transition font-bold"
            >
              Save Webhook URL
            </button>
            {webhookUrl && (
              <button
                onClick={handleDisconnect}
                className="text-[10px] text-red-400 font-mono hover:bg-red-950/10 px-2.5 py-1.5 rounded transition"
              >
                Clear Link
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
