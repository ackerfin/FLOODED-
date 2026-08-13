import { useEffect, useState } from 'react';
import {
  subscribeGateway,
  getGatewayStatus,
  type CommandCase,
  type GatewayStatus,
} from '@/lib/gatewayCases';

/** Polls the SoftAP Gateway every 4s and returns the locally persisted cases. */
export function useGatewayCases() {
  const [cases, setCases] = useState<CommandCase[]>([]);
  const [status, setStatus] = useState<GatewayStatus>(getGatewayStatus);

  useEffect(() => {
    return subscribeGateway((s, c) => {
      setStatus({ ...s });
      setCases(c);
    });
  }, []);

  return { cases, status };
}