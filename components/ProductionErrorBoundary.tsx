
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
}

// Fixed: Inheriting from React.Component directly to ensure 'props' is correctly typed and recognized by the TypeScript compiler.
// Making children optional to fix 'Property children is missing' error in App.tsx.
class ProductionErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[Neural Error Boundary]:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#050505] p-10">
          <div className="glass p-12 rounded-[2.5rem] text-center max-w-md border-red-500/20">
            <AlertTriangle className="mx-auto text-red-500 mb-6" size={48} />
            <h2 className="text-2xl font-bold mb-4 uppercase tracking-widest font-mono">Neural Disconnect</h2>
            <p className="text-gray-500 text-sm mb-10 leading-relaxed">
              The neural uplink encountered a critical error. This session has been terminated to protect data integrity.
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="w-full py-4 bg-indigo-600 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-500"
            >
              <RefreshCcw size={18} /> Re-Sync Hub
            </button>
          </div>
        </div>
      );
    }

    // Fixed: Standard access to this.props.children after establishing proper class inheritance
    return this.props.children || null;
  }
}

export default ProductionErrorBoundary;
