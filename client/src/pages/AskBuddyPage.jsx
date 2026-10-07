import React, { useState, useRef, useEffect } from 'react';
import { useOutletContext, useParams } from 'react-router-dom';
import {
  BotMessageSquare,
  Send,
  Sparkles,
  User,
  Loader2,
  FileCode,
  ShieldCheck,
  HelpCircle,
  CornerDownLeft,
} from 'lucide-react';
import aiService from '../services/aiService.js';
import FilePreviewModal from '../components/files/FilePreviewModal.jsx';

export function AskBuddyPage() {
  const { repositoryData } = useOutletContext();
  const { owner, repo } = useParams();

  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'buddy',
      text: `Hi! I'm Buddy. I've analyzed **${repositoryData?.repository?.name || 'this repository'}** based strictly on its verified files and detected architecture.\n\nAsk me anything about how this codebase is structured, where it starts, or what technologies it uses!`,
      grounded: true,
      sources: ['README.md'],
    },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const messagesEndRef = useRef(null);

  const suggestedQuestions = [
    'Where does the application start?',
    'What technology does this project use?',
    'Explain this project like I am a beginner.',
    'Where is the frontend UI handled?',
    'Where is the backend server handled?',
    'Where is the database or data models?',
    'Where is authentication handled?',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (questionToSend) => {
    const query = questionToSend || input;
    if (!query.trim() || loading) return;

    const userMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: query.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!questionToSend) setInput('');
    setLoading(true);

    try {
      const response = await aiService.askBuddy(query.trim(), repositoryData);
      const buddyMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'buddy',
        text: response.answer,
        sources: response.sources || [],
        grounded: response.grounded,
        provider: response.provider || 'Grounded AI Engine',
      };
      setMessages((prev) => [...prev, buddyMessage]);
    } catch (err) {
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'buddy',
        text: `Sorry, I couldn't process that question: ${err.message || 'Server error'}. Please try asking about the structure or entry points.`,
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  // Helper to render text with clickable file paths
  const renderMessageContent = (text) => {
    if (!text) return null;

    // Matches `path/to/file` or standard code blocks
    const parts = text.split(/(`[^`]+`)/g);

    return parts.map((part, index) => {
      if (part.startsWith('`') && part.endsWith('`')) {
        const path = part.slice(1, -1);
        // Check if looks like a file or path
        const looksLikeFile = path.includes('/') || path.includes('.') || path.includes('package');
        if (looksLikeFile) {
          return (
            <button
              key={index}
              onClick={() => setPreviewFile({ path, fileName: path.split('/').pop() })}
              className="inline-flex items-center gap-1 font-mono text-brand-300 bg-dark-900 border border-brand-500/30 hover:bg-brand-500/10 px-1.5 py-0.5 rounded text-xs mx-0.5 transition-colors underline decoration-brand-500/40"
              title="Click to preview file"
            >
              <FileCode className="w-3 h-3 text-brand-400 shrink-0" />
              <span>{path}</span>
            </button>
          );
        }
        return (
          <code key={index} className="bg-dark-900 text-slate-200 px-1 py-0.5 rounded text-xs font-mono">
            {path}
          </code>
        );
      }
      return <span key={index} className="whitespace-pre-wrap">{part}</span>;
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Ask Buddy Banner */}
      <div className="bg-dark-900 border border-dark-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-brand-500/10 border border-brand-500/30 rounded-xl text-brand-400">
            <BotMessageSquare className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              Ask Buddy
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/30">
                Grounded
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Strictly grounded answers citing real repository paths. Zero hallucinations.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Verified Repository Context</span>
        </div>
      </div>

      {/* Suggested Questions Carousel / Chips */}
      <div>
        <p className="text-xs font-mono uppercase text-slate-400 mb-2.5 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-brand-400" />
          Suggested Questions for {repositoryData?.repository?.name}:
        </p>
        <div className="flex flex-wrap gap-2">
          {suggestedQuestions.map((q) => (
            <button
              key={q}
              onClick={() => handleSend(q)}
              disabled={loading}
              className="px-3 py-1.5 rounded-xl bg-dark-900 hover:bg-dark-800 text-slate-300 hover:text-white text-xs font-medium border border-dark-800 hover:border-dark-700 transition-all text-left disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Container */}
      <div className="bg-dark-900 border border-dark-800 rounded-2xl p-4 sm:p-6 shadow-xl min-h-[420px] max-h-[600px] overflow-y-auto flex flex-col space-y-4">
        {messages.map((msg) => {
          const isBuddy = msg.sender === 'buddy';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-[88%] ${isBuddy ? 'self-start' : 'self-end flex-row-reverse'}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                  isBuddy
                    ? 'bg-brand-500/10 border border-brand-500/30 text-brand-400'
                    : 'bg-blue-500/20 border border-blue-500/30 text-blue-400'
                }`}
              >
                {isBuddy ? <BotMessageSquare className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  isBuddy
                    ? 'bg-dark-950 border border-dark-800 text-slate-200'
                    : 'bg-brand-600 text-white font-medium rounded-tr-none'
                }`}
              >
                <div className="prose prose-invert prose-xs max-w-none">
                  {renderMessageContent(msg.text)}
                </div>

                {isBuddy && msg.provider && (
                  <div className="mt-2.5 pt-2 border-t border-dark-800/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>Source: {msg.provider}</span>
                    {msg.grounded && (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> Grounded
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-3 self-start max-w-[85%]">
            <div className="w-8 h-8 rounded-xl bg-brand-500/10 border border-brand-500/30 text-brand-400 flex items-center justify-center shrink-0">
              <BotMessageSquare className="w-4 h-4" />
            </div>
            <div className="p-4 rounded-2xl bg-dark-950 border border-dark-800 text-slate-400 text-xs flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-brand-400" />
              <span>Analyzing repository context...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Ask Buddy about ${repositoryData?.repository?.name || 'this repo'}...`}
          disabled={loading}
          className="flex-1 px-4 py-3 bg-dark-900 border border-dark-700 rounded-xl text-slate-100 text-xs sm:text-sm placeholder:text-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="px-5 py-3 rounded-xl bg-brand-500 hover:bg-brand-400 text-dark-950 font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-lg shadow-brand-500/20 disabled:opacity-50 shrink-0"
        >
          <span>Ask</span>
          <Send className="w-4 h-4" />
        </button>
      </form>

      {/* File Preview Modal when user clicks file path in answer */}
      {previewFile && (
        <FilePreviewModal
          file={previewFile}
          owner={owner}
          repo={repo}
          defaultBranch={repositoryData?.repository?.default_branch || 'main'}
          onClose={() => setPreviewFile(null)}
        />
      )}
    </div>
  );
}

export default AskBuddyPage;
