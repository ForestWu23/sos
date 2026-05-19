import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { ArrowLeftRight, Clock, Copy, FlaskConical } from 'lucide-react';
import Button from '../../components/Button';
import Tag from '../../components/Tag';
import { toast } from '../../components/Toast';
import './EpochConverterPage.css';

const detectUnit = (value: string): { unit: string; divisor: number } => {
  const len = value.length;
  if (len <= 10) return { unit: 'seconds', divisor: 1 };
  if (len === 13) return { unit: 'milliseconds', divisor: 1000 };
  if (len === 16) return { unit: 'microseconds', divisor: 1_000_000 };
  if (len >= 19) return { unit: 'nanoseconds', divisor: 1_000_000_000 };
  return { unit: 'milliseconds', divisor: 1000 };
};

const formatDate = (date: Date, timeZone: string): string =>
  date.toLocaleString('en-US', {
    timeZone,
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
    timeZoneName: 'short',
  });

const formatISO = (date: Date): string => date.toISOString();

const formatISOWithTZ = (date: Date, timeZone: string): string => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    fractionalSecondDigits: 3,
    timeZoneName: 'longOffset',
  } as Intl.DateTimeFormatOptions).formatToParts(date);

  const get = (type: string) => parts.find((p) => p.type === type)?.value || '';
  const offset = get('timeZoneName').replace('GMT', '') || '+00:00';
  return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}:${get('second')}.${get('fractionalSecond')}${offset}`;
};

const copyText = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  } catch {
    const el = document.createElement('textarea');
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    toast.success('Copied to clipboard');
  }
};

interface EpochResult {
  gmt: string;
  pst: string;
  isoUtc: string;
  isoPst: string;
  unit: string;
  ms: number;
}

const parseEpoch = (raw: string): EpochResult | null => {
  const cleaned = raw.trim();
  if (!cleaned || !/^\d+$/.test(cleaned)) return null;
  const { unit, divisor } = detectUnit(cleaned);
  const epochNum = Number(cleaned);
  const ms =
    Math.floor(epochNum / divisor) * 1000 +
    Math.floor((epochNum % divisor) / (divisor / 1000));
  const date = new Date(ms);
  if (isNaN(date.getTime())) return null;
  return {
    gmt: formatDate(date, 'UTC'),
    pst: formatDate(date, 'America/Los_Angeles'),
    isoUtc: formatISO(date),
    isoPst: formatISOWithTZ(date, 'America/Los_Angeles'),
    unit,
    ms,
  };
};

const formatDuration = (diffMs: number): string => {
  const absDiff = Math.abs(diffMs);
  const seconds = Math.floor(absDiff / 1000);
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  parts.push(`${secs}s`);
  return (diffMs < 0 ? '-' : '') + parts.join(' ');
};

const FORMATS = [
  { key: 'gmt', label: 'GMT / UTC' },
  { key: 'pst', label: 'PST / Pacific' },
  { key: 'isoUtc', label: 'ISO 8601 (UTC)' },
  { key: 'isoPst', label: 'ISO 8601 (PST)' },
] as const;

interface TimestampInputProps {
  label: string;
  color: string;
  value: string;
  onChange: (v: string) => void;
  onConvert: () => void;
  onUseCurrent: () => void;
}

const TimestampInput: React.FC<TimestampInputProps> = ({
  label,
  color,
  value,
  onChange,
  onConvert,
  onUseCurrent,
}) => (
  <div className="ts-input-card">
    <div className="ts-input-header">
      <span className="ts-input-badge" style={{ background: color }}>{label}</span>
      <Button size="small" onClick={onUseCurrent}>Now</Button>
    </div>
    <div className="ts-input-row">
      <div style={{ flex: 1, position: 'relative' }}>
        <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#999', pointerEvents: 'none' }}>
          <Clock size={14} />
        </span>
        <input
          type="text"
          placeholder="Epoch timestamp"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onConvert()}
          className="epoch-input"
          style={{
            width: '100%',
            padding: '8px 32px 8px 32px',
            border: '1px solid #d9d9d9',
            borderRadius: 6,
            fontSize: 14,
            outline: 'none',
            fontFamily: 'inherit',
          }}
          onFocus={(e) => { e.target.style.borderColor = '#1677ff'; }}
          onBlur={(e) => { e.target.style.borderColor = '#d9d9d9'; }}
        />
      </div>
      <Button type="primary" size="large" icon={<ArrowLeftRight size={14} />} onClick={onConvert}>
        Convert
      </Button>
    </div>
  </div>
);

interface CompareCellProps {
  value?: string;
}

const CompareCell: React.FC<CompareCellProps> = ({ value }) => (
  <td className="compare-value">
    {value ? (
      <div className="compare-value-inner">
        <span>{value}</span>
        <button
          className="epoch-copy-btn"
          onClick={() => copyText(value)}
          title="Copy"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px' }}
        >
          <Copy size={13} />
        </button>
      </div>
    ) : (
      <span className="compare-empty">—</span>
    )}
  </td>
);

const EpochConverterPage: React.FC = () => {
  const [inputA, setInputA] = useState('');
  const [inputB, setInputB] = useState('');
  const [resultA, setResultA] = useState<EpochResult | null>(null);
  const [resultB, setResultB] = useState<EpochResult | null>(null);
  const [errorA, setErrorA] = useState('');
  const [errorB, setErrorB] = useState('');
  const [currentEpoch, setCurrentEpoch] = useState(Math.floor(Date.now() / 1000));

  useEffect(() => {
    const timer = setInterval(() => setCurrentEpoch(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(timer);
  }, []);

  const convertA = useCallback(() => {
    if (!inputA.trim()) { setErrorA('Enter a timestamp'); setResultA(null); return; }
    const r = parseEpoch(inputA);
    if (!r) { setErrorA('Invalid epoch timestamp'); setResultA(null); return; }
    setResultA(r); setErrorA('');
  }, [inputA]);

  const convertB = useCallback(() => {
    if (!inputB.trim()) { setErrorB('Enter a timestamp'); setResultB(null); return; }
    const r = parseEpoch(inputB);
    if (!r) { setErrorB('Invalid epoch timestamp'); setResultB(null); return; }
    setResultB(r); setErrorB('');
  }, [inputB]);

  const useCurrent = (setter: (v: string) => void, converter: () => void) => {
    setter(String(currentEpoch));
    setTimeout(converter, 0);
  };

  const diff = useMemo(() => {
    if (!resultA || !resultB) return null;
    return formatDuration(resultB.ms - resultA.ms);
  }, [resultA, resultB]);

  const hasAnyResult = resultA || resultB;

  return (
    <div className="epoch-container">
      <div className="epoch-content">
        <h3 className="epoch-title" style={{ fontSize: 20, fontWeight: 600 }}>
          Epoch &amp; Unix Timestamp Converter
        </h3>

        <div className="epoch-current-card" style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 8, padding: '12px 16px' }}>
          <div className="epoch-current-row">
            <span style={{ fontSize: 13, color: '#999' }}>Current Unix epoch time</span>
            <code className="epoch-current-value">{currentEpoch}</code>
          </div>
        </div>

        <div className="epoch-card" style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 8, padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <p style={{ fontSize: 12, color: '#999', margin: 0 }}>
              Supports seconds (10 digits), milliseconds (13), microseconds (16), nanoseconds (19).
            </p>
            <Button
              size="small"
              icon={<FlaskConical size={13} />}
              onClick={() => {
                const a = '1716134400';
                const b = '1716220800000';
                setInputA(a);
                setInputB(b);
                setErrorA('');
                setErrorB('');
                const rA = parseEpoch(a);
                const rB = parseEpoch(b);
                if (rA) setResultA(rA);
                if (rB) setResultB(rB);
              }}
            >
              Sample
            </Button>
          </div>
          <div className="ts-inputs-row">
            <TimestampInput
              label="A"
              color="#1677ff"
              value={inputA}
              onChange={setInputA}
              onConvert={convertA}
              onUseCurrent={() => useCurrent(setInputA, convertA)}
            />
            <TimestampInput
              label="B"
              color="#722ed1"
              value={inputB}
              onChange={setInputB}
              onConvert={convertB}
              onUseCurrent={() => useCurrent(setInputB, convertB)}
            />
          </div>
          {(errorA || errorB) && (
            <div className="ts-errors">
              {errorA && <span className="ts-error"><b>A:</b> {errorA}</span>}
              {errorB && <span className="ts-error"><b>B:</b> {errorB}</span>}
            </div>
          )}
        </div>

        {hasAnyResult && (
          <div className="epoch-card" style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 8, padding: '16px' }}>
            <table className="compare-table">
              <thead>
                <tr>
                  <th className="compare-label-col">Format</th>
                  <th className="compare-val-col">
                    <span className="compare-col-badge" style={{ background: '#1677ff' }}>A</span>
                    {resultA && <Tag color="blue" style={{ marginLeft: 6 }}>{resultA.unit}</Tag>}
                  </th>
                  <th className="compare-val-col">
                    <span className="compare-col-badge" style={{ background: '#722ed1' }}>B</span>
                    {resultB && <Tag color="purple" style={{ marginLeft: 6 }}>{resultB.unit}</Tag>}
                  </th>
                </tr>
              </thead>
              <tbody>
                {FORMATS.map((fmt) => (
                  <tr key={fmt.key}>
                    <td className="compare-label">{fmt.label}</td>
                    <CompareCell value={resultA?.[fmt.key]} />
                    <CompareCell value={resultB?.[fmt.key]} />
                  </tr>
                ))}
                {diff !== null && (
                  <tr className="compare-diff-row">
                    <td className="compare-label">Difference (B − A)</td>
                    <td colSpan={2} className="compare-diff-value">{diff}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="epoch-card epoch-ref-card" style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 8 }}>
          <div style={{ padding: '10px 16px', borderBottom: '1px solid #f0f0f0', fontWeight: 600, fontSize: 13, color: '#555' }}>Reference</div>
          <div style={{ padding: '0 16px 8px' }}>
            <table className="epoch-ref-table">
              <thead>
                <tr><th>Human-readable time</th><th>Seconds</th></tr>
              </thead>
              <tbody>
                <tr><td>1 minute</td><td>60</td></tr>
                <tr><td>1 hour</td><td>3,600</td></tr>
                <tr><td>1 day</td><td>86,400</td></tr>
                <tr><td>1 week</td><td>604,800</td></tr>
                <tr><td>1 month (30.44 days)</td><td>2,629,743</td></tr>
                <tr><td>1 year (365.25 days)</td><td>31,556,926</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div className="sos-page-footer">Built by <strong>@Forest</strong></div>
    </div>
  );
};

export default EpochConverterPage;
