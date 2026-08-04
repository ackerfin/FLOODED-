import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Radio, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { EmergencyButton } from '@/components/EmergencyButton';
import { QuickTools } from '@/components/QuickTools';
import { NetworkStatus } from '@/components/NetworkStatus';
import { SOSFlow } from '@/components/SOSFlow';
import { BottomNav } from '@/components/BottomNav';
import { QuotesModal } from '@/components/QuotesModal';

export default function Home() {
  const { device, language, sosReports } = useApp();
  const [showSOSFlow, setShowSOSFlow] = useState(false);
  const [showQuotes, setShowQuotes] = useState(false);

  const recentReports = sosReports.slice(0, 3);

  if (showSOSFlow) {
    return (
      <SOSFlow
        onComplete={() => setShowSOSFlow(false)}
        onCancel={() => setShowSOSFlow(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="p-4 safe-top">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-bold text-lg">FLOODED</h1>
              <p className="text-xs text-muted-foreground font-mono">
                {language === 'vi' ? 'Hệ thống cứu hộ' : 'Rescue System'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {device && (
              <div className="text-right mr-2">
                <p className="text-[10px] text-muted-foreground font-mono">ID</p>
                <p className="text-xs font-mono">{device.id.slice(0, 8)}</p>
              </div>
            )}
            <Link to="/settings" className="p-2 rounded-lg bg-secondary">
              <Settings className="w-5 h-5 text-muted-foreground" />
            </Link>
          </div>
        </div>
      </header>

      <main className="px-4 space-y-6">
        {/* Network Status */}
        <NetworkStatus />

        {/* Emergency Button */}
        <EmergencyButton onClick={() => setShowSOSFlow(true)} />

        {/* Quick Tools */}
        <div>
          <h2 className="text-sm font-medium text-muted-foreground mb-3">
            {language === 'vi' ? 'Công cụ nhanh' : 'Quick Tools'}
          </h2>
          <QuickTools onQuoteClick={() => setShowQuotes(true)} />
        </div>

        {/* Recent SOS Reports */}
        {recentReports.length > 0 && (
          <div>
            <h2 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
              <Radio className="w-4 h-4" />
              {language === 'vi' ? 'SOS gần đây' : 'Recent SOS'}
            </h2>
            <div className="space-y-2">
              {recentReports.map((report) => (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="tactical-card p-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        report.syncStatus === 'synced' ? 'bg-success' : 'bg-warning'
                      }`} />
                      <span className="text-sm font-mono">
                        {new Date(report.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded ${
                      report.healthStatus === 'ok' ? 'bg-success/20 text-success' :
                      report.healthStatus === 'injured' ? 'bg-warning/20 text-warning' :
                      'bg-destructive/20 text-destructive'
                    }`}>
                      {report.healthStatus}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </main>

      <BottomNav />
      
      {/* Quotes Modal */}
      <QuotesModal isOpen={showQuotes} onClose={() => setShowQuotes(false)} />
    </div>
  );
}
