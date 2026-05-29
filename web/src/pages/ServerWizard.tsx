import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ChevronRight, ChevronLeft, MapPin, Settings, Network, Rocket, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MAP_INFO, DEFAULT_CONFIG, type ServerConfig } from '@/types/server';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Toggle } from '@/components/ui/Toggle';
import { Tooltip } from '@/components/ui/Tooltip';

// --- Step definitions ---
const STEPS = [
  { id: 0, label: 'Karte', icon: MapPin },
  { id: 1, label: 'Konfiguration', icon: Settings },
  { id: 2, label: 'Netzwerk', icon: Network },
  { id: 3, label: 'Review', icon: Rocket },
];

// --- Preset templates ---
const PRESETS = [
  {
    id: 'pvp-standard',
    label: 'PvP Standard',
    description: 'Ausgeglichene PvP-Einstellungen für kompetitives Spiel',
    config: { pvpEnabled: true, xpMultiplier: 1.5, harvestAmountMultiplier: 2, tameSpeedMultiplier: 3, maxPlayers: 70 },
  },
  {
    id: 'pve-chill',
    label: 'PvE Entspannt',
    description: 'Höhere Multiplikatoren für ein entspanntes Erlebnis',
    config: { pvpEnabled: false, xpMultiplier: 3, harvestAmountMultiplier: 5, tameSpeedMultiplier: 10, maxPlayers: 50 },
  },
  {
    id: 'hardcore',
    label: 'Hardcore',
    description: 'Vanilla-Einstellungen, maximale Schwierigkeit',
    config: { pvpEnabled: true, xpMultiplier: 1, harvestAmountMultiplier: 1, tameSpeedMultiplier: 1, hardcore: true, maxPlayers: 30 },
  },
  {
    id: 'custom',
    label: 'Individuell',
    description: 'Alles selbst konfigurieren',
    config: {},
  },
];

export function ServerWizard() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [creating, setCreating] = useState(false);
  const [config, setConfig] = useState<Partial<ServerConfig>>({
    ...DEFAULT_CONFIG,
    map: 'TheIsland',
    sessionName: '',
    name: '',
    adminPassword: '',
    rconPassword: '',
  });

  function update(patch: Partial<ServerConfig>) {
    setConfig((prev) => ({ ...prev, ...patch }));
  }

  function applyPreset(presetId: string) {
    const preset = PRESETS.find((p) => p.id === presetId);
    if (preset) update(preset.config as Partial<ServerConfig>);
  }

  async function handleCreate() {
    setCreating(true);
    await new Promise((r) => setTimeout(r, 1200));
    navigate('/');
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-xl font-bold text-[rgb(var(--text-primary))]">Neuen Server erstellen</h1>
        <p className="text-sm text-[rgb(var(--text-muted))] mt-0.5">
          Folge den Schritten, um deinen ARK:SA-Server einzurichten.
        </p>
      </div>

      {/* Step progress */}
      <div className="flex items-center gap-0 mb-8">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center flex-1 last:flex-none">
            <button
              type="button"
              onClick={() => i < step && setStep(i)}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-lg transition-colors duration-150',
                i < step && 'cursor-pointer hover:bg-[rgb(var(--bg-elevated))]',
                i >= step && 'cursor-default'
              )}
            >
              <div
                className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200 text-xs font-bold',
                  i < step
                    ? 'bg-emerald-500 text-white'
                    : i === step
                    ? 'bg-[rgb(var(--primary))] text-[rgb(var(--bg-base))]'
                    : 'bg-[rgb(var(--bg-elevated))] text-[rgb(var(--text-muted))] border border-[rgb(var(--border))]'
                )}
              >
                {i < step ? <Check className="w-3.5 h-3.5" /> : <s.icon className="w-3.5 h-3.5" />}
              </div>
              <span
                className={cn(
                  'text-sm font-medium hidden sm:block',
                  i === step ? 'text-[rgb(var(--text-primary))]' : 'text-[rgb(var(--text-muted))]'
                )}
              >
                {s.label}
              </span>
            </button>
            {i < STEPS.length - 1 && (
              <div className="flex-1 h-px bg-[rgb(var(--border))] mx-2" />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="surface-card">
        {step === 0 && <StepMap config={config} update={update} />}
        {step === 1 && <StepConfig config={config} update={update} applyPreset={applyPreset} />}
        {step === 2 && <StepNetwork config={config} update={update} />}
        {step === 3 && <StepReview config={config} />}

        {/* Navigation */}
        <div className="px-6 py-4 border-t border-[rgb(var(--border))] flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => (step === 0 ? navigate('/') : setStep((s) => s - 1))}
          >
            <ChevronLeft className="w-4 h-4" />
            {step === 0 ? 'Abbrechen' : 'Zurück'}
          </Button>
          {step < 3 ? (
            <Button variant="primary" onClick={() => setStep((s) => s + 1)}>
              Weiter
              <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button variant="primary" loading={creating} onClick={handleCreate}>
              <Rocket className="w-4 h-4" />
              Server erstellen
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Step 0: Map Selection ---
function StepMap({
  config,
  update,
}: {
  config: Partial<ServerConfig>;
  update: (p: Partial<ServerConfig>) => void;
}) {
  return (
    <div className="p-6">
      <SectionTitle>Welche Karte soll gespielt werden?</SectionTitle>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
        {Object.values(MAP_INFO).map((map) => (
          <button
            key={map.id}
            type="button"
            onClick={() => update({ map: map.id })}
            className={cn(
              'flex items-start gap-3 p-4 rounded-xl border text-left transition-all duration-150',
              config.map === map.id
                ? 'border-[rgb(var(--primary))] bg-[rgba(245,158,11,0.06)]'
                : 'border-[rgb(var(--border))] bg-[rgb(var(--bg-elevated))] hover:border-[rgb(var(--border-strong))]'
            )}
          >
            <div
              className="w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0"
              style={{ background: map.color, boxShadow: `0 0 8px ${map.color}60` }}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold text-[rgb(var(--text-primary))]">{map.label}</span>
                {map.dlc && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 font-medium">
                    DLC
                  </span>
                )}
                <span
                  className={cn(
                    'text-[10px] px-1.5 py-0.5 rounded font-medium',
                    map.difficulty === 'Easy' && 'bg-emerald-500/15 text-emerald-400',
                    map.difficulty === 'Medium' && 'bg-blue-500/15 text-blue-400',
                    map.difficulty === 'Hard' && 'bg-amber-500/15 text-amber-400',
                    map.difficulty === 'Expert' && 'bg-red-500/15 text-red-400'
                  )}
                >
                  {map.difficulty}
                </span>
              </div>
              <p className="text-xs text-[rgb(var(--text-muted))] mt-0.5 leading-relaxed">{map.description}</p>
              <div className="text-[10px] text-[rgb(var(--text-muted))] mt-1 font-medium uppercase tracking-wide">
                {map.theme}
              </div>
            </div>
            {config.map === map.id && (
              <Check className="w-4 h-4 text-[rgb(var(--primary))] flex-shrink-0 mt-0.5" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// --- Step 1: Config ---
function StepConfig({
  config,
  update,
  applyPreset,
}: {
  config: Partial<ServerConfig>;
  update: (p: Partial<ServerConfig>) => void;
  applyPreset: (id: string) => void;
}) {
  return (
    <div className="p-6 space-y-6">
      <SectionTitle>Basis-Konfiguration</SectionTitle>

      {/* Preset chooser */}
      <div>
        <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-2">
          Vorlage auswählen
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => applyPreset(p.id)}
              className="p-3 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-elevated))] hover:border-[rgb(var(--primary))] text-left transition-all duration-150"
            >
              <div className="text-sm font-medium text-[rgb(var(--text-primary))]">{p.label}</div>
              <div className="text-[11px] text-[rgb(var(--text-muted))] mt-0.5 leading-tight">{p.description}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-[rgb(var(--border))]" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Server-Name"
          placeholder="Mein ARK Server"
          value={config.name ?? ''}
          onChange={(e) => update({ name: e.target.value, sessionName: e.target.value })}
        />
        <Input
          label="Admin-Passwort"
          type="password"
          placeholder="••••••••"
          value={config.adminPassword ?? ''}
          onChange={(e) => update({ adminPassword: e.target.value })}
          hint="Für RCON und Admin-Befehle"
        />
        <LabeledNumber
          label="Max. Spieler"
          value={config.maxPlayers ?? 70}
          min={1}
          max={255}
          onChange={(v) => update({ maxPlayers: v })}
        />
        <Input
          label="Server-Passwort"
          type="password"
          placeholder="Leer = öffentlich"
          value={config.serverPassword ?? ''}
          onChange={(e) => update({ serverPassword: e.target.value })}
          hint="Leer lassen für öffentlichen Server"
        />
      </div>

      <div className="border-t border-[rgb(var(--border))]" />
      <h3 className="text-sm font-semibold text-[rgb(var(--text-secondary))] uppercase tracking-wide">
        Multiplikatoren
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <LabeledNumber
          label="XP-Multiplikator"
          value={config.xpMultiplier ?? 1}
          step={0.5}
          min={0.1}
          max={10}
          onChange={(v) => update({ xpMultiplier: v })}
        />
        <LabeledNumber
          label="Ernte-Multiplikator"
          value={config.harvestAmountMultiplier ?? 1}
          step={0.5}
          min={0.1}
          max={20}
          onChange={(v) => update({ harvestAmountMultiplier: v })}
        />
        <LabeledNumber
          label="Zähm-Multiplikator"
          value={config.tameSpeedMultiplier ?? 1}
          step={1}
          min={0.1}
          max={50}
          onChange={(v) => update({ tameSpeedMultiplier: v })}
        />
      </div>

      <div className="border-t border-[rgb(var(--border))]" />
      <h3 className="text-sm font-semibold text-[rgb(var(--text-secondary))] uppercase tracking-wide">
        Spielmodus
      </h3>
      <div className="space-y-3">
        <Toggle
          checked={config.pvpEnabled ?? true}
          onChange={(v) => update({ pvpEnabled: v })}
          label="PvP aktiviert"
          description="Spieler können sich gegenseitig bekämpfen"
        />
        <Toggle
          checked={config.hardcore ?? false}
          onChange={(v) => update({ hardcore: v })}
          label="Hardcore-Modus"
          description="Tod = Charakter gelöscht"
        />
        <Toggle
          checked={config.battleEye ?? true}
          onChange={(v) => update({ battleEye: v })}
          label="BattlEye"
          description="Anti-Cheat (empfohlen für öffentliche Server)"
        />
      </div>
    </div>
  );
}

// --- Step 2: Network ---
function StepNetwork({
  config,
  update,
}: {
  config: Partial<ServerConfig>;
  update: (p: Partial<ServerConfig>) => void;
}) {
  return (
    <div className="p-6 space-y-6">
      <SectionTitle>Netzwerk-Einstellungen</SectionTitle>

      <div className="surface-card p-4 border-[rgb(var(--primary))]/30 bg-amber-500/5">
        <div className="flex items-start gap-2.5 text-amber-400">
          <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div className="text-xs leading-relaxed">
            Stelle sicher, dass die folgenden Ports in deiner Firewall und ggf. deinem Router freigegeben sind (UDP).
            Verwende keine bereits belegten Ports.
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <label className="text-sm font-medium text-[rgb(var(--text-secondary))]">Game-Port</label>
            <Tooltip content="Haupt-Spielport für Client-Verbindungen (UDP)">
              <Info className="w-3.5 h-3.5 text-[rgb(var(--text-muted))] cursor-help" />
            </Tooltip>
          </div>
          <Input
            type="number"
            value={config.port ?? 7777}
            onChange={(e) => update({ port: parseInt(e.target.value) || 7777 })}
            hint="Standard: 7777"
          />
        </div>
        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <label className="text-sm font-medium text-[rgb(var(--text-secondary))]">Query-Port</label>
            <Tooltip content="Steam-Server-Browser-Port (UDP)">
              <Info className="w-3.5 h-3.5 text-[rgb(var(--text-muted))] cursor-help" />
            </Tooltip>
          </div>
          <Input
            type="number"
            value={config.queryPort ?? 27015}
            onChange={(e) => update({ queryPort: parseInt(e.target.value) || 27015 })}
            hint="Standard: 27015"
          />
        </div>
        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <label className="text-sm font-medium text-[rgb(var(--text-secondary))]">RCON-Port</label>
            <Tooltip content="Remote Admin Console (TCP)">
              <Info className="w-3.5 h-3.5 text-[rgb(var(--text-muted))] cursor-help" />
            </Tooltip>
          </div>
          <Input
            type="number"
            value={config.rconPort ?? 32330}
            onChange={(e) => update({ rconPort: parseInt(e.target.value) || 32330 })}
            hint="Standard: 32330"
          />
        </div>
      </div>

      <div>
        <div className="flex items-center gap-1.5 mb-1.5">
          <label className="text-sm font-medium text-[rgb(var(--text-secondary))]">RCON-Passwort</label>
          <Tooltip content="Passwort für RCON-Zugriff. Unterschiedlich vom Admin-Passwort empfohlen.">
            <Info className="w-3.5 h-3.5 text-[rgb(var(--text-muted))] cursor-help" />
          </Tooltip>
        </div>
        <Input
          type="password"
          placeholder="••••••••"
          value={config.rconPassword ?? ''}
          onChange={(e) => update({ rconPassword: e.target.value })}
          className="max-w-sm"
        />
      </div>

      {/* Port conflict check */}
      <div className="surface-card p-4">
        <h4 className="text-xs font-semibold text-[rgb(var(--text-muted))] uppercase tracking-wide mb-3">
          Port-Übersicht
        </h4>
        <div className="space-y-2">
          {[
            { label: 'Game', port: config.port ?? 7777, proto: 'UDP' },
            { label: 'Query', port: config.queryPort ?? 27015, proto: 'UDP' },
            { label: 'RCON', port: config.rconPort ?? 32330, proto: 'TCP' },
          ].map((p) => (
            <div key={p.label} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-12 text-[rgb(var(--text-muted))]">{p.label}</span>
                <span className="font-mono text-[rgb(var(--text-primary))]">{p.port}</span>
              </div>
              <span className="text-[rgb(var(--text-muted))] font-mono">{p.proto}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- Step 3: Review ---
function StepReview({ config }: { config: Partial<ServerConfig> }) {
  const map = config.map ? MAP_INFO[config.map] : null;
  return (
    <div className="p-6 space-y-5">
      <SectionTitle>Zusammenfassung</SectionTitle>
      <p className="text-sm text-[rgb(var(--text-muted))]">
        Überprüfe die Einstellungen bevor der Server erstellt wird.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ReviewSection title="Server">
          <ReviewRow label="Name" value={config.name || '—'} />
          <ReviewRow label="Karte" value={map?.label ?? '—'} />
          <ReviewRow label="Max. Spieler" value={config.maxPlayers?.toString() ?? '—'} />
          <ReviewRow label="Spielmodus" value={config.pvpEnabled ? 'PvP' : 'PvE'} />
          <ReviewRow label="Hardcore" value={config.hardcore ? 'Ja' : 'Nein'} />
          <ReviewRow label="BattlEye" value={config.battleEye ? 'Aktiv' : 'Inaktiv'} />
        </ReviewSection>

        <ReviewSection title="Netzwerk">
          <ReviewRow label="Game-Port" value={config.port?.toString() ?? '—'} mono />
          <ReviewRow label="Query-Port" value={config.queryPort?.toString() ?? '—'} mono />
          <ReviewRow label="RCON-Port" value={config.rconPort?.toString() ?? '—'} mono />
        </ReviewSection>

        <ReviewSection title="Multiplikatoren">
          <ReviewRow label="XP" value={`×${config.xpMultiplier}`} mono />
          <ReviewRow label="Ernte" value={`×${config.harvestAmountMultiplier}`} mono />
          <ReviewRow label="Zähmen" value={`×${config.tameSpeedMultiplier}`} mono />
        </ReviewSection>
      </div>
    </div>
  );
}

function ReviewSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="surface-card p-4">
      <h4 className="text-xs font-semibold text-[rgb(var(--text-muted))] uppercase tracking-wide mb-3">{title}</h4>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function ReviewRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between text-xs gap-2">
      <span className="text-[rgb(var(--text-muted))]">{label}</span>
      <span className={cn('text-[rgb(var(--text-primary))]', mono && 'font-mono')}>{value}</span>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-base font-semibold text-[rgb(var(--text-primary))]">{children}</h2>
  );
}

function LabeledNumber({
  label,
  value,
  min = 0,
  max = 100,
  step = 1,
  onChange,
}: {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-[rgb(var(--text-secondary))]">{label}</label>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(parseFloat(e.target.value) || min)}
        className="w-full h-9 rounded-lg bg-[rgb(var(--bg-surface))] border border-[rgb(var(--border))] px-3 text-sm text-[rgb(var(--text-primary))] hover:border-[rgb(var(--border-strong))] focus:outline-none focus:border-[rgb(var(--primary))] focus:ring-1 focus:ring-[rgb(var(--primary))]/50 transition-colors"
      />
    </div>
  );
}
