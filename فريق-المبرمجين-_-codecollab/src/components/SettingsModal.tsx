import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import {
  X,
  Sun,
  Moon,
  Globe,
  Volume2,
  VolumeX,
  User,
  Shield,
  Palette,
  Terminal,
  Check
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { userProfile } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const { theme, setTheme, soundEnabled, setSoundEnabled } = useTheme();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {t('settingsTitle')}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                تخصيص الواجهة وتفضيلات بيئة العمل
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Theme Section */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
              {t('appearance')}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setTheme('dark')}
                className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                  theme === 'dark'
                    ? 'border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Moon className="w-4 h-4" />
                  <span className="text-xs">{t('themeDark')}</span>
                </div>
                {theme === 'dark' && <Check className="w-4 h-4" />}
              </button>

              <button
                onClick={() => setTheme('light')}
                className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                  theme === 'light'
                    ? 'border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span className="text-xs">{t('themeLight')}</span>
                </div>
                {theme === 'light' && <Check className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Language Section */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
              {t('languageOption')}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setLanguage('ar')}
                className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                  language === 'ar'
                    ? 'border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Globe className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs">{t('arabic')}</span>
                </div>
                {language === 'ar' && <Check className="w-4 h-4" />}
              </button>

              <button
                onClick={() => setLanguage('en')}
                className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                  language === 'en'
                    ? 'border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Globe className="w-4 h-4 text-cyan-500" />
                  <span className="text-xs">{t('english')}</span>
                </div>
                {language === 'en' && <Check className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Audio Sound Effects */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
              {t('soundEffects')}
            </label>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <div className="flex items-center gap-3">
                {soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-indigo-500" />
                ) : (
                  <VolumeX className="w-4 h-4 text-slate-400" />
                )}
                <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                  {soundEnabled ? t('enabled') : t('disabled')}
                </span>
              </div>
              <div
                className={`w-9 h-5 flex items-center rounded-full p-1 transition-colors ${
                  soundEnabled ? 'bg-indigo-600 justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'
                }`}
              >
                <div className="w-3.5 h-3.5 rounded-full bg-white shadow-sm" />
              </div>
            </button>
          </div>

          {/* User Profile Card */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
              {t('profileInfo')}
            </label>
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center gap-3">
              <img
                src={userProfile?.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=user`}
                alt={userProfile?.displayName || 'User'}
                className="w-12 h-12 rounded-xl object-cover bg-slate-200 dark:bg-slate-700"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  {userProfile?.displayName}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {userProfile?.email}
                </p>
                <div className="flex items-center gap-1.5 mt-1 text-[11px] text-emerald-600 dark:text-emerald-400">
                  <Shield className="w-3 h-3" />
                  <span>Google Account Verified</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
          >
            {t('close')}
          </button>
        </div>
      </div>
    </div>
  );
};
