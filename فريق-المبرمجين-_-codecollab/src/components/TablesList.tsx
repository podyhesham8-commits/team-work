import React, { useState, useEffect } from 'react';
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  addDoc,
  serverTimestamp,
  doc,
  setDoc,
  deleteDoc,
  updateDoc
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { TableItem, TableCategory } from '../types';
import { playSuccessSound } from '../utils/sound';
import {
  Plus,
  Search,
  Users,
  Lock,
  Unlock,
  Shield,
  Trash2,
  ExternalLink,
  Code2,
  FolderCode,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  X,
  AlertCircle
} from 'lucide-react';

interface TablesListProps {
  onSelectTable: (table: TableItem) => void;
}

export const TablesList: React.FC<TablesListProps> = ({ onSelectTable }) => {
  const { currentUser, userProfile } = useAuth();
  const { t, isRtl } = useLanguage();

  const [tables, setTables] = useState<TableItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterMode, setFilterMode] = useState<'all' | 'mine'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Create Table Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [password, setPassword] = useState('');
  const [maxMembers, setMaxMembers] = useState(5);
  const [category, setCategory] = useState<TableCategory>('web');
  const [creating, setCreating] = useState(false);

  // Join Table Modal
  const [joiningTable, setJoiningTable] = useState<TableItem | null>(null);
  const [joinPassword, setJoinPassword] = useState('');
  const [joinError, setJoinError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);

  // Listen to tables in real-time
  useEffect(() => {
    const tablesRef = collection(db, 'tables');
    const q = query(tablesRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: TableItem[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          list.push({
            id: docSnap.id,
            name: data.name || 'بدون اسم',
            description: data.description || '',
            isPrivate: Boolean(data.isPrivate),
            password: data.password || '',
            maxMembers: data.maxMembers || 5,
            category: data.category || 'web',
            creatorId: data.creatorId || '',
            creatorName: data.creatorName || '',
            creatorPhoto: data.creatorPhoto || '',
            memberCount: data.memberCount || 1,
            memberIds: data.memberIds || [],
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : (data.createdAt || new Date().toISOString()),
            updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : (data.updatedAt || new Date().toISOString()),
          });
        });
        setTables(list);
        setLoading(false);
      },
      (error) => {
        setLoading(false);
        handleFirestoreError(error, OperationType.LIST, 'tables');
      }
    );

    return () => unsubscribe();
  }, []);

  // Handle Create Table
  const handleCreateTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !name.trim()) return;

    setCreating(true);
    try {
      const now = new Date().toISOString();
      const newTableData = {
        name: name.trim(),
        description: description.trim(),
        isPrivate,
        password: isPrivate ? password.trim() : '',
        maxMembers: Number(maxMembers) || 5,
        category,
        creatorId: currentUser.uid,
        creatorName: userProfile?.displayName || currentUser.displayName || 'مطور',
        creatorPhoto: userProfile?.photoURL || currentUser.photoURL || '',
        memberCount: 1,
        memberIds: [currentUser.uid],
        createdAt: now,
        updatedAt: now
      };

      const docRef = await addDoc(collection(db, 'tables'), newTableData);

      // Add creator as owner member
      await setDoc(doc(db, 'tables', docRef.id, 'members', currentUser.uid), {
        userId: currentUser.uid,
        displayName: userProfile?.displayName || currentUser.displayName || 'مطور',
        email: currentUser.email || '',
        photoURL: userProfile?.photoURL || currentUser.photoURL || '',
        role: 'owner',
        joinedAt: now
      });

      // Create default starter starter files for this table workspace
      const starterHtml = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <title>${name}</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <div class="card">
    <h1>🚀 مرحباً بكم في ${name}</h1>
    <p>${description || 'بيئة عمل برمجية تفاعلية للفريق'}</p>
    <button id="btn">اضغط للتجربة</button>
    <div id="output"></div>
  </div>
  <script src="app.js"></script>
</body>
</html>`;

      const starterCss = `body {
  font-family: system-ui, -apple-system, sans-serif;
  background: #0f172a;
  color: #f8fafc;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  margin: 0;
}
.card {
  background: #1e293b;
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
  border: 1px solid #334155;
  text-align: center;
  max-width: 400px;
}
button {
  background: #6366f1;
  color: white;
  border: none;
  padding: 0.6rem 1.4rem;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: 0.2s;
}
button:hover {
  background: #4f46e5;
  transform: scale(1.05);
}
#output {
  margin-top: 1rem;
  font-size: 0.9rem;
  color: #38bdf8;
}`;

      const starterJs = `document.getElementById('btn').addEventListener('click', () => {
  const output = document.getElementById('output');
  output.textContent = '✨ تم تشغيل الكود بنجاح من بيئة العمل المشتركة!';
  console.log('فريق العمل متصل والبيئة نشطة!');
});`;

      await addDoc(collection(db, 'tables', docRef.id, 'files'), {
        name: 'index.html',
        language: 'html',
        content: starterHtml,
        lastModifiedBy: currentUser.uid,
        lastModifiedByName: userProfile?.displayName || 'مطور',
        createdAt: now,
        updatedAt: now
      });

      await addDoc(collection(db, 'tables', docRef.id, 'files'), {
        name: 'style.css',
        language: 'css',
        content: starterCss,
        lastModifiedBy: currentUser.uid,
        lastModifiedByName: userProfile?.displayName || 'مطور',
        createdAt: now,
        updatedAt: now
      });

      await addDoc(collection(db, 'tables', docRef.id, 'files'), {
        name: 'app.js',
        language: 'javascript',
        content: starterJs,
        lastModifiedBy: currentUser.uid,
        lastModifiedByName: userProfile?.displayName || 'مطور',
        createdAt: now,
        updatedAt: now
      });

      // Add a welcome chat message
      await addDoc(collection(db, 'tables', docRef.id, 'messages'), {
        text: `أهلاً بالجميع في غرفة العمل الجديدة (${name})! 🎉 يمكننا الآن كتابة الكود ومشاركة الأفكار والمهام معاً.`,
        senderId: currentUser.uid,
        senderName: userProfile?.displayName || 'منشئ الغرفة',
        senderPhoto: userProfile?.photoURL || '',
        createdAt: now
      });

      playSuccessSound();
      setIsCreateOpen(false);
      setName('');
      setDescription('');
      setIsPrivate(false);
      setPassword('');

      // Open new table directly
      const createdItem: TableItem = {
        ...newTableData,
        id: docRef.id
      };
      onSelectTable(createdItem);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'tables');
    } finally {
      setCreating(false);
    }
  };

  // Handle Join Table
  const handleJoinClick = (table: TableItem) => {
    if (!currentUser) return;
    const isMember = table.memberIds?.includes(currentUser.uid) || table.creatorId === currentUser.uid;

    if (isMember) {
      onSelectTable(table);
      return;
    }

    if (table.memberCount >= table.maxMembers) {
      alert(t('roomFull'));
      return;
    }

    if (table.isPrivate) {
      setJoiningTable(table);
      setJoinPassword('');
      setJoinError(null);
    } else {
      executeJoin(table);
    }
  };

  const executeJoin = async (table: TableItem) => {
    if (!currentUser) return;
    setJoining(true);
    setJoinError(null);

    try {
      const now = new Date().toISOString();
      const updatedMembers = [...(table.memberIds || []), currentUser.uid];
      const newCount = (table.memberCount || 1) + 1;

      // Add member subdocument
      await setDoc(doc(db, 'tables', table.id, 'members', currentUser.uid), {
        userId: currentUser.uid,
        displayName: userProfile?.displayName || currentUser.displayName || 'مطور',
        email: currentUser.email || '',
        photoURL: userProfile?.photoURL || currentUser.photoURL || '',
        role: 'member',
        joinedAt: now
      });

      // Update table metadata
      await updateDoc(doc(db, 'tables', table.id), {
        memberCount: newCount,
        memberIds: updatedMembers,
        updatedAt: now
      });

      // Add notification in chat
      await addDoc(collection(db, 'tables', table.id, 'messages'), {
        text: `👋 انضم ${userProfile?.displayName || 'مطور جديد'} إلى الفريق!`,
        senderId: currentUser.uid,
        senderName: userProfile?.displayName || 'عضو جديد',
        senderPhoto: userProfile?.photoURL || '',
        createdAt: now
      });

      playSuccessSound();
      setJoiningTable(null);
      onSelectTable({
        ...table,
        memberCount: newCount,
        memberIds: updatedMembers
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `tables/${table.id}`);
    } finally {
      setJoining(false);
    }
  };

  const submitJoinWithPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joiningTable) return;

    if (joiningTable.password && joinPassword !== joiningTable.password) {
      setJoinError(t('passwordIncorrect'));
      return;
    }

    executeJoin(joiningTable);
  };

  // Handle Delete Table
  const handleDeleteTable = async (tableId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(t('confirmDeleteTable'))) return;

    try {
      await deleteDoc(doc(db, 'tables', tableId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `tables/${tableId}`);
    }
  };

  // Filtering
  const filteredTables = tables.filter((table) => {
    if (filterMode === 'mine' && currentUser) {
      const isMine = table.creatorId === currentUser.uid || table.memberIds?.includes(currentUser.uid);
      if (!isMine) return false;
    }

    if (selectedCategory !== 'all' && table.category !== selectedCategory) {
      return false;
    }

    if (searchQuery.trim()) {
      const queryLower = searchQuery.toLowerCase();
      const matchName = table.name.toLowerCase().includes(queryLower);
      const matchDesc = table.description.toLowerCase().includes(queryLower);
      const matchCat = table.category.toLowerCase().includes(queryLower);
      if (!matchName && !matchDesc && !matchCat) return false;
    }

    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Top Banner and Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <span>{t('allTables')}</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-mono font-bold">
              {tables.length}
            </span>
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            اختر بيئة عمل للانضمام والبرمجة مع فريقك، أو أنشئ تيبول جديد لمشروعك
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/25 hover:shadow-indigo-500/40 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{t('createTable')}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm mb-8 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 self-start md:self-auto">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              filterMode === 'all'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t('allTables')}
          </button>
          <button
            onClick={() => setFilterMode('mine')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              filterMode === 'mine'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t('myTables')}
          </button>
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
          {[
            { id: 'all', label: t('allCategories') },
            { id: 'web', label: t('catWeb') },
            { id: 'mobile', label: t('catMobile') },
            { id: 'fullstack', label: t('catFullstack') },
            { id: 'ai', label: t('catAi') },
            { id: 'backend', label: t('catBackend') },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2.5 py-1 rounded-lg text-xs whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 font-semibold'
                  : 'bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 border border-transparent hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 start-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('searchTables')}
            className="w-full ps-9 pe-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          />
        </div>
      </div>

      {/* Tables Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <div className="w-8 h-8 border-3 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-3" />
          <p className="text-sm">جاري تحميل غرف العمل من Firestore...</p>
        </div>
      ) : filteredTables.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-4">
            <FolderCode className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
            لا توجد غرف مطابقة
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-6">
            كن أول من يبدأ بإنشاء بيئة عمل لفريقك ودعوة زملائك للمشاركة في البرمجة.
          </p>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t('createTable')}</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTables.map((table) => {
            const isMember = table.memberIds?.includes(currentUser?.uid || '') || table.creatorId === currentUser?.uid;
            const isCreator = table.creatorId === currentUser?.uid;
            const isFull = table.memberCount >= table.maxMembers;

            return (
              <div
                key={table.id}
                onClick={() => handleJoinClick(table)}
                className="group relative flex flex-col justify-between p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-200 cursor-pointer overflow-hidden"
              >
                {/* Top badges */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 uppercase tracking-wide">
                      {table.category}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {table.isPrivate ? (
                        <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-medium">
                          <Lock className="w-3 h-3" />
                          <span>{t('privateRoom')}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-medium">
                          <Unlock className="w-3 h-3" />
                          <span>{t('publicRoom')}</span>
                        </span>
                      )}

                      {isCreator && (
                        <button
                          onClick={(e) => handleDeleteTable(table.id, e)}
                          className="p-1 rounded-md text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          title={t('deleteTable')}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-2 line-clamp-1">
                    {table.name}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-4">
                    {table.description || 'بيئة عمل برمجية تعاونية تضم محرراً حياً، شات الفريق، ولوحة إدارة المهام.'}
                  </p>
                </div>

                {/* Bottom Meta & Action */}
                <div>
                  {/* Capacity Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                      <span className="flex items-center gap-1 font-medium">
                        <Users className="w-3.5 h-3.5 text-indigo-500" />
                        <span>{t('membersCount')}: {table.memberCount} / {table.maxMembers}</span>
                      </span>
                      {isFull && <span className="text-rose-500 font-semibold">{t('roomFull')}</span>}
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isFull ? 'bg-rose-500' : 'bg-indigo-500'
                        }`}
                        style={{ width: `${Math.min(100, (table.memberCount / table.maxMembers) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Creator and Join Button */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img
                        src={table.creatorPhoto || `https://api.dicebear.com/7.x/bottts/svg?seed=${table.creatorId}`}
                        alt={table.creatorName}
                        className="w-6 h-6 rounded-full object-cover bg-slate-200 dark:bg-slate-700"
                      />
                      <span className="text-[11px] text-slate-600 dark:text-slate-400 font-medium truncate max-w-[100px]">
                        {table.creatorName}
                      </span>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        isMember
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white'
                          : isFull
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                          : 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 group-hover:bg-indigo-600 group-hover:text-white'
                      }`}
                    >
                      <span>{isMember ? 'دخول الغرفة' : t('joinTable')}</span>
                      {isRtl ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Table Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  <Code2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {t('createNewTable')}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    حدد تفاصيل الغرفة البرمجية وكلمة السر وسعة الفريق
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTable} className="p-6 space-y-4 overflow-y-auto">
              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {t('tableName')} *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('tableNamePlaceholder')}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {t('tableDescription')}
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t('tableDescPlaceholder')}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>

              {/* Category & Max members */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    {t('categoryLabel')}
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as TableCategory)}
                    className="w-full px-3 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  >
                    <option value="web">{t('catWeb')}</option>
                    <option value="mobile">{t('catMobile')}</option>
                    <option value="fullstack">{t('catFullstack')}</option>
                    <option value="ai">{t('catAi')}</option>
                    <option value="backend">{t('catBackend')}</option>
                    <option value="game">{t('catGame')}</option>
                    <option value="general">{t('catGeneral')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    {t('maxMembersLabel')}
                  </label>
                  <input
                    type="number"
                    min={2}
                    max={50}
                    value={maxMembers}
                    onChange={(e) => setMaxMembers(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>
              </div>

              {/* Password Protection */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {isPrivate ? (
                      <Lock className="w-4 h-4 text-amber-500" />
                    ) : (
                      <Unlock className="w-4 h-4 text-slate-400" />
                    )}
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {t('isPrivateLabel')}
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={isPrivate}
                    onChange={(e) => setIsPrivate(e.target.checked)}
                    className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                  />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">
                  {t('passwordHint')}
                </p>

                {isPrivate && (
                  <div>
                    <input
                      type="text"
                      required={isPrivate}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t('passwordPlaceholder')}
                      className="w-full px-3.5 py-2 rounded-lg text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 font-mono"
                    />
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 disabled:opacity-50 cursor-pointer flex items-center gap-2"
                >
                  {creating && <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  <span>{t('create')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Join Password Protected Modal */}
      {joiningTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {joiningTable.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t('enterPasswordToJoin')}
                </p>
              </div>
            </div>

            <form onSubmit={submitJoinWithPassword} className="space-y-4">
              <input
                type="password"
                required
                autoFocus
                value={joinPassword}
                onChange={(e) => setJoinPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 font-mono text-center tracking-widest"
              />

              {joinError && (
                <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{joinError}</span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setJoiningTable(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={joining}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 disabled:opacity-50 cursor-pointer flex items-center gap-2"
                >
                  {joining && <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  <span>{t('join')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
