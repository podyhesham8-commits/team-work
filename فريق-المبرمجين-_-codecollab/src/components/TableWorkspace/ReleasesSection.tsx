import React, { useState, useEffect } from 'react';
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  addDoc,
  getDocs
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { CommitItem, TableItem } from '../../types';
import { playSuccessSound } from '../../utils/sound';
import {
  GitCommit,
  GitBranch,
  Download,
  Plus,
  PackageCheck,
  Clock,
  Sparkles,
  FileCode2,
  FolderDown,
  CheckCircle2,
  Activity,
  Archive
} from 'lucide-react';

interface ReleasesSectionProps {
  table: TableItem;
}

export const ReleasesSection: React.FC<ReleasesSectionProps> = ({ table }) => {
  const { currentUser, userProfile } = useAuth();
  const { t } = useLanguage();

  const [commits, setCommits] = useState<CommitItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Commit Modal
  const [isCommitModalOpen, setIsCommitModalOpen] = useState(false);
  const [commitMessage, setCommitMessage] = useState('');
  const [committing, setCommitting] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Listen to commits in real-time
  useEffect(() => {
    const commitsRef = collection(db, 'tables', table.id, 'commits');
    const q = query(commitsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: CommitItem[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          list.push({
            id: docSnap.id,
            message: data.message || 'إصدار جديد للمشروع',
            authorId: data.authorId || '',
            authorName: data.authorName || 'مطور',
            filesCount: data.filesCount || 1,
            snapshotSummary: data.snapshotSummary || '',
            createdAt: data.createdAt || new Date().toISOString(),
          });
        });

        setCommits(list);
        setLoading(false);
      },
      (error) => {
        setLoading(false);
        handleFirestoreError(error, OperationType.LIST, `tables/${table.id}/commits`);
      }
    );

    return () => unsubscribe();
  }, [table.id]);

  // Handle Commit Snapshot
  const handleCreateCommit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !commitMessage.trim()) return;

    setCommitting(true);
    try {
      // Get current files count
      const filesSnap = await getDocs(collection(db, 'tables', table.id, 'files'));
      const filesCount = filesSnap.size;

      const now = new Date().toISOString();
      await addDoc(collection(db, 'tables', table.id, 'commits'), {
        message: commitMessage.trim(),
        authorId: currentUser.uid,
        authorName: userProfile?.displayName || currentUser.displayName || 'مطور',
        filesCount: filesCount || 1,
        snapshotSummary: `حفظ نسخة رسمية تضم ${filesCount} ملفات برمجية`,
        createdAt: now,
      });

      playSuccessSound();
      setIsCommitModalOpen(false);
      setCommitMessage('');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `tables/${table.id}/commits`);
    } finally {
      setCommitting(false);
    }
  };

  // Handle Export & Download All Project Files
  const handleExportProject = async () => {
    setExporting(true);
    try {
      const filesSnap = await getDocs(collection(db, 'tables', table.id, 'files'));
      const projectFiles: { name: string; content: string }[] = [];

      filesSnap.forEach((docSnap) => {
        const data = docSnap.data();
        projectFiles.push({
          name: data.name || 'file.txt',
          content: data.content || '',
        });
      });

      if (projectFiles.length === 0) {
        alert('لا توجد ملفات في المشروع لتحميلها.');
        return;
      }

      // Generate downloadable bundle JSON & separate download
      const bundleData = {
        projectName: table.name,
        category: table.category,
        exportedAt: new Date().toISOString(),
        files: projectFiles,
      };

      // Create and trigger download of main bundle
      const blob = new Blob([JSON.stringify(bundleData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${table.name.toLowerCase().replace(/\s+/g, '-')}-bundle.json`;
      link.click();
      URL.revokeObjectURL(url);

      // Also download HTML file directly if exists
      const htmlFile = projectFiles.find((f) => f.name.endsWith('.html'));
      if (htmlFile) {
        const htmlBlob = new Blob([htmlFile.content], { type: 'text/html;charset=utf-8' });
        const htmlUrl = URL.createObjectURL(htmlBlob);
        const htmlLink = document.createElement('a');
        htmlLink.href = htmlUrl;
        htmlLink.download = htmlFile.name;
        htmlLink.click();
        URL.revokeObjectURL(htmlUrl);
      }

      playSuccessSound();
    } catch (err) {
      console.error('Failed to export project', err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-lg">
      {/* Top Header */}
      <div className="h-16 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <GitBranch className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              {t('releasesTitle')}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {t('releasesSubtitle')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportProject}
            disabled={exporting}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            {exporting ? (
              <div className="w-3.5 h-3.5 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
            ) : (
              <FolderDown className="w-3.5 h-3.5 text-indigo-500" />
            )}
            <span>{t('exportProject')}</span>
          </button>

          <button
            onClick={() => setIsCommitModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <GitCommit className="w-3.5 h-3.5" />
            <span>{t('commitNow')}</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Export Banner Card */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-900/20 via-purple-900/10 to-slate-900/40 border border-indigo-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-indigo-500/20 text-indigo-400">
              <Archive className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                حزمة المشروع الجاهزة للتصدير (Export Package)
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {t('exportProjectDesc')}
              </p>
            </div>
          </div>

          <button
            onClick={handleExportProject}
            disabled={exporting}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2 cursor-pointer self-stretch md:self-auto justify-center"
          >
            <Download className="w-3.5 h-3.5" />
            <span>تحميل الأكواد والملفات الآن</span>
          </button>
        </div>

        {/* Commit History Timeline */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" />
              <span>{t('commitHistory')} ({commits.length})</span>
            </h4>
          </div>

          {loading ? (
            <div className="flex justify-center py-12 text-xs text-slate-400">
              جاري تحميل سجل الإصدارات...
            </div>
          ) : commits.length === 0 ? (
            <div className="text-center py-12 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-6 text-slate-400">
              <GitCommit className="w-8 h-8 mx-auto mb-2 text-slate-400 dark:text-slate-600" />
              <p className="text-xs font-medium">{t('noCommits')}</p>
            </div>
          ) : (
            <div className="space-y-3 relative before:absolute before:inset-0 before:start-4 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
              {commits.map((commit, idx) => (
                <div
                  key={commit.id}
                  className="relative ps-10 group"
                >
                  {/* Dot */}
                  <div className="absolute start-2.5 top-3 -translate-x-1/2 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-900 bg-indigo-500 shadow-sm" />

                  {/* Commit Box */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 hover:border-indigo-500/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 font-bold">
                          commit #{commits.length - idx}
                        </span>
                        <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                          {commit.message}
                        </h5>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {commit.snapshotSummary || 'نسخة برمجية محفوظة'}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 font-mono self-end sm:self-auto">
                      <span>بواسطة: {commit.authorName}</span>
                      <span>•</span>
                      <span>
                        {new Date(commit.createdAt).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Commit Modal */}
      {isCommitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-6">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
              {t('commitNow')}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              احفظ لقطة موثقة لجميع ملفات وأكواد المشروع الحالية مع رسالة توضيحية للفريق.
            </p>

            <form onSubmit={handleCreateCommit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('commitMessage')} *
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={commitMessage}
                  onChange={(e) => setCommitMessage(e.target.value)}
                  placeholder={t('commitPlaceholder')}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCommitModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={committing}
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 disabled:opacity-50 cursor-pointer"
                >
                  {committing ? 'جاري الحفظ...' : t('commitNow')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
