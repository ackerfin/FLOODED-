import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, List, Download, RefreshCw, Clock, ArrowLeft, 
  UserSearch, Plus, X, Phone, Navigation, CheckCircle2, AlertTriangle,
  FileText, Shield
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { StatusBadge } from '@/components/StatusBadge';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { provinces } from '@/lib/provinces';
import type { HealthStatus, MissingPersonRequest, SOSReport } from '@/types';

type ViewMode = 'list' | 'map' | 'missing' | 'log';
type FilterStatus = 'all' | 'critical' | 'injured' | 'ok' | 'unsynced';

interface ActionLog {
  id: string;
  action: string;
  reportId?: string;
  timestamp: number;
}

function getActionLogs(): ActionLog[] {
  const saved = localStorage.getItem('flooded_action_logs');
  return saved ? JSON.parse(saved) : [];
}

function addActionLog(action: string, reportId?: string) {
  const logs = getActionLogs();
  logs.unshift({ id: uuidv4(), action, reportId, timestamp: Date.now() });
  localStorage.setItem('flooded_action_logs', JSON.stringify(logs.slice(0, 200)));
}

export default function Admin() {
  const { language, sosReports, triggerSync, isOnline, pendingCount, settings } = useApp();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [reportStatuses, setReportStatuses] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('flooded_report_statuses');
    return saved ? JSON.parse(saved) : {};
  });

  // Missing persons
  const [missingPersons, setMissingPersons] = useState<MissingPersonRequest[]>(() => {
    const saved = localStorage.getItem('flooded_missing_persons');
    return saved ? JSON.parse(saved) : [];
  });
  const [showMissingForm, setShowMissingForm] = useState(false);
  const [mpName, setMpName] = useState('');
  const [mpProvince, setMpProvince] = useState('');
  const [mpProvinceSearch, setMpProvinceSearch] = useState('');
  const [mpShowDropdown, setMpShowDropdown] = useState(false);
  const [mpArea, setMpArea] = useState('');
  const [mpPhone, setMpPhone] = useState('');
  const [mpNote, setMpNote] = useState('');

  // Action logs
  const [actionLogs] = useState<ActionLog[]>(getActionLogs);

  const saveMissingPersons = (list: MissingPersonRequest[]) => {
    setMissingPersons(list);
    localStorage.setItem('flooded_missing_persons', JSON.stringify(list));
  };

  const filteredReports = useMemo(() => {
    if (filterStatus === 'all') return sosReports;
    if (filterStatus === 'unsynced') return sosReports.filter(r => r.syncStatus === 'pending');
    if (filterStatus === 'critical') return sosReports.filter(r => r.healthStatus === 'critical' || r.healthStatus === 'unconscious');
    return sosReports.filter(r => r.healthStatus === filterStatus);
  }, [sosReports, filterStatus]);

  const stats = useMemo(() => ({
    total: sosReports.length,
    critical: sosReports.filter(r => r.healthStatus === 'critical' || r.healthStatus === 'unconscious').length,
    injured: sosReports.filter(r => r.healthStatus === 'injured').length,
    ok: sosReports.filter(r => r.healthStatus === 'ok').length,
    unsynced: pendingCount,
  }), [sosReports, pendingCount]);

  const handleSync = async () => {
    setIsSyncing(true);
    const result = await triggerSync();
    addActionLog(`Đồng bộ: ${result.syncedCount} báo cáo`);
    setIsSyncing(false);
    if (result.syncedCount > 0) toast.success(language === 'vi' ? `Đã đồng bộ ${result.syncedCount}` : `Synced ${result.syncedCount}`);
  };

  const updateReportStatus = (reportId: string, status: string) => {
    const updated = { ...reportStatuses, [reportId]: status };
    setReportStatuses(updated);
    localStorage.setItem('flooded_report_statuses', JSON.stringify(updated));
    addActionLog(`${status}: ${reportId.slice(0, 8)}`, reportId);
    toast.success(language === 'vi' ? `Đã cập nhật: ${status}` : `Updated: ${status}`);
  };

  const exportData = (format: 'csv' | 'json') => {
    const allData = { sosReports: filteredReports, missingPersons, actionLogs: getActionLogs() };
    let content: string, filename: string, mimeType: string;
    if (format === 'json') {
      content = JSON.stringify(allData, null, 2); filename = 'flooded-export.json'; mimeType = 'application/json';
    } else {
      const headers = ['ID', 'Thời gian', 'Trạng thái sức khỏe', 'Số người', 'Vĩ độ', 'Kinh độ', 'Đồng bộ', 'Trạng thái xử lý'];
      const rows = filteredReports.map(r => [r.id.slice(0, 8), new Date(r.timestamp).toISOString(), r.healthStatus, r.peopleCount, r.location?.latitude || '', r.location?.longitude || '', r.syncStatus, reportStatuses[r.id] || 'Mới']);
      content = [headers.join(','), ...rows.map(r => r.join(','))].join('\n'); filename = 'flooded-export.csv'; mimeType = 'text/csv';
    }
    const blob = new Blob([content], { type: mimeType }); const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url);
    addActionLog(`Xuất dữ liệu ${format.toUpperCase()}`);
  };

  const getStatusColor = (status: HealthStatus) => {
    switch (status) { case 'critical': case 'unconscious': return 'bg-[hsl(var(--status-critical))]'; case 'injured': return 'bg-[hsl(var(--status-injured))]'; case 'ok': return 'bg-[hsl(var(--status-ok))]'; default: return 'bg-[hsl(var(--status-unknown))]'; }
  };

  const handleSubmitMissing = () => {
    if (!mpName.trim() || !mpProvince || !mpPhone.trim()) {
      toast.error(language === 'vi' ? 'Nhập tên, tỉnh/thành và SĐT' : 'Name, province and phone required');
      return;
    }
    const req: MissingPersonRequest = { id: uuidv4(), personName: mpName.trim(), province: mpProvince, areaDescription: mpArea.trim(), contactPhone: mpPhone.trim(), note: mpNote.trim().slice(0, 120), status: 'new', createdAt: Date.now() };
    saveMissingPersons([req, ...missingPersons]);
    setMpName(''); setMpProvince(''); setMpProvinceSearch(''); setMpArea(''); setMpPhone(''); setMpNote('');
    setShowMissingForm(false);
    addActionLog(`Thêm tìm người: ${mpName.trim()}`);
    toast.success(language === 'vi' ? 'Đã gửi yêu cầu' : 'Request sent');
  };

  const updateMissingStatus = (id: string, status: MissingPersonRequest['status']) => {
    saveMissingPersons(missingPersons.map(m => m.id === id ? { ...m, status } : m));
    addActionLog(`Tìm người ${status}: ${id.slice(0, 8)}`);
  };

  const filteredProvinces = provinces.filter(p => p.toLowerCase().includes(mpProvinceSearch.toLowerCase()));
  const selectedReport = sosReports.find(r => r.id === selectedReportId);

  const openDirections = (report: SOSReport) => {
    if (report.location) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${report.location.latitude},${report.location.longitude}`, '_blank');
    }
  };

  const statusLabels = [
    { key: 'new', vi: 'Mới', en: 'New' },
    { key: 'processing', vi: 'Đang xử lý', en: 'Processing' },
    { key: 'done', vi: 'Đã xử lý', en: 'Done' },
    { key: 'closed', vi: 'Đóng', en: 'Closed' },
  ];

  return (
    <div className="min-h-screen bg-background pb-8">
      <header className="sticky top-0 bg-background/95 backdrop-blur border-b border-border z-10">
        <div className="flex items-center gap-4 p-4">
          <Link to="/more" className="p-2 rounded-lg bg-secondary">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1">
            <h1 className="font-bold text-lg flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              {language === 'vi' ? 'Quản lý cứu hộ' : 'Rescue Dashboard'}
            </h1>
            <p className="text-xs text-muted-foreground">{language === 'vi' ? 'Dành cho đội điều phối' : 'For coordination teams'}</p>
          </div>
          <button onClick={handleSync} disabled={isSyncing || !isOnline} className="p-2 rounded-lg bg-secondary disabled:opacity-50">
            <RefreshCw className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Triage Stats */}
        <div className="grid grid-cols-5 gap-1.5 px-4 mb-3">
          {[
            { label: language === 'vi' ? 'Tổng' : 'All', value: stats.total, color: 'bg-muted', filter: 'all' as FilterStatus },
            { label: language === 'vi' ? 'Nguy kịch' : 'Critical', value: stats.critical, color: 'bg-[hsl(var(--status-critical))]', filter: 'critical' as FilterStatus },
            { label: language === 'vi' ? 'Bị thương' : 'Injured', value: stats.injured, color: 'bg-[hsl(var(--status-injured))]', filter: 'injured' as FilterStatus },
            { label: 'OK', value: stats.ok, color: 'bg-[hsl(var(--status-ok))]', filter: 'ok' as FilterStatus },
            { label: language === 'vi' ? 'Chờ gửi' : 'Queue', value: stats.unsynced, color: 'bg-warning', filter: 'unsynced' as FilterStatus },
          ].map((stat) => (
            <button key={stat.label} onClick={() => setFilterStatus(stat.filter)}
              className={`tactical-card p-2 text-center transition-all ${filterStatus === stat.filter ? 'ring-2 ring-accent' : ''}`}>
              <div className={`w-3 h-3 rounded-full ${stat.color} mx-auto mb-1`} />
              <p className="text-lg font-bold">{stat.value}</p>
              <p className="text-[10px] text-muted-foreground">{stat.label}</p>
            </button>
          ))}
        </div>

        {/* View tabs */}
        <div className="flex items-center gap-1.5 px-4 pb-3 overflow-x-auto">
          {[
            { mode: 'list' as ViewMode, icon: List, vi: 'Danh sách', en: 'List' },
            { mode: 'map' as ViewMode, icon: MapPin, vi: 'Bản đồ', en: 'Map' },
            { mode: 'missing' as ViewMode, icon: UserSearch, vi: 'Tìm người', en: 'Missing' },
            { mode: 'log' as ViewMode, icon: FileText, vi: 'Nhật ký', en: 'Log' },
          ].map(tab => (
            <button key={tab.mode} onClick={() => setViewMode(tab.mode)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap flex items-center gap-1 ${viewMode === tab.mode ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
              <tab.icon className="w-4 h-4" />{language === 'vi' ? tab.vi : tab.en}
            </button>
          ))}
        </div>
      </header>

      <main className="px-4 pt-3">
        {/* ============= MAP VIEW ============= */}
        {viewMode === 'map' && (
          <div className="space-y-3">
            <div className="tactical-card p-3">
              <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                {language === 'vi' ? 'Bản đồ mô phỏng — vị trí ước lượng, không chính xác tuyệt đối' : 'Simulated map — estimated positions'}
              </p>
            </div>
            <div className="tactical-card p-4 relative overflow-hidden">
              <div className="relative w-full h-[300px] bg-secondary/50 rounded-lg">
                {filteredReports.slice(0, 30).map((report, index) => {
                  const hash = report.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                  const x = (hash % 80) + 10; const y = ((hash * 7) % 80) + 10;
                  return (
                    <motion.button key={report.id} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: index * 0.03 }}
                      onClick={() => setSelectedReportId(report.id)}
                      className={`absolute w-5 h-5 rounded-full ${getStatusColor(report.healthStatus)} shadow-lg ring-2 ring-background cursor-pointer hover:scale-125 transition-transform`}
                      style={{ left: `${x}%`, top: `${y}%` }}
                    />
                  );
                })}
                {filteredReports.length === 0 && <p className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">{language === 'vi' ? 'Chưa có điểm SOS' : 'No SOS points'}</p>}
              </div>
            </div>

            {/* Selected report sheet */}
            <AnimatePresence>
              {selectedReport && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="tactical-card space-y-3">
                  <div className="flex items-center justify-between">
                    <StatusBadge status={selectedReport.healthStatus} size="sm" language={language} />
                    <button onClick={() => setSelectedReportId(null)}><X className="w-4 h-4 text-muted-foreground" /></button>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><span className="text-xs text-muted-foreground">{language === 'vi' ? 'Số người' : 'People'}</span><p className="font-bold text-lg">{selectedReport.peopleCount}</p></div>
                    <div><span className="text-xs text-muted-foreground">{language === 'vi' ? 'Thời gian' : 'Time'}</span><p className="font-mono text-xs">{new Date(selectedReport.timestamp).toLocaleString()}</p></div>
                    <div className="col-span-2"><span className="text-xs text-muted-foreground">{language === 'vi' ? 'Vị trí (ước lượng)' : 'Location (estimated)'}</span><p className="font-mono text-xs">{selectedReport.location ? `${selectedReport.location.latitude.toFixed(5)}, ${selectedReport.location.longitude.toFixed(5)}` : 'N/A'}</p></div>
                    {selectedReport.needTags && selectedReport.needTags.length > 0 && (
                      <div className="col-span-2"><span className="text-xs text-muted-foreground">{language === 'vi' ? 'Nhu cầu' : 'Needs'}</span>
                        <div className="flex flex-wrap gap-1 mt-1">{selectedReport.needTags.map((t, i) => <span key={i} className="px-2 py-0.5 rounded bg-secondary text-xs">{t}</span>)}</div>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => updateReportStatus(selectedReport.id, 'Đã nhận ca')} className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-bold flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />{language === 'vi' ? 'Nhận ca' : 'Accept'}
                    </button>
                    {selectedReport.location && (
                      <button onClick={() => openDirections(selectedReport)} className="flex-1 py-2 bg-accent text-accent-foreground rounded-lg text-sm font-bold flex items-center justify-center gap-1">
                        <Navigation className="w-4 h-4" />{language === 'vi' ? 'Chỉ đường' : 'Directions'}
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* ============= LIST VIEW (SOS Inbox) ============= */}
        {viewMode === 'list' && (
          <div className="space-y-2">
            {filteredReports.length === 0 ? (
              <div className="tactical-card p-8 text-center"><p className="text-muted-foreground">{language === 'vi' ? 'Chưa có báo cáo SOS' : 'No SOS reports'}</p></div>
            ) : filteredReports.map((report, index) => {
              const rStatus = reportStatuses[report.id] || (language === 'vi' ? 'Mới' : 'New');
              return (
                <motion.div key={report.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.02 }} className="tactical-card p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full ${getStatusColor(report.healthStatus)}`} />
                      <StatusBadge status={report.healthStatus} size="sm" language={language} />
                    </div>
                    <span className="text-xs text-muted-foreground font-mono">{new Date(report.timestamp).toLocaleString()}</span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">{language === 'vi' ? 'Người' : 'People'}</span>
                      <p className="font-bold text-base">{report.peopleCount}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">{language === 'vi' ? 'Vị trí' : 'Location'}</span>
                      <p className="font-mono">{report.location ? `${report.location.latitude.toFixed(4)}, ${report.location.longitude.toFixed(4)}` : 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">{language === 'vi' ? 'Đồng bộ' : 'Sync'}</span>
                      <p className={report.syncStatus === 'synced' ? 'text-[hsl(var(--success))]' : 'text-warning'}>{report.syncStatus === 'synced' ? '✓ Đã gửi' : '○ Chờ'}</p>
                    </div>
                  </div>

                  {report.needTags && report.needTags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {report.needTags.map((t, i) => <span key={i} className="px-2 py-0.5 rounded bg-secondary text-xs">{t}</span>)}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-1 border-t border-border">
                    <div className="flex gap-1 flex-1 overflow-x-auto">
                      {statusLabels.map(s => (
                        <button key={s.key} onClick={() => updateReportStatus(report.id, s.vi)}
                          className={`px-2 py-1 rounded text-[11px] whitespace-nowrap ${rStatus === s.vi ? 'bg-primary text-primary-foreground font-bold' : 'bg-secondary text-muted-foreground'}`}>
                          {language === 'vi' ? s.vi : s.en}
                        </button>
                      ))}
                    </div>
                    {report.location && (
                      <button onClick={() => openDirections(report)} className="p-1.5 rounded bg-accent/20 text-accent shrink-0">
                        <Navigation className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* ============= MISSING PERSONS ============= */}
        {viewMode === 'missing' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-medium">{language === 'vi' ? 'Yêu cầu tìm người' : 'Missing Persons'} ({missingPersons.length})</h2>
              <button onClick={() => setShowMissingForm(true)} className="p-2 rounded-lg bg-primary text-primary-foreground">
                <Plus className="w-5 h-5" />
              </button>
            </div>

            <div className="tactical-card p-3">
              <p className="text-xs text-muted-foreground flex items-start gap-1">
                <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
                {language === 'vi' ? 'Thông tin do người thân cung cấp, có thể chưa chính xác. Không overclaim vị trí.' : 'Info provided by relatives, may be inaccurate.'}
              </p>
            </div>

            <AnimatePresence>
              {showMissingForm && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="tactical-card space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{language === 'vi' ? 'Thêm yêu cầu' : 'Add Request'}</h3>
                    <button onClick={() => setShowMissingForm(false)}><X className="w-5 h-5 text-muted-foreground" /></button>
                  </div>
                  <input type="text" value={mpName} onChange={(e) => setMpName(e.target.value)} placeholder={language === 'vi' ? 'Họ tên người cần tìm *' : 'Person name *'} className="w-full px-3 py-2 bg-secondary rounded-lg text-sm focus:outline-none" />
                  <div className="relative">
                    <input type="text" value={mpProvinceSearch} onChange={(e) => { setMpProvinceSearch(e.target.value); setMpShowDropdown(true); }} onFocus={() => setMpShowDropdown(true)}
                      placeholder={language === 'vi' ? 'Tỉnh/Thành phố * (tìm kiếm)' : 'Province *'} className="w-full px-3 py-2 bg-secondary rounded-lg text-sm focus:outline-none" />
                    {mpShowDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg max-h-36 overflow-y-auto z-30">
                        {filteredProvinces.slice(0, 15).map(p => (
                          <button key={p} onClick={() => { setMpProvince(p); setMpProvinceSearch(p); setMpShowDropdown(false); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-secondary ${mpProvince === p ? 'bg-primary/10 font-medium' : ''}`}>{p}</button>
                        ))}
                      </div>
                    )}
                  </div>
                  <input type="text" value={mpArea} onChange={(e) => setMpArea(e.target.value)} placeholder={language === 'vi' ? 'Khu vực (xã/phường, mô tả)' : 'Area'} className="w-full px-3 py-2 bg-secondary rounded-lg text-sm focus:outline-none" />
                  <input type="tel" value={mpPhone} onChange={(e) => setMpPhone(e.target.value)} placeholder={language === 'vi' ? 'SĐT liên hệ *' : 'Phone *'} className="w-full px-3 py-2 bg-secondary rounded-lg text-sm focus:outline-none" />
                  <div className="relative">
                    <input type="text" value={mpNote} onChange={(e) => setMpNote(e.target.value.slice(0, 120))} placeholder={language === 'vi' ? 'Ghi chú...' : 'Note...'} className="w-full px-3 py-2 bg-secondary rounded-lg text-sm focus:outline-none pr-14" maxLength={120} />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">{mpNote.length}/120</span>
                  </div>
                  <button onClick={handleSubmitMissing} className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-bold">{language === 'vi' ? 'Gửi yêu cầu' : 'Submit'}</button>
                </motion.div>
              )}
            </AnimatePresence>

            {missingPersons.map((mp) => (
              <motion.div key={mp.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="tactical-card p-3 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-bold text-base">{mp.personName}</p>
                    <p className="text-xs text-muted-foreground">{mp.province}{mp.areaDescription ? ` • ${mp.areaDescription}` : ''}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                    mp.status === 'new' ? 'bg-destructive/20 text-destructive' : mp.status === 'processing' ? 'bg-warning/20 text-warning' : mp.status === 'contacted' ? 'bg-[hsl(var(--success))]/20 text-[hsl(var(--success))]' : 'bg-muted text-muted-foreground'
                  }`}>{mp.status === 'new' ? 'Mới' : mp.status === 'processing' ? 'Đang xử lý' : mp.status === 'contacted' ? 'Đã liên hệ' : 'Đóng'}</span>
                </div>
                <p className="text-sm flex items-center gap-1"><Phone className="w-3 h-3" />{mp.contactPhone}</p>
                {mp.note && <p className="text-sm text-muted-foreground">{mp.note}</p>}
                <div className="flex gap-1.5 pt-1">
                  {(['new', 'processing', 'contacted', 'closed'] as const).map(s => (
                    <button key={s} onClick={() => updateMissingStatus(mp.id, s)}
                      className={`px-2 py-1 rounded text-xs ${mp.status === s ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}>
                      {s === 'new' ? 'Mới' : s === 'processing' ? 'Xử lý' : s === 'contacted' ? 'Đã LH' : 'Đóng'}
                    </button>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* ============= ACTION LOG ============= */}
        {viewMode === 'log' && (
          <div className="space-y-2">
            <h2 className="font-medium text-sm text-muted-foreground mb-3">{language === 'vi' ? 'Nhật ký thao tác' : 'Action Log'}</h2>
            {getActionLogs().length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">{language === 'vi' ? 'Chưa có thao tác nào' : 'No actions yet'}</p>
            ) : getActionLogs().slice(0, 50).map(log => (
              <div key={log.id} className="tactical-card p-3 flex items-center justify-between">
                <p className="text-sm">{log.action}</p>
                <span className="text-xs text-muted-foreground font-mono">{new Date(log.timestamp).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        )}

        {/* Export */}
        {(viewMode === 'list' || viewMode === 'map') && (
          <div className="flex gap-2 mt-4">
            <button onClick={() => exportData('csv')} className="flex-1 py-3 bg-secondary rounded-lg font-medium text-sm flex items-center justify-center gap-2">
              <Download className="w-4 h-4" />CSV
            </button>
            <button onClick={() => exportData('json')} className="flex-1 py-3 bg-secondary rounded-lg font-medium text-sm flex items-center justify-center gap-2">
              <Download className="w-4 h-4" />JSON
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
