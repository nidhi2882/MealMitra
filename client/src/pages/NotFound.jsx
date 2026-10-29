import { Link } from "react-router-dom";

export default function NotFound() {
    return (
        <div className="min-h-[75vh] flex flex-col items-center justify-center text-center px-4 bg-background">
            <div className="max-w-md w-full bg-surface border border-line rounded-2xl p-8 shadow-sm">
                <div className="w-16 h-16 bg-accent/10 text-accent rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                    🍲
                </div>
                <h1 className="font-display text-5xl font-bold text-ink mb-2">404</h1>
                <h2 className="font-display text-2xl font-semibold text-ink mb-3">
                    Page Not Found
                </h2>
                <p className="text-ink/70 text-sm mb-6 leading-relaxed">
                    The page or resource you are looking for might have been moved, expired, or doesn't exist.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                        to="/"
                        className="px-5 py-2.5 bg-ink text-background rounded-lg font-medium text-sm hover:bg-ink/90 transition shadow-sm text-center"
                    >
                        Go to Homepage
                    </Link>
                    <Link
                        to="/login"
                        className="px-5 py-2.5 bg-background border border-line text-ink rounded-lg font-medium text-sm hover:bg-surface transition text-center"
                    >
                        Sign In
                    </Link>
                </div>
            </div>
        </div>
    );
}

