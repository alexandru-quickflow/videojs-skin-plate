import { XMarkIcon } from '@heroicons/react/16/solid';
import { Badge } from '@preview/shell/components/ui/badge';
import { Button } from '@preview/shell/components/ui/button';
import { Input } from '@preview/shell/components/ui/input';
import { Label } from '@preview/shell/components/ui/label';
import { SheetTitle } from '@preview/shell/components/ui/sheet';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  useSidebar,
} from '@preview/shell/components/ui/sidebar';
import { Slider } from '@preview/shell/components/ui/slider';
import { Switch } from '@preview/shell/components/ui/switch';
import { type ReactNode, useId, useRef, useState } from 'react';

import { locales } from './config';
import {
  ASPECT_RATIOS,
  codeSnippet,
  COLOR_SCHEMES,
  INDEX_PLACES,
  RULERS,
  SOURCES,
  THEMES,
  WIDTH_PRESETS,
  type IndexPlace,
  type Ruler,
  type Source,
  type Theme,
  hasAspectRatio,
  localeLabel,
  PLAYER_WIDTH,
  PRELOAD_VALUES,
  TEXT_DIRECTIONS,
  type AspectRatio,
  type ColorScheme,
  type Locale,
  type PreloadValue,
  type TextDirection,
  type WorkbenchParams,
} from './params';
import { PREFERENCE_QUERIES, type Preferences } from './preferences';
import { SelectField } from './select';

const SCHEME_LABELS: Record<ColorScheme, string> = { auto: 'System', light: 'Light', dark: 'Dark' };
const DIRECTION_LABELS: Record<TextDirection, string> = {
  auto: 'Language',
  ltr: 'Left to right',
  rtl: 'Right to left',
};

const SOURCE_LABELS: Record<Source, string> = {
  chapters: 'Chapters and captions',
  'one-chapter': 'One chapter',
  'no-chapters': 'No chapters',
  error: 'Broken stream',
};
const INDEX_LABELS: Record<IndexPlace, string> = { end: 'After the picture', start: 'Before the picture', none: 'Hidden' };
const RULER_LABELS: Record<Ruler, string> = { dense: 'Every tick', sparse: 'Tall ticks only' };

const PRELOAD_LABELS: Record<PreloadValue, string> = { auto: 'Auto', metadata: 'Metadata', none: 'None' };

/** English first, then every built-in language pack by name. */
const LOCALE_OPTIONS = [...locales]
  .map((value) => ({ value, label: localeLabel(value) }))
  .sort((a, b) => (a.value === 'en' ? -1 : b.value === 'en' ? 1 : a.label.localeCompare(b.label, 'en')));

export type OptionsPanelProps = {
  /** The id the navbar's toggle points at with `aria-controls`. */
  id: string;
  params: WorkbenchParams;
  onParamsChange: (value: Partial<WorkbenchParams>) => void;
  preferences: Preferences;
};

/** How the preview looks and plays. Sits beside the preview, so its controls never cover it. */
export function OptionsPanel({ id, params, onParamsChange, preferences }: OptionsPanelProps) {
  const { isMobile, setOpen, setOpenMobile } = useSidebar();
  const close = () => {
    if (isMobile) setOpenMobile(false);
    else {
      setOpen(false);
      document.getElementById(`${id}-trigger`)?.focus();
    }
  };

  return (
    <Sidebar
      id={id}
      side="right"
      aria-label="Options"
      onKeyDown={(event) => {
        if (event.key === 'Escape' && !event.defaultPrevented) {
          event.preventDefault();
          close();
        }
      }}
      className="top-14 h-[calc(100svh-3.5rem)]"
    >
      <SidebarHeader className="h-12 shrink-0 flex-row items-center justify-between border-b px-4">
        {isMobile ? (
          <SheetTitle className="text-sm font-semibold">Options</SheetTitle>
        ) : (
          <h2 className="text-sm font-semibold">Options</h2>
        )}
        <Button
          id={`${id}-close`}
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Close options"
          onClick={close}
        >
          <XMarkIcon className="size-4" aria-hidden="true" />
        </Button>
      </SidebarHeader>
      <SidebarContent className="gap-0">
        <Section title="Preview">
          <WidthControl value={params.width} onChange={(width) => onParamsChange({ width })} />
          <SelectField
            label="Aspect ratio"
            value={params.ratio}
            onChange={(value) => onParamsChange({ ratio: value as AspectRatio })}
            options={ASPECT_RATIOS.map((value) => ({ value, label: value === 'intrinsic' ? 'Intrinsic' : value }))}
            disabled={!hasAspectRatio}
          />
          <SelectField
            label="Color scheme"
            value={params.scheme}
            onChange={(value) => onParamsChange({ scheme: value as ColorScheme })}
            options={COLOR_SCHEMES.map((value) => ({ value, label: SCHEME_LABELS[value] }))}
          />
          <SelectField
            label="Direction"
            value={params.dir}
            onChange={(value) => onParamsChange({ dir: value as TextDirection })}
            options={TEXT_DIRECTIONS.map((value) => ({ value, label: DIRECTION_LABELS[value] }))}
          />
          <SelectField
            label="Theme"
            value={params.theme}
            onChange={(value) => onParamsChange({ theme: value as Theme })}
            options={THEMES.map((value) => ({ value, label: value[0]!.toUpperCase() + value.slice(1) }))}
          />
          <SelectField
            label="Language"
            value={params.locale}
            onChange={(value) => onParamsChange({ locale: value as Locale })}
            options={LOCALE_OPTIONS}
          />
        </Section>

        <Section title="Media">
          <SelectField
            label="Source"
            value={params.source}
            onChange={(value) => onParamsChange({ source: value as Source })}
            options={SOURCES.map((value) => ({ value, label: SOURCE_LABELS[value] }))}
          />
        </Section>

        <Section title="Customise">
          <ColorField label="Accent" value={params.accent} fallback="#2bd4bd" onChange={(accent) => onParamsChange({ accent })} />
          <ColorField
            label="Playhead"
            value={params.playhead}
            fallback="#ff5f45"
            onChange={(playhead) => onParamsChange({ playhead })}
          />
          <TextField
            label="Corner radius"
            value={params.radius}
            placeholder="16"
            suffix="px"
            inputMode="numeric"
            onChange={(radius) => onParamsChange({ radius: radius.replace(/\D/g, '').slice(0, 2) })}
          />
          <TextField
            label="Plate number"
            value={params.number}
            placeholder="01"
            onChange={(number) => onParamsChange({ number: number.slice(0, 4) })}
          />
          <TextField
            label="Word while playing"
            value={params.playingWord}
            placeholder="Playing"
            onChange={(playingWord) => onParamsChange({ playingWord: playingWord.slice(0, 16) })}
          />
          <SelectField
            label="Index"
            value={params.index}
            onChange={(value) => onParamsChange({ index: value as IndexPlace })}
            options={INDEX_PLACES.map((value) => ({ value, label: INDEX_LABELS[value] }))}
          />
          <SelectField
            label="Ruler"
            value={params.ruler}
            onChange={(value) => onParamsChange({ ruler: value as Ruler })}
            options={RULERS.map((value) => ({ value, label: RULER_LABELS[value] }))}
          />
          <SwitchItem label="Head line" checked={params.head} onChange={(head) => onParamsChange({ head })} />
        </Section>

        <Section title="Code">
          <CodeBlock code={codeSnippet(params)} />
        </Section>

        <Section title="Playback">
          <SwitchItem
            label="Autoplay"
            checked={params.autoplay}
            onChange={(autoplay) => onParamsChange({ autoplay })}
          />
          <SwitchItem label="Muted" checked={params.muted} onChange={(muted) => onParamsChange({ muted })} />
          <SwitchItem label="Loop" checked={params.loop} onChange={(loop) => onParamsChange({ loop })} />
          <SelectField
            label="Preload"
            value={params.preload}
            onChange={(value) => onParamsChange({ preload: value as PreloadValue })}
            options={PRELOAD_VALUES.map((value) => ({ value, label: PRELOAD_LABELS[value] }))}
          />
        </Section>

        <Section title="Detected preferences">
          <PreferenceBadges preferences={preferences} />
        </Section>
      </SidebarContent>
    </Sidebar>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  const headingId = useId();

  return (
    <SidebarGroup role="region" aria-labelledby={headingId} className="border-b p-4">
      <SidebarGroupLabel
        render={<h3 id={headingId} />}
        className="text-muted-foreground h-auto px-0 pb-3 text-xs font-medium"
      >
        {title}
      </SidebarGroupLabel>
      <SidebarGroupContent className="grid auto-rows-[minmax(2rem,auto)] grid-cols-[1fr_auto] items-center gap-x-3 gap-y-3">
        {children}
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

/** The player's width in the preview: a slider with ticks where the skins' layouts change, and a field for exact widths. */
function WidthControl({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  const id = useId();
  const dragging = useRef(false);
  const [draft, setDraft] = useState<string | null>(null);
  const clamp = (width: number) =>
    Number.isFinite(width) ? Math.min(PLAYER_WIDTH.max, Math.max(PLAYER_WIDTH.min, Math.round(width))) : value;

  return (
    <>
      <Label id={id} className="text-muted-foreground font-normal whitespace-nowrap">
        Width
      </Label>
      <div className="flex items-center gap-1 justify-self-end">
        <Input
          type="number"
          aria-label="Width in pixels"
          min={PLAYER_WIDTH.min}
          max={PLAYER_WIDTH.max}
          step={1}
          value={draft ?? value}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={(event) => {
            if (draft !== null) onChange(clamp(event.target.valueAsNumber));

            setDraft(null);
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              event.currentTarget.blur();
            }
          }}
          className="h-8 w-20 text-right text-sm tabular-nums"
        />
        <span className="text-muted-foreground text-sm">px</span>
      </div>
      <div className="col-span-2 pb-2">
        <Slider
          aria-labelledby={id}
          aria-valuetext={`${value} pixels`}
          min={PLAYER_WIDTH.min}
          max={PLAYER_WIDTH.max}
          step={1}
          value={value}
          onPointerDownCapture={() => {
            dragging.current = true;
          }}
          onPointerUpCapture={() => {
            dragging.current = false;
          }}
          onPointerCancelCapture={() => {
            dragging.current = false;
          }}
          onValueChange={(next) => {
            if (typeof next !== 'number') return;

            // Snap pointer drags near common layout breakpoints; keyboard and number entry stay precise.
            const stop = dragging.current ? PLAYER_WIDTH.stops.find((stop) => Math.abs(stop - next) <= 12) : undefined;

            onChange(stop ?? next);
          }}
          className="h-6"
        />
        <div aria-hidden="true" className="relative mx-2 h-1">
          {PLAYER_WIDTH.stops.map((stop) => (
            <span
              key={stop}
              className="bg-muted-foreground/50 absolute h-1 w-px"
              style={{ left: `${((stop - PLAYER_WIDTH.min) / (PLAYER_WIDTH.max - PLAYER_WIDTH.min)) * 100}%` }}
            />
          ))}
        </div>
      </div>
      <div className="col-span-2 flex flex-wrap gap-1" role="group" aria-label="Width presets">
        {WIDTH_PRESETS.map((preset) => (
          <Button
            key={preset.width}
            type="button"
            size="sm"
            variant={value === preset.width ? 'default' : 'outline'}
            aria-pressed={value === preset.width}
            onClick={() => onChange(preset.width)}
          >
            {preset.label} {preset.width}
          </Button>
        ))}
      </div>
    </>
  );
}

/** A colour for one of Plate's properties; empty keeps the theme's own. */
function ColorField({
  label,
  value,
  fallback,
  onChange,
}: {
  label: string;
  value: string;
  /** Night's colour, shown while the theme's own is in use. */
  fallback: string;
  onChange: (value: string) => void;
}) {
  const id = useId();

  return (
    <>
      <Label htmlFor={id} className="text-muted-foreground font-normal whitespace-nowrap">
        {label}
      </Label>
      <div className="flex items-center gap-1 justify-self-end">
        <input
          id={id}
          type="color"
          value={value || fallback}
          onChange={(event) => onChange(event.target.value)}
          className="h-8 w-10 cursor-pointer rounded border bg-transparent p-0.5"
        />
        <Button type="button" size="sm" variant="ghost" disabled={!value} onClick={() => onChange('')}>
          {value ? 'Reset' : 'Theme'}
        </Button>
      </div>
    </>
  );
}

function TextField({
  label,
  value,
  placeholder,
  suffix,
  inputMode,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  suffix?: string;
  inputMode?: 'numeric' | 'text';
  onChange: (value: string) => void;
}) {
  const id = useId();

  return (
    <>
      <Label htmlFor={id} className="text-muted-foreground font-normal whitespace-nowrap">
        {label}
      </Label>
      <div className="flex items-center gap-1 justify-self-end">
        <Input
          id={id}
          value={value}
          placeholder={placeholder}
          inputMode={inputMode}
          onChange={(event) => onChange(event.target.value)}
          className="h-8 w-28 text-sm"
        />
        {suffix && <span className="text-muted-foreground text-sm">{suffix}</span>}
      </div>
    </>
  );
}

/** The current settings as code, with a button that copies it. */
function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="col-span-2 grid gap-2">
      <pre className="bg-muted overflow-x-auto rounded-md p-3 text-xs leading-relaxed" tabIndex={0}>
        <code>{code}</code>
      </pre>
      <div className="flex items-center justify-end gap-2">
        <span className="text-muted-foreground text-xs" role="status">
          {copied ? 'Copied' : ''}
        </span>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => {
            void navigator.clipboard?.writeText(code).then(() => {
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            });
          }}
        >
          Copy
        </Button>
      </div>
    </div>
  );
}

/** The preferences skins react to, as the browser reports them; DevTools' rendering emulation flips them live. */
function PreferenceBadges({ preferences }: { preferences: Preferences }) {
  return (
    <ul className="col-span-2 flex flex-wrap gap-1" aria-label="Detected preferences">
      {PREFERENCE_QUERIES.map(([name]) => (
        <li key={name} data-active={preferences[name]}>
          <Badge variant={preferences[name] ? 'default' : 'outline'} className="text-xs">
            {name}: {preferences[name] ? 'on' : 'off'}
          </Badge>
        </li>
      ))}
    </ul>
  );
}

function SwitchItem({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  const id = useId();

  return (
    <>
      <Label htmlFor={id} className="text-muted-foreground cursor-pointer font-normal whitespace-nowrap">
        {label}
      </Label>
      <Switch id={id} checked={checked} onCheckedChange={onChange} className="justify-self-end" />
    </>
  );
}
