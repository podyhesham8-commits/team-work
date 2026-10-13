import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  addDoc,
  doc,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { CodeFile, TableItem } from '../../types';
import {
  FileCode2,
  Plus,
  Play,
  RotateCcw,
  Copy,
  Download,
  Trash2,
  Check,
  Eye,
  EyeOff,
  Terminal,
  Sparkles,
  FileText,
  Code2,
  Laptop
} from 'lucide-react';

interface CodeSectionProps {
  table: TableItem;
}

export const CodeSection: React.FC<CodeSectionProps> = ({ table }) => {
  const { currentUser, userProfile } = useAuth();
  const { t, isRtl } = useLanguage();

  const [files, setFiles] = useState<CodeFile[]>([]);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Editor state
  const [editorContent, setEditorContent] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [showPreview, setShowPreview] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'preview' | 'console'>('preview');
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const [copied, setCopied] = useState<boolean>(false);

  // New file modal
  const [isNewFileModalOpen, setIsNewFileModalOpen] = useState(false);
  const [newFileName, setNewFileName] = useState('');

  // Debounce ref for writing to Firestore
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isLocalUpdateRef = useRef<boolean>(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 1. Listen to files in this table
  useEffect(() => {
    const filesRef = collection(db, 'tables', table.id, 'files');
    const q = query(filesRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fileList: CodeFile[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          fileList.push({
            id: docSnap.id,
            name: data.name || 'file.txt',
            language: data.language || 'javascript',
            content: data.content ?? '',
            lastModifiedBy: data.lastModifiedBy || '',
            lastModifiedByName: data.lastModifiedByName || 'مطور',
            createdAt: data.createdAt || new Date().toISOString(),
            updatedAt: data.updatedAt || new Date().toISOString(),
          });
        });

        setFiles(fileList);
        setLoading(false);

        // Auto select first file if none selected
        if (fileList.length > 0 && !selectedFileId) {
          setSelectedFileId(fileList[0].id);
          setEditorContent(fileList[0].content);
        }
      },
      (error) => {
        setLoading(false);
        handleFirestoreError(error, OperationType.LIST, `tables/${table.id}/files`);
      }
    );

    return () => unsubscribe();
  }, [table.id]);

  // 2. Sync active file content
  const activeFile = useMemo(() => {
    return files.find((f) => f.id === selectedFileId) || files[0] || null;
  }, [files, selectedFileId]);

  useEffect(() => {
    if (activeFile && !isLocalUpdateRef.current) {
      setEditorContent(activeFile.content);
    }
  }, [activeFile]);

  // Handle local text editing with live debounce to Firestore
  const handleContentChange = (newVal: string) => {
    setEditorContent(newVal);
    isLocalUpdateRef.current = true;
    setIsTyping(true);

    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    updateTimeoutRef.current = setTimeout(async () => {
      if (!activeFile || !currentUser) return;

      try {
        const fileDocRef = doc(db, 'tables', table.id, 'files', activeFile.id);
        await updateDoc(fileDocRef, {
          content: newVal,
          lastModifiedBy: currentUser.uid,
          lastModifiedByName: userProfile?.displayName || currentUser.displayName || 'مطور',
          updatedAt: new Date().toISOString()
        });
      } catch (err) {
        console.error('Error auto-syncing code file:', err);
      } finally {
        isLocalUpdateRef.current = false;
        setIsTyping(false);
      }
    }, 400); // 400ms instant real-time sync
  };

  // Keyboard shortcut: Tab indentation inside code editor
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;

      const newContent = editorContent.substring(0, start) + '  ' + editorContent.substring(end);
      handleContentChange(newContent);

      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
        }
      }, 0);
    }
  };

  // Detect language helper
  const detectLanguage = (filename: string): CodeFile['language'] => {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (ext === 'html' || ext === 'htm') return 'html';
    if (ext === 'css') return 'css';
    if (ext === 'js' || ext === 'jsx') return 'javascript';
    if (ext === 'ts' || ext === 'tsx') return 'typescript';
    if (ext === 'py') return 'python';
    if (ext === 'json') return 'json';
    return 'markdown';
  };

  // Handle Add File
  const handleCreateFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName.trim() || !currentUser) return;

    const trimmed = newFileName.trim();
    const lang = detectLanguage(trimmed);

    let defaultContent = '';
    if (lang === 'html') {
      defaultContent = `<!DOCTYPE html>\n<html>\n<head>\n  <title>${trimmed}</title>\n</head>\n<body>\n  <h2>مرحباً بك!</h2>\n</body>\n</html>`;
    } else if (lang === 'css') {
      defaultContent = `/* أنماط ${trimmed} */\nbody {\n  margin: 0;\n  padding: 1rem;\n}`;
    } else if (lang === 'javascript') {
      defaultContent = `// كود ${trimmed}\nconsole.log('تشغيل الملف بنجاح');`;
    } else if (lang === 'python') {
      defaultContent = `# برنامج بايثون: ${trimmed}\nprint("مرحباً بكم في بيئة بايثون")`;
    } else if (lang === 'json') {
      defaultContent = `{\n  "version": "1.0.0",\n  "name": "${trimmed}"\n}`;
    } else {
      defaultContent = `# ${trimmed}\n\nاكتب محتواك هنا...`;
    }

    try {
      const now = new Date().toISOString();
      const docRef = await addDoc(collection(db, 'tables', table.id, 'files'), {
        name: trimmed,
        language: lang,
        content: defaultContent,
        lastModifiedBy: currentUser.uid,
        lastModifiedByName: userProfile?.displayName || 'مطور',
        createdAt: now,
        updatedAt: now
      });

      setSelectedFileId(docRef.id);
      setEditorContent(defaultContent);
      setIsNewFileModalOpen(false);
      setNewFileName('');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `tables/${table.id}/files`);
    }
  };

  // Handle Delete File
  const handleDeleteFile = async (fileId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (files.length <= 1) {
      alert('لا يمكن حذف آخر ملف في المشروع.');
      return;
    }
    if (!window.confirm('هل تريد بالتأكيد حذف هذا الملف؟')) return;

    try {
      await deleteDoc(doc(db, 'tables', table.id, 'files', fileId));
      if (selectedFileId === fileId) {
        const remaining = files.filter((f) => f.id !== fileId);
        if (remaining.length > 0) {
          setSelectedFileId(remaining[0].id);
          setEditorContent(remaining[0].content);
        }
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `tables/${table.id}/files/${fileId}`);
    }
  };

  // Copy code
  const handleCopyCode = () => {
    navigator.clipboard.writeText(editorContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download file
  const handleDownloadFile = () => {
    if (!activeFile) return;
    const blob = new Blob([editorContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = activeFile.name;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Build live preview HTML source bundle
  const livePreviewSrc = useMemo(() => {
    const htmlFile = files.find((f) => f.name.endsWith('.html')) || activeFile;
    const cssFiles = files.filter((f) => f.name.endsWith('.css'));
    const jsFiles = files.filter((f) => f.name.endsWith('.js'));

    const cssBundle = cssFiles.map((f) => `<style>/* ${f.name} */\n${f.content}\n</style>`).join('\n');
    const jsBundle = jsFiles.map((f) => `<script>/* ${f.name} */\ntry {\n${f.content}\n} catch(err) { console.error(err); }\n</script>`).join('\n');

    let baseHtml = htmlFile?.language === 'html' ? htmlFile.content : `<div style="font-family: sans-serif; padding: 2rem;"><h2>${activeFile?.name || 'Preview'}</h2><pre style="background: #1e293b; color: #f8fafc; padding: 1rem; border-radius: 8px;">${editorContent.replace(/</g, '&lt;')}</pre></div>`;

    // Inject console interceptor
    const consoleInterceptor = `
      <script>
        (function() {
          const originalLog = console.log;
          const originalError = console.error;
          console.log = function(...args) {
            window.parent.postMessage({ type: 'CONSOLE_LOG', data: args.join(' ') }, '*');
            originalLog.apply(console, args);
          };
          console.error = function(...args) {
            window.parent.postMessage({ type: 'CONSOLE_LOG', data: '❌ ' + args.join(' ') }, '*');
            originalError.apply(console, args);
          };
        })();
      </script>
    `;

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          ${consoleInterceptor}
          ${cssBundle}
        </head>
        <body>
          ${baseHtml}
          ${jsBundle}
        </body>
      </html>
    `;
  }, [files, activeFile, editorContent]);

  // Listen to iframe console messages
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.data?.type === 'CONSOLE_LOG') {
        setConsoleLogs((prev) => [...prev.slice(-49), event.data.data]);
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  // Compute line numbers
  const lineCount = useMemo(() => {
    return Math.max(1, editorContent.split('\n').length);
  }, [editorContent]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-400">
        <div className="w-8 h-8 border-3 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-3" />
        <p className="text-sm">جاري تهيئة بيئة البرمجة ومزامنة الملفات...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden shadow-lg">
      {/* Top IDE Toolbar */}
      <div className="h-12 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 px-4 flex items-center justify-between text-xs">
        {/* Left: Active file info & Live Sync indicator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-mono text-slate-700 dark:text-slate-200 font-semibold">
            <FileCode2 className="w-4 h-4 text-indigo-500" />
            <span>{activeFile?.name || 'index.html'}</span>
          </div>

          <div className="h-4 w-px bg-slate-300 dark:bg-slate-700" />

          {/* Sync badge */}
          <div className="flex items-center gap-1.5 text-[11px]">
            <span className={`w-2 h-2 rounded-full ${isTyping ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'}`} />
            <span className="text-slate-500 dark:text-slate-400 font-medium">
              {isTyping ? t('typingNow') : t('liveSyncActive')}
            </span>
          </div>

          {activeFile && (
            <span className="text-[10px] text-slate-400 hidden lg:inline">
              (آخر تعديل بواسطة: {activeFile.lastModifiedByName})
            </span>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCopyCode}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            title={t('copyCode')}
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copied ? t('copied') : t('copyCode')}</span>
          </button>

          <button
            onClick={handleDownloadFile}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            title={t('downloadFile')}
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t('downloadFile')}</span>
          </button>

          <button
            onClick={() => setShowPreview(!showPreview)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border transition-colors cursor-pointer ${
              showPreview
                ? 'border-indigo-500/50 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            {showPreview ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{t('livePreview')}</span>
          </button>
        </div>
      </div>

      {/* Main IDE Workspace Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar: File Explorer */}
        <div className="w-48 sm:w-56 border-e border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 flex flex-col shrink-0">
          <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t('files')} ({files.length})
            </span>
            <button
              onClick={() => setIsNewFileModalOpen(true)}
              className="p-1 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              title={t('newFile')}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Files List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {files.map((file) => {
              const isSelected = file.id === (activeFile?.id || '');
              return (
                <div
                  key={file.id}
                  onClick={() => {
                    setSelectedFileId(file.id);
                    setEditorContent(file.content);
                  }}
                  className={`group flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white font-medium shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileCode2 className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-white' : 'text-indigo-400'}`} />
                    <span className="truncate">{file.name}</span>
                  </div>

                  {files.length > 1 && (
                    <button
                      onClick={(e) => handleDeleteFile(file.id, e)}
                      className={`opacity-0 group-hover:opacity-100 p-0.5 rounded transition-opacity ${
                        isSelected ? 'hover:text-rose-200' : 'hover:text-rose-500'
                      }`}
                      title="حذف الملف"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Center: Live Editor */}
        <div className={`flex-1 flex flex-col bg-slate-950 text-slate-100 overflow-hidden ${showPreview ? 'w-1/2' : 'w-full'}`}>
          <div className="flex-1 flex overflow-hidden">
            {/* Line numbers */}
            <div className="w-12 py-3 bg-slate-950/80 border-e border-slate-800/80 text-right pe-3 text-[11px] font-mono text-slate-600 select-none overflow-hidden shrink-0">
              {Array.from({ length: lineCount }).map((_, i) => (
                <div key={i} className="leading-6">
                  {i + 1}
                </div>
              ))}
            </div>

            {/* Code TextArea */}
            <div className="flex-1 relative overflow-auto p-3">
              <textarea
                ref={textareaRef}
                value={editorContent}
                onChange={(e) => handleContentChange(e.target.value)}
                onKeyDown={handleKeyDown}
                spellCheck={false}
                autoCapitalize="off"
                autoComplete="off"
                dir="ltr"
                className="w-full h-full bg-transparent text-slate-200 font-mono text-xs sm:text-sm leading-6 resize-none focus:outline-none focus:ring-0 selection:bg-indigo-600/40"
                placeholder={t('defaultFilePlaceholder')}
              />
            </div>
          </div>

          {/* Editor Status Bar */}
          <div className="h-7 border-t border-slate-800 bg-slate-950 px-3 flex items-center justify-between text-[11px] font-mono text-slate-500">
            <div className="flex items-center gap-3">
              <span>{activeFile?.language.toUpperCase() || 'CODE'}</span>
              <span>UTF-8</span>
              <span>{lineCount} lines</span>
            </div>
            <div>
              <span>Tab Size: 2</span>
            </div>
          </div>
        </div>

        {/* Right: Live Preview & Terminal Pane */}
        {showPreview && (
          <div className="w-full md:w-1/2 border-s border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 flex flex-col">
            {/* Sub-tabs: Preview / Console */}
            <div className="h-9 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 px-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('preview')}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                    activeTab === 'preview'
                      ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  {t('livePreview')}
                </button>
                <button
                  onClick={() => setActiveTab('console')}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'console'
                      ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>الكونسول</span>
                  {consoleLogs.length > 0 && (
                    <span className="w-4 h-4 rounded-full bg-indigo-500/20 text-indigo-400 text-[10px] flex items-center justify-center font-bold">
                      {consoleLogs.length}
                    </span>
                  )}
                </button>
              </div>

              {activeTab === 'console' && (
                <button
                  onClick={() => setConsoleLogs([])}
                  className="text-[11px] text-slate-500 hover:text-rose-500 transition-colors"
                >
                  {t('clearConsole')}
                </button>
              )}
            </div>

            {/* Pane Content */}
            <div className="flex-1 relative overflow-hidden bg-white dark:bg-slate-950">
              {activeTab === 'preview' ? (
                <iframe
                  title="Live Preview"
                  sandbox="allow-scripts allow-modals allow-forms allow-same-origin"
                  srcDoc={livePreviewSrc}
                  className="w-full h-full border-none bg-white"
                />
              ) : (
                <div className="h-full p-4 overflow-y-auto font-mono text-xs text-slate-300 space-y-1.5 bg-slate-950" dir="ltr">
                  <div className="text-slate-500 pb-2 border-b border-slate-800">
                    // Console Output Terminal (Live Logger)
                  </div>
                  {consoleLogs.length === 0 ? (
                    <div className="text-slate-600 italic py-4">
                      No console logs yet. Use console.log() in your code to see output here.
                    </div>
                  ) : (
                    consoleLogs.map((log, idx) => (
                      <div key={idx} className="flex gap-2 text-slate-200">
                        <span className="text-indigo-400 select-none">&gt;</span>
                        <span className="break-all">{log}</span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* New File Modal */}
      {isNewFileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-5">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
              {t('newFile')}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              {t('fileNamePrompt')}
            </p>

            <form onSubmit={handleCreateFile} className="space-y-4">
              <input
                type="text"
                required
                autoFocus
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                placeholder="component.js أو styles.css"
                className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewFileModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 cursor-pointer"
                >
                  {t('newFile')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
