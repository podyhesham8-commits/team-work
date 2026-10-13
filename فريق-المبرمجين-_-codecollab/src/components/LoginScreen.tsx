import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { SettingsModal } from './SettingsModal';
import {
  Code2,
  Sun,
  Moon,
  Globe,
  Settings,
  Sparkles,
  Play,
  ArrowRight,
  ArrowLeft,
  Mail,
  User,
  ShieldCheck,
  Zap,
  Users,
  CheckCircle2,
  Terminal,
  Cpu
} from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const { loginNormal, signInWithGoogle, quickSignIn, authError, clearAuthError } = useAuth();
  const { t, language, setLanguage, isRtl } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  const [name, setName] = useState('عبد الرحمن هشام');
  const [email, setEmail] = useState('podyhesham8@gmail.com');
  const [signingIn, setSigningIn] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleNormalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSigningIn(true);
      await loginNormal(name, email);
    } finally {
      setSigningIn(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setSigningIn(true);
      await signInWithGoogle();
    } finally {
      setSigningIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white relative overflow-hidden transition-colors duration-200">
      {/* Decorative Gradient Glows */}
      <div className="absolute top-0 -left-40 w-96 h-96 bg-indigo-500/15 dark:bg-indigo-600/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/4 -right-40 w-96 h-96 bg-cyan-500/15 dark:bg-cyan-600/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-[600px] h-[350px] bg-purple-500/10 dark:bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Top Navbar */}
      <header className="w-full px-6 py-4 flex items-center justify-between z-10 border-b border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/70 backdrop-blur-md transition-colors sticky top-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 font-bold">
            <Code2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-700 dark:from-white dark:via-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
              {t('appName')}
            </h1>
            <p className="text-xs text-indigo-600 dark:text-indigo-400 font-mono tracking-wider font-semibold">
              {t('appSubtitle')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Settings Trigger */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer shadow-sm"
            title="الإعدادات / Settings"
          >
            <Settings className="w-3.5 h-3.5 text-indigo-500" />
            <span className="hidden sm:inline">الإعدادات</span>
          </button>

          {/* Language Switch */}
          <button
            onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer shadow-sm"
          >
            <Globe className="w-3.5 h-3.5 text-cyan-500" />
            <span>{language === 'ar' ? 'English' : 'العربية'}</span>
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer shadow-sm"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">فاتح</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-indigo-600" />
                <span className="hidden sm:inline">داكن</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Hero & Login Section */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-10 flex flex-col justify-center items-center z-10">
        <div className="text-center max-w-3xl mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 text-xs font-bold mb-5 backdrop-blur-sm shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
            <span>منصة البرمجة التعاونية المتكاملة لفرق التطوير</span>
          </div>

          <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight md:leading-snug mb-4 text-slate-900 dark:text-white">
            اصنع وشارك الأكواد مع فريقك <br className="hidden md:inline" />
            <span className="bg-gradient-to-r from-indigo-600 via-cyan-500 to-purple-600 dark:from-indigo-400 dark:via-cyan-400 dark:to-purple-400 bg-clip-text text-transparent">
              في نفس اللحظة والملف
            </span>
          </h2>

          <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto mb-8">
            {t('tagline')}. أنشئ غرفتك البرمجية (Table)، حدد أعضاء الفريق، وابدأ بكتابة الأكواد مع محرر مباشر، محادثة فورية، ولوحة مهام متكاملة.
          </p>

          {/* Regular Login Form Card */}
          <div className="max-w-md w-full mx-auto p-6 md:p-8 rounded-3xl bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-2xl backdrop-blur-xl text-start">
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">تسجيل الدخول إلى حسابك</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">سجل ببياناتك أو ادخل فورياً بنقرة واحدة</p>
              </div>
              <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-mono text-xs font-bold">
                Dev Hub
              </span>
            </div>

            <form onSubmit={handleNormalSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  الاسم الكامل:
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute top-3.5 right-3.5" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="مثال: عبد الرحمن هشام"
                    className="w-full pr-10 pl-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  البريد الإلكتروني:
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute top-3.5 right-3.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pr-10 pl-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs font-mono font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>

              {authError && (
                <div className="text-xs text-rose-500 bg-rose-500/10 border border-rose-500/30 px-3.5 py-2 rounded-xl flex items-center justify-between">
                  <span>{authError}</span>
                  <button type="button" onClick={clearAuthError} className="underline font-bold mr-2">إغلاق</button>
                </div>
              )}

              {/* Submit Normal Login Button */}
              <button
                type="submit"
                disabled={signingIn}
                className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
              >
                {signingIn ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>تسجيل الدخول ومتابعة العمل</span>
                    {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                  </>
                )}
              </button>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                <span className="flex-shrink mx-3 text-[11px] font-bold text-slate-400">أو</span>
                <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
              </div>

              {/* Google Sign In Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={signingIn}
                className="w-full py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/90 text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold text-xs flex items-center justify-center gap-2.5 shadow-sm cursor-pointer transition-all hover:scale-[1.01]"
              >
                <svg className="w-4 h-4 bg-white rounded-full p-0.5" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"/>
                  <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"/>
                  <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9z"/>
                  <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z"/>
                </svg>
                <span>تسجيل الدخول السريع بحساب Google</span>
              </button>

              {/* 1-Click Instant Abdulrahman Access */}
              <button
                type="button"
                onClick={() => quickSignIn('عبد الرحمن هشام')}
                className="w-full py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <Zap className="w-3.5 h-3.5 fill-amber-500" />
                <span>دخول فوري مباشر (عبد الرحمن هشام)</span>
              </button>
            </form>
          </div>

          {/* Quick Badges */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500 dark:text-slate-400 mt-8">
            <span className="flex items-center gap-1.5 bg-white/60 dark:bg-slate-900/60 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-800">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>قاعدة بيانات Firestore نشطة</span>
            </span>
            <span className="flex items-center gap-1.5 bg-white/60 dark:bg-slate-900/60 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-800">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>مزامنة الأكواد لحظياً</span>
            </span>
            <span className="flex items-center gap-1.5 bg-white/60 dark:bg-slate-900/60 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-800">
              <Users className="w-4 h-4 text-cyan-500" />
              <span>غرف تيم عامة وخاصة</span>
            </span>
          </div>
        </div>

        {/* Interactive Mock Code Window Preview */}
        <div className="w-full max-w-4xl rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 shadow-2xl backdrop-blur-xl overflow-hidden mt-6 mb-10 transition-colors">
          <div className="px-5 py-3.5 bg-slate-100 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500" />
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono ml-2">table-workspace/index.html</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Live 5 Devs Connected
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 text-xs font-mono">
            {/* Editor Side */}
            <div className="p-5 bg-slate-900 dark:bg-slate-950/80 text-slate-300 leading-relaxed border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 overflow-x-auto">
              <div className="flex gap-3">
                <span className="text-slate-600 select-none">1</span>
                <span className="text-purple-400">&lt;<span className="text-rose-400">div</span> <span className="text-amber-300">class</span>=<span className="text-emerald-300">"programmer-team"</span>&gt;</span>
              </div>
              <div className="flex gap-3">
                <span className="text-slate-600 select-none">2</span>
                <span className="pl-4 text-purple-400">&lt;<span className="text-rose-400">h1</span>&gt;<span className="text-white font-sans font-bold">فريق المبرمجين الأبطال 🚀</span>&lt;/<span className="text-rose-400">h1</span>&gt;</span>
              </div>
              <div className="flex gap-3">
                <span className="text-slate-600 select-none">3</span>
                <span className="pl-4 text-purple-400">&lt;<span className="text-rose-400">p</span>&gt;<span className="text-slate-400 font-sans">نكتب الأكواد معاً مباشرة في نفس الثانية...</span>&lt;/<span className="text-rose-400">p</span>&gt;</span>
              </div>
              <div className="flex gap-3 bg-indigo-500/20 py-0.5 rounded px-1">
                <span className="text-slate-600 select-none">4</span>
                <span className="pl-4 text-cyan-300 flex items-center gap-1">
                  <span>const team = startCollabRoom();</span>
                  <span className="w-1.5 h-4 bg-cyan-400 animate-pulse inline-block" />
                </span>
              </div>
              <div className="flex gap-3">
                <span className="text-slate-600 select-none">5</span>
                <span className="text-purple-400">&lt;/<span className="text-rose-400">div</span>&gt;</span>
              </div>
            </div>

            {/* Live Output Side */}
            <div className="p-6 bg-gradient-to-br from-indigo-50/50 via-white to-slate-100 dark:from-indigo-950/40 dark:via-slate-900 dark:to-slate-950 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[11px] mb-3 pb-2 border-b border-slate-200 dark:border-slate-800">
                  <span className="flex items-center gap-1.5 text-indigo-600 dark:text-cyan-400 font-sans font-bold">
                    <Play className="w-3.5 h-3.5" />
                    المعاينة الحية التفاعلية
                  </span>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold px-2 py-0.5 rounded-full">Zero Latency</span>
                </div>
                <div className="rounded-2xl p-5 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 shadow-md">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-1">فريق المبرمجين الأبطال 🚀</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">نكتب الأكواد معاً مباشرة في نفس الثانية...</p>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 text-[10px] font-sans font-bold">
                      HTML5 + CSS3 + JS
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 text-[10px] font-sans font-bold">
                      Live Preview Active
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span>5 أقسام متكاملة لكل تيبول</span>
                <span className="text-indigo-500 font-bold font-sans">IDE • Chat • Tasks • Docs • Commits</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-slate-400 py-4 border-t border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-950/40">
        فريق المبرمجين • منصة التعاون البرمجي وقاعدة بيانات Firestore المباشرة
      </footer>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
};
