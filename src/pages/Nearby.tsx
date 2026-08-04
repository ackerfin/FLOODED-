import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, RefreshCw, Ship, Radio, Wifi, WifiOff,
  Radar, Send, ArrowRightLeft, AlertTriangle, Info,
  CheckCircle2, Clock, Zap
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { getCommAdapter } from '@/lib/comm';
import type { CommAdapter, ScanResult, BroadcastResult, DataMuleResult } from '@/lib/comm';
import { BottomNav } from '@/components/BottomNav';
import { toast } from 'sonner';

interface SimLog {
  id: string;
  type: 'scan' | 'broadcast' | 'mule';
  message: string;
  timestamp: number;
  detail?: string;
}

export default function Nearby() {
  const { language, nearbyDevices, refreshNearby, pendingCount, sosReports, refreshReports, settings } = useApp();
  const [isScanning, setIsScanning] = useState(false);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [isPickingUp, setIsPickingUp] = useState(false);
  const [logs, setLogs] = useState<SimLog[]>([]);
  const [lastScan, setLastScan] = useState<ScanResult | null>(null);
  const [lastBroadcast, setLastBroadcast] = useState<BroadcastResult | null>(null);
  const [lastMule, setLastMule] = useState<DataMuleResult | null>(null);
  const adapterRef = useRef<CommAdapter>(getCommAdapter());
  const battSaver = settings?.lowPowerMode ?? false;

  const addLog = (type: SimLog['type'], message: string, detail?: string) => {
    setLogs(prev => [{
      id: `${Date.now()}-${Math.random()}`,
      type,
      message,
      timestamp: Date.now(),
      detail,
    }, ...prev].slice(0, 20));
  };

  // --- Actions ---
  const handleScan = async () => {
    setIsScanning(true);
    try {
      const result = await adapterRef.current.scanNearby();
      setLastScan(result);
      await refreshNearby();
      addLog('scan',
        language === 'vi'
          ? `Quét xong: ${result.devices.length} thiết bị`
          : `Scan done: ${result.devices.length} devices`,
        result.devices.map(d => `${d.name} (~${d.distance}m)`).join(', ')
      );
      toast.success(
        language === 'vi'
          ? `Phát hiện ${result.devices.length} thiết bị gần`
          : `Found ${result.devices.length} nearby devices`
      );
    } catch {
      toast.error(language === 'vi' ? 'Lỗi quét' : 'Scan failed');
    } finally {
      setIsScanning(false);
    }
  };

  const handleBroadcast = async () => {
    if (sosReports.length === 0) {
      toast.info(language === 'vi' ? 'Chưa có gói SOS nào' : 'No SOS packets to broadcast');
      return;
    }
    setIsBroadcasting(true);
    try {
      const latest = sosReports[0];
      const result = await adapterRef.current.broadcastSOS(latest);
      setLastBroadcast(result);
      addLog('broadcast',
        language === 'vi'
          ? `Gửi SOS → ${result.reachedCount} thiết bị (+${result.hopsAdded} hop)`
          : `SOS → ${result.reachedCount} devices (+${result.hopsAdded} hop)`,
        `Report: ${latest.id.slice(0, 8)}`
      );
      toast.success(
        language === 'vi'
          ? `Đã gửi SOS tới ${result.reachedCount} thiết bị`
          : `SOS sent to ${result.reachedCount} devices`
      );
    } catch {
      toast.error(language === 'vi' ? 'Lỗi gửi SOS' : 'Broadcast failed');
    } finally {
      setIsBroadcasting(false);
    }
  };

  const handleDataMule = async () => {
    setIsPickingUp(true);
    try {
      const result = await adapterRef.current.dataMulePickup();
      setLastMule(result);
      await refreshReports();
      if (result.pickedUpCount > 0) {
        addLog('mule',
          language === 'vi'
            ? `Thu: ${result.pickedUpCount} gói, chuyển tiếp: ${result.forwardedCount}`
            : `Picked: ${result.pickedUpCount}, forwarded: ${result.forwardedCount}`,
          `Mule: ${result.dataMuleId}`
        );
        toast.success(
          language === 'vi'
            ? `Thu ${result.pickedUpCount} gói SOS • Chuyển tiếp ${result.forwardedCount}`
            : `Collected ${result.pickedUpCount} • Forwarded ${result.forwardedCount}`
        );
      } else {
        addLog('mule',
          language === 'vi' ? 'Không có gói nào cần thu' : 'No packets to collect'
        );
        toast.info(language === 'vi' ? 'Không có tín hiệu cần thu' : 'Nothing to collect');
      }
    } catch {
      toast.error(language === 'vi' ? 'Lỗi thu thập' : 'Collection failed');
    } finally {
      setIsPickingUp(false);
    }
  };

  const vi = language === 'vi';

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="p-4 safe-top">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
              <Radio className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h1 className="font-bold text-lg">
                {vi ? 'Kết nối lân cận' : 'Nearby Connection'}
              </h1>
              <p className="text-xs text-muted-foreground">
                {vi ? 'Mô phỏng • Chỉ dành cho demo/web' : 'Simulation • Web demo only'}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="px-4 space-y-5">
        {/* Disclaimer Banner */}
        <div className="rounded-xl border border-warning/40 bg-warning/10 p-3 flex gap-3 items-start">
          <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed">
            <p className="font-bold text-warning mb-1">
              {vi ? 'CHẾ ĐỘ MÔ PHỎNG' : 'SIMULATION MODE'}
            </p>
            <p className="text-muted-foreground">
              {vi
                ? 'Đây là mô phỏng mạng lưới BLE/Mesh trên web. BLE thật sẽ có trong bản mobile native sau. Dữ liệu thiết bị được tạo giả lập.'
                : 'This is a simulated BLE/Mesh network for web demo. Real BLE will be available in the native mobile version. Device data is generated locally.'}
            </p>
          </div>
        </div>

        {/* Adapter Info */}
        <div className="rounded-xl border border-border bg-secondary/30 p-3 flex items-center gap-3">
          <Info className="w-4 h-4 text-muted-foreground shrink-0" />
          <div className="text-xs text-muted-foreground">
            <span className="font-mono">{adapterRef.current.type}</span>
            {' • '}
            <span>{adapterRef.current.label}</span>
          </div>
        </div>

        {/* 3 Action Buttons */}
        <div className="space-y-3">
          {/* Scan */}
          <motion.button
            onClick={handleScan}
            disabled={isScanning}
            whileTap={battSaver ? undefined : { scale: 0.97 }}
            className="w-full rounded-2xl border-2 border-accent/40 bg-accent/10 p-4 flex items-center gap-4 disabled:opacity-50"
          >
            <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center shrink-0">
              {isScanning
                ? <RefreshCw className="w-6 h-6 text-accent animate-spin" />
                : <Radar className="w-6 h-6 text-accent" />}
            </div>
            <div className="text-left flex-1">
              <p className="font-bold text-base">
                {vi ? 'Mô phỏng quét thiết bị gần' : 'Simulate Scan Nearby'}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {vi
                  ? `Tìm thiết bị lân cận (giả lập) • ${nearbyDevices.length} đã tìm`
                  : `Discover nearby devices (simulated) • ${nearbyDevices.length} found`}
              </p>
            </div>
          </motion.button>

          {/* Broadcast SOS */}
          <motion.button
            onClick={handleBroadcast}
            disabled={isBroadcasting || sosReports.length === 0}
            whileTap={battSaver ? undefined : { scale: 0.97 }}
            className="w-full rounded-2xl border-2 border-destructive/40 bg-destructive/10 p-4 flex items-center gap-4 disabled:opacity-50"
          >
            <div className="w-12 h-12 rounded-xl bg-destructive/20 flex items-center justify-center shrink-0">
              {isBroadcasting
                ? <RefreshCw className="w-6 h-6 text-destructive animate-spin" />
                : <Send className="w-6 h-6 text-destructive" />}
            </div>
            <div className="text-left flex-1">
              <p className="font-bold text-base">
                {vi ? 'Mô phỏng gửi gói SOS' : 'Simulate Broadcast SOS'}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {sosReports.length > 0
                  ? vi ? `Gửi gói SOS gần nhất tới thiết bị lân cận` : 'Send latest SOS to nearby devices'
                  : vi ? 'Chưa có gói SOS nào' : 'No SOS reports yet'}
              </p>
            </div>
          </motion.button>

          {/* Data Mule */}
          <motion.button
            onClick={handleDataMule}
            disabled={isPickingUp || pendingCount === 0}
            whileTap={battSaver ? undefined : { scale: 0.97 }}
            className="w-full rounded-2xl border-2 border-warning/40 bg-warning/10 p-4 flex items-center gap-4 disabled:opacity-50"
          >
            <div className="w-12 h-12 rounded-xl bg-warning/20 flex items-center justify-center shrink-0">
              {isPickingUp
                ? <RefreshCw className="w-6 h-6 text-warning animate-spin" />
                : <Ship className="w-6 h-6 text-warning" />}
            </div>
            <div className="text-left flex-1">
              <p className="font-bold text-base">
                {vi ? 'Mô phỏng Rescue Boat / Data Mule' : 'Simulate Rescue Boat / Data Mule'}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {pendingCount > 0
                  ? vi ? `${pendingCount} gói SOS chờ thu thập & chuyển tiếp` : `${pendingCount} packets waiting`
                  : vi ? 'Không có gói nào chờ xử lý' : 'No pending packets'}
              </p>
            </div>
          </motion.button>
        </div>

        {/* Discovered Devices */}
        <div>
          <h2 className="text-sm font-bold text-muted-foreground mb-2 flex items-center gap-2">
            <Users className="w-4 h-4" />
            {vi ? 'Thiết bị phát hiện (mô phỏng)' : 'Discovered Devices (simulated)'}
            <span className="ml-auto font-mono text-xs">{nearbyDevices.length}</span>
          </h2>

          {nearbyDevices.length === 0 ? (
            <div className="rounded-xl border border-dashed border-muted-foreground/30 p-6 text-center text-sm text-muted-foreground">
              {vi ? 'Nhấn "Mô phỏng quét" để tìm thiết bị' : 'Tap "Simulate Scan" to discover'}
            </div>
          ) : (
            <div className="space-y-2">
              {nearbyDevices.map((device, index) => (
                <motion.div
                  key={device.id}
                  initial={battSaver ? false : { opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className="rounded-xl border border-border bg-secondary/30 p-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {device.status === 'active' ? (
                        <Wifi className="w-4 h-4 text-success" />
                      ) : (
                        <WifiOff className="w-4 h-4 text-muted-foreground" />
                      )}
                      <div>
                        <p className="text-sm font-medium">{device.name}</p>
                        <p className="text-xs text-muted-foreground font-mono">
                          ~{device.distance}m • {device.sosCount} SOS
                        </p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      device.status === 'active'
                        ? 'bg-success/20 text-success'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {device.status === 'active'
                        ? (vi ? 'Hoạt động' : 'Active')
                        : (vi ? 'Mất kết nối' : 'Offline')}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Simulation Log */}
        {logs.length > 0 && (
          <div>
            <h2 className="text-sm font-bold text-muted-foreground mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {vi ? 'Nhật ký mô phỏng' : 'Simulation Log'}
            </h2>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {logs.map(log => (
                <div key={log.id} className="rounded-lg bg-secondary/40 border border-border px-3 py-2 text-xs">
                  <div className="flex items-center gap-2">
                    {log.type === 'scan' && <Radar className="w-3 h-3 text-accent shrink-0" />}
                    {log.type === 'broadcast' && <Send className="w-3 h-3 text-destructive shrink-0" />}
                    {log.type === 'mule' && <Ship className="w-3 h-3 text-warning shrink-0" />}
                    <span className="font-medium flex-1">{log.message}</span>
                    <span className="text-muted-foreground font-mono text-[10px]">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  {log.detail && (
                    <p className="text-muted-foreground mt-1 pl-5 text-[10px] font-mono truncate">{log.detail}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Technical Note */}
        <div className="rounded-xl border border-border bg-muted/30 p-3 text-[11px] text-muted-foreground leading-relaxed">
          <p className="font-bold mb-1">🔧 {vi ? 'Ghi chú kỹ thuật' : 'Technical Note'}</p>
          <p>
            {vi
              ? 'Module này sử dụng CommAdapter trừu tượng. Hiện tại chạy SimulatedCommAdapter (web). Trong bản React Native / Flutter, sẽ thay bằng NativeBLEAdapter sử dụng Bluetooth Low Energy thật.'
              : 'This module uses an abstract CommAdapter. Currently runs SimulatedCommAdapter (web). In React Native / Flutter version, it will be replaced by NativeBLEAdapter using real Bluetooth Low Energy.'}
          </p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
