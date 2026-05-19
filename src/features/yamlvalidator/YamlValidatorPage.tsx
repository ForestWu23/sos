import React, { useState, useRef, useCallback, useMemo } from 'react';
import { CheckCircle, Copy, Trash2, ArrowLeftRight, FlaskConical } from 'lucide-react';
import yaml from 'js-yaml';

const SAMPLE_YAML = `# Application configuration
app:
  name: my-service
  version: "2.1.0"
  debug: false

server:
  host: 0.0.0.0
  port: 8080
  timeout: 30

database:
  host: db.example.com
  port: 5432
  name: mydb
  pool:
    min: 2
    max: 10

features:
  - auth
  - logging
  - metrics
`;
import Button from '../../components/Button';
import Checkbox from '../../components/Checkbox';
import Tag from '../../components/Tag';
import { toast } from '../../components/Toast';
import './YamlValidatorPage.css';

const highlightYaml = (text: string): string => {
  if (!text) return '';
  const escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return escaped
    .split('\n')
    .map((line) => {
      if (/^\s*#/.test(line)) return `<span class="yaml-comment">${line}</span>`;
      return line.replace(
        /^(\s*)([\w][^\s:]*?)(\s*:\s*)(.*)/,
        (_, indent, key, colon, value) => {
          let valuePart = value;
          if (/^(['"]).*\1$/.test(value.trim())) {
            valuePart = `<span class="yaml-string">${value}</span>`;
          } else if (/^-?\d+(\.\d+)?$/.test(value.trim())) {
            valuePart = `<span class="yaml-number">${value}</span>`;
          } else if (/^(true|false)$/i.test(value.trim())) {
            valuePart = `<span class="yaml-boolean">${value}</span>`;
          } else if (/^(null|~)$/i.test(value.trim())) {
            valuePart = `<span class="yaml-null">${value}</span>`;
          } else if (value.trim().startsWith('#')) {
            valuePart = `<span class="yaml-comment">${value}</span>`;
          } else if (value.trim()) {
            valuePart = `<span class="yaml-string">${value}</span>`;
          }
          return `${indent}<span class="yaml-key">${key}</span>${colon}${valuePart}`;
        },
      );
    })
    .join('\n');
};

const LineNumbers: React.FC<{ count: number }> = ({ count }) => (
  <div className="line-numbers" aria-hidden="true">
    {Array.from({ length: count }, (_, i) => (
      <div key={i + 1} className="line-number">{i + 1}</div>
    ))}
  </div>
);

const YamlValidatorPage: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [stripComments, setStripComments] = useState(true);
  const [resolveAliases, setResolveAliases] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const inputHighlightRef = useRef<HTMLPreElement>(null);
  const inputLineNumRef = useRef<HTMLDivElement>(null);

  const inputLineCount = useMemo(() => Math.max(inputValue.split('\n').length, 1), [inputValue]);
  const inputHighlightedHtml = useMemo(() => highlightYaml(inputValue), [inputValue]);

  const handleValidate = useCallback(() => {
    if (!inputValue.trim()) { setError(''); setIsValid(null); return; }
    try {
      const schema = resolveAliases ? yaml.DEFAULT_SCHEMA : yaml.FAILSAFE_SCHEMA;
      const docs = yaml.loadAll(inputValue, undefined, { schema });
      if (stripComments) {
        const reformatted = (docs as unknown[])
          .map((doc) => yaml.dump(doc, { indent: 2, lineWidth: -1, noRefs: !resolveAliases }))
          .join('---\n');
        setInputValue(reformatted);
      }
      setError('');
      setIsValid(true);
    } catch (e) {
      setError((e as Error).message || 'Invalid YAML');
      setIsValid(false);
    }
  }, [inputValue, stripComments, resolveAliases]);

  const handleToJson = useCallback(() => {
    if (!inputValue.trim()) return;
    try {
      const schema = resolveAliases ? yaml.DEFAULT_SCHEMA : yaml.FAILSAFE_SCHEMA;
      const doc = yaml.load(inputValue, { schema });
      setInputValue(JSON.stringify(doc, null, 2));
      setError('');
      setIsValid(true);
    } catch (e) {
      setError((e as Error).message || 'Invalid YAML');
      setIsValid(false);
    }
  }, [inputValue, resolveAliases]);

  const handleCopy = useCallback(async () => {
    if (!inputValue) return;
    try {
      await navigator.clipboard.writeText(inputValue);
      toast.success('Copied to clipboard');
    } catch {
      const ta = document.createElement('textarea');
      ta.value = inputValue;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      toast.success('Copied to clipboard');
    }
  }, [inputValue]);

  const handleClear = useCallback(() => {
    setInputValue('');
    setError('');
    setIsValid(null);
    textareaRef.current?.focus();
  }, []);

  const handleInputScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    const { scrollTop, scrollLeft } = e.currentTarget;
    if (inputLineNumRef.current) inputLineNumRef.current.scrollTop = scrollTop;
    if (inputHighlightRef.current) {
      inputHighlightRef.current.scrollTop = scrollTop;
      inputHighlightRef.current.scrollLeft = scrollLeft;
    }
  };

  return (
    <div className="yaml-validator-container">
      <div className="yaml-validator-toolbar">
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
          <Button type="primary" icon={<CheckCircle size={14} />} onClick={handleValidate}>
            Validate
          </Button>
          <Button icon={<ArrowLeftRight size={14} />} onClick={handleToJson}>
            YAML → JSON
          </Button>
          <Button icon={<Copy size={14} />} onClick={handleCopy} disabled={!inputValue}>
            Copy
          </Button>
          <Button icon={<Trash2 size={14} />} onClick={handleClear}>
            Clear
          </Button>
          <Button
            icon={<FlaskConical size={14} />}
            onClick={() => { setInputValue(SAMPLE_YAML); setIsValid(null); setError(''); }}
          >
            Sample
          </Button>
          <Checkbox
            checked={stripComments}
            onChange={(e) => setStripComments(e.target.checked)}
          >
            Reformat (strips comments)
          </Checkbox>
          <Checkbox
            checked={resolveAliases}
            onChange={(e) => setResolveAliases(e.target.checked)}
          >
            Resolve aliases
          </Checkbox>
        </div>
      </div>

      <div className="yaml-panel-header">
        YAML
        {isValid === true && <Tag color="success" style={{ marginLeft: 10 }}>Valid YAML</Tag>}
        {isValid === false && <Tag color="error" style={{ marginLeft: 10 }}>Invalid YAML</Tag>}
      </div>

      {error && (
        <div className="yaml-error-bar">
          <pre>{error}</pre>
        </div>
      )}

      <div className="yaml-panel-body">
        <div className="yaml-editor-wrapper">
          <div className="yaml-line-numbers-wrapper" ref={inputLineNumRef}>
            <LineNumbers count={inputLineCount} />
          </div>
          <div className="yaml-input-highlight-container">
            <pre
              className="yaml-input-highlight-pre"
              ref={inputHighlightRef}
              aria-hidden="true"
              dangerouslySetInnerHTML={{ __html: inputHighlightedHtml + '\n' }}
            />
            <textarea
              ref={textareaRef}
              className="yaml-input-textarea"
              value={inputValue}
              onChange={(e) => { setInputValue(e.target.value); setIsValid(null); setError(''); }}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); handleValidate(); }
              }}
              onScroll={handleInputScroll}
              placeholder="Paste your YAML here... (⌘+Enter to validate)"
              spellCheck={false}
            />
          </div>
        </div>
      </div>

      <div className="sos-page-footer">Built by <strong>@Forest</strong></div>
    </div>
  );
};

export default YamlValidatorPage;
