import React, { useState, useEffect } from 'react';
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
import { DocItem, TableItem } from '../../types';
import { playSuccessSound } from '../../utils/sound';
import {
  FileText,
  Plus,
  Save,
  Trash2,
  Layers,
  Terminal,
  BookOpen,
  Code2,
  Copy,
  Check,
  Sparkles,
  X
} from 'lucide-react';

interface DocsSectionProps {
  table: TableItem;
}

export const DocsSection: React.FC<DocsSectionProps> = ({ table }) => {
  const { currentUser, userProfile } = useAuth();
  const { t } = useLanguage();

  const [docsList, setDocsList] = useState<DocItem[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Editor state
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [category, setCategory] = useState<DocItem['category']>('spec');
  const [saving, setSaving] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // New Doc Modal
  const [isNewDocOpen, setIsNewDocOpen] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newCategory, setNewCategory] = useState<DocItem['category']>('spec');

  // Listen to docs in real-time
  useEffect(() => {
    const docsRef = collection(db, 'tables', table.id, 'docs');
    const q = query(docsRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: DocItem[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          list.push({
            id: docSnap.id,
            title: data.title || 'وثيقة بدون عنوان',
            content: data.content || '',
            category: data.category || 'spec',
            updatedBy: data.updatedBy || '',
            updatedByName: data.updatedByName || 'مطور',
            createdAt: data.createdAt || new Date().toISOString(),
            updatedAt: data.updatedAt || new Date().toISOString(),
          });
        });

        setDocsList(list);
        setLoading(false);

        if (list.length > 0 && !selectedDocId) {
          setSelectedDocId(list[0].id);
          setTitle(list[0].title);
          setContent(list[0].content);
          setCategory(list[0].category);
        }
      },
      (error) => {
        setLoading(false);
        handleFirestoreError(error, OperationType.LIST, `tables/${table.id}/docs`);
      }
    );

    return () => unsubscribe();
  }, [table.id]);

  const activeDoc = docsList.find((d) => d.id === selectedDocId) || docsList[0] || null;

  useEffect(() => {
    if (activeDoc) {
      setTitle(activeDoc.title);
      setContent(activeDoc.content);
      setCategory(activeDoc.category);
    }
  }, [activeDoc?.id]);

  // Handle Save
  const handleSaveDoc = async () => {
    if (!activeDoc || !currentUser) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'tables', table.id, 'docs', activeDoc.id), {
        title,
        content,
        category,
        updatedBy: currentUser.uid,
        updatedByName: userProfile?.displayName || 'مطور',
        updatedAt: new Date().toISOString(),
      });
      playSuccessSound();
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `tables/${table.id}/docs/${activeDoc.id}`);
    } finally {
      setSaving(false);
    }
  };

  // Handle Create Doc
  const handleCreateDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !newTitle.trim()) return;

    try {
      const now = new Date().toISOString();
      let defaultTemplate = '';
      if (newCategory === 'api') {
        defaultTemplate = `## مواصفات واجهة البرمجة (API Documentation)
- **Base URL**: https://api.myproject.com/v1

### 1. Endpoint: GET /api/users
- **الوصف**: جلب قائمة المستخدمين
- **المعاملات (Parameters)**:
  - \`limit\` (number): عدد العناصر
  - \`page\` (number): رقم الصفحة
- **استجابة النجاح (200 OK)**:
\`\`\`json
{
  "status": "success",
  "data": [
    { "id": "1", "name": "عبد الرحمن", "role": "admin" }
  ]
}
\`\`\``;
      } else if (newCategory === 'spec') {
        defaultTemplate = `## البنية المعمارية للنظام (System Architecture)
- **الهدف**: بناء نظام سحابي متزامن يدعم التفاعل الفوري
- **قواعد البيانات**: Firestore Realtime DB
- **الخوادم**: Cloud Run Serverless
- **المكونات الأساسية**:
  1. وحدة التوثيق والصلاحيات (Auth Module)
  2. محرك المزامنة الحية (Live Collaboration Engine)
  3. كونسول المعاينة اللحظية (Sandbox Runner)`;
      } else {
        defaultTemplate = `## ${newTitle}\n\nاكتب هنا تفاصيل وملاحظات المشروع...`;
      }

      const docRef = await addDoc(collection(db, 'tables', table.id, 'docs'), {
        title: newTitle.trim(),
        content: defaultTemplate,
        category: newCategory,
        updatedBy: currentUser.uid,
        updatedByName: userProfile?.displayName || 'مطور',
        createdAt: now,
        updatedAt: now,
      });

      setSelectedDocId(docRef.id);
      setTitle(newTitle.trim());
      setContent(defaultTemplate);
      setCategory(newCategory);
      setIsNewDocOpen(false);
      setNewTitle('');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `tables/${table.id}/docs`);
    }
  };

  // Handle Delete Doc
  const handleDeleteDoc = async (docId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('هل تريد حذف هذه الوثيقة؟')) return;
    try {
      await deleteDoc(doc(db, 'tables', table.id, 'docs', docId));
      if (selectedDocId === docId) {
        setSelectedDocId(null);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `tables/${table.id}/docs/${docId}`);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-lg">
      {/* Top Header */}
      <div className="h-14 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              {t('docsTitle')}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {t('docsSubtitle')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeDoc && (
            <button
              onClick={handleSaveDoc}
              disabled={saving}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 disabled:opacity-50 transition-all cursor-pointer"
            >
              {saving ? (
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              <span>{t('saveDoc')}</span>
            </button>
          )}

          <button
            onClick={() => setIsNewDocOpen(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t('addDoc')}</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Docs Navigator */}
        <div className="w-48 sm:w-60 border-e border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 p-3 flex flex-col shrink-0">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 px-1">
            وثائق المشروع ({docsList.length})
          </span>

          <div className="flex-1 overflow-y-auto space-y-1">
            {docsList.length === 0 ? (
              <div className="text-center py-10 text-xs text-slate-400">
                لا توجد وثائق بعد
              </div>
            ) : (
              docsList.map((d) => {
                const isSelected = d.id === activeDoc?.id;
                return (
                  <div
                    key={d.id}
                    onClick={() => setSelectedDocId(d.id)}
                    className={`group flex items-center justify-between p-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-200 dark:border-indigo-800'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{d.title}</span>
                    </div>

                    <button
                      onClick={(e) => handleDeleteDoc(d.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Editor Pane */}
        {activeDoc ? (
          <div className="flex-1 flex flex-col p-6 overflow-y-auto bg-white dark:bg-slate-900">
            {/* Title & Category Form */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              <div className="sm:col-span-2">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t('docTitle')}
                  className="w-full px-3.5 py-2 text-base font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>

              <div>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as DocItem['category'])}
                  className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                >
                  <option value="spec">{t('catSpec')}</option>
                  <option value="api">{t('catApi')}</option>
                  <option value="guide">{t('catGuide')}</option>
                  <option value="notes">{t('catNotes')}</option>
                </select>
              </div>
            </div>

            {/* Markdown Content Area */}
            <div className="flex-1 flex flex-col">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="اكتب مواصفات ومعمارية النظام وتفاصيل APIs هنا (يدعم تنسيق Markdown)..."
                className="flex-1 w-full p-4 rounded-xl text-xs sm:text-sm font-mono leading-relaxed bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>

            <div className="mt-3 text-[11px] text-slate-400 flex items-center justify-between">
              <span>آخر تعديل بواسطة: {activeDoc.updatedByName}</span>
              <span>يدعم التوثيق الفني ومخططات APIs</span>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
            <BookOpen className="w-12 h-12 mb-3 text-slate-300 dark:text-slate-700" />
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">
              لا توجد وثيقة محددة
            </p>
            <p className="text-xs max-w-sm mb-4">
              أنشئ وثيقة جديدة لتوثيق هيكل المشروع وواجهات الـ APIs أو مذكرات التيم.
            </p>
            <button
              onClick={() => setIsNewDocOpen(true)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20"
            >
              {t('addDoc')}
            </button>
          </div>
        )}
      </div>

      {/* New Doc Modal */}
      {isNewDocOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-5">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
              {t('addDoc')}
            </h4>

            <form onSubmit={handleCreateDoc} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('docTitle')} *
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="مثال: مواصفات الـ APIs ونقاط النهاية"
                  className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('docCategory')}
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as DocItem['category'])}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                >
                  <option value="spec">{t('catSpec')}</option>
                  <option value="api">{t('catApi')}</option>
                  <option value="guide">{t('catGuide')}</option>
                  <option value="notes">{t('catNotes')}</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsNewDocOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20"
                >
                  {t('addDoc')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
