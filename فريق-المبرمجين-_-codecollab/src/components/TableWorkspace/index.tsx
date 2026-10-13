import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../firebase/config';
import { useLanguage } from '../../contexts/LanguageContext';
import { TableItem, TableMember } from '../../types';
import { CodeSection } from './CodeSection';
import { ChatSection } from './ChatSection';
import { TasksSection } from './TasksSection';
import { DocsSection } from './DocsSection';
import { ReleasesSection } from './ReleasesSection';
import { MembersModal } from './MembersModal';
import {
  Code2,
  MessageSquare,
  CheckSquare,
  FileCode2,
  GitBranch,
  Users,
  Lock,
  Unlock
} from 'lucide-react';

interface TableWorkspaceProps {
  table: TableItem;
  onBack: () => void;
  isMembersModalOpen: boolean;
  onCloseMembersModal: () => void;
}

export type WorkspaceTab = 'code' | 'chat' | 'tasks' | 'docs' | 'releases';

export const TableWorkspace: React.FC<TableWorkspaceProps> = ({
  table,
  onBack,
  isMembersModalOpen,
  onCloseMembersModal,
}) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('code');
  const [members, setMembers] = useState<TableMember[]>([]);

  // Listen to members in real-time
  useEffect(() => {
    const membersRef = collection(db, 'tables', table.id, 'members');
    const q = query(membersRef);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const memList: TableMember[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          memList.push({
            id: docSnap.id,
            userId: data.userId || docSnap.id,
            displayName: data.displayName || 'عضو',
            email: data.email || '',
            photoURL: data.photoURL || '',
            role: data.role || 'member',
            joinedAt: data.joinedAt || new Date().toISOString(),
          });
        });
        setMembers(memList);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, `tables/${table.id}/members`);
      }
    );

    return () => unsubscribe();
  }, [table.id]);

  const tabs: { id: WorkspaceTab; label: string; icon: React.FC<{ className?: string }>; badge?: number }[] = [
    { id: 'code', label: t('tabCode'), icon: Code2 },
    { id: 'chat', label: t('tabChat'), icon: MessageSquare },
    { id: 'tasks', label: t('tabTasks'), icon: CheckSquare },
    { id: 'docs', label: t('tabDocs'), icon: FileCode2 },
    { id: 'releases', label: t('tabReleases'), icon: GitBranch },
  ];

  return (
    <div className="max-w-[1600px] mx-auto px-2 sm:px-4 md:px-6 py-4">
      {/* Workspace Tabs Navigation Bar */}
      <div className="mb-4 flex items-center justify-between overflow-x-auto pb-1 gap-2">
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-indigo-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Render Active Section */}
      <div className="transition-all duration-150">
        {activeTab === 'code' && <CodeSection table={table} />}
        {activeTab === 'chat' && <ChatSection table={table} />}
        {activeTab === 'tasks' && <TasksSection table={table} members={members} />}
        {activeTab === 'docs' && <DocsSection table={table} />}
        {activeTab === 'releases' && <ReleasesSection table={table} />}
      </div>

      {/* Members Modal */}
      <MembersModal
        isOpen={isMembersModalOpen}
        onClose={onCloseMembersModal}
        table={table}
        members={members}
      />
    </div>
  );
};
