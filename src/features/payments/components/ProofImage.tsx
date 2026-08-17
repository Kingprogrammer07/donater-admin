import { useEffect, useState } from "react";
import { paymentsApi } from "@/api/client";
import { Icons } from "@/components/icons";
import { Skeleton } from "@/components/ui/skeleton";

interface ProofImageProps {
  paymentId: number;
  alt?: string;
  className?: string;
  onZoom?: (blobUrl: string) => void;
}

export function ProofImage({
  paymentId,
  alt = "To'lov cheki rasmi",
  className = "",
  onZoom,
}: ProofImageProps) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    let createdUrl: string | null = null;

    setIsLoading(true);
    setError(null);

    paymentsApi
      .getProofFileBlobUrl(paymentId)
      .then((url) => {
        if (!isMounted) {
          URL.revokeObjectURL(url);
          return;
        }
        createdUrl = url;
        setBlobUrl(url);
        setIsLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        setIsLoading(false);
        const msg = err?.message || "Chek rasmini yuklab bo'lmadi.";
        setError(msg);
      });

    return () => {
      isMounted = false;
      if (createdUrl) {
        URL.revokeObjectURL(createdUrl);
      }
    };
  }, [paymentId]);

  if (isLoading) {
    return (
      <div className={`relative flex items-center justify-center bg-surface-2 rounded-md overflow-hidden min-h-[260px] ${className}`}>
        <Skeleton className="size-full absolute inset-0" />
        <div className="relative z-10 flex flex-col items-center gap-2 text-fg-muted">
          <Icons.Spinner size="md" className="animate-spin text-fg-muted" />
          <span className="text-xs font-medium">Chek rasmi yuklanmoqda...</span>
        </div>
      </div>
    );
  }

  if (error || !blobUrl) {
    return (
      <div className={`flex flex-col items-center justify-center p-6 bg-surface-2 border border-hairline rounded-md text-center space-y-2 min-h-[260px] ${className}`}>
        <div className="size-10 rounded-full bg-status-fail-bg flex items-center justify-center text-status-fail">
          <Icons.AlertCircle size="md" />
        </div>
        <p className="text-xs font-medium text-fg">Chek rasmi mavjud emas</p>
        <p className="text-xs text-fg-muted max-w-[200px] leading-relaxed font-mono">
          {error || "Rasm topilmadi"}
        </p>
      </div>
    );
  }

  return (
    <div className={`relative group rounded-md overflow-hidden border border-hairline bg-surface-2 ${className}`}>
      <img
        src={blobUrl}
        alt={alt}
        className="w-full max-h-[460px] object-contain cursor-zoom-in transition-transform duration-200 group-hover:scale-[1.01]"
        onClick={() => onZoom?.(blobUrl)}
      />
      <button
        onClick={() => onZoom?.(blobUrl)}
        className="absolute bottom-3 right-3 px-2.5 py-1.5 rounded-sm bg-surface/90 backdrop-blur-md border border-hairline text-xs font-medium text-fg shadow-1 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 cursor-pointer"
        aria-label="Rasmni kattalashtirish"
      >
        <Icons.Eye size="sm" />
        <span>Kattalashtirish</span>
      </button>
    </div>
  );
}
