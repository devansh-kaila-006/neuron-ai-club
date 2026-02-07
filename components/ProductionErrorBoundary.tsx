import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

// Fix: Explicitly extending Component<Props, State> to resolve property recognition issues with TS where props were not correctly inherited from React.Component.
class ProductionErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  // Use ErrorInfo type for componentDidCatch as per standard React error boundary implementation
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

    // Accessing children from this.props which is now correctly recognized due to explicit inheritance from Component<Props, State>
    return this.props.children;
  }
}

export default ProductionErrorBoundary;