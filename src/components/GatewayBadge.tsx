import { Wifi, WifiOff } from 'lucide-react';
import { formatTime, type GatewayStatus } from '@/lib/gatewayCases';

export function GatewayBadge({ status }: { status: GatewayStatus }) {
  if (status.connected) {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success/15 text-success text-[11px] font-bold">
        <Wifi className="w-3.5 h-3.5" />
        <span>Gatewsay: đã kết nối {formatTime(status.lastSuccessAt)}</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-destructive/15 text-destructive text-[11px] font-bold">
      <WifiOff className="w-3.5 h-3.5" />
      <span>Gateway: mất kết nối lúc {formatTime(status.lastErrorAt)}</span>
    </div>
  );
}
