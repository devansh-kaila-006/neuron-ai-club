
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw, Info } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  showDebug: boolean;
}

class ProductionErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    showDebug: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, showDebug: false };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[Neural Error Boundary]:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#050505] p-10">
          <div className="glass p-12 rounded-[2.5rem] text-center max-w-md border-red-500/20 shadow-2xl">
            <AlertTriangle className="mx-auto text-red-500 mb-6" size={48} />
            <h2 className="text-2xl font-bold mb-4 uppercase tracking-widest font-mono">Neural Disconnect</h2>
            <p className="text-gray-500 text-sm mb-10 leading-relaxed">
              The neural uplink encountered a critical error. This session has been terminated to protect data integrity.
            </p>
            
            <div className="space-y-4">
              <button 
                onClick={() => window.location.reload()}
                className="w-full py-4 bg-indigo-600 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-500 transition-all shadow-xl"
              >
                <RefreshCcw size={18} /> Re-Sync Hub
              </button>

              <button 
                onClick={() => this.setState({ showDebug: !this.state.showDebug })}
                className="text-[9px] font-mono text-gray-800 uppercase tracking-widest hover:text-gray-500"
              >
                {this.state.showDebug ? 'Hide Technical Manifest' : 'View Technical Manifest'}
              </button>

              {this.state.showDebug && (
                <div className="mt-4 p-4 bg-red-500/5 border border-red-500/10 rounded-xl text-left">
                  <p className="text-[10px] font-mono text-red-400 break-words">
                    {this.state.error?.toString() || 'Unknown System Anomaly'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children || null;
  }
}

export default ProductionErrorBoundary;
