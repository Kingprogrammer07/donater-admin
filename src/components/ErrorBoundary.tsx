import { Component, type ErrorInfo, type ReactNode } from "react";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  private handleGoHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = "/admin/";
  };

  public override render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[60vh] w-full flex items-center justify-center p-4 bg-canvas text-fg select-none">
          <div className="w-full max-w-[480px] rounded-md border border-status-fail/30 bg-surface p-6 sm:p-8 shadow-2 space-y-6 text-center">
            <div className="flex justify-center">
              <div className="size-12 rounded-full bg-status-fail-bg flex items-center justify-center text-status-fail">
                <Icons.AlertTriangle size="lg" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="label-caps text-status-fail">Kutilmagan Xatolik</div>
              <h2 className="text-xl font-semibold tracking-tight text-fg">
                Interfeys yuklanishida xatolik yuz berdi
              </h2>
              <p className="text-xs text-fg-muted leading-relaxed">
                Ilova kutilmagan holatga duch keldi. Qaytadan yuklab ko'ring yoki bosh sahifaga qayting.
              </p>
            </div>

            {this.state.error && (
              <div className="rounded-sm border border-hairline bg-surface-2 p-3 text-left overflow-auto max-h-[140px]">
                <p className="text-xs font-mono text-status-fail break-all">
                  {this.state.error.name}: {this.state.error.message}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Button variant="primary" size="md" onClick={this.handleReset} className="gap-2">
                <Icons.Refresh size="sm" />
                <span>Sahifani yangilash</span>
              </Button>
              <Button variant="secondary" size="md" onClick={this.handleGoHome} className="gap-2">
                <Icons.Home size="sm" />
                <span>Bosh sahifa</span>
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
