import { Loader2 } from "lucide-react";

export function LoadingModal() {
    return (
        <div
            className="loading-modal-overlay"
            role="dialog"
            aria-modal="true"
            aria-label="Carregando"
        >
            <Loader2 size={48} className="loading-modal-spinner" />
        </div>
    );
}
