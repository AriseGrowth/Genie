'use client';

import { useVoice } from '../../lib/useVoice';
import GeniePanel from './GeniePanel';

export default function GeniePanelWrapper() {
  const { speak } = useVoice();
  return <GeniePanel onSpeakText={speak} />;
}
