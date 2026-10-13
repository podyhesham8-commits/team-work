import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    localStorage.removeItem('codecollab_theme');
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center" dir="rtl">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mb-4 border border-rose-500/20">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">حدث خطأ غير متوقع أثناء التشغيل</h2>
          <p className="text-sm text-slate-400 max-w-md mb-6 leading-relaxed">
            لا تقلق، بياناتك وأكوادك محفوظة على Firebase. اضغط على الزر أدناه لإعادة تحميل بيئة العمل.
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={this.handleReload}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>إعادة تحميل المنصة</span>
            </button>
            <button
              onClick={this.handleReset}
              className="px-4 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white text-xs font-medium cursor-pointer"
            >
              <span>إعادة تعيين</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
