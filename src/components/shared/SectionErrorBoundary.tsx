import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    name?: string;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class SectionErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error(`Uncaught error in section ${this.props.name || 'unknown'}:`, error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <Card className="border-destructive/20 bg-destructive/5 my-8">
                    <CardContent className="flex flex-col items-center justify-center p-8 text-center space-y-4">
                        <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                            <AlertCircle className="w-6 h-6 text-destructive" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="font-semibold text-lg text-foreground">
                                Something went wrong
                            </h3>
                            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                                We couldn't load the {this.props.name || 'content'}. This might be due to a temporary connection issue.
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => this.setState({ hasError: false })}
                            className="gap-2"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Try Again
                        </Button>
                    </CardContent>
                </Card>
            );
        }

        return this.props.children;
    }
}
