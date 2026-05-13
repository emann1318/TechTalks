import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Code2, Eye, Edit3, Send, AlertCircle, Info, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const Editor = ({ initialData, onSave, loading }) => {
  const [activeTab, setActiveTab] = useState('edit');
  const [postData, setPostData] = useState({
    title: initialData?.title || '',
    body: initialData?.body || '',
    tags: initialData?.tags || '',
    category: initialData?.category || 'Tutorial',
    difficulty: initialData?.difficulty || 'Beginner'
  });

  const categories = ['Tutorial', 'Opinion', 'News', 'Review', 'Case Study'];
  const difficulties = ['Beginner', 'Intermediate', 'Advanced'];

  const handleSave = () => {
    onSave({
      ...postData,
      tags: typeof postData.tags === 'string' ? postData.tags.split(',').map(t => t.trim()).filter(Boolean) : postData.tags
    });
  };

  //  renderer for preview
  const renderPreview = (content) => {
    const parts = content.split('```');
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        const lines = part.split('\n');
        const language = lines[0].trim() || 'javascript';
        const code = lines.slice(1).join('\n');
        return (
          <div key={index} className="my-6 rounded-xl overflow-hidden text-sm">
            <div className="bg-gray-800 text-gray-400 px-4 py-1 flex justify-between items-center text-[10px] font-mono">
              <span>{language.toUpperCase()}</span>
              <span>READ-ONLY</span>
            </div>
            <SyntaxHighlighter language={language} style={dracula} customStyle={{ margin: 0 }}>
              {code}
            </SyntaxHighlighter>
          </div>
        );
      }
      return <div key={index} className="whitespace-pre-wrap py-2 text-gray-700 leading-relaxed font-sans">{part}</div>;
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-gray-100">
        <button
          onClick={() => setActiveTab('edit')}
          className={`flex items-center px-6 py-4 text-sm font-bold transition-all ${
            activeTab === 'edit' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/30' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <Edit3 className="h-4 w-4 mr-2" /> Editor
        </button>
        <button
          onClick={() => setActiveTab('preview')}
          className={`flex items-center px-6 py-4 text-sm font-bold transition-all ${
            activeTab === 'preview' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/30' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <Eye className="h-4 w-4 mr-2" /> Preview
        </button>
      </div>

      <div className="p-8">
        <AnimatePresence mode="wait">
          {activeTab === 'edit' ? (
            <motion.div
              key="edit"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Category</label>
                  <select
                    value={postData.category || 'Tutorial'}
                    onChange={(e) => setPostData({ ...postData, category: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Difficulty</label>
                  <select
                    value={postData.difficulty || 'Beginner'}
                    onChange={(e) => setPostData({ ...postData, difficulty: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    {difficulties.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Post Title</label>
                <input
                  type="text"
                  value={postData.title || ''}
                  onChange={(e) => setPostData({ ...postData, title: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xl font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm font-bold text-gray-700">
                  <label>Post Body</label>
                </div>
                <textarea
                  value={postData.body || ''}
                  onChange={(e) => setPostData({ ...postData, body: e.target.value })}
                  rows={15}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-4 font-mono text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none shadow-inner"
                ></textarea>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Tags (comma separated)</label>
                <input
                  type="text"
                  value={postData.tags || ''}
                  onChange={(e) => setPostData({ ...postData, tags: e.target.value })}
                  placeholder="react, javascript, frontend"
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none placeholder:text-gray-300 shadow-inner"
                />
              </div>

              <button
                onClick={handleSave}
                disabled={loading || !postData.title || !postData.body}
                className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg shadow-indigo-200"
              >
                {loading ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : <Send className="h-5 w-5 mr-2" />}
                Publish Talk
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="preview"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="prose max-w-none min-h-150"
            >
              <div className="mb-8">
                <div className="flex items-center space-x-2 text-indigo-600 mb-2">
                  <span className="text-xs font-bold uppercase tracking-widest">{postData.category}</span>
                  <span className="h-1 w-1 bg-gray-300 rounded-full"></span>
                  <span className="text-xs font-bold uppercase tracking-widest">{postData.difficulty}</span>
                </div>
                <h1 className="text-4xl font-extrabold text-gray-900 leading-tight">
                  {postData.title || 'Draft Title'}
                </h1>
              </div>
              <div className="post-content">
                {postData.body ? renderPreview(postData.body) : <p className="text-gray-300 italic">No content to preview yet...</p>}
              </div>
              <div className="mt-10 pt-8 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={loading || !postData.title || !postData.body}
                  className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg shadow-indigo-200"
                >
                  {loading ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : <Send className="h-5 w-5 mr-2" />}
                  Publish Talk
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Editor;
