"use client";

import type { ErrorInfo, ReactNode } from "react";
import { Component } from "react";

import { captureError } from "@/lib/observability";

type ErrorBoundaryProps = {
  fallback: ReactNode;
  children: ReactNode;
  context?: string;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    captureError(error, {
      componentStack: info.componentStack,
      context: this.props.context ?? "unknown-boundary",
    });
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

