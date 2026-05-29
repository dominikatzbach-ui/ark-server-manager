import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Save, ChevronDown, ChevronRight, Info, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MOCK_SERVERS } from '@/api/client';
import { type ServerConfig, DEFAULT_CONFIG } from '@/types/server';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Toggle } from '@/components/ui/Toggle';
import { Tooltip } from '@/components/ui/Tooltip';

type ConfigTab = 'general' | 'network' | 'gameplay' | 'mods';

interface SettingRowProps {
  label: string;
  tooltip?: string;
  children: React.ReactNode;
  advanced?: boolean;
  showAdvanced?: boolean;
}

function SettingRow({ label, tooltip, children, advanced, showAdvanced }: SettingRowProps) {
  if (advanced && !showAdvanced) return null;
  return (
    <div className="flex items-start justify-between py-3.5 gap-4 border-b border-[rgb(var(--border-subtle))] last:border-b-0">
      <div className="flex-1 min-w-0 pt-0.5">
        <div className="flex items-center gap-1.5">
          <span className="text-sm text-[rgb(var(--text-primary))]">{label}</span>
          {advanced && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-500/15 text-violet-400 font-medium">
              Erweitert
            </span>
          )}
          {tooltip && (
            <Tooltip content={tooltip}>
              <Info className="w-3.5 h-3.5 text-[rgb(var(--text-muted))] cursor-help flex-shrink-0" />
            </Tooltip>
          )}
        </div>
      </div>
      <div className="flex-shrink-0 w-52">{children}</div>
    </div>
  );
}

interface SectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function Section({ title, children, defaultOpen = true }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="surface-card mb-4 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-[rgb(var(--bg-overlay))] transition-colors duration-150"
      >
        <span className="text-sm font-semibold text-[rgb(var(--text-primary))]">{title}</span>
        {open ? (
          <ChevronDown className="w-4 h-4 text-[rgb(var(--text-muted))]" />
        ) : (
          <ChevronRight className="w-4 h-4 text-[rgb(var(--text-muted))]" />
        )}
      </button>
      {open && <div className="px-5 pb-2">{children}</div>}
    </div>
  );
}

export function ConfigEditor() {
  const [searchParams] = useSearchParams();
  const serverId = searchParams.get('serverId');
  const server = MOCK_SERVERS.find((s) => s.id === serverId) ?? MOCK_SERVERS[0];

  const [config, setConfig] = useState<Partial<ServerConfig>>({
    ...DEFAULT_CONFIG,
    name: server.name,
    map: server.map,
    port: server.port,
    queryPort: server.queryPort,
    rconPort: server.rconPort,
    maxPlayers: server.maxPlayers,
  });
  const [activeTab, setActiveTab] = useState<ConfigTab>('general');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function update(patch: Partial<ServerConfig>) {
    setConfig((prev) => ({ ...prev, ...patch }));
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  const TABS: { id: ConfigTab; label: string }[] = [
    { id: 'general', label: 'Allgemein' },
    { id: 'network', label: 'Netzwerk' },
    { id: 'gameplay', label: 'Gameplay' },
    { id: 'mods', label: 'Mods' },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-[rgb(var(--text-primary))]">Konfiguration</h1>
          <p className="text-sm text-[rgb(var(--text-muted))] mt-0.5">{server.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowAdvanced((v) => !v)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors',
              showAdvanced
                ? 'border-violet-500/40 bg-violet-500/10 text-violet-400'
                : 'border-[rgb(var(--border))] text-[rgb(var(--text-muted))] hover:border-[rgb(var(--border-strong))] hover:text-[rgb(var(--text-secondary))]'
            )}
          >
            {showAdvanced ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            Erweitert
          </button>
          <Button variant="primary" size="sm" loading={saving} onClick={handleSave}>
            <Save className="w-4 h-4" />
            {saved ? 'Gespeichert!' : 'Speichern'}
          </Button>
        </div>
      </div>

      {/* Server running warning */}
      {server.status === 'running' && (
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-lg border border-amber-500/30 bg-amber-500/5 text-amber-400 text-xs mb-5">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          Der Server läuft gerade. Änderungen werden erst nach dem nächsten Neustart wirksam.
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-[rgb(var(--bg-surface))] p-1 rounded-xl border border-[rgb(var(--border))]">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-150',
              activeTab === tab.id
                ? 'bg-[rgb(var(--bg-elevated))] text-[rgb(var(--text-primary))] shadow-sm'
                : 'text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text-secondary))]'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'general' && (
        <>
          <Section title="Server-Identität">
            <SettingRow label="Server-Name" tooltip="Name der im Steam-Browser angezeigt wird">
              <Input
                value={config.name ?? ''}
                onChange={(e) => update({ name: e.target.value })}
                placeholder="Mein ARK Server"
              />
            </SettingRow>
            <SettingRow label="Session-Name" tooltip="Interner Session-Name" advanced showAdvanced={showAdvanced}>
              <Input
                value={config.sessionName ?? ''}
                onChange={(e) => update({ sessionName: e.target.value })}
              />
            </SettingRow>
            <SettingRow label="Maximale Spieler">
              <Input
                type="number"
                value={config.maxPlayers ?? 70}
                onChange={(e) => update({ maxPlayers: parseInt(e.target.value) || 1 })}
                min={1}
                max={255}
              />
            </SettingRow>
          </Section>

          <Section title="Sicherheit">
            <SettingRow label="Admin-Passwort" tooltip="Für Cheat-Befehle und Admin-Login">
              <Input
                type="password"
                value={config.adminPassword ?? ''}
                onChange={(e) => update({ adminPassword: e.target.value })}
                placeholder="••••••••"
              />
            </SettingRow>
            <SettingRow label="Server-Passwort" tooltip="Leer = öffentlicher Server">
              <Input
                type="password"
                value={config.serverPassword ?? ''}
                onChange={(e) => update({ serverPassword: e.target.value })}
                placeholder="Leer = öffentlich"
              />
            </SettingRow>
            <SettingRow label="BattlEye" tooltip="Anti-Cheat-System. Empfohlen für öffentliche Server.">
              <Toggle
                checked={config.battleEye ?? true}
                onChange={(v) => update({ battleEye: v })}
              />
            </SettingRow>
          </Section>
        </>
      )}

      {activeTab === 'network' && (
        <Section title="Ports">
          <SettingRow label="Game-Port" tooltip="Client-Verbindungsport (UDP)">
            <Input
              type="number"
              value={config.port ?? 7777}
              onChange={(e) => update({ port: parseInt(e.target.value) || 7777 })}
            />
          </SettingRow>
          <SettingRow label="Query-Port" tooltip="Steam-Browser-Port (UDP)">
            <Input
              type="number"
              value={config.queryPort ?? 27015}
              onChange={(e) => update({ queryPort: parseInt(e.target.value) || 27015 })}
            />
          </SettingRow>
          <SettingRow label="RCON-Port" tooltip="Remote-Admin-Console-Port (TCP)">
            <Input
              type="number"
              value={config.rconPort ?? 32330}
              onChange={(e) => update({ rconPort: parseInt(e.target.value) || 32330 })}
            />
          </SettingRow>
          <SettingRow label="RCON-Passwort" tooltip="Für externe RCON-Tools">
            <Input
              type="password"
              value={config.rconPassword ?? ''}
              onChange={(e) => update({ rconPassword: e.target.value })}
              placeholder="••••••••"
            />
          </SettingRow>
        </Section>
      )}

      {activeTab === 'gameplay' && (
        <>
          <Section title="Spielmodus">
            <SettingRow label="PvP aktiviert" tooltip="Spieler können sich bekämpfen">
              <Toggle checked={config.pvpEnabled ?? true} onChange={(v) => update({ pvpEnabled: v })} />
            </SettingRow>
            <SettingRow label="Hardcore" tooltip="Tod löscht den Charakter permanent">
              <Toggle checked={config.hardcore ?? false} onChange={(v) => update({ hardcore: v })} />
            </SettingRow>
            <SettingRow label="Dino-Mitnahme erlaubt" tooltip="Fliegende Dinos können andere Spieler tragen" advanced showAdvanced={showAdvanced}>
              <Toggle checked={config.allowFlyerCarry ?? true} onChange={(v) => update({ allowFlyerCarry: v })} />
            </SettingRow>
            <SettingRow label="Cluster-Downloads" tooltip="Spieler können Dinos/Items aus anderen Clustern herunterladen" advanced showAdvanced={showAdvanced}>
              <Toggle checked={!(config.noTributeDownloads ?? false)} onChange={(v) => update({ noTributeDownloads: !v })} />
            </SettingRow>
          </Section>

          <Section title="Multiplikatoren">
            <SettingRow label="XP-Multiplikator">
              <RangeInput value={config.xpMultiplier ?? 1} min={0.1} max={10} step={0.1} onChange={(v) => update({ xpMultiplier: v })} />
            </SettingRow>
            <SettingRow label="Ernte-Multiplikator">
              <RangeInput value={config.harvestAmountMultiplier ?? 1} min={0.1} max={20} step={0.5} onChange={(v) => update({ harvestAmountMultiplier: v })} />
            </SettingRow>
            <SettingRow label="Zähm-Geschwindigkeit">
              <RangeInput value={config.tameSpeedMultiplier ?? 1} min={0.1} max={50} step={1} onChange={(v) => update({ tameSpeedMultiplier: v })} />
            </SettingRow>
            <SettingRow label="Spieler-Schaden" advanced showAdvanced={showAdvanced}>
              <RangeInput value={config.playerDamageMultiplier ?? 1} min={0.1} max={5} step={0.1} onChange={(v) => update({ playerDamageMultiplier: v })} />
            </SettingRow>
            <SettingRow label="Spieler-Resistenz" advanced showAdvanced={showAdvanced}>
              <RangeInput value={config.playerResistanceMultiplier ?? 1} min={0.1} max={5} step={0.1} onChange={(v) => update({ playerResistanceMultiplier: v })} />
            </SettingRow>
            <SettingRow label="Dino-Anzahl" tooltip="Anzahl der spawenden Dinos im Verhältnis zum Standardwert" advanced showAdvanced={showAdvanced}>
              <RangeInput value={config.dinoCountMultiplier ?? 1} min={0.1} max={5} step={0.1} onChange={(v) => update({ dinoCountMultiplier: v })} />
            </SettingRow>
          </Section>
        </>
      )}

      {activeTab === 'mods' && (
        <Section title="Mod-Verwaltung">
          <div className="py-4">
            <Input
              label="Workshop-IDs (eine pro Zeile)"
              placeholder="731604991&#10;1609138312"
              hint="Steam Workshop Mod-IDs, getrennt durch Zeilenumbrüche"
            />
            <div className="mt-4 p-4 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-surface))]">
              <p className="text-xs text-[rgb(var(--text-muted))]">
                Mods werden beim nächsten Serverstart automatisch von Steam heruntergeladen und installiert.
                Große Mod-Pakete können den Startvorgang deutlich verlängern.
              </p>
            </div>
          </div>
        </Section>
      )}
    </div>
  );
}

function RangeInput({
  value,
  min,
  max,
  step,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="flex-1 h-1.5 rounded-full appearance-none bg-[rgb(var(--bg-overlay))] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[rgb(var(--primary))] [&::-webkit-slider-thumb]:cursor-pointer"
      />
      <span className="text-sm font-mono text-[rgb(var(--text-primary))] w-10 text-right">×{value}</span>
    </div>
  );
}
