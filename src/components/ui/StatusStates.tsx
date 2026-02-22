import { Loader2, AlertCircle, Inbox, RefreshCw } from "lucide-react";
import { cn } from "../../lib/utils";

interface LoadingProps {
    message?: string;
    className?: string;
}

export const LoadingState = ({ message = "Loading content...", className }: LoadingProps) => (
    <div className={cn("flex flex-col items-center justify-center p-12 text-center", className)}>
        <Loader2 className="h-10 w-10 animate-spin text-[#2C4BFD] mb-4" />
        <p className="text-gray-500 font-medium">{message}</p>
    </div>
);

interface ErrorProps {
    message: string;
    onRetry?: () => void;
    className?: string;
}

export const ErrorState = ({ message, onRetry, className }: ErrorProps) => (
    <div className={cn("flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-red-100 bg-red-50 dark:bg-red-900/10 dark:border-red-900/20", className)}>
        <AlertCircle className="h-10 w-10 text-red-500 mb-4" />
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Oops! Something went wrong</h3>
        <p className="text-red-600 dark:text-red-400 mb-6 max-w-md">{message}</p>
        {onRetry && (
            <button
                onClick={onRetry}
                className="inline-flex items-center gap-2 rounded-xl bg-gray-900 dark:bg-white dark:text-gray-900 px-6 py-2.5 text-sm font-bold text-white transition-all hover:scale-105 active:scale-95"
            >
                <RefreshCw className="h-4 w-4" />
                Try Again
            </button>
        )}
    </div>
);

interface EmptyProps {
    title: string;
    message: string;
    icon?: React.ReactNode;
    className?: string;
}

export const EmptyState = ({ title, message, icon, className }: EmptyProps) => (
    <div className={cn("flex flex-col items-center justify-center p-12 text-center rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800", className)}>
        {icon || <Inbox className="h-12 w-12 text-gray-300 dark:text-gray-700 mb-4" />}
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
        <p className="text-gray-500 dark:text-gray-400 max-w-sm">{message}</p>
    </div>
);
