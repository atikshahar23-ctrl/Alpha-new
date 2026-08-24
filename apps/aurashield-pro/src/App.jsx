import { useState } from 'react';

import Backdrop from './components/Backdrop';
import ClearanceGate from './components/ClearanceGate';
import StatusBar from './components/StatusBar';
import EMFRadar from './components/EMFRadar';
import LooshMonitor from './components/LooshMonitor';
import ScalarJammer from './components/ScalarJammer';
import KirlianFeed from './components/KirlianFeed';
import ProvenancePanel from './components/ProvenancePanel';

import { useDeviceOrientation } from './hooks/useDeviceOrientation';
import { useAudioEngine } from './hooks/useAudioEngine';
import { useCamera } from './hooks/useCamera';
import { useCoherenceSim } from './hooks/useCoherenceSim';
import { useAnomalyField } from './hooks/useAnomalyField';

export default function App() {
  const [entered, setEntered] = useState(false);
  const [provenance, setProvenance] = useState(false);

  const orientation = useDeviceOrientation();
  const camera = useCamera();
  const audio = useAudioEngine();

  // Engaging the jammer feeds back into both simulations: coherence
  // trends higher and contact spawn rate drops. It's what makes the
  // console read as one system rather than four widgets.
  const shielded = audio.engaged;

  const sim = useCoherenceSim({ shielded });
  const field = useAnomalyField({ shielded, active: entered });

  return (
    <div className="crt relative min-h-[100dvh] bg-void">
      <Backdrop />

      {!entered ? (
        <ClearanceGate
          orientation={orientation}
          camera={camera}
          onEnter={() => setEntered(true)}
        />
      ) : (
        <div className="relative z-10">
          <StatusBar
            orientation={orientation}
            camera={camera}
            audio={audio}
            shielded={shielded}
            onProvenance={() => setProvenance(true)}
          />

          <main className="mx-auto max-w-[1400px] px-3 py-4 sm:px-4">
            <div className="grid gap-3 lg:grid-cols-2 lg:items-start">
              {/* Left column — the scope leads, it's the hero */}
              <div className="space-y-3">
                <EMFRadar
                  orientation={orientation}
                  contacts={field.contacts}
                  shielded={shielded}
                />
                <KirlianFeed camera={camera} />
              </div>

              {/* Right column — telemetry and countermeasures */}
              <div className="space-y-3">
                <LooshMonitor sim={sim} shielded={shielded} />
                <ScalarJammer audio={audio} />
              </div>
            </div>

            <footer className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-phosphor/12 px-1 pt-3 font-mono text-[9px] text-ash">
              <span>AURASHIELD PRO · FIELD TERMINAL</span>
              <span className="text-violet-glow/50">
                {field.threatCount > 0
                  ? `${field.threatCount} high-threat contact${field.threatCount > 1 ? 's' : ''} tracked`
                  : 'no high-threat contacts'}
              </span>
              <button
                onClick={() => setProvenance(true)}
                className="ml-auto underline decoration-dotted underline-offset-2 hover:text-phosphor-dim"
              >
                Simulation — see data provenance
              </button>
            </footer>
          </main>
        </div>
      )}

      <ProvenancePanel open={provenance} onClose={() => setProvenance(false)} />
    </div>
  );
}
