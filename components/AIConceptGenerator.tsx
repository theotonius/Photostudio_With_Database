
import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Client } from '../types.ts';
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
      /* Initializing GoogleGenAI using process.env.API_KEY as per the world-class guidelines */
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Photography Studio Assistant: Create a creative shoot concept for a client.
      Client Name: ${client.name}
      Event: ${client.eventType}
      Date: ${client.eventDate}
      Details: ${client.notes || 'No specific notes'}
      
      Please provide:
      1. A unique Theme Name
      2. Lighting & Vibe Suggestions
      3. A 10-point Shot List (Must include candid and creative poses)
      
      Format the output beautifully and professionally.`;

      /* Querying the model with the recommended gemini-3-flash-preview for text tasks */
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      /* Extracting text content directly via the .text property from GenerateContentResponse */
      if (response && response.text) {
        setConcept(response.text);
      } else {
        throw new Error("AI থেকে কোনো উত্তর পাওয়া যায়নি। পুনরায় চেষ্টা করুন।");
      }
    } catch (err: any) {
      console.error('Gemini Error:', err);
      setError(err.message || 'Error communicating with AI. Check your internet connection.');
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
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-300">
        <div className="px-8 py-6 bg-indigo-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles size={24} className="animate-pulse" />
            <h3 className="text-xl font-black tracking-tight">AI SHOOT ASSISTANT</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3 text-rose-600 text-sm font-bold">
              <AlertCircle size={20} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!concept ? (
            <div className="text-center py-12 space-y-6">
              <div className="bg-indigo-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto text-indigo-600 shadow-inner">
                <Sparkles size={48} />
              </div>
              <div className="space-y-2">
                <h4 className="text-2xl font-black text-slate-900 tracking-tight">শ্যুট আইডিয়া জেনারেট করুন</h4>
                <p className="text-slate-500 max-w-sm mx-auto font-medium">
                  আপনার ক্লায়েন্ট <strong>{client.name}</strong>-এর জন্য একটি কাস্টম ফটোগ্রাফি কনসেপ্ট তৈরি করুন।
                </p>
              </div>
              <button 
                onClick={generateConcept}
                disabled={loading}
                className="inline-flex items-center gap-3 px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-xl shadow-indigo-200"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
                {loading ? 'প্রসেসিং হচ্ছে...' : 'আইডিয়া তৈরি করুন'}
              </button>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h4 className="font-black text-slate-800 uppercase tracking-widest text-xs">আপনার কাস্টম শুট প্ল্যান</h4>
                <button 
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 text-sm font-black text-indigo-600 hover:text-indigo-700 uppercase tracking-widest"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  {copied ? 'কপি হয়েছে' : 'কপি করুন'}
                </button>
              </div>
              <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200 prose prose-slate max-w-none">
                <div className="whitespace-pre-wrap text-slate-700 font-medium leading-relaxed text-sm">
                  {concept}
                </div>
              </div>
              <button 
                onClick={() => setConcept(null)}
                className="w-full py-4 text-slate-400 font-black uppercase tracking-[0.2em] text-[10px] hover:bg-slate-50 rounded-2xl transition-colors"
              >
                নতুন আইডিয়া খুঁজুন
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIConceptGenerator;
