"use client";

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  name?: string;
}

interface State {
  hasError: boolean;
}

/**
 * P2-4 Fix: Error Boundary wrapper for dashboard widgets.
 * Prevents a single widget crash from taking down the entire dashboard.
 *
 * Usage:
 *   <WidgetErrorBoundary name="SrsCard">
 *     <SrsCard {...props} />
 *   </WidgetErrorBoundary>
 */
export class WidgetErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  override render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="bg-card border border-border rounded-2xl p-4 text-center">
            <p className="text-muted-foreground text-sm">
              Không thể tải widget{this.props.name ? ` ${this.props.name}` : ""}
              .
            </p>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
