import React, { useState, useRef, useEffect } from "react";
import { Send, Sparkles, MessageCircle, RefreshCw } from "lucide-react";

interface Message {
  sender: "user" | "ai";
  text: string;
  time: string;
}

export default function GuideAI() {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "ai",
      text: "Kunal, JSP AI active. IIT Delhi MnC targeted. Pucho, wahi bataunga. No extra talks.",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsgText = input;
    setInput("");
    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const newMessages = [...messages, { sender: "user", text: userMsgText, time: now }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsgText }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessages((prev) => [
          ...prev,
          {
            sender: "ai",
            text: data.reply,
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            sender: "ai",
            text: `Error: ${data.error || "Server issue"}`,
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: "Chhatra, network connection issue. Double check server status.",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg flex flex-col h-[400px] shadow-sm relative overflow-hidden">
      {/* Header */}
      <div className="bg-slate-805 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" />
          <div>
            <h3 className="text-xs font-bold text-slate-200">AI Support (Crisp)</h3>
            <p className="text-[9px] text-slate-500 font-mono">ACTIVE SELECTOR SUPPORT</p>
          </div>
        </div>
        <span className="px-2 py-0.5 rounded bg-blue-500/10 text-[9px] text-blue-400 font-mono border border-blue-500/20">
          ONLINE
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-slate-800">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded px-3 py-2 text-xs font-sans ${
                m.sender === "user"
                  ? "bg-blue-600 text-slate-50"
                  : "bg-slate-950 text-slate-200 border border-slate-800 font-normal whitespace-pre-wrap"
              }`}
            >
              <p className="leading-relaxed">{m.text}</p>
              <span className="block text-[8px] mt-1 text-slate-500 font-mono text-right">
                {m.time}
              </span>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-950 text-slate-200 border border-slate-800 rounded px-3 py-2 text-xs font-sans flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-400" />
              <span className="text-[9px] text-slate-500 font-mono">Formulating MoI sphere...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input form */}
      <form onSubmit={handleSend} className="p-2 border-t border-slate-800 bg-slate-950 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask formula, PYQ tip, doubt, or motivation..."
          className="flex-1 bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-100 placeholder-slate-650 focus:outline-none focus:border-blue-500"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="bg-blue-600 hover:bg-blue-500 text-slate-100 px-3 rounded transition duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
