import { Component, ReactNode } from "react";

export class RouterErrorBoundary extends Component<
  { children: ReactNode },
  { error: any }
> {
  constructor(props: any) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return <div>Something went wrong.</div>;
    }
    return this.props.children;
  }
}
