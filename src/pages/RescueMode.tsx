import { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Inbox, MapIcon, Users2, Layers, Settings as SettingsIcon,
  ArrowLeft, RefreshCw, Download, Phone, Navigation, CheckCircle2,
  AlertTriangle, X, Shield, Send, Plus, MapPin, Loader2,
  Eye, UserPlus, Clock, ChevronRight, Copy, MoreVertical,
  XCircle, Flag, Truck, Target, Search, PhoneCall, FileWarning,
  Timer, Ban, LogOut, HeartHandshake
} from 'lucide-react';
import commandMapImg from '@/assets/command-map.jpg';
import { GatewayBadge } from '@/components/GatewayBadge';
import { useGatewayCases } from '@/hooks/useGatewayCases';
import RescueMap from '@/components/RescueMap';
import { useApp } from '@/contexts/AppContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { provinces } from '@/lib/provinces';
import {
  seedDemoData, getCases, saveCases, getTeams, saveTeams, getZones, saveZones,
  getLogs, addLog, updateCaseStatus, assignTeamToCase, getZoneStats,
  haversineKm, estimateETA, simulateTeamMovement,
  caseStatusMeta, severityMeta, teamStatusMeta, pipelineFilters, filterCasesByPipeline,
  type SOSCase, type CaseStatus, type CaseSeverity, type RescueTeamAccount,
  type Zone, type TeamStatus, type CaseLog, type PipelineFilterKey,
} from '@/lib/commandCenter';
import {
  getRegistrations, approveRegistration, rejectRegistration,
  teamTypeLabels, vehicleTypeLabels, availabilityLabels,
  type RescueTeamRegistration, type RegistrationStatus,
} from '@/lib/rescueRegistration';
import {
  getStormZones, seedStormZones, addStormZone, updateStormZone, deleteStormZone,
  type StormZone,
} from '@/lib/stormZones';
import {
  getRelativeReports, acceptRelativeReport, rejectRelativeReport, resetRelativeReview,
  simulateRelativeReport, urgencyLabels, urgencyToSeverity,
  type RelativeReport,
} from '@/lib/relativeReports';

type CCTab = 'cases' | 'map' | 'teams' | 'zones' | 'relatives';

function timeAgo(ts: number, vi: boolean): string {
  const diff = (Date.now() - ts) / 60000;
  if (diff < 1) return vi ? 'vừa xong' : 'just now';
  if (diff < 60) return `${Math.floor(diff)} ${vi ? 'phút trước' : 'min ago'}`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ${vi ? 'trước' : 'ago'}`;
  return `${Math.floor(diff / 1440)}d`;
}

export default function RescueMode() {
  const { language, updateAppSettings } = useApp();
  const navigate = useNavigate();
  const vi = language === 'vi';

  // Auth guard: require COMMAND login
  useEffect(() => {
    const authed = sessionStorage.getItem('flooded_command_auth');
    if (!authed) { navigate('/command-login'); return; }
  }, [navigate]);

  // Seed on mount
  useEffect(() => { seedDemoData(); seedStormZones(); }, []);

  // Simulate team movement
  useEffect(() => {
    const iv = setInterval(simulateTeamMovement, 5000);
    return () => clearInterval(iv);
  }, []);

  const [tab, setTab] = useState<CCTab>('cases');
  const [cases, setCases] = useState<SOSCase[]>(getCases);
  const [teams, setTeamsState] = useState<RescueTeamAccount[]>(getTeams);
  const [zones, setZonesState] = useState<Zone[]>(getZones);
  const [logs, setLogs] = useState<CaseLog[]>(getLogs);
  const [stormZones, setStormZonesState] = useState<StormZone[]>(getStormZones);
  const [relativeReports, setRelativeReports] = useState<RelativeReport[]>(getRelativeReports);

  // Refresh from storage
  const refresh = useCallback(() => {
    setCases(getCases());
    setTeamsState(getTeams());
    setZonesState(getZones());
    setLogs(getLogs());
    setStormZonesState(getStormZones());
    setRelativeReports(getRelativeReports());
  }, []);

  // Auto-refresh every 5s
  useEffect(() => { const iv = setInterval(refresh, 5000); return () => clearInterval(iv); }, [refresh]);

  // Gateway data layer: poll http://192.168.4.1/api/cases every 4s (Dexie-backed)
  const { status: gatewayStatus, cases: gatewayCases } = useGatewayCases();
  useEffect(() => { if (gatewayCases.length) setCases(gatewayCases); }, [gatewayCases]);

  // Filters
  const [pipelineFilter, setPipelineFilter] = useState<PipelineFilterKey>('ALL');
  const [severityFilter, setSeverityFilter] = useState<CaseSeverity | 'ALL'>('ALL');
  const [searchText, setSearchText] = useState('');

  // Detail drawer
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [showTeamForm, setShowTeamForm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ label: string; description: string; onConfirm: () => void } | null>(null);
  const [showRegistrations, setShowRegistrations] = useState(false);
  const [registrations, setRegistrations] = useState<RescueTeamRegistration[]>(getRegistrations);
  const [selectedRegId, setSelectedRegId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [approvedCreds, setApprovedCreds] = useState<{ teamCode: string; teamName: string } | null>(null);
  // Storm zone management
  const [showStormEditor, setShowStormEditor] = useState(false);
  const [newStormName, setNewStormName] = useState('');
  const [newStormCoords, setNewStormCoords] = useState('');
  // Coordination modal (approved teams)
  const [showCoordination, setShowCoordination] = useState(false);
  // Relative (remote) SOS reports review
  const [showRelativeReports, setShowRelativeReports] = useState(false);
  const [relFilter, setRelFilter] = useState<'PENDING' | 'ACCEPTED' | 'REJECTED'>('PENDING');
  const [relRejectId, setRelRejectId] = useState<string | null>(null);
  const [relRejectReason, setRelRejectReason] = useState('');

  // Filtered & sorted cases: RED first, then oldest first
  const filteredCases = useMemo(() => {
    let r = [...cases];
    r = filterCasesByPipeline(r, pipelineFilter);
    if (severityFilter !== 'ALL') r = r.filter(c => c.severity === severityFilter);
    if (searchText) {
      const q = searchText.toLowerCase();
      r = r.filter(c => c.reporterName.toLowerCase().includes(q) || c.locationText.toLowerCase().includes(q) || (c.victimName || '').toLowerCase().includes(q) || c.id.includes(q));
    }
    const sev = { RED: 0, ORANGE: 1, GREEN: 2 };
    r.sort((a, b) => sev[a.severity] - sev[b.severity] || a.createdAt - b.createdAt);
    return r;
  }, [cases, pipelineFilter, severityFilter, searchText]);

  // Stats
  const stats = useMemo(() => ({
    total: cases.length,
    red: cases.filter(c => c.severity === 'RED').length,
    orange: cases.filter(c => c.severity === 'ORANGE').length,
    green: cases.filter(c => c.severity === 'GREEN').length,
    waitSafe: cases.filter(c => c.status === 'WAITING_SAFE_CONDITIONS').length,
    active: cases.filter(c => !['CLOSED', 'RESCUED', 'DUPLICATE', 'FALSE_REPORT'].includes(c.status)).length,
  }), [cases]);

  // Actions
  const doUpdateStatus = (caseId: string, status: CaseStatus, note?: string) => {
    updateCaseStatus(caseId, status, note);
    refresh();
    toast.success(`${caseStatusMeta[status][vi ? 'vi' : 'en']}`);
  };

  const doAssign = (caseId: string, teamId: string) => {
    assignTeamToCase(caseId, teamId);
    refresh();
    toast.success(vi ? 'Đã phân công' : 'Assigned');
  };

  const doApproveRegistration = (id: string) => {
    const creds = approveRegistration(id);
    if (creds) {
      setApprovedCreds(creds);
      setRegistrations(getRegistrations());
      refresh();
      toast.success(vi ? 'Đã duyệt — chuyển sang Điều phối cứu hộ để triển khai' : 'Approved — go to Coordination to dispatch');
    }
  };

  // Dispatch approved team into active teams list
  const doDispatchTeam = (reg: RescueTeamRegistration) => {
    const t = getTeams();
    // Check if already dispatched
    if (t.find(x => x.name === reg.teamName && x.leaderPhone === reg.leaderPhone)) {
      toast.error(vi ? 'Đội này đã được điều phối rồi' : 'Team already dispatched');
      return;
    }
    const nt: RescueTeamAccount = {
      id: uuidv4(), name: reg.teamName, leaderName: reg.leaderName, leaderPhone: reg.leaderPhone,
      membersCount: reg.membersCount, vehicleType: reg.vehicleTypes.map(v => vehicleTypeLabels[v]).join(', '),
      username: reg.leaderName, password: reg.leaderPhone,
      status: 'AVAILABLE', lastUpdated: Date.now(),
    };
    t.push(nt);
    saveTeams(t);
    refresh();
    toast.success(vi ? `Đã điều phối đội "${reg.teamName}" vào danh sách` : `Dispatched "${reg.teamName}"`);
  };

  const doRejectRegistration = (id: string) => {
    if (!rejectReason.trim()) { toast.error(vi ? 'Vui lòng nhập lý do' : 'Please enter reason'); return; }
    rejectRegistration(id, rejectReason.trim());
    setRegistrations(getRegistrations());
    setShowRejectForm(false);
    setRejectReason('');
    toast.success(vi ? 'Đã từ chối hồ sơ' : 'Registration rejected');
  };

  const pendingRegs = useMemo(() => registrations.filter(r => r.status === 'PENDING'), [registrations]);

  // ===== Relative (remote) SOS reports =====
  const pendingRelReports = useMemo(() => relativeReports.filter(r => (r.review ?? 'PENDING') === 'PENDING'), [relativeReports]);
  const filteredRelReports = useMemo(
    () => relativeReports.filter(r => (r.review ?? 'PENDING') === relFilter),
    [relativeReports, relFilter]
  );

  const doAcceptRelative = (id: string) => {
    const created = acceptRelativeReport(id);
    setConfirmAction(null);
    refresh();
    if (created) {
      // Move the approved report straight into SOS Cases for dispatching
      setShowRelativeReports(false);
      setRelRejectId(null);
      setPipelineFilter('ALL');
      setSeverityFilter('ALL');
      setSearchText('');
      setTab('cases');
      setSelectedCaseId(created.id);
      toast.success(vi ? 'Đã tạo ca SOS từ hồ sơ báo hộ — sẵn sàng phân công đội' : 'SOS case created — ready to assign a team');
    } else {
      toast.error(vi ? 'Không thể xử lý hồ sơ này' : 'Cannot process this report');
    }
  };


  const doRejectRelative = () => {
    if (!relRejectId) return;
    if (!relRejectReason.trim()) { toast.error(vi ? 'Vui lòng nhập lý do' : 'Please enter a reason'); return; }
    rejectRelativeReport(relRejectId, relRejectReason.trim());
    setRelRejectId(null);
    setRelRejectReason('');
    refresh();
    toast.success(vi ? 'Đã từ chối hồ sơ' : 'Report rejected');
  };

  const doSimulateRelative = () => {
    const r = simulateRelativeReport();
    refresh();
    setRelFilter('PENDING');
    toast.success(vi ? `Mô phỏng: hồ sơ báo hộ "${r.personName}"` : `Simulated relative report: ${r.personName}`);
  };

  const doTeamStatus = (teamId: string, status: TeamStatus) => {
    const t = getTeams();
    const i = t.findIndex(x => x.id === teamId);
    if (i === -1) return;
    t[i].status = status;
    t[i].lastUpdated = Date.now();
    if (status === 'AVAILABLE' || status === 'OFFLINE') { t[i].assignedCaseId = undefined; }
    saveTeams(t);
    refresh();
  };

  const exportData = (fmt: 'csv' | 'json') => {
    const data = { cases, teams, zones, logs };
    let content: string, filename: string, mime: string;
    if (fmt === 'json') {
      content = JSON.stringify(data, null, 2); filename = 'command-center-export.json'; mime = 'application/json';
    } else {
      const h = ['ID', 'Severity', 'Status', 'Reporter', 'Phone', 'Location', 'People', 'Team', 'Created'];
      const rows = cases.map(c => [c.id.slice(0, 8), c.severity, c.status, c.reporterName, c.reporterPhone, `"${c.locationText}"`, c.peopleCount, teams.find(t => t.id === c.assignedTeamId)?.name || '', new Date(c.createdAt).toISOString()]);
      content = [h.join(','), ...rows.map(r => r.join(','))].join('\n'); filename = 'command-center-export.csv'; mime = 'text/csv';
    }
    const blob = new Blob([content], { type: mime }); const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url);
  };

  const handleDisable = () => { sessionStorage.removeItem('flooded_command_auth'); updateAppSettings({ rescueMode: false }); navigate('/settings'); };
  const handleCommandLogout = () => { sessionStorage.removeItem('flooded_command_auth'); navigate('/command-login'); };

  const selectedCase = cases.find(c => c.id === selectedCaseId);
  const caseLogs = selectedCaseId ? logs.filter(l => l.caseId === selectedCaseId).sort((a, b) => b.timestamp - a.timestamp) : [];

  const tabs: { id: CCTab; icon: typeof Inbox; vi: string; en: string; badge?: number }[] = [
    { id: 'cases', icon: Inbox, vi: 'SOS Cases', en: 'SOS Cases', badge: stats.active },
    { id: 'map', icon: MapIcon, vi: 'Bản đồ', en: 'Map' },
    { id: 'relatives', icon: HeartHandshake, vi: 'Báo hộ', en: 'Relatives', badge: pendingRelReports.length },
    { id: 'teams', icon: Users2, vi: 'Đội', en: 'Teams', badge: teams.filter(t => t.status === 'AVAILABLE').length },
    { id: 'zones', icon: Layers, vi: 'Khu vực', en: 'Zones' },
  ];


  // ========== CASE DETAIL DRAWER ==========
  const renderCaseDrawer = () => {
    if (!selectedCase) return null;
    const sev = severityMeta[selectedCase.severity];
    const st = caseStatusMeta[selectedCase.status];
    const assignedTeam = teams.find(t => t.id === selectedCase.assignedTeamId);
    const availableTeams = teams.filter(t => t.status === 'AVAILABLE');
    const zone = zones.find(z => z.id === selectedCase.zoneId);

    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 z-50 flex items-end sm:items-center justify-center" onClick={() => setSelectedCaseId(null)}>
        <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }} className="bg-card w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl" onClick={e => e.stopPropagation()}>
          {/* Header */}
          <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between z-10 rounded-t-2xl">
            <div className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded-full ${sev.color}`} />
              <span className="font-bold text-sm">{selectedCase.severity === 'RED' ? (vi ? 'Cần cứu ngay' : 'Critical') : selectedCase.severity === 'ORANGE' ? (vi ? 'Nguy cơ cao' : 'High Risk') : (vi ? 'Tạm ổn' : 'Stable')}</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${st.color}`}>{st[vi ? 'vi' : 'en']}</span>
            </div>
            <button onClick={() => setSelectedCaseId(null)} className="p-1.5 rounded-lg bg-secondary"><X className="w-4 h-4" /></button>
          </div>

          <div className="p-4 space-y-4">
            {/* Basic info */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{vi ? 'Người báo' : 'Reporter'}</p>
                <p className="font-bold">{selectedCase.reporterName}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="w-3 h-3" />{selectedCase.reporterPhone}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{vi ? 'Nguồn' : 'Source'}</p>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${selectedCase.sourceType === 'citizen' ? 'bg-accent/20 text-accent' : 'bg-warning/20 text-warning'}`}>
                  {selectedCase.sourceType === 'citizen' ? (vi ? 'Người dân' : 'Citizen') : (vi ? 'Người thân' : 'Relative')}
                </span>
              </div>
              {selectedCase.victimName && (
                <div className="col-span-2">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{vi ? 'Nạn nhân' : 'Victim'}</p>
                  <p className="font-bold">{selectedCase.victimName}</p>
                </div>
              )}
              <div className="col-span-2">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{vi ? 'Vị trí' : 'Location'}</p>
                <p className="font-medium text-sm">{selectedCase.locationText}</p>
                {zone && <p className="text-xs text-muted-foreground">{zone.name}, {zone.province}</p>}
                {selectedCase.lat && <p className="text-[10px] font-mono text-muted-foreground">{selectedCase.lat.toFixed(5)}, {selectedCase.lng?.toFixed(5)}</p>}
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{vi ? 'Số người' : 'People'}</p>
                <p className="text-2xl font-bold">{selectedCase.peopleCount}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{vi ? 'Thời gian' : 'Time'}</p>
                <p className="text-xs font-mono">{timeAgo(selectedCase.createdAt, vi)}</p>
                <p className="text-[10px] text-muted-foreground">{new Date(selectedCase.createdAt).toLocaleString()}</p>
              </div>
            </div>

            {selectedCase.vulnerableGroups && (
              <div className="p-2.5 rounded-lg bg-destructive/10 border border-destructive/30">
                <p className="text-[10px] text-destructive uppercase tracking-wider font-bold mb-1">{vi ? 'Nhóm dễ tổn thương' : 'Vulnerable Groups'}</p>
                <p className="text-sm text-destructive">{selectedCase.vulnerableGroups}</p>
              </div>
            )}

            {selectedCase.description && (
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{vi ? 'Mô tả' : 'Description'}</p>
                <p className="text-sm">{selectedCase.description}</p>
              </div>
            )}

            {selectedCase.needTags && selectedCase.needTags.length > 0 && (
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{vi ? 'Nhu cầu' : 'Needs'}</p>
                <div className="flex flex-wrap gap-1">{selectedCase.needTags.map((t, i) => <span key={i} className="px-2 py-0.5 rounded bg-secondary text-xs">{t}</span>)}</div>
              </div>
            )}

            {/* Assigned team */}
            {assignedTeam && (
              <div className="p-3 rounded-lg border border-accent/30 bg-accent/5">
                <p className="text-[10px] text-accent uppercase tracking-wider font-bold mb-1">{vi ? 'Đội được phân công' : 'Assigned Team'}</p>
                <p className="font-bold text-sm">{assignedTeam.name}</p>
                <p className="text-xs text-muted-foreground">{assignedTeam.leaderName} • {assignedTeam.vehicleType}</p>
                {assignedTeam.currentLocation && selectedCase.lat && (
                  <p className="text-xs text-accent mt-1">
                    📍 {haversineKm(assignedTeam.currentLocation.lat, assignedTeam.currentLocation.lng, selectedCase.lat, selectedCase.lng!).toFixed(1)} km
                    — ETA: {estimateETA(haversineKm(assignedTeam.currentLocation.lat, assignedTeam.currentLocation.lng, selectedCase.lat, selectedCase.lng!))}
                  </p>
                )}
              </div>
            )}

            {/* Quick status actions */}
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">{vi ? 'Cập nhật trạng thái' : 'Update Status'}</p>
              <div className="grid grid-cols-3 gap-1.5">
                {selectedCase.status === 'NEW' && (
                  <button onClick={() => setConfirmAction({ label: vi ? 'Xác minh' : 'Verify', description: vi ? 'Bắt đầu xác minh ca SOS này?' : 'Start verifying this SOS case?', onConfirm: () => { doUpdateStatus(selectedCase.id, 'VERIFYING', vi ? 'Bắt đầu xác minh' : 'Start verifying'); setConfirmAction(null); } })} className="py-2 rounded-lg bg-warning/20 text-warning text-xs font-bold flex items-center justify-center gap-1"><Eye className="w-3 h-3" />{vi ? 'Xác minh' : 'Verify'}</button>
                )}
                {(selectedCase.status === 'VERIFYING') && (
                  <button onClick={() => setConfirmAction({ label: vi ? 'Đã xác minh' : 'Verified', description: vi ? 'Xác nhận ca này đã được xác minh?' : 'Confirm this case is verified?', onConfirm: () => { doUpdateStatus(selectedCase.id, 'VERIFIED'); setConfirmAction(null); } })} className="py-2 rounded-lg bg-accent/20 text-accent text-xs font-bold flex items-center justify-center gap-1"><CheckCircle2 className="w-3 h-3" />{vi ? 'Đã xác minh' : 'Verified'}</button>
                )}
                {(['NEW', 'VERIFIED', 'WAITING_FOR_ASSIGNMENT'] as CaseStatus[]).includes(selectedCase.status) && (
                  <button onClick={() => setConfirmAction({ label: vi ? 'Chờ an toàn' : 'Wait Safe', description: vi ? 'Chuyển ca sang trạng thái chờ điều kiện an toàn?' : 'Set case to waiting for safe conditions?', onConfirm: () => { doUpdateStatus(selectedCase.id, 'WAITING_SAFE_CONDITIONS'); setConfirmAction(null); } })} className="py-2 rounded-lg bg-secondary text-muted-foreground text-xs font-bold flex items-center justify-center gap-1"><Timer className="w-3 h-3" />{vi ? 'Chờ an toàn' : 'Wait Safe'}</button>
                )}
                {(['ASSIGNED', 'TEAM_ACCEPTED'] as CaseStatus[]).includes(selectedCase.status) && (
                  <button onClick={() => setConfirmAction({ label: vi ? 'Đang đến' : 'En Route', description: vi ? 'Xác nhận đội đang trên đường đến?' : 'Confirm team is en route?', onConfirm: () => { doUpdateStatus(selectedCase.id, 'IN_PROGRESS'); setConfirmAction(null); } })} className="py-2 rounded-lg bg-warning/20 text-warning text-xs font-bold flex items-center justify-center gap-1"><Truck className="w-3 h-3" />{vi ? 'Đang đến' : 'En Route'}</button>
                )}
                {(['IN_PROGRESS'] as CaseStatus[]).includes(selectedCase.status) && (
                  <button onClick={() => setConfirmAction({ label: vi ? 'Đã cứu' : 'Rescued', description: vi ? 'Xác nhận ca này đã được cứu thành công?' : 'Confirm this case has been rescued?', onConfirm: () => { doUpdateStatus(selectedCase.id, 'RESCUED'); setConfirmAction(null); } })} className="py-2 rounded-lg bg-success/20 text-success text-xs font-bold flex items-center justify-center gap-1"><CheckCircle2 className="w-3 h-3" />{vi ? 'Đã cứu' : 'Rescued'}</button>
                )}
                <button onClick={() => setConfirmAction({ label: vi ? 'Báo trùng' : 'Duplicate', description: vi ? 'Đánh dấu ca này là TRÙNG LẶP? Hành động không thể hoàn tác.' : 'Mark this case as DUPLICATE? This cannot be undone.', onConfirm: () => { doUpdateStatus(selectedCase.id, 'DUPLICATE'); setConfirmAction(null); } })} className="py-2 rounded-lg bg-muted text-muted-foreground text-xs font-bold flex items-center justify-center gap-1"><Copy className="w-3 h-3" />{vi ? 'Trùng' : 'Dup'}</button>
                <button onClick={() => setConfirmAction({ label: vi ? 'Báo giả' : 'False Report', description: vi ? 'Đánh dấu ca này là BÁO GIẢ? Hành động không thể hoàn tác.' : 'Mark this case as FALSE REPORT? This cannot be undone.', onConfirm: () => { doUpdateStatus(selectedCase.id, 'FALSE_REPORT'); setConfirmAction(null); } })} className="py-2 rounded-lg bg-muted text-muted-foreground text-xs font-bold flex items-center justify-center gap-1"><Ban className="w-3 h-3" />{vi ? 'Báo giả' : 'False'}</button>
                <button onClick={() => setConfirmAction({ label: vi ? 'Đóng ca' : 'Close Case', description: vi ? 'Đóng ca SOS này? Hành động không thể hoàn tác.' : 'Close this SOS case? This cannot be undone.', onConfirm: () => { doUpdateStatus(selectedCase.id, 'CLOSED'); setConfirmAction(null); } })} className="py-2 rounded-lg bg-muted text-muted-foreground text-xs font-bold flex items-center justify-center gap-1"><XCircle className="w-3 h-3" />{vi ? 'Đóng' : 'Close'}</button>
              </div>
            </div>

            {/* Assign team */}
            {!assignedTeam && availableTeams.length > 0 && (
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">{vi ? 'Phân công đội' : 'Assign Team'}</p>
                <div className="space-y-1.5">
                  {availableTeams.map(t => {
                    const dist = t.currentLocation && selectedCase.lat ? haversineKm(t.currentLocation.lat, t.currentLocation.lng, selectedCase.lat, selectedCase.lng!) : null;
                    return (
                      <button key={t.id} onClick={() => setConfirmAction({ label: vi ? `Phân công ${t.name}` : `Assign ${t.name}`, description: vi ? `Phân công đội "${t.name}" cho ca SOS này?` : `Assign team "${t.name}" to this SOS case?`, onConfirm: () => { doAssign(selectedCase.id, t.id); setConfirmAction(null); setSelectedCaseId(null); } })}
                        className="w-full p-2.5 rounded-lg bg-secondary flex items-center justify-between hover:bg-accent/10 transition-colors">
                        <div className="text-left">
                          <p className="font-medium text-sm">{t.name}</p>
                          <p className="text-[10px] text-muted-foreground">{t.leaderName} • {t.vehicleType} • {t.membersCount}{vi ? ' người' : ' ppl'}</p>
                        </div>
                        <div className="text-right">
                          {dist !== null && (
                            <>
                              <p className="text-xs font-mono text-accent">{dist.toFixed(1)} km</p>
                              <p className="text-[10px] text-muted-foreground">ETA: {estimateETA(dist)}</p>
                            </>
                          )}
                          <ChevronRight className="w-4 h-4 text-muted-foreground inline" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Directions */}
            {selectedCase.lat && (
              <button onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${selectedCase.lat},${selectedCase.lng}`, '_blank')}
                className="w-full py-2.5 bg-accent/20 text-accent rounded-xl text-sm font-bold flex items-center justify-center gap-1">
                <Navigation className="w-4 h-4" />{vi ? 'Mở bản đồ / Chỉ đường' : 'Open Map / Directions'}
              </button>
            )}

            {/* Timeline log */}
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">{vi ? 'Nhật ký' : 'Timeline'}</p>
              {caseLogs.length === 0 ? (
                <p className="text-xs text-muted-foreground">{vi ? 'Chưa có thao tác' : 'No actions yet'}</p>
              ) : (
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {caseLogs.map(l => (
                    <div key={l.id} className="flex items-start gap-2 text-xs p-1.5 rounded bg-secondary/50">
                      <Clock className="w-3 h-3 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <span className="font-medium">{l.action}</span>
                        {l.note && <span className="text-muted-foreground"> — {l.note}</span>}
                        <p className="text-[10px] text-muted-foreground font-mono">{new Date(l.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  // ========== RENDER ==========
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Top bar */}
      <header className="sticky top-0 bg-background/95 backdrop-blur border-b border-primary/30 z-10">
        <div className="flex items-center gap-3 p-3">
          <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <h1 className="font-bold text-sm tracking-wider">{vi ? 'TRUNG TÂM ĐIỀU PHỐI' : 'COMMAND CENTER'}</h1>
            <p className="text-[10px] text-muted-foreground">{vi ? 'COMMAND Dashboard • Bảng điều phối cứu hộ' : 'COMMAND Dashboard • Rescue Coordination'}</p>
          </div>
          <button onClick={() => setShowSettings(!showSettings)} className="p-2 rounded-lg bg-secondary">
            <SettingsIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Gateway connection badge */}
        <div className="px-3 pb-2">
          <GatewayBadge status={gatewayStatus} />
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-5 gap-1 px-3 pb-2">
          {[
            { label: vi ? 'Tổng' : 'Total', val: stats.total, bg: 'bg-secondary', sev: 'ALL' as const },
            { label: vi ? 'Cần cứu ngay' : 'Critical', val: stats.red, bg: 'bg-destructive/20', sev: 'RED' as const },
            { label: vi ? 'Nguy cơ cao' : 'High Risk', val: stats.orange, bg: 'bg-warning/20', sev: 'ORANGE' as const },
            { label: vi ? 'Tạm ổn' : 'Stable', val: stats.green, bg: 'bg-success/20', sev: 'GREEN' as const },
            { label: vi ? 'Chờ AT' : 'Wait', val: stats.waitSafe, bg: 'bg-secondary', sev: 'ALL' as const },
          ].map(s => (
            <button key={s.label} onClick={() => s.label !== (vi ? 'Chờ AT' : 'Wait') ? setSeverityFilter(s.sev === severityFilter ? 'ALL' : s.sev) : null}
              className={`p-1.5 rounded-lg ${s.bg} text-center transition-all ${severityFilter === s.sev && s.sev !== 'ALL' ? 'ring-2 ring-primary' : ''}`}>
              <p className="text-lg font-bold leading-none">{s.val}</p>
              <p className="text-[9px] text-muted-foreground">{s.label}</p>
            </button>
          ))}
        </div>
      </header>

      {/* Settings panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden bg-card border-b border-border">
            <div className="p-4 space-y-3">
              <div className="flex gap-2">
                <button onClick={() => exportData('csv')} className="flex-1 py-2 bg-secondary rounded-lg text-sm font-medium flex items-center justify-center gap-1"><Download className="w-4 h-4" />CSV</button>
                <button onClick={() => exportData('json')} className="flex-1 py-2 bg-secondary rounded-lg text-sm font-medium flex items-center justify-center gap-1"><Download className="w-4 h-4" />JSON</button>
              </div>
              <p className="text-xs text-muted-foreground">{vi ? `Nhật ký: ${logs.length} thao tác` : `Logs: ${logs.length} actions`}</p>
              <button onClick={handleCommandLogout} className="w-full py-2.5 bg-warning/20 text-warning rounded-lg text-sm font-bold flex items-center justify-center gap-1"><LogOut className="w-4 h-4" />{vi ? 'Đăng xuất COMMAND' : 'Logout COMMAND'}</button>
              <button onClick={handleDisable} className="w-full py-2.5 bg-destructive/20 text-destructive rounded-lg text-sm font-bold">{vi ? 'Tắt chế độ cứu hộ' : 'Disable Rescue Mode'}</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <main className="px-3 pt-2 pb-4">
        {/* ===== TAB: SOS CASES ===== */}
        {tab === 'cases' && (
          <div className="space-y-2">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input type="text" value={searchText} onChange={e => setSearchText(e.target.value)} placeholder={vi ? 'Tìm tên, vị trí, ID...' : 'Search name, location, ID...'}
                className="w-full pl-9 pr-3 py-2 bg-secondary rounded-lg text-sm focus:outline-none" />
            </div>

            {/* Pipeline filter */}
            <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
              {pipelineFilters.map(f => (
                <button key={f.key} onClick={() => setPipelineFilter(f.key)} className={`px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all ${pipelineFilter === f.key ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}>
                  {vi ? f.vi : f.en}
                </button>
              ))}
            </div>

            {/* Relative (remote) SOS reports inbox */}
            <div className="tactical-card p-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-warning/20 flex items-center justify-center shrink-0">
                <PhoneCall className="w-4 h-4 text-warning" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm">{vi ? 'Hồ sơ báo SOS hộ người thân' : 'Relative SOS Reports'}</p>
                <p className="text-[11px] text-muted-foreground">
                  {pendingRelReports.length > 0
                    ? (vi ? `${pendingRelReports.length} hồ sơ chờ xác minh` : `${pendingRelReports.length} awaiting review`)
                    : (vi ? 'Không có hồ sơ chờ xử lý' : 'No pending reports')}
                </p>
              </div>
              <button onClick={() => { setRelativeReports(getRelativeReports()); setTab('relatives'); }}
                className="relative px-2.5 py-1.5 rounded-lg bg-warning text-warning-foreground text-xs font-bold whitespace-nowrap">
                {vi ? 'Xử lý' : 'Review'}
                {pendingRelReports.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-[9px] font-bold px-1 rounded-full">{pendingRelReports.length}</span>
                )}
              </button>
            </div>



            {/* Case list */}
            {filteredCases.length === 0 ? (
              <div className="tactical-card p-8 text-center">
                <Inbox className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground text-sm">{vi ? 'Không có case nào phù hợp' : 'No matching cases'}</p>
              </div>
            ) : (
              filteredCases.map((c, i) => {
                const sev = severityMeta[c.severity];
                const st = caseStatusMeta[c.status];
                const team = teams.find(t => t.id === c.assignedTeamId);
                return (
                  <motion.button key={c.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.015 }}
                    onClick={() => setSelectedCaseId(c.id)} className="tactical-card p-3 w-full text-left space-y-1.5 hover:border-primary/40 transition-colors">
                    {/* Row 1: severity + source + time */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-3 h-3 rounded-full ${sev.color}`} />
                        <span className={`text-xs font-bold ${c.severity === 'RED' ? 'text-destructive' : c.severity === 'ORANGE' ? 'text-warning' : 'text-success'}`}>{c.severity === 'RED' ? (vi ? 'Cần cứu ngay' : 'Critical') : c.severity === 'ORANGE' ? (vi ? 'Nguy cơ cao' : 'High Risk') : (vi ? 'Tạm ổn' : 'Stable')}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${c.sourceType === 'citizen' ? 'bg-accent/20 text-accent' : 'bg-warning/20 text-warning'}`}>
                          {c.sourceType === 'citizen' ? (vi ? 'Dân' : 'Citizen') : (vi ? 'Thân' : 'Relative')}
                        </span>
                      </div>
                      <span className="text-[10px] text-muted-foreground font-mono">{timeAgo(c.createdAt, vi)}</span>
                    </div>
                    {/* Row 2: name, phone, people */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{c.reporterName}{c.victimName ? ` → ${c.victimName}` : ''}</p>
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1"><Phone className="w-2.5 h-2.5" />{c.reporterPhone}</p>
                      </div>
                      <p className="text-lg font-bold">{c.peopleCount}<span className="text-[10px] text-muted-foreground ml-0.5">{vi ? 'người' : 'ppl'}</span></p>
                    </div>
                    {/* Row 3: location */}
                    <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3 flex-shrink-0" />{c.locationText}</p>
                    {/* Row 4: status + team */}
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${st.color}`}>{st[vi ? 'vi' : 'en']}</span>
                      {team && <span className="text-[10px] text-accent">🚤 {team.name}</span>}
                    </div>
                    {/* Quick actions */}
                    <div className="flex gap-1 pt-1 border-t border-border">
                      <button onClick={e => { e.stopPropagation(); window.open(`tel:${c.reporterPhone}`); }} className="px-2 py-1 bg-secondary rounded text-[10px] flex items-center gap-1"><PhoneCall className="w-3 h-3" />{vi ? 'Gọi' : 'Call'}</button>
                      {c.lat && <button onClick={e => { e.stopPropagation(); window.open(`https://www.google.com/maps?q=${c.lat},${c.lng}`); }} className="px-2 py-1 bg-secondary rounded text-[10px] flex items-center gap-1"><MapIcon className="w-3 h-3" />{vi ? 'Map' : 'Map'}</button>}
                      {!c.assignedTeamId && c.status !== 'CLOSED' && c.status !== 'RESCUED' && (
                        <button onClick={e => { e.stopPropagation(); setSelectedCaseId(c.id); }} className="px-2 py-1 bg-accent/20 text-accent rounded text-[10px] flex items-center gap-1"><Users2 className="w-3 h-3" />{vi ? 'Gán đội' : 'Assign'}</button>
                      )}
                    </div>
                  </motion.button>
                );
              })
            )}
          </div>
        )}

        {/* ===== TAB: RELATIVE SOS REPORTS (full page) ===== */}
        {tab === 'relatives' && (
          <div className="space-y-3">
            <div className="tactical-card p-3">
              <p className="font-bold text-sm">{vi ? 'Hồ sơ báo SOS hộ người thân' : 'Relative SOS Reports'}</p>
              <p className="text-[11px] text-muted-foreground">{vi ? 'Xác minh → tạo ca SOS chính thức' : 'Verify → create official SOS case'}</p>
              <div className="mt-2 flex items-center justify-between gap-2">
                <button onClick={() => { setRelativeReports(getRelativeReports()); toast.success(vi ? 'Đã cập nhật hồ sơ mới nhất' : 'Refreshed'); }}
                  className="flex-1 py-2 rounded-lg bg-secondary text-xs font-bold flex items-center justify-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5" />{vi ? 'Cập nhật mới nhất' : 'Refresh latest'}
                </button>
              </div>
              <button onClick={doSimulateRelative} className="mt-2 text-[10px] text-muted-foreground underline underline-offset-2">
                {vi ? 'Mô phỏng hồ sơ báo hộ mới (demo)' : 'Simulate a new relative report (demo)'}
              </button>
            </div>

            <div className="flex gap-1">
              {([
                { k: 'PENDING' as const, vi: 'Chờ xác minh', en: 'Pending' },
                { k: 'ACCEPTED' as const, vi: 'Đã tạo ca', en: 'Accepted' },
                { k: 'REJECTED' as const, vi: 'Không duyệt', en: 'Rejected' },
              ]).map(f => (
                <button key={f.k} onClick={() => setRelFilter(f.k)}
                  className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold ${relFilter === f.k ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}>
                  {vi ? f.vi : f.en} ({relativeReports.filter(r => (r.review ?? 'PENDING') === f.k).length})
                </button>
              ))}
            </div>

            {filteredRelReports.length === 0 ? (
              <div className="tactical-card p-8 text-center">
                <Inbox className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground text-sm">{vi ? 'Không có hồ sơ nào' : 'No reports'}</p>
              </div>
            ) : (
              ([
                { sev: 'RED' as const, vi: 'Cần cứu ngay', en: 'Critical' },
                { sev: 'ORANGE' as const, vi: 'Nguy cơ cao', en: 'High Risk' },
                { sev: 'GREEN' as const, vi: 'Tạm ổn', en: 'Stable' },
              ]).map(g => {
                const group = filteredRelReports.filter(r => urgencyToSeverity(r.urgency) === g.sev);
                if (group.length === 0) return null;
                return (
                  <div key={g.sev} className="space-y-2">
                    <div className="flex items-center gap-2 pt-1">
                      <div className={`w-3 h-3 rounded-full ${severityMeta[g.sev].color}`} />
                      <p className={`text-xs font-bold ${g.sev === 'RED' ? 'text-destructive' : g.sev === 'ORANGE' ? 'text-warning' : 'text-success'}`}>
                        {vi ? g.vi : g.en}
                      </p>
                      <span className="text-[10px] text-muted-foreground">({group.length})</span>
                      <div className="flex-1 h-px bg-border" />
                    </div>
                    {group.map(r => (
                      <div key={r.id} className="tactical-card p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <div className={`w-3 h-3 rounded-full ${severityMeta[urgencyToSeverity(r.urgency)].color}`} />
                            <span className="text-xs font-bold">{vi ? urgencyLabels[r.urgency].vi : urgencyLabels[r.urgency].en}</span>
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-warning/20 text-warning">{vi ? 'Báo hộ' : 'Relative'}</span>
                          </div>
                          <span className="text-[10px] text-muted-foreground font-mono">{timeAgo(r.createdAt, vi)}</span>
                        </div>

                        <div>
                          <p className="font-bold text-sm">{r.personName}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="w-3 h-3" />{r.personPhone || '—'}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" />{[r.address, r.province].filter(Boolean).join(', ') || (vi ? 'Chưa rõ' : 'Unknown')}</p>
                          {r.location && <p className="text-[10px] font-mono text-muted-foreground">{r.location.lat.toFixed(5)}, {r.location.lng.toFixed(5)}</p>}
                        </div>

                        {r.needs && r.needs.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {r.needs.map(n => <span key={n} className="px-1.5 py-0.5 rounded bg-secondary text-[10px]">{n}</span>)}
                          </div>
                        )}
                        {r.note && <p className="text-xs">{r.note}</p>}
                        <p className="text-[10px] text-muted-foreground font-mono">ID: {r.id.slice(0, 8).toUpperCase()}</p>

                        {(r.review ?? 'PENDING') === 'PENDING' ? (
                          relRejectId === r.id ? (
                            <div className="space-y-2">
                              <input type="text" value={relRejectReason} onChange={e => setRelRejectReason(e.target.value)}
                                placeholder={vi ? 'Lý do không duyệt...' : 'Rejection reason...'}
                                className="w-full px-3 py-2 bg-secondary rounded-lg text-sm focus:outline-none" />
                              <div className="flex gap-2">
                                <button onClick={() => { setRelRejectId(null); setRelRejectReason(''); }} className="flex-1 py-2 bg-secondary rounded-lg text-xs font-bold">{vi ? 'Huỷ' : 'Cancel'}</button>
                                <button onClick={doRejectRelative} className="flex-1 py-2 bg-destructive text-destructive-foreground rounded-lg text-xs font-bold">{vi ? 'Xác nhận' : 'Confirm'}</button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex gap-2">
                              <button onClick={() => setConfirmAction({
                                label: vi ? 'Tạo ca SOS?' : 'Create SOS case?',
                                description: vi ? `Hồ sơ báo hộ cho "${r.personName}" sẽ trở thành ca SOS chính thức để phân công đội.` : `Report for "${r.personName}" becomes an official SOS case.`,
                                onConfirm: () => doAcceptRelative(r.id),
                              })} className="flex-1 py-2 bg-success text-success-foreground rounded-lg text-xs font-bold flex items-center justify-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />{vi ? 'Duyệt & tạo ca' : 'Accept'}
                              </button>
                              <button onClick={() => { setRelRejectId(r.id); setRelRejectReason(''); }}
                                className="flex-1 py-2 bg-destructive/20 text-destructive rounded-lg text-xs font-bold flex items-center justify-center gap-1">
                                <Ban className="w-3.5 h-3.5" />{vi ? 'Không duyệt' : 'Reject'}
                              </button>
                            </div>
                          )
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${r.review === 'ACCEPTED' ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'}`}>
                              {r.review === 'ACCEPTED' ? (vi ? 'Đã tạo ca SOS' : 'Case created') : (vi ? 'Không duyệt' : 'Rejected')}
                            </span>
                            {r.reviewNote && <span className="text-[10px] text-muted-foreground flex-1 truncate">{r.reviewNote}</span>}
                            {r.review === 'ACCEPTED' && r.linkedCaseId && (
                              <button onClick={() => { setTab('cases'); setSelectedCaseId(r.linkedCaseId!); }}
                                className="px-2 py-1 rounded bg-secondary text-[10px] font-bold">{vi ? 'Xem ca' : 'View case'}</button>
                            )}
                            {r.review === 'REJECTED' && (
                              <button onClick={() => { resetRelativeReview(r.id); refresh(); }}
                                className="px-2 py-1 rounded bg-secondary text-[10px] font-bold">{vi ? 'Mở lại' : 'Reopen'}</button>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })
            )}
          </div>
        )}



        {/* ===== TAB: MAP ===== */}
        {tab === 'map' && (
          <div className="space-y-3">
            <div className="tactical-card p-2 flex items-center gap-2">
              <AlertTriangle className="w-3 h-3 text-warning" />
              <p className="text-[10px] text-muted-foreground">{vi ? 'Mô phỏng — Vị trí ước lượng' : 'Simulation — Estimated positions'}</p>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-3 text-[10px]">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-status-critical" />SOS RED</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-status-injured" />SOS ORANGE</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-status-ok" />SOS GREEN</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-accent ring-2 ring-accent" />{vi ? 'Đội cứu hộ' : 'Team'}</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-destructive/30 border border-destructive" />{vi ? 'Vùng bão' : 'Storm Zone'}</span>
            </div>

            <div className="tactical-card p-0 relative overflow-hidden">
              <RescueMap cases={cases} teams={teams} stormZones={stormZones} onCaseClick={setSelectedCaseId} vi={vi} />
            </div>

            {/* Storm Zone Management */}
            <div className="tactical-card p-3 space-y-2">
              <div className="flex items-center justify-between">
                <p className="font-bold text-sm">{vi ? '⚠ Vùng bão' : '⚠ Storm Zones'}</p>
                <button onClick={() => setShowStormEditor(!showStormEditor)} className="px-2 py-1 bg-primary/20 text-primary rounded text-[10px] font-bold">
                  <Plus className="w-3 h-3 inline mr-1" />{vi ? 'Thêm' : 'Add'}
                </button>
              </div>

              {showStormEditor && (
                <div className="space-y-2 p-2 bg-secondary rounded-lg">
                  <input type="text" value={newStormName} onChange={e => setNewStormName(e.target.value)} placeholder={vi ? 'Tên vùng bão...' : 'Storm zone name...'}
                    className="w-full px-3 py-2 bg-card rounded-lg text-sm focus:outline-none" />
                  <textarea value={newStormCoords} onChange={e => setNewStormCoords(e.target.value)}
                    placeholder="[[16.55,107.45],[16.55,107.80],[16.20,107.90],[16.10,107.50]]"
                    className="w-full h-20 px-3 py-2 bg-card rounded-lg text-xs font-mono resize-none focus:outline-none" />
                  <div className="flex gap-2">
                    <button onClick={() => setShowStormEditor(false)} className="flex-1 py-2 bg-card rounded-lg text-sm">{vi ? 'Huỷ' : 'Cancel'}</button>
                    <button onClick={() => {
                      try {
                        const coords = JSON.parse(newStormCoords);
                        if (!Array.isArray(coords) || coords.length < 3) throw new Error('invalid');
                        addStormZone(newStormName || 'Vùng bão mới', coords);
                        refresh();
                        setShowStormEditor(false);
                        setNewStormName('');
                        setNewStormCoords('');
                        toast.success(vi ? 'Đã thêm vùng bão' : 'Storm zone added');
                      } catch { toast.error(vi ? 'Toạ độ không hợp lệ (JSON array)' : 'Invalid coords (JSON array)'); }
                    }} className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-bold">{vi ? 'Tạo' : 'Create'}</button>
                  </div>
                </div>
              )}

              {stormZones.length === 0 ? (
                <p className="text-xs text-muted-foreground">{vi ? 'Chưa có vùng bão' : 'No storm zones'}</p>
              ) : (
                stormZones.map(sz => (
                  <div key={sz.id} className="flex items-center justify-between p-2 bg-secondary/50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">{sz.name}</p>
                      <p className="text-[10px] text-muted-foreground">{sz.polygonCoords.length} {vi ? 'điểm' : 'points'} • {sz.active ? (vi ? 'Đang hiển thị' : 'Active') : (vi ? 'Ẩn' : 'Hidden')}</p>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => { updateStormZone(sz.id, { active: !sz.active }); refresh(); }}
                        className={`px-2 py-1 rounded text-[10px] font-bold ${sz.active ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'}`}>
                        {sz.active ? (vi ? 'Ẩn' : 'Hide') : (vi ? 'Hiện' : 'Show')}
                      </button>
                      <button onClick={() => { deleteStormZone(sz.id); refresh(); toast.success(vi ? 'Đã xoá' : 'Deleted'); }}
                        className="px-2 py-1 rounded bg-destructive/20 text-destructive text-[10px] font-bold">{vi ? 'Xoá' : 'Del'}</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ===== TAB: TEAMS ===== */}
        {tab === 'teams' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-sm">{vi ? 'Đội cứu hộ' : 'Rescue Teams'} ({teams.length})</h2>
                <button onClick={() => { setShowRegistrations(true); setRegistrations(getRegistrations()); }}
                  className="relative p-1.5 rounded-lg bg-warning/20 text-warning" title={vi ? 'Hồ sơ đăng ký' : 'Registrations'}>
                  <FileWarning className="w-4 h-4" />
                  {pendingRegs.length > 0 && <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-[9px] font-bold px-1 rounded-full">{pendingRegs.length}</span>}
                </button>
              </div>
              <button onClick={() => { setShowCoordination(true); setRegistrations(getRegistrations()); }}
                className="px-3 py-1.5 rounded-lg bg-destructive text-destructive-foreground text-xs font-bold" title={vi ? 'Điều phối cứu hộ' : 'Coordination'}>
                {vi ? 'Điều phối cứu hộ' : 'Coordination'}
              </button>
            </div>

            <p className="text-[10px] text-muted-foreground flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />{vi ? 'Đội cứu hộ đăng ký → Command xác minh & duyệt → Vào danh sách phân công.' : 'Teams register → Command verifies & approves → Added to assignment list.'}
            </p>

            {/* Team list */}
            {teams.length === 0 ? (
              <div className="tactical-card p-8 text-center">
                <Users2 className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground text-sm">{vi ? 'Chưa có đội nào' : 'No teams yet'}</p>
              </div>
            ) : (
              teams.map(t => {
                const assigned = cases.find(c => c.id === t.assignedCaseId);
                const stMeta = teamStatusMeta[t.status];
                return (
                  <div key={t.id} className="tactical-card p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-sm">{t.name}</p>
                        <p className="text-xs text-muted-foreground">{t.leaderName} • {t.leaderPhone}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${stMeta.color}`}>{stMeta[vi ? 'vi' : 'en']}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{t.membersCount} {vi ? 'người' : 'ppl'}</span>
                      <span>{t.vehicleType}</span>
                      <span className="font-mono">@{t.username}</span>
                    </div>
                    {t.currentLocation && (
                      <p className="text-[10px] font-mono text-muted-foreground">📍 {t.currentLocation.lat.toFixed(4)}, {t.currentLocation.lng.toFixed(4)} • {timeAgo(t.lastUpdated, vi)}</p>
                    )}
                    {assigned && (
                      <div className="p-2 rounded bg-warning/10 text-xs">
                        <span className="font-bold text-warning">{vi ? 'Nhiệm vụ:' : 'Mission:'}</span> {assigned.reporterName} — {assigned.locationText.slice(0, 30)}
                        {assigned.lat && t.currentLocation && (
                          <span className="text-accent ml-2">
                            {haversineKm(t.currentLocation.lat, t.currentLocation.lng, assigned.lat, assigned.lng!).toFixed(1)} km — ETA: {estimateETA(haversineKm(t.currentLocation.lat, t.currentLocation.lng, assigned.lat, assigned.lng!))}
                          </span>
                        )}
                      </div>
                    )}
                    {/* Status controls */}
                    <div className="flex gap-1 border-t border-border pt-2">
                      {(['AVAILABLE', 'BUSY', 'RETURNING', 'OFFLINE'] as TeamStatus[]).map(s => (
                        <button key={s} onClick={() => doTeamStatus(t.id, s)}
                          className={`px-2 py-1 rounded text-[10px] font-medium ${t.status === s ? teamStatusMeta[s].color : 'bg-secondary text-muted-foreground'}`}>
                          {teamStatusMeta[s][vi ? 'vi' : 'en']}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ===== TAB: ZONES ===== */}
        {tab === 'zones' && (
          <div className="space-y-3">
            <h2 className="font-bold text-sm">{vi ? 'Khu vực điều phối' : 'Zone Coordination'}</h2>
            <p className="text-[10px] text-muted-foreground">
              {vi ? 'Phát hiện trùng lặp cứu trợ • Tránh bỏ sót khu vực' : 'Detect overlapping rescue • Avoid missing zones'}
            </p>

            {zones.length === 0 ? (
              <div className="tactical-card p-8 text-center">
                <Layers className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground text-sm">{vi ? 'Chưa có khu vực' : 'No zones'}</p>
              </div>
            ) : (
              zones.map(z => {
                const zStats = getZoneStats(z.id);
                const zoneCases = cases.filter(c => c.zoneId === z.id && !['CLOSED', 'RESCUED', 'DUPLICATE', 'FALSE_REPORT'].includes(c.status));
                const zoneTeams = teams.filter(t => {
                  const ac = cases.find(c => c.id === t.assignedCaseId);
                  return ac && ac.zoneId === z.id && t.status === 'BUSY';
                });

                // Detect overlap: > 1 team on same zone or > 2 teams
                const hasOverlap = zoneTeams.length > 1;
                const noTeam = zoneCases.length > 0 && zoneTeams.length === 0 && zoneCases.some(c => !c.assignedTeamId);

                return (
                  <div key={z.id} className={`tactical-card p-3 space-y-2 ${noTeam ? 'border-destructive/50' : hasOverlap ? 'border-warning/50' : ''}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-sm">{z.name}</p>
                        <p className="text-xs text-muted-foreground">{z.province}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${noTeam ? 'bg-destructive/20 text-destructive' : hasOverlap ? 'bg-warning/20 text-warning' : 'bg-success/20 text-success'}`}>
                        {noTeam ? (vi ? 'KHÔNG CÓ ĐỘI' : 'NO TEAM') : hasOverlap ? (vi ? 'TRÙNG LẶP' : 'OVERLAP') : 'OK'}
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-2 text-center">
                      <div className="p-1.5 rounded bg-secondary">
                        <p className="text-lg font-bold">{zStats.active}</p>
                        <p className="text-[9px] text-muted-foreground">{vi ? 'SOS' : 'SOS'}</p>
                      </div>
                      <div className="p-1.5 rounded bg-destructive/10">
                        <p className="text-lg font-bold text-destructive">{zStats.unassigned}</p>
                        <p className="text-[9px] text-muted-foreground">{vi ? 'Chưa GĐ' : 'No team'}</p>
                      </div>
                      <div className="p-1.5 rounded bg-accent/10">
                        <p className="text-lg font-bold text-accent">{zoneTeams.length}</p>
                        <p className="text-[9px] text-muted-foreground">{vi ? 'Đội' : 'Teams'}</p>
                      </div>
                      <div className="p-1.5 rounded bg-secondary">
                        <p className="text-lg font-bold">{zStats.total}</p>
                        <p className="text-[9px] text-muted-foreground">{vi ? 'Tổng' : 'Total'}</p>
                      </div>
                    </div>

                    {hasOverlap && (
                      <div className="p-2 rounded bg-warning/10 text-xs text-warning flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />{vi ? `Cảnh báo: ${zoneTeams.length} đội đang hoạt động cùng khu vực` : `Warning: ${zoneTeams.length} teams in same zone`}
                      </div>
                    )}

                    {/* Cases in zone */}
                    {zoneCases.length > 0 && (
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {zoneCases.map(c => (
                          <button key={c.id} onClick={() => { setSelectedCaseId(c.id); setTab('cases'); }}
                            className="w-full flex items-center gap-2 p-1.5 rounded bg-secondary/50 text-left hover:bg-secondary">
                            <div className={`w-2.5 h-2.5 rounded-full ${severityMeta[c.severity].color}`} />
                            <span className="text-xs flex-1 truncate">{c.reporterName} — {c.locationText.slice(0, 20)}</span>
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${caseStatusMeta[c.status].color}`}>{caseStatusMeta[c.status][vi ? 'vi' : 'en']}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Teams in zone */}
                    {zoneTeams.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-[10px] text-muted-foreground uppercase">{vi ? 'Đội trong khu vực' : 'Teams in zone'}</p>
                        {zoneTeams.map(t => (
                          <div key={t.id} className="flex items-center gap-2 p-1.5 rounded bg-accent/10 text-xs">
                            <Truck className="w-3 h-3 text-accent" />
                            <span className="font-medium">{t.name}</span>
                            <span className="text-muted-foreground">{t.vehicleType}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Assign available team to zone */}
                    {noTeam && (
                      <div>
                        <p className="text-[10px] text-destructive font-bold mb-1">{vi ? 'Gán đội cho khu vực này:' : 'Assign team to this zone:'}</p>
                        <div className="flex flex-wrap gap-1">
                          {teams.filter(t => t.status === 'AVAILABLE').map(t => (
                            <button key={t.id} onClick={() => {
                              const unassignedCase = zoneCases.find(c => !c.assignedTeamId);
                              if (unassignedCase) doAssign(unassignedCase.id, t.id);
                            }} className="px-2 py-1 rounded bg-accent/20 text-accent text-[10px] font-bold">
                              {t.name}
                            </button>
                          ))}
                          {teams.filter(t => t.status === 'AVAILABLE').length === 0 && (
                            <span className="text-[10px] text-muted-foreground">{vi ? 'Không có đội sẵn sàng' : 'No available teams'}</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </main>

      {/* Case Detail Drawer */}
      <AnimatePresence>{selectedCaseId && renderCaseDrawer()}</AnimatePresence>

      {/* Confirmation Dialog */}
      <AnimatePresence>
        {confirmAction && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-6" onClick={() => setConfirmAction(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card w-full max-w-sm rounded-2xl p-5 space-y-4" onClick={e => e.stopPropagation()}>
              <div className="text-center space-y-2">
                <AlertTriangle className="w-10 h-10 text-warning mx-auto" />
                <h3 className="font-bold text-lg">{vi ? 'Xác nhận hành động' : 'Confirm Action'}</h3>
                <p className="text-sm text-muted-foreground">{confirmAction.description}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setConfirmAction(null)} className="flex-1 py-2.5 bg-secondary rounded-xl text-sm font-medium">{vi ? 'Huỷ' : 'Cancel'}</button>
                <button onClick={confirmAction.onConfirm} className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-bold">{confirmAction.label}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Registration Review Modal (Yellow - Pending) */}
      <AnimatePresence>
        {showRegistrations && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-end sm:items-center justify-center" onClick={() => { setShowRegistrations(false); setSelectedRegId(null); setApprovedCreds(null); }}>
            <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
              className="bg-card w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl p-4 space-y-3" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between">
                <h2 className="font-bold">{vi ? 'Hồ sơ đăng ký đội cứu hộ' : 'Team Registration Review'}</h2>
                <button onClick={() => { setShowRegistrations(false); setSelectedRegId(null); setApprovedCreds(null); }} className="p-1.5 rounded-lg bg-secondary"><X className="w-4 h-4" /></button>
              </div>

              {/* Filter tabs */}
              <div className="flex gap-1">
                {(['PENDING', 'APPROVED', 'REJECTED'] as RegistrationStatus[]).map(s => (
                  <button key={s} className={`px-3 py-1 rounded-lg text-xs font-medium ${s === 'PENDING' ? 'bg-warning/20 text-warning' : s === 'APPROVED' ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'}`}>
                    {s === 'PENDING' ? (vi ? `Chờ xác minh (${registrations.filter(r => r.status === 'PENDING').length})` : `Pending (${registrations.filter(r => r.status === 'PENDING').length})`) : s === 'APPROVED' ? (vi ? 'Đã duyệt' : 'Approved') : (vi ? 'Không duyệt' : 'Rejected')}
                  </button>
                ))}
              </div>

              {/* Approved credentials popup */}
              {approvedCreds && (
                <div className="p-4 bg-success/10 border-2 border-success/30 rounded-xl space-y-2">
                  <p className="font-bold text-success text-sm">✅ {vi ? 'MÃ ĐỘI ĐÃ CẤP' : 'TEAM CODE ISSUED'}</p>
                  <div className="p-3 bg-secondary rounded-lg font-mono text-sm space-y-1">
                    <p>{vi ? 'Tên đội:' : 'Team:'} <span className="font-bold text-primary">{approvedCreds.teamName}</span></p>
                    <p>{vi ? 'Mã đội:' : 'Code:'} <span className="font-bold text-primary">{approvedCreds.teamCode}</span></p>
                  </div>
                  <button onClick={() => { navigator.clipboard.writeText(`Tên đội: ${approvedCreds.teamName}\nMã đội: ${approvedCreds.teamCode}`); toast.success(vi ? 'Đã sao chép' : 'Copied'); }}
                    className="w-full py-2 bg-success/20 text-success rounded-lg text-sm font-medium flex items-center justify-center gap-1">
                    <Copy className="w-4 h-4" />{vi ? 'Sao chép thông tin' : 'Copy credentials'}
                  </button>
                  <p className="text-[10px] text-muted-foreground text-center">{vi ? 'Gửi thông tin này cho đội trưởng qua Zalo/SMS' : 'Send this to the team leader via Zalo/SMS'}</p>
                </div>
              )}

              {/* Registration list - FULL DETAILS */}
              {registrations.filter(r => r.status === 'PENDING').length === 0 && !approvedCreds ? (
                <div className="p-8 text-center">
                  <Shield className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground text-sm">{vi ? 'Không có hồ sơ chờ xác minh' : 'No pending registrations'}</p>
                </div>
              ) : (
                registrations.filter(r => r.status === 'PENDING').map(r => (
                  <div key={r.id} className="tactical-card p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-sm">{r.teamName}</p>
                        <p className="text-xs text-muted-foreground">{r.leaderName} • {r.leaderPhone}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-warning/20 text-warning">PENDING</span>
                    </div>

                    {/* Full registration details */}
                    <div className="space-y-1.5 text-xs border-t border-border pt-2">
                      <div className="flex justify-between"><span className="text-muted-foreground">{vi ? 'Loại đội' : 'Team type'}</span><span className="font-medium">{teamTypeLabels[r.teamType]}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">{vi ? 'Tỉnh/TP' : 'Province'}</span><span className="font-medium">{r.province}</span></div>
                      {r.district && <div className="flex justify-between"><span className="text-muted-foreground">{vi ? 'Quận/Huyện' : 'District'}</span><span className="font-medium">{r.district}</span></div>}
                      {r.ward && <div className="flex justify-between"><span className="text-muted-foreground">{vi ? 'Phường/Xã' : 'Ward'}</span><span className="font-medium">{r.ward}</span></div>}
                      {r.email && <div className="flex justify-between"><span className="text-muted-foreground">Email</span><span className="font-medium">{r.email}</span></div>}
                      <div className="flex justify-between"><span className="text-muted-foreground">{vi ? 'Số thành viên' : 'Members'}</span><span className="font-medium">{r.membersCount}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">{vi ? 'Phương tiện' : 'Vehicles'}</span><span className="font-medium">{r.vehicleTypes.map(v => vehicleTypeLabels[v]).join(', ')}</span></div>
                      {r.vehicleOtherText && <div className="flex justify-between"><span className="text-muted-foreground">{vi ? 'PT khác' : 'Other vehicle'}</span><span className="font-medium">{r.vehicleOtherText}</span></div>}
                      {r.licensePlate && <div className="flex justify-between"><span className="text-muted-foreground">{vi ? 'Biển số' : 'License plate'}</span><span className="font-medium">{r.licensePlate}</span></div>}
                      {r.capacityNote && <div className="flex justify-between"><span className="text-muted-foreground">{vi ? 'Năng lực' : 'Capacity'}</span><span className="font-medium">{r.capacityNote}</span></div>}
                      <div className="flex justify-between"><span className="text-muted-foreground">{vi ? 'Thời gian hoạt động' : 'Availability'}</span><span className="font-medium">{r.availability.map(a => availabilityLabels[a]).join(', ')}</span></div>
                      {r.verificationFileNames.length > 0 && (
                        <div>
                          <p className="text-muted-foreground mb-1">{vi ? '📎 File xác minh (CCCD/Giấy tờ):' : '📎 Verification files:'}</p>
                          <div className="flex flex-wrap gap-1">
                            {r.verificationFileNames.map((f, i) => (
                              <span key={i} className="px-2 py-0.5 rounded bg-accent/20 text-accent text-[10px] font-medium">{f}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="flex justify-between"><span className="text-muted-foreground">{vi ? 'Ngày gửi' : 'Submitted'}</span><span className="font-medium">{new Date(r.createdAt).toLocaleString('vi-VN')}</span></div>
                    </div>

                    {/* Actions: DUYỆT / CHỜ / KHÔNG DUYỆT */}
                    {selectedRegId === r.id && showRejectForm ? (
                      <div className="space-y-2">
                        <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder={vi ? 'Lý do không duyệt *' : 'Rejection reason *'}
                          className="w-full h-16 px-3 py-2 bg-secondary rounded-lg text-sm resize-none focus:outline-none" />
                        <div className="flex gap-2">
                          <button onClick={() => { setShowRejectForm(false); setSelectedRegId(null); }} className="flex-1 py-2 bg-secondary rounded-lg text-sm">{vi ? 'Huỷ' : 'Cancel'}</button>
                          <button onClick={() => doRejectRegistration(r.id)} className="flex-1 py-2 bg-destructive text-destructive-foreground rounded-lg font-bold text-sm">{vi ? 'Xác nhận không duyệt' : 'Confirm Reject'}</button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-1.5">
                        <button onClick={() => setConfirmAction({
                          label: vi ? 'Duyệt' : 'Approve',
                          description: vi ? `Duyệt đội "${r.teamName}" và thêm vào danh sách phân công?` : `Approve team "${r.teamName}" and add to assignment list?`,
                          onConfirm: () => { doApproveRegistration(r.id); setConfirmAction(null); }
                        })} className="flex-1 py-2 bg-success/20 text-success rounded-lg text-xs font-bold flex items-center justify-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />{vi ? 'DUYỆT' : 'APPROVE'}
                        </button>
                        <button className="flex-1 py-2 bg-secondary text-muted-foreground rounded-lg text-xs font-bold flex items-center justify-center gap-1">
                          <Clock className="w-3 h-3" />{vi ? 'CHỜ' : 'HOLD'}
                        </button>
                        <button onClick={() => { setSelectedRegId(r.id); setShowRejectForm(true); setRejectReason(''); }}
                          className="flex-1 py-2 bg-destructive/20 text-destructive rounded-lg text-xs font-bold flex items-center justify-center gap-1">
                          <XCircle className="w-3 h-3" />{vi ? 'KHÔNG DUYỆT' : 'REJECT'}
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Coordination Modal (Red - Approved teams ready to dispatch) */}
      <AnimatePresence>
        {showCoordination && (() => {
          // Show APPROVED registrations that are NOT yet in teams list
          const approvedRegs = registrations.filter(r => r.status === 'APPROVED');
          const notDispatched = approvedRegs.filter(r => !teams.find(t => t.name === r.teamName && t.leaderPhone === r.leaderPhone));
          return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-end sm:items-center justify-center" onClick={() => setShowCoordination(false)}>
            <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
              className="bg-card w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl p-4 space-y-3" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between">
                <h2 className="font-bold">{vi ? 'Điều phối cứu hộ' : 'Rescue Coordination'}</h2>
                <button onClick={() => setShowCoordination(false)} className="p-1.5 rounded-lg bg-secondary"><X className="w-4 h-4" /></button>
              </div>

              <p className="text-[10px] text-muted-foreground">{vi ? 'Các đội đã được duyệt và sẵn sàng phân công nhiệm vụ.' : 'Approved teams ready for mission assignment.'}</p>

              {notDispatched.length === 0 ? (
                <div className="p-8 text-center">
                  <Users2 className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground text-sm">{vi ? 'Không có đội nào chờ điều phối' : 'No teams awaiting dispatch'}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{vi ? 'Duyệt hồ sơ từ mục vàng trước' : 'Approve registrations from yellow section first'}</p>
                </div>
              ) : (
                notDispatched.map(r => (
                  <div key={r.id} className="tactical-card p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-sm">{r.teamName}</p>
                        <p className="text-xs text-muted-foreground">{r.leaderName} • {r.leaderPhone}</p>
                      </div>
                      <button onClick={() => setConfirmAction({
                        label: vi ? 'Điều phối' : 'Dispatch',
                        description: vi ? `Thêm đội "${r.teamName}" vào danh sách điều phối cứu hộ?` : `Add "${r.teamName}" to active rescue list?`,
                        onConfirm: () => { doDispatchTeam(r); setConfirmAction(null); }
                      })} className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold">
                        {vi ? 'Điều phối' : 'Dispatch'}
                      </button>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{r.membersCount} {vi ? 'người' : 'ppl'}</span>
                      <span>{r.vehicleTypes.map(v => vehicleTypeLabels[v]).join(', ')}</span>
                    </div>
                    {r.province && <p className="text-[10px] text-muted-foreground">{r.province}{r.district ? ` • ${r.district}` : ''}</p>}
                  </div>
                ))
              )}
            </motion.div>
          </motion.div>
          );
        })()}
      </AnimatePresence>





      {/* Bottom Nav - Command Center specific */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-primary/30 safe-bottom z-40">
        <div className="flex items-center justify-around py-2">
          {tabs.map(t => {
            const isActive = tab === t.id;
            const handleClick = () => {
              if (t.id === 'relatives') {
                setRelativeReports(getRelativeReports());
              }
              setTab(t.id);
            };

            return (
              <button key={t.id} onClick={handleClick}
                className={`flex flex-col items-center justify-center p-2 min-w-[56px] transition-colors relative ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>

                <t.icon className="w-6 h-6" />
                <span className="text-[10px] font-medium mt-0.5">{vi ? t.vi : t.en}</span>
                {t.badge !== undefined && t.badge > 0 && (
                  <span className="absolute -top-0.5 right-1 bg-primary text-primary-foreground text-[9px] font-bold px-1.5 rounded-full">{t.badge}</span>
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}