import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { TableItem } from '../types';
import {
  Code2,
  Settings,
  LogOut,
  Sun,
  Moon,
  Globe,
  ChevronLeft,
  ChevronRight,
  Users,
  Lock,
  Unlock,
  Shield,
  Layers
} from 'lucide-react';

interface NavbarProps {
  currentTable: TableItem | null;
  onBackToTables: () => void;
  onOpenSettings: () => void;
  onOpenMembers?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTable,
  onBackToTables,
  onOpenSettings,
  onOpenMembers
}) => {
  const { userProfile, logout } = useAuth();
  const { t, language, setLanguage, isRtl } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md sticky top-0 z-40 px-4 md:px-6 flex items-center justify-between transition-colors">
      {/* Left side (or Right in RTL) */}
      <div className="flex items-center gap-3">
        {currentTable ? (
          <div className="flex items-center gap-2">
            <button
              onClick={onBackToTables}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            >
              {isRtl ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              <span>{t('backToTables')}</span>
            </button>

            <div className="h-5 w-px bg-slate-300 dark:bg-slate-700 mx-1 hidden sm:block" />

            <div className="flex items-center gap-2">
              <span className="font-bold text-sm md:text-base text-slate-900 dark:text-white max-w-[200px] sm:max-w-xs truncate">
                {currentTable.name}
              </span>

              {currentTable.isPrivate ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  <Lock className="w-3 h-3" />
                  <span className="hidden sm:inline">{t('privateRoom')}</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <Unlock className="w-3 h-3" />
                  <span className="hidden sm:inline">{t('publicRoom')}</span>
                </span>
              )}

              {onOpenMembers && (
                <button
                  onClick={onOpenMembers}
                  className="flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                  title={t('membersCount')}
                >
                  <Users className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                  <span>{currentTable.memberCount || 1} / {currentTable.maxMembers || 5}</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center shadow-md shadow-indigo-500/20">
              <Code2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-base tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                {t('appName')}
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 font-semibold">
                  Hub
                </span>
              </h1>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
                {t('tagline')}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Right side controls */}
      <div className="flex items-center gap-2">
        {/* Language Switch */}
        <button
          onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
          title="Toggle Language"
        >
          <Globe className="w-3.5 h-3.5 text-indigo-500 dark:text-cyan-400" />
          <span className="font-semibold">{language === 'ar' ? 'EN' : 'عربي'}</span>
        </button>

        {/* Theme Switch */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
          title="Toggle Theme"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-600" />
          )}
        </button>

        {/* Settings button */}
        <button
          onClick={onOpenSettings}
          className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
          title={t('settings')}
        >
          <Settings className="w-4 h-4 text-slate-600 dark:text-slate-400" />
        </button>

        {/* User Profile Avatar & Dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
          >
            <img
              src={userProfile?.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=user`}
              alt={userProfile?.displayName || 'User'}
              className="w-7 h-7 rounded-lg object-cover bg-slate-200 dark:bg-slate-800"
            />
            <span className="text-xs font-medium text-slate-800 dark:text-slate-200 max-w-[100px] truncate hidden md:inline">
              {userProfile?.displayName || 'المطور'}
            </span>
          </button>

          {profileOpen && (
            <div
              className={`absolute top-full mt-2 w-56 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl p-3 z-50 animate-in fade-in zoom-in-95 duration-100 ${
                isRtl ? 'left-0' : 'right-0'
              }`}
            >
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <img
                  src={userProfile?.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=user`}
                  alt={userProfile?.displayName || 'User'}
                  className="w-10 h-10 rounded-xl object-cover bg-slate-200 dark:bg-slate-800"
                />
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {userProfile?.displayName}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {userProfile?.email}
                  </p>
                </div>
              </div>

              <div className="py-2 space-y-1">
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    onOpenSettings();
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-start"
                >
                  <Settings className="w-3.5 h-3.5 text-slate-500" />
                  <span>{t('settings')}</span>
                </button>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={async () => {
                    setProfileOpen(false);
                    await logout();
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors text-start"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{t('logout')}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
