import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Trash2, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);

    try {
      fetch('/api/client-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'ReactErrorBoundary',
          message: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          time: new Date().toISOString(),
        }),
      });
    } catch {}
  }

  private handleResetCache = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {}
    window.location.reload();
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4 sm:p-6 font-sans">
          <div className="max-w-xl w-full bg-slate-800/90 border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-black tracking-wider text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                  DULI Health Platform • Recuperação
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                  Ops! Ocorreu um erro no módulo
                </h2>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 font-mono text-xs text-rose-300 overflow-x-auto max-h-48">
              <p className="font-bold">{this.state.error?.name}: {this.state.error?.message}</p>
              {this.state.error?.stack && (
                <pre className="text-[11px] text-slate-400 mt-2 whitespace-pre-wrap">
                  {this.state.error.stack.slice(0, 500)}
                </pre>
              )}
            </div>

            <p className="text-xs text-slate-300">
              O sistema protegeu a integridade dos seus dados. Clique abaixo para reiniciar ou limpar o cache local se algum dado antigo estiver corrompido.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs shadow-md transition-all active:scale-95"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Recarregar Página</span>
              </button>

              <button
                onClick={this.handleResetCache}
                className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-slate-700 hover:bg-slate-600 text-white font-black text-xs transition-all active:scale-95"
              >
                <Trash2 className="w-4 h-4 text-rose-400" />
                <span>Limpar Cache & Resetar</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
