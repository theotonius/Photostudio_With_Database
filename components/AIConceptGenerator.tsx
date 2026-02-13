
import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Client } from '../types';
import { X, Sparkles, Loader2, Copy, Check, AlertCircle } from 'lucide-react';

interface AIConceptGeneratorProps {
  client: Client;
  onClose: () => void;
}

const AIConceptGenerator: React.FC<AIConceptGeneratorProps> = ({ client, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [concept, setConcept] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateConcept = async () => {
    setLoading(true);
    setError(null);
    try {
      const apiKey = process.env.API_KEY;
      if (!apiKey) {
        throw new Error("API Key missing. Please configure it in your environment settings.");
      }

      const ai = new GoogleGenAI({ apiKey });
      const prompt = `Create a creative photography shoot concept and shot list for a client named ${client.name} for their ${client.eventType} event on ${client.eventDate}. 
      Details: ${client.notes || 'Standard shoot'}. 
      Package: ${client.package}. 
      Please provide a theme name, lighting suggestions, and a 10-point shot list. Be professional and creative. Output in a clear format.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      if (response && response.text) {
        setConcept(response.text);
      } else {
        throw new Error("Received an empty response from AI.");
      }
    } catch (err: any) {
      console.error('Error generating concept:', err);
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (concept) {
      navigator.clipboard.writeText(concept);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
        <div className="px-6 py-4 bg-indigo-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={20} />
            <h3 className="text-lg font-bold">AI Shot Assistant</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-indigo-500 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3 text-rose-600 text-sm font-bold">
              <AlertCircle size={20} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!concept ? (
            <div className="text-center py-12 space-y-4">
              <div className="bg-indigo-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto text-indigo-600">
                <Sparkles size={40} />
              </div>
              <div>
                <h4 className="text-xl font-bold text-slate-800">Generate Shoot Ideas</h4>
                <p className="text-slate-500 max-w-sm mx-auto mt-2">
                  Let Gemini create a professional theme and shot list specifically for {client.name}'s {client.eventType}.
                </p>
              </div>
              <button 
                onClick={generateConcept}
                disabled={loading}
                className="inline-flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-lg shadow-indigo-100"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
                {loading ? 'Thinking...' : 'Generate Plan'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-800">Your Custom Shoot Plan</h4>
                <button 
                  onClick={copyToClipboard}
                  className="flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  {copied ? 'Copied' : 'Copy Text'}
                </button>
              </div>
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 prose prose-slate max-w-none">
                <div className="whitespace-pre-wrap text-slate-700 font-medium leading-relaxed">
                  {concept}
                </div>
              </div>
              <button 
                onClick={() => setConcept(null)}
                className="w-full py-3 text-slate-500 font-semibold hover:bg-slate-50 rounded-xl transition-colors"
              >
                Generate Another Version
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIConceptGenerator;
