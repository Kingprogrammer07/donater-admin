import { HealthPanel } from "./components/HealthPanel";
import { QueueWorkerPanel } from "./components/QueueWorkerPanel";
import { FazerCardsPanel } from "./components/FazerCardsPanel";
import { WebhooksPanel } from "./components/WebhooksPanel";

export default function SystemPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-fg tracking-tight">
          Tizim Holati va Diagnostika (System Status)
        </h1>
        <p className="text-xs text-fg-subtle mt-0.5">
          Infratuzilma sog'lig'i, asinxron ishchi navbatlari, provayder balansi va webhook integratsiyalari
        </p>
      </div>

      {/* 1. Health Panel */}
      <HealthPanel />

      {/* 2. Middle Row: Queue & Worker + FazerCards Balance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <QueueWorkerPanel />
        <FazerCardsPanel />
      </div>

      {/* 3. Webhooks & Callbacks */}
      <WebhooksPanel />
    </div>
  );
}
