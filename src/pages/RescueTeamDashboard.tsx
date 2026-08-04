import { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Inbox, Layers, Users2, Settings as SettingsIcon,
  Shield, MapPin, Phone, X, Clock, ChevronRight,
  Search, PhoneCall, MapIcon, AlertTriangle, Truck,
  Navigation, CheckCircle2, Eye, LogOut, Edit3, Save,
  XCircle, MessageSquare
} from 'lucide-react';
import RescueMap from '@/components/RescueMap';
import { useApp } from '@/contexts/AppContext';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import {
  seedDemoData, getCases, saveCases, getTeams, getZones,
  getLogs, getZoneStats, haversineKm, estimateETA,
  caseStatusMeta, severityMeta, teamStatusMeta, addLog,
  type SOSCase, type CaseStatus, type CaseSeverity,
  type RescueTeamAccount, type Zone, type CaseLog,
} from '@/lib/commandCenter';
import {
  type RescueTeamCredential,
  getCredentials, saveCredentials, updateTeamProfile,
} from '@/lib/rescueRegistration';
import { getStormZones, seedStormZones, type StormZone } from '@/lib/stormZones';

// Pipeline filters for TEAM view (4 tabs)
type TeamPipelineKey = 'ALL' | 'VERIFYING_AND_ROUTING' | 'ASSIGNED' | 'COMPLETED';

const teamPipelineFilters: { key: TeamPipelineKey; vi: string; en: string }[] = [
  { key: 'ALL', vi: 'Tất cả', en: 'All' },
  { key: 'VERIFYING_AND_ROUTING', vi: 'Đang xác minh và điều hướng', en: 'Verifying & Routing' },
  { key: 'ASSIGNED', vi: 'Đã phân công', en: 'Assigned' },
  { key: 'COMPLETED', vi: 'Hoàn thành', en: 'Completed' },
];

function filterTeamCases(cases: SOSCase[], filter: TeamPipelineKey): SOSCase[] {
  if (filter === 'ALL') return cases;
  if (filter === 'VERIFYING_AND_ROUTING') return cases.filter(c =>
    ['NEW', 'VERIFYING', 'VERIFIED', 'WAITING_FOR_ASSIGNMENT', 'WAITING_SAFE_CONDITIONS', 'IN_PROGRESS'].includes(c.status)
  );
  if (filter === 'ASSIGNED') return cases.filter(c => ['ASSIGNED', 'TEAM_ACCEPTED'].includes(c.status));
  if (filter === 'COMPLETED') return cases.filter(c => ['RESCUED', 'CLOSED', 'DUPLICATE', 'FALSE_REPORT'].includes(c.status));
  return cases;
}

function timeAgo(ts: number, vi: boolean): string {
  const diff = (Date.now() - ts) / 60000;
  if (diff < 1) return vi ? 'vừa xong' : 'just now';
  if (diff < 60) return `${Math.floor(diff)} ${vi ? 'phút trước' : 'min ago'}`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ${vi ? 'trước' : 'ago'}`;
  return `${Math.floor(diff / 1440)}d`;
}

type TeamTab = 'cases' | 'map' | 'profile' | 'zones';

export default function RescueTeamDashboard() {
  const { language, updateAppSettings } = useApp();
  const navigate = useNavigate();
  const vi = language === 'vi';

  // Auth check
  const [team, setTeam] = useState<RescueTeamCredential | null>(null);
  useEffect(() => {
    const saved = sessionStorage.getItem('flooded_rescue_team');
    if (!saved) { navigate('/rescue-login'); return; }
    setTeam(JSON.parse(saved));
    seedDemoData();
    seedStormZones();
  }, [navigate]);

  const [tab, setTab] = useState<TeamTab>('cases');
  const [cases, setCases] = useState<SOSCase[]>(getCases);
  const [teams, setTeamsState] = useState<RescueTeamAccount[]>(getTeams);
  const [zones, setZonesState] = useState<Zone[]>(getZones);
  const [logs] = useState<CaseLog[]>(getLogs);
  const [stormZones, setStormZones] = useState<StormZone[]>(getStormZones);

  const refresh = useCallback(() => {
    setCases(getCases());
    setTeamsState(getTeams());
    setZonesState(getZones());
    setStormZones(getStormZones());
  }, []);

  useEffect(() => { const iv = setInterval(refresh, 5000); return () => clearInterval(iv); }, [refresh]);

  // Filters
  const [pipelineFilter, setPipelineFilter] = useState<TeamPipelineKey>('ALL');
  const [searchText, setSearchText] = useState('');
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [rejectNoteId, setRejectNoteId] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState('');

  // Profile editing
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ teamName: '', leaderName: '', leaderPhone: '', province: '' });

  const filteredCases = useMemo(() => {
    let r = [...cases];
    r = filterTeamCases(r, pipelineFilter);
    if (searchText) {
      const q = searchText.toLowerCase();
      r = r.filter(c => c.reporterName.toLowerCase().includes(q) || c.locationText.toLowerCase().includes(q) || c.id.includes(q));
    }
    const sev = { RED: 0, ORANGE: 1, GREEN: 2 };
    r.sort((a, b) => sev[a.severity] - sev[b.severity] || a.createdAt - b.createdAt);
    return r;
  }, [cases, pipelineFilter, searchText]);

  const stats = useMemo(() => ({
    total: cases.length,
    active: cases.filter(c => !['CLOSED', 'RESCUED', 'DUPLICATE', 'FALSE_REPORT'].includes(c.status)).length,
  }), [cases]);

  const handleLogout = () => {
    sessionStorage.removeItem('flooded_rescue_team');
    navigate('/rescue-login');
  };

  const handleStartEdit = () => {
    if (!team) return;
    setEditData({
      teamName: team.teamName,
      leaderName: team.leaderName,
      leaderPhone: team.leaderPhone,
      province: team.province,
    });
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (!team) return;
    const result = updateTeamProfile(team.id, editData);
    if (result.success) {
      const updated = getCredentials().find(c => c.id === team.id);
      if (updated) {
        setTeam(updated);
        sessionStorage.setItem('flooded_rescue_team', JSON.stringify(updated));
      }
      setIsEditing(false);
      toast.success(vi ? 'Đã cập nhật hồ sơ' : 'Profile updated');
    } else {
      toast.error(result.error || 'Error');
    }
  };

  const selectedCase = cases.find(c => c.id === selectedCaseId);

  // Mission actions
  const handleAcceptMission = (caseId: string) => {
    const all = getCases();
    const idx = all.findIndex(c => c.id === caseId);
    if (idx === -1) return;
    all[idx].status = 'TEAM_ACCEPTED';
    all[idx].updatedAt = Date.now();
    saveCases(all);
    addLog(caseId, 'Đội xác nhận nhận lệnh', team?.teamName);
    refresh();
    toast.success(vi ? 'Đã xác nhận nhận lệnh' : 'Mission accepted');
  };

  const handleRejectMission = (caseId: string) => {
    if (!rejectNote.trim()) { toast.error(vi ? 'Vui lòng ghi lý do' : 'Please enter reason'); return; }
    const all = getCases();
    const idx = all.findIndex(c => c.id === caseId);
    if (idx === -1) return;
    all[idx].status = 'WAITING_FOR_ASSIGNMENT';
    all[idx].assignedTeamId = undefined;
    all[idx].updatedAt = Date.now();
    saveCases(all);
    addLog(caseId, `Đội từ chối lệnh: ${rejectNote.trim()}`, team?.teamName);
    setRejectNoteId(null);
    setRejectNote('');
    refresh();
    toast.info(vi ? 'Đã từ chối lệnh' : 'Mission rejected');
  };

  const handleCompleteMission = (caseId: string) => {
    const all = getCases();
    const idx = all.findIndex(c => c.id === caseId);
    if (idx === -1) return;
    all[idx].status = 'RESCUED';
    all[idx].updatedAt = Date.now();
    saveCases(all);
    addLog(caseId, 'Đội báo cáo hoàn thành cứu hộ', team?.teamName);
    refresh();
    toast.success(vi ? 'Đã báo cáo hoàn thành — chờ COMMAND duyệt' : 'Reported complete — awaiting COMMAND review');
  };

  // ========== CASE DETAIL DRAWER ==========
  const renderCaseDrawer = () => {
    if (!selectedCase) return null;
    const sev = severityMeta[selectedCase.severity];
    const st = caseStatusMeta[selectedCase.status];
    const assignedTeam = teams.find(t => t.id === selectedCase.assignedTeamId);
    const zone = zones.find(z => z.id === selectedCase.zoneId);
    const caseLogs = logs.filter(l => l.caseId === selectedCase.id).sort((a, b) => b.timestamp - a.timestamp);

    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 z-50 flex items-end sm:items-center justify-center" onClick={() => setSelectedCaseId(null)}>
        <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }} className="bg-card w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl" onClick={e => e.stopPropagation()}>
          <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between z-10 rounded-t-2xl">
            <div className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded-full ${sev.color}`} />
              <span className="font-bold text-sm">{selectedCase.severity === 'RED' ? (vi ? 'Cần cứu ngay' : 'Critical') : selectedCase.severity === 'ORANGE' ? (vi ? 'Nguy cơ cao' : 'High Risk') : (vi ? 'Tạm ổn' : 'Stable')}</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${st.color}`}>{st[vi ? 'vi' : 'en']}</span>
            </div>
            <button onClick={() => setSelectedCaseId(null)} className="p-1.5 rounded-lg bg-secondary"><X className="w-4 h-4" /></button>
          </div>

          <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{vi ? 'Người báo' : 'Reporter'}</p>
                <p className="font-bold">{selectedCase.reporterName}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="w-3 h-3" />{selectedCase.reporterPhone}</p>
              </div>
              <div className="col-span-2">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{vi ? 'Vị trí' : 'Location'}</p>
                <p className="font-medium text-sm">{selectedCase.locationText}</p>
                {zone && <p className="text-xs text-muted-foreground">{zone.name}, {zone.province}</p>}
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{vi ? 'Số người' : 'People'}</p>
                <p className="text-2xl font-bold">{selectedCase.peopleCount}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{vi ? 'Thời gian' : 'Time'}</p>
                <p className="text-xs font-mono">{timeAgo(selectedCase.createdAt, vi)}</p>
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

            {assignedTeam && (
              <div className="p-3 rounded-lg border border-accent/30 bg-accent/5">
                <p className="text-[10px] text-accent uppercase tracking-wider font-bold mb-1">{vi ? 'Đội được phân công' : 'Assigned Team'}</p>
                <p className="font-bold text-sm">{assignedTeam.name}</p>
                <p className="text-xs text-muted-foreground">{assignedTeam.leaderName} • {assignedTeam.vehicleType}</p>
              </div>
            )}

            {selectedCase.lat && (
              <button onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${selectedCase.lat},${selectedCase.lng}`, '_blank')}
                className="w-full py-2.5 bg-accent/20 text-accent rounded-xl text-sm font-bold flex items-center justify-center gap-1">
                <Navigation className="w-4 h-4" />{vi ? 'Mở bản đồ / Chỉ đường' : 'Open Map / Directions'}
              </button>
            )}

            {/* Timeline */}
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

  if (!team) return null;

  const bottomTabs: { id: TeamTab; icon: typeof Inbox; vi: string; en: string; badge?: number }[] = [
    { id: 'cases', icon: Inbox, vi: 'SOS Cases', en: 'SOS Cases', badge: stats.active },
    { id: 'map', icon: MapIcon, vi: 'Bản đồ', en: 'Map' },
    { id: 'profile', icon: Users2, vi: 'Hồ sơ đội', en: 'Team Profile' },
    { id: 'zones', icon: Layers, vi: 'Khu vực', en: 'Zones' },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Top bar */}
      <header className="sticky top-0 bg-background/95 backdrop-blur border-b border-primary/30 z-10">
        <div className="flex items-center gap-3 p-3">
          <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <h1 className="font-bold text-sm tracking-wider">{vi ? 'TRUNG TÂM ĐIỀU PHỐI' : 'COORDINATION CENTER'}</h1>
            <p className="text-[10px] text-muted-foreground">{team.teamName} • {vi ? 'Đội cứu hộ' : 'Rescue Team'}</p>
          </div>
          <button onClick={() => setShowSettings(!showSettings)} className="p-2 rounded-lg bg-secondary">
            <SettingsIcon className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Settings panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden bg-card border-b border-border">
            <div className="p-4 space-y-3">
              <div className="p-3 bg-secondary rounded-lg text-sm">
                <p className="font-bold">{team.teamName}</p>
                <p className="text-xs text-muted-foreground">{vi ? 'Đội trưởng:' : 'Leader:'} {team.leaderName} • {team.leaderPhone}</p>
                <p className="text-xs text-muted-foreground">{vi ? 'Mã đội:' : 'Team Code:'} <span className="font-mono font-bold">{team.teamCode}</span></p>
              </div>
              <Link to="/command-login" className="block w-full py-2.5 bg-warning/20 text-warning rounded-lg text-sm font-bold text-center">
                {vi ? '🔒 Chuyển sang COMMAND MODE →' : '🔒 Switch to COMMAND MODE →'}
              </Link>
              <button onClick={handleLogout} className="w-full py-2.5 bg-destructive/20 text-destructive rounded-lg text-sm font-bold flex items-center justify-center gap-1">
                <LogOut className="w-4 h-4" />{vi ? 'Đăng xuất' : 'Logout'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <main className="px-3 pt-2 pb-4">
        {/* ===== TAB: CASES ===== */}
        {tab === 'cases' && (
          <div className="space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input type="text" value={searchText} onChange={e => setSearchText(e.target.value)} placeholder={vi ? 'Tìm tên, vị trí, ID...' : 'Search...'}
                className="w-full pl-9 pr-3 py-2 bg-secondary rounded-lg text-sm focus:outline-none" />
            </div>

            {/* Pipeline filter - 4 tabs */}
            <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
              {teamPipelineFilters.map(f => (
                <button key={f.key} onClick={() => setPipelineFilter(f.key)} className={`px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all ${pipelineFilter === f.key ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}>
                  {vi ? f.vi : f.en}
                </button>
              ))}
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
                const assignedTeam = teams.find(t => t.id === c.assignedTeamId);
                return (
                  <motion.button key={c.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.015 }}
                    onClick={() => setSelectedCaseId(c.id)} className="tactical-card p-3 w-full text-left space-y-1.5 hover:border-primary/40 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-3 h-3 rounded-full ${sev.color}`} />
                        <span className={`text-xs font-bold ${c.severity === 'RED' ? 'text-destructive' : c.severity === 'ORANGE' ? 'text-warning' : 'text-success'}`}>{c.severity === 'RED' ? (vi ? 'Cần cứu ngay' : 'Critical') : c.severity === 'ORANGE' ? (vi ? 'Nguy cơ cao' : 'High Risk') : (vi ? 'Tạm ổn' : 'Stable')}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground font-mono">{timeAgo(c.createdAt, vi)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{c.reporterName}</p>
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1"><Phone className="w-2.5 h-2.5" />{c.reporterPhone}</p>
                      </div>
                      <p className="text-lg font-bold">{c.peopleCount}<span className="text-[10px] text-muted-foreground ml-0.5">{vi ? 'người' : 'ppl'}</span></p>
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3 flex-shrink-0" />{c.locationText}</p>
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${st.color}`}>{st[vi ? 'vi' : 'en']}</span>
                      {assignedTeam && <span className="text-[10px] text-accent">🚤 {assignedTeam.name}</span>}
                    </div>
                    {/* Quick actions */}
                    <div className="flex flex-wrap gap-1 pt-1 border-t border-border">
                      <button onClick={e => { e.stopPropagation(); window.open(`tel:${c.reporterPhone}`); }} className="px-2 py-1 bg-secondary rounded text-[10px] flex items-center gap-1"><PhoneCall className="w-3 h-3" />{vi ? 'Gọi' : 'Call'}</button>
                      {c.lat && <button onClick={e => { e.stopPropagation(); window.open(`https://www.google.com/maps?q=${c.lat},${c.lng}`); }} className="px-2 py-1 bg-secondary rounded text-[10px] flex items-center gap-1"><MapIcon className="w-3 h-3" />{vi ? 'Map' : 'Map'}</button>}
                      
                      {/* Mission action: ASSIGNED → accept or reject */}
                      {c.status === 'ASSIGNED' && c.assignedTeamId && (
                        <>
                          <button onClick={e => { e.stopPropagation(); handleAcceptMission(c.id); }} className="px-2 py-1 bg-success/20 text-success rounded text-[10px] font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />{vi ? 'Xác nhận lệnh' : 'Accept'}
                          </button>
                          {rejectNoteId === c.id ? (
                            <div className="w-full flex gap-1 mt-1" onClick={e => e.stopPropagation()}>
                              <input type="text" value={rejectNote} onChange={e => setRejectNote(e.target.value)} placeholder={vi ? 'Lý do từ chối...' : 'Reason...'}
                                className="flex-1 px-2 py-1 bg-secondary rounded text-[10px] focus:outline-none" />
                              <button onClick={() => handleRejectMission(c.id)} className="px-2 py-1 bg-destructive/20 text-destructive rounded text-[10px] font-bold">{vi ? 'Gửi' : 'Send'}</button>
                              <button onClick={() => { setRejectNoteId(null); setRejectNote(''); }} className="px-2 py-1 bg-secondary rounded text-[10px]">✕</button>
                            </div>
                          ) : (
                            <button onClick={e => { e.stopPropagation(); setRejectNoteId(c.id); }} className="px-2 py-1 bg-destructive/20 text-destructive rounded text-[10px] font-bold flex items-center gap-1">
                              <XCircle className="w-3 h-3" />{vi ? 'Không thể nhận' : 'Reject'}
                            </button>
                          )}
                        </>
                      )}

                      {/* Mission action: TEAM_ACCEPTED or IN_PROGRESS → complete */}
                      {(['TEAM_ACCEPTED', 'IN_PROGRESS'] as CaseStatus[]).includes(c.status) && c.assignedTeamId && (
                        <button onClick={e => { e.stopPropagation(); handleCompleteMission(c.id); }} className="px-2 py-1 bg-success/20 text-success rounded text-[10px] font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />{vi ? 'Hoàn thành cứu hộ' : 'Complete'}
                        </button>
                      )}
                    </div>
                  </motion.button>
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

            <div className="flex flex-wrap gap-3 text-[10px]">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-status-critical" />SOS RED</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-status-injured" />SOS ORANGE</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-status-ok" />SOS GREEN</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-accent ring-2 ring-accent" />{vi ? 'Đội cứu hộ' : 'Team'}</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-destructive/30 border border-destructive" />{vi ? 'Vùng bão' : 'Storm'}</span>
            </div>

            <div className="tactical-card p-0 relative overflow-hidden">
              <RescueMap cases={cases} teams={teams} stormZones={stormZones} onCaseClick={setSelectedCaseId} vi={vi} />
            </div>
          </div>
        )}

        {/* ===== TAB: TEAM PROFILE ===== */}
        {tab === 'profile' && (
          <div className="space-y-4">
            <h2 className="font-bold text-sm">{vi ? 'Hồ sơ đội cứu hộ' : 'Team Profile'}</h2>

            <div className="tactical-card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  <span className="font-bold">{team.teamName}</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-success/20 text-success text-[10px] font-bold">{team.status}</span>
              </div>

              <div className="text-xs text-muted-foreground space-y-1">
                <p>{vi ? 'Mã đội:' : 'Team Code:'} <span className="font-mono font-bold text-foreground">{team.teamCode}</span></p>
                <p>{vi ? 'Tỉnh/TP:' : 'Province:'} {team.province}</p>
                <p>{vi ? 'Số lần chỉnh sửa:' : 'Edits used:'} {team.editCount}/3</p>
              </div>
            </div>

            {isEditing ? (
              <div className="tactical-card p-4 space-y-3">
                <h3 className="font-bold text-sm">{vi ? 'Chỉnh sửa thông tin' : 'Edit Info'}</h3>
                <div className="space-y-2">
                  <div>
                    <label className="text-[10px] text-muted-foreground">{vi ? 'Tên đội' : 'Team Name'}</label>
                    <input type="text" value={editData.teamName} onChange={e => setEditData(d => ({ ...d, teamName: e.target.value }))}
                      className="w-full px-3 py-2 bg-secondary rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground">{vi ? 'Tên đội trưởng' : 'Leader Name'}</label>
                    <input type="text" value={editData.leaderName} onChange={e => setEditData(d => ({ ...d, leaderName: e.target.value }))}
                      className="w-full px-3 py-2 bg-secondary rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground">{vi ? 'Số điện thoại' : 'Phone'}</label>
                    <input type="tel" value={editData.leaderPhone} onChange={e => setEditData(d => ({ ...d, leaderPhone: e.target.value }))}
                      className="w-full px-3 py-2 bg-secondary rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground">{vi ? 'Khu vực hoạt động' : 'Operating Area'}</label>
                    <input type="text" value={editData.province} onChange={e => setEditData(d => ({ ...d, province: e.target.value }))}
                      className="w-full px-3 py-2 bg-secondary rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setIsEditing(false)} className="flex-1 py-2 bg-secondary rounded-lg text-sm font-medium">{vi ? 'Huỷ' : 'Cancel'}</button>
                  <button onClick={handleSaveEdit} className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-bold flex items-center justify-center gap-1">
                    <Save className="w-4 h-4" />{vi ? 'Lưu' : 'Save'}
                  </button>
                </div>
                <p className="text-[10px] text-muted-foreground text-center">{vi ? `Còn ${3 - team.editCount} lần chỉnh sửa` : `${3 - team.editCount} edits remaining`}</p>
              </div>
            ) : (
              <div className="tactical-card p-4 space-y-3">
                <h3 className="font-bold text-sm">{vi ? 'Thông tin chi tiết' : 'Details'}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">{vi ? 'Đội trưởng' : 'Leader'}</span><span className="font-medium">{team.leaderName}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">{vi ? 'Điện thoại' : 'Phone'}</span><span className="font-medium">{team.leaderPhone}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">{vi ? 'Khu vực' : 'Area'}</span><span className="font-medium">{team.province}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">{vi ? 'Ngày tạo' : 'Created'}</span><span className="font-mono text-xs">{new Date(team.createdAt).toLocaleDateString('vi-VN')}</span></div>
                </div>

                {team.editCount < 3 ? (
                  <button onClick={handleStartEdit} className="w-full py-2.5 bg-primary/20 text-primary rounded-lg text-sm font-bold flex items-center justify-center gap-1">
                    <Edit3 className="w-4 h-4" />{vi ? 'Chỉnh sửa thông tin' : 'Edit Profile'}
                  </button>
                ) : (
                  <div className="p-3 bg-muted rounded-lg text-center">
                    <p className="text-xs text-muted-foreground font-medium">{vi ? 'Đã đạt giới hạn chỉnh sửa (3/3)' : 'Edit limit reached (3/3)'}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ===== TAB: ZONES (view only) ===== */}
        {tab === 'zones' && (
          <div className="space-y-3">
            <h2 className="font-bold text-sm">{vi ? 'Khu vực điều phối' : 'Zone Coordination'}</h2>
            <p className="text-[10px] text-muted-foreground">
              {vi ? 'Chỉ xem — Thao tác quản lý thuộc quyền COMMAND' : 'View only — Management actions belong to COMMAND'}
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
                        <p className="text-[9px] text-muted-foreground">SOS</p>
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

                    {/* Cases in zone - view only */}
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

                    {/* Teams in zone - view only */}
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
                    {/* No action buttons - view only for team */}
                  </div>
                );
              })
            )}
          </div>
        )}
      </main>

      {/* Case Detail Drawer */}
      <AnimatePresence>{selectedCaseId && renderCaseDrawer()}</AnimatePresence>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-primary/30 safe-bottom z-40">
        <div className="flex items-center justify-around py-2">
          {bottomTabs.map(t => {
            const isActive = tab === t.id;
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex flex-col items-center justify-center p-2 min-w-[60px] transition-colors relative ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
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
