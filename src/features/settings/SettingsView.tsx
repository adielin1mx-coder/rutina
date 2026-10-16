import { useState } from 'react';
import { Check, Download, ExternalLink, Link2Off, RefreshCw, RotateCcw, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { importMeals, pull, saveSession, setSyncConfig, useStore } from '@/lib/store';
import { Switch } from '@/components/ui/switch';
import type { Session } from '@/lib/progression';
import { DEFAULT_PREFS, inkOn, PRESETS, setPrefs, TYPE_LABEL, typeVars, usePrefs, type Tone } from '@/lib/theme';

export function SettingsView() {
  const sync = useStore((s) => s.sync);
  const status = useStore((s) => s.status);
  const error = useStore((s) => s.error);
  const lastSync = useStore((s) => s.lastSync);
  const sessions = useStore((s) => s.sessions);
  const meals = useStore((s) => s.meals);
  const [url, setUrl] = useState(sync?.url ?? '');
  const [token, setToken] = useState(sync?.token ?? '');

  function connect() {
    if (!/^https:\/\/script\.google\.com\/macros\/s\/.+\/exec$/.test(url.trim())) {
      toast.error('La URL debe ser la del Web App de Apps Script y terminar en /exec.');
      return;
    }
    if (token.trim().length < 8) {
      toast.error('Usa un token de al menos 8 caracteres.');
      return;
    }
    setSyncConfig({ url: url.trim(), token: token.trim() });
    toast.success('Conectado a tu Google Sheet');
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify({ sessions: Object.values(sessions), meals }, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `rutina-registro-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  async function importJson(file: File) {
    try {
      // Respaldo nuevo: { sessions, meals }. El anterior era solo la lista de sesiones.
      const data = JSON.parse(await file.text()) as Session[] | { sessions: Session[]; meals?: Record<string, string[]> };
      const list = Array.isArray(data) ? data : data.sessions ?? [];
      list.forEach((s) => s.id && s.exerciseId && Array.isArray(s.sets) && saveSession(s));
      const importedMeals = Array.isArray(data) ? undefined : data.meals;
      const days = importedMeals ? Object.keys(importedMeals).length : 0;
      if (importedMeals && days) importMeals(importedMeals);
      toast.success(`${list.length} sesiones${days ? ` y ${days} días de comidas` : ''} importadas`);
    } catch {
      toast.error('El archivo no es un respaldo válido.');
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-[clamp(52px,13vw,88px)] leading-[0.85] font-black uppercase">Ajustes</h1>
        <p className="mt-3 max-w-[60ch] text-[15.5px] text-muted-foreground">
          Tus pesos y comidas se guardan en este dispositivo y, si conectas tu Google Sheet, también en tu Drive, sincronizados entre el celular y la computadora.
        </p>
      </header>

      <Appearance />

      <section className="grain space-y-4 rounded-2xl border bg-surface p-5">
        <h2 className="font-display text-3xl font-black uppercase">Google Sheet</h2>
        <ol className="list-decimal space-y-1 pl-5 text-[14px] text-foreground/80">
          <li>Crea una Google Sheet en tu Drive.</li>
          <li>Extensiones › Apps Script › pega el contenido de <code className="text-neon">apps-script/Code.gs</code> del repositorio.</li>
          <li>Configuración del proyecto (engrane) › hasta abajo, “Propiedades de las secuencias de comandos” › Agregar propiedad: nombre <code className="text-neon">TOKEN</code>, valor una frase secreta › Guardar.</li>
          <li>Implementar › Nueva implementación › Aplicación web · Ejecutar como: Yo · Acceso: Cualquier persona.</li>
          <li>Copia la URL que termina en <code>/exec</code> y pégala aquí junto con tu TOKEN.</li>
        </ol>
        <a
          href="https://github.com/adielin1mx-coder/rutina/blob/main/apps-script/Code.gs"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-neon"
        >
          Ver Code.gs <ExternalLink className="size-3.5" />
        </a>

        <label className="block">
          <span className="text-[12.5px] font-semibold tracking-wide text-muted-foreground uppercase">URL del Web App</span>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://script.google.com/macros/s/…/exec"
            className="mt-1 h-11 w-full rounded-xl border border-input bg-background px-3 text-[14px] outline-none focus:border-neon"
          />
        </label>
        <label className="block">
          <span className="text-[12.5px] font-semibold tracking-wide text-muted-foreground uppercase">Token</span>
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="La frase secreta que pusiste en TOKEN"
            className="mt-1 h-11 w-full rounded-xl border border-input bg-background px-3 text-[14px] outline-none focus:border-neon"
          />
        </label>
        <p className="text-[12.5px] text-muted-foreground">La URL y el token se guardan solo en este navegador; nunca se suben al repositorio.</p>

        <div className="flex flex-wrap gap-2">
          <button onClick={connect} className="h-11 rounded-xl bg-neon px-5 font-semibold text-white">
            {sync ? 'Guardar cambios' : 'Conectar'}
          </button>
          {sync && (
            <>
              <button onClick={() => void pull()} className="inline-flex h-11 items-center gap-2 rounded-xl border bg-surface-2 px-4 font-semibold">
                <RefreshCw className={status === 'syncing' ? 'size-4 animate-spin' : 'size-4'} /> Sincronizar ahora
              </button>
              <button
                onClick={() => {
                  setSyncConfig(null);
                  toast('Desconectado. Los datos siguen en este dispositivo.');
                }}
                className="inline-flex h-11 items-center gap-2 rounded-xl border px-4 font-semibold text-muted-foreground"
              >
                <Link2Off className="size-4" /> Desconectar
              </button>
            </>
          )}
        </div>
        {sync && (
          <p className="text-[13px] text-muted-foreground">
            Estado: <b className="text-foreground">{status}</b>
            {lastSync && ` · última sincronización ${new Date(lastSync).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}`}
            {error && <span className="block text-destructive">{error}</span>}
          </p>
        )}
      </section>

      <section className="grain space-y-3 rounded-2xl border bg-surface p-5">
        <h2 className="font-display text-3xl font-black uppercase">Respaldo</h2>
        <p className="text-[14px] text-muted-foreground">{Object.keys(sessions).length} sesiones guardadas en este dispositivo.</p>
        <div className="flex flex-wrap gap-2">
          <button onClick={exportJson} className="inline-flex h-11 items-center gap-2 rounded-xl border bg-surface-2 px-4 font-semibold">
            <Download className="size-4" /> Exportar JSON
          </button>
          <label className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-xl border bg-surface-2 px-4 font-semibold">
            <Upload className="size-4" /> Importar JSON
            <input type="file" accept="application/json" className="hidden" onChange={(e) => e.target.files?.[0] && void importJson(e.target.files[0])} />
          </label>
        </div>
      </section>
    </div>
  );
}

const TONES: Tone[] = ['hyp', 'str', 'rec'];
const TONE_LABEL: Record<Tone, string> = {
  hyp: 'Días de hipertrofia · L, M, X',
  str: 'Días de fuerza · J, V',
  rec: 'Recomendaciones opcionales',
};

function Appearance() {
  const prefs = usePrefs();
  const [name, setName] = useState(prefs.name);
  const changed = prefs.hyp !== DEFAULT_PREFS.hyp || prefs.str !== DEFAULT_PREFS.str || prefs.rec !== DEFAULT_PREFS.rec;

  return (
    <section className="grain space-y-5 rounded-2xl border bg-surface p-5">
      <h2 className="font-display text-3xl font-black uppercase">Apariencia</h2>

      <label className="block">
        <span className="text-[12.5px] font-semibold tracking-wide text-muted-foreground uppercase">Tu nombre</span>
        <input
          value={name}
          maxLength={24}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => setPrefs({ name: name.trim() || DEFAULT_PREFS.name })}
          className="mt-1 h-11 w-full rounded-xl border border-input bg-background px-3 text-[14px] outline-none focus:border-neon"
        />
        <span className="mt-1 block text-[12.5px] text-muted-foreground">Aparece en la bienvenida: “Bienvenido, {prefs.name}”.</span>
      </label>

      {TONES.map((t) => (
        <div key={t}>
          <p className="text-[12.5px] font-semibold tracking-wide text-muted-foreground uppercase">{TONE_LABEL[t]}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {PRESETS.map((c) => (
              <button
                key={c}
                onClick={() => setPrefs({ [t]: c })}
                aria-label={`Color ${c}`}
                aria-pressed={prefs[t] === c}
                className="grid size-9 place-items-center rounded-full border-2 border-transparent transition-transform active:scale-90 aria-pressed:border-foreground"
                style={{ background: c }}
              >
                {prefs[t] === c && <Check className="size-4" style={{ color: inkOn(c) }} strokeWidth={3} />}
              </button>
            ))}
            <label
              className="relative grid size-9 cursor-pointer place-items-center overflow-hidden rounded-full border-2 border-dashed border-foreground/40 text-[10px] font-bold"
              title="Color libre"
            >
              <span
                className="absolute inset-1 rounded-full"
                style={{ background: PRESETS.includes(prefs[t]) ? 'conic-gradient(red, yellow, lime, cyan, blue, magenta, red)' : prefs[t] }}
              />
              <input type="color" value={prefs[t]} onChange={(e) => setPrefs({ [t]: e.target.value })} className="absolute inset-0 cursor-pointer opacity-0" />
            </label>
          </div>
        </div>
      ))}

      <div className="grid grid-cols-3 gap-2">
        {TONES.map((t) => (
          <div key={t} style={typeVars(t)} className="relative flex flex-col items-start gap-1 overflow-hidden rounded-xl border border-(--c)/40 bg-surface-2 p-3">
            <span className="font-display text-3xl leading-none font-black text-(--c)">{t === 'hyp' ? 'L' : t === 'str' ? 'J' : '+1'}</span>
            <span className="rounded-md bg-(--c) px-1.5 py-0.5 text-[10px] font-black tracking-wider text-(--c-ink) uppercase">
              {t === 'rec' ? 'Recomendado' : TYPE_LABEL[t].long}
            </span>
            <span className="absolute inset-x-0 bottom-0 h-[3px] bg-(--c)" />
          </div>
        ))}
      </div>

      <label className="flex items-center justify-between gap-3 rounded-xl border bg-surface-2 p-3">
        <span>
          <span className="block text-[14.5px] font-semibold">Mostrar recomendaciones</span>
          <span className="text-[12.5px] text-muted-foreground">Ejercicios opcionales al final de cada día, con su conteo.</span>
        </span>
        <Switch checked={prefs.showRecs} onCheckedChange={(v) => setPrefs({ showRecs: v })} />
      </label>

      {changed && (
        <button
          onClick={() => setPrefs({ hyp: DEFAULT_PREFS.hyp, str: DEFAULT_PREFS.str, rec: DEFAULT_PREFS.rec })}
          className="inline-flex h-10 items-center gap-2 rounded-xl border px-4 text-[14px] font-semibold text-muted-foreground"
        >
          <RotateCcw className="size-4" /> Restablecer colores
        </button>
      )}
    </section>
  );
}
