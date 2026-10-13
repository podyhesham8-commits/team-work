import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { TableItem, TableMember } from '../../types';
import {
  Users,
  X,
  Crown,
  Shield,
  Lock,
  Copy,
  Check,
  UserCheck,
  Share2
} from 'lucide-react';

interface MembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  table: TableItem;
  members: TableMember[];
}

export const MembersModal: React.FC<MembersModalProps> = ({
  isOpen,
  onClose,
  table,
  members,
}) => {
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  const [copiedPass, setCopiedPass] = React.useState(false);

  if (!isOpen) return null;

  const handleCopyPasscode = () => {
    if (table.password) {
      navigator.clipboard.writeText(table.password);
      setCopiedPass(true);
      setTimeout(() => setCopiedPass(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                أعضاء الفريق ({members.length} / {table.maxMembers})
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                المبرمجون المشاركون في هذه الغرفة
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Members List */}
        <div className="p-6 overflow-y-auto space-y-3">
          {/* Room Passcode Badge if private */}
          {table.isPrivate && table.password && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-xs text-amber-700 dark:text-amber-300">
                <Lock className="w-4 h-4 shrink-0" />
                <span>رمز سر الغرفة: <strong className="font-mono">{table.password}</strong></span>
              </div>
              <button
                onClick={handleCopyPasscode}
                className="px-2 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-700 dark:text-amber-300 text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer"
              >
                {copiedPass ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copiedPass ? 'تم النسخ' : 'نسخ'}</span>
              </button>
            </div>
          )}

          {members.map((member) => {
            const isOwner = member.userId === table.creatorId || member.role === 'owner';
            const isMe = member.userId === currentUser?.uid;

            return (
              <div
                key={member.id}
                className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={member.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${member.userId}`}
                    alt={member.displayName}
                    className="w-10 h-10 rounded-xl object-cover bg-slate-200 dark:bg-slate-700"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {member.displayName}
                      </span>
                      {isMe && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-500 font-semibold">
                          (أنت)
                        </span>
                      )}
                    </div>
                    {member.email && (
                      <span className="text-[11px] text-slate-400 block truncate max-w-[180px]">
                        {member.email}
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  {isOwner ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                      <Crown className="w-3 h-3" />
                      <span>قائد الفريق</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                      <UserCheck className="w-3 h-3" />
                      <span>عضو</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
          >
            {t('close')}
          </button>
        </div>
      </div>
    </div>
  );
};
