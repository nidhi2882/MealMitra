export default function Loader({ label = "Loading" }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 gap-3" role="status" aria-live="polite">
            <div className="w-8 h-8 border-2 border-line border-t-accent rounded-full animate-spin" />
            <span className="text-sm text-ink/60 font-sans">{label}…</span>
        </div>
    );
}