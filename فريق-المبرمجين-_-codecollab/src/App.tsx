import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LoginScreen } from './components/LoginScreen';
import { Navbar } from './components/Navbar';
import { TablesList } from './components/TablesList';
import { TableWorkspace } from './components/TableWorkspace';
import { SettingsModal } from './components/SettingsModal';
import { TableItem } from './types';
import { Code2 } from 'lucide-react';

const MainApp: React.FC = () => {
  const { currentUser, loading } = useAuth();
  const [selectedTable, setSelectedTable] = useState<TableItem | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);

  // Loading Screen while Firebase Auth initializes
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center text-slate-900 dark:text-slate-100 transition-colors">
        <div className="relative mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center shadow-xl shadow-indigo-500/30 animate-pulse">
            <Code2 className="w-8 h-8 text-white" />
          </div>
          <div className="absolute -inset-1 rounded-2xl bg-indigo-500/20 blur-md -z-10 animate-ping" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">فريق المبرمجين | CodeCollab</h2>
        <div className="flex items-center gap-2 text-xs text-indigo-600 dark:text-indigo-400 font-mono font-medium">
          <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span>جاري الاتصال بقاعدة بيانات Firebase...</span>
        </div>
      </div>
    );
  }

  // First page: Sign In
  if (!currentUser) {
    return <LoginScreen />;
  }

  return (
    <div className="min-h-screen bg-slate-100/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        currentTable={selectedTable}
        onBackToTables={() => setSelectedTable(null)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenMembers={selectedTable ? () => setIsMembersModalOpen(true) : undefined}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {selectedTable ? (
          <TableWorkspace
            table={selectedTable}
            onBack={() => setSelectedTable(null)}
            isMembersModalOpen={isMembersModalOpen}
            onCloseMembersModal={() => setIsMembersModalOpen(false)}
          />
        ) : (
          <TablesList onSelectTable={(tbl) => setSelectedTable(tbl)} />
        )}
      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <MainApp />
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
