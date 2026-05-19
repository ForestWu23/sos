import React, { useState, useRef, useCallback, useMemo } from 'react';
import { Paintbrush, Copy, Trash2, Minimize2, FlaskConical } from 'lucide-react';
import Button from '../../components/Button';
import { toast } from '../../components/Toast';
import './JsonFormatterPage.css';

const SAMPLE_JSON = `{
  "user": {
    "id": 42,
    "name": "Alice",
    "email": "alice@example.com",
    "roles": ["admin", "editor"],
    "active": true,
    "address": {
      "city": "San Francisco",
      "zip": "94105"
    }
  },
  "meta": {
    "version": "1.0",
    "generated": 1716134400,
    "tags": ["sample", "demo"]
  }
}`;

const stripComments = (text: string): string => {
  let result = '';
  let inString = false;
  let escape = false;
  let i = 0;
  while (i < text.length) {
    const ch = text[i];
    if (escape) { result += ch; escape = false; i++; continue; }
    if (inString) {
      result += ch;
      if (ch === '\\') escape = true;
      else if (ch === '"') inString = false;
      i++;
      continue;
    }
    if (ch === '"') { inString = true; result += ch; i++; continue; }
    if (ch === '/' && text[i + 1] === '/') {
      while (i < text.length && text[i] !== '\n') i++;
      continue;
    }
    result += ch;
    i++;
  }
  return result;
};

const highlightJson = (json: string, theme: 'light' | 'dark' = 'dark'): string => {
  if (!json) return '';
  const escaped = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const prefix = theme === 'light' ? 'json-light-' : 'json-';
  const highlighted = escaped.replace(
    /("(\\u[a-fA-F0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
    (match) => {
      let cls = `${prefix}number`;
      if (/^"/.test(match)) cls = /:$/.test(match) ? `${prefix}key` : `${prefix}string`;
      else if (/true|false/.test(match)) cls = `${prefix}boolean`;
      else if (/null/.test(match)) cls = `${prefix}null`;
      return `<span class="${cls}">${match}</span>`;
    },
  );
  return highlighted.replace(
    /(\/\/.*)/g,
    (match) => `<span class="${prefix}comment">${match}</span>`,
  );
};

const LineNumbers: React.FC<{ count: number }> = ({ count }) => (
  <div className="line-numbers" aria-hidden="true">
    {Array.from({ length: count }, (_, i) => (
      <div key={i + 1} className="line-number">{i + 1}</div>
    ))}
  </div>
);

const JsonFormatterPage: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [formattedHtml, setFormattedHtml] = useState('');
  const [formattedText, setFormattedText] = useState('');
  const [error, setError] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const inputHighlightRef = useRef<HTMLPreElement>(null);
  const inputLineNumRef = useRef<HTMLDivElement>(null);
  const outputBodyRef = useRef<HTMLPreElement>(null);
  const outputLineNumRef = useRef<HTMLDivElement>(null);

  const inputLineCount = useMemo(() => Math.max(inputValue.split('\n').length, 1), [inputValue]);
  const inputHighlightedHtml = useMemo(() => highlightJson(inputValue, 'light'), [inputValue]);
  const outputLineCount = useMemo(
    () => (formattedText ? formattedText.split('\n').length : 0),
    [formattedText],
  );

  const handleBeautify = useCallback(() => {
    if (!inputValue.trim()) { setError(''); setFormattedHtml(''); setFormattedText(''); return; }
    try {
      const cleaned = stripComments(inputValue);
      const parsed = JSON.parse(cleaned);
      const pretty = JSON.stringify(parsed, null, 2);
      setFormattedText(pretty);
      setFormattedHtml(highlightJson(pretty));
      setError('');
    } catch (e) {
      setError((e as Error).message);
      setFormattedHtml('');
      setFormattedText('');
    }
  }, [inputValue]);

  const handleMinify = useCallback(() => {
    if (!inputValue.trim()) return;
    try {
      const cleaned = stripComments(inputValue);
      const parsed = JSON.parse(cleaned);
      const minified = JSON.stringify(parsed);
      setFormattedText(minified);
      setFormattedHtml(highlightJson(minified));
      setError('');
    } catch (e) {
      setError((e as Error).message);
    }
  }, [inputValue]);

  const handleCopy = useCallback(async () => {
    if (!formattedText) return;
    try {
      await navigator.clipboard.writeText(formattedText);
      toast.success('Copied to clipboard');
    } catch {
      const ta = document.createElement('textarea');
      ta.value = formattedText;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      toast.success('Copied to clipboard');
    }
  }, [formattedText]);

  const handleClear = useCallback(() => {
    setInputValue('');
    setFormattedHtml('');
    setFormattedText('');
    setError('');
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

  const handleOutputScroll = (e: React.UIEvent<HTMLPreElement>) => {
    if (outputLineNumRef.current) outputLineNumRef.current.scrollTop = e.currentTarget.scrollTop;
  };

  return (
    <div className="json-formatter-container">
      <div className="json-formatter-toolbar">
        <div className="json-formatter-toolbar-left">
          <Button type="primary" icon={<Paintbrush size={14} />} onClick={handleBeautify}>
            Beautify
          </Button>
          <Button icon={<Minimize2 size={14} />} onClick={handleMinify}>
            Minify
          </Button>
          <Button icon={<Trash2 size={14} />} onClick={handleClear}>
            Clear
          </Button>
          <Button icon={<FlaskConical size={14} />} onClick={() => setInputValue(SAMPLE_JSON)}>
            Sample
          </Button>
        </div>
        <div className="json-formatter-toolbar-right">
          <Button icon={<Copy size={14} />} onClick={handleCopy} disabled={!formattedText}>
            Copy
          </Button>
        </div>
      </div>

      <div className="json-formatter-panels">
        <div className="json-formatter-panel-col">
          <div className="panel-header">Input</div>
          <div className="panel-body">
            <div className="editor-wrapper">
              <div className="line-numbers-wrapper" ref={inputLineNumRef}>
                <LineNumbers count={inputLineCount} />
              </div>
              <div className="input-highlight-container">
                <pre
                  className="input-highlight-pre"
                  ref={inputHighlightRef}
                  aria-hidden="true"
                  dangerouslySetInnerHTML={{ __html: inputHighlightedHtml + '\n' }}
                />
                <textarea
                  ref={textareaRef}
                  className="json-input-textarea"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                      e.preventDefault();
                      handleBeautify();
                    }
                  }}
                  onScroll={handleInputScroll}
                  placeholder="Paste your JSON here... (⌘+Enter to beautify)"
                  spellCheck={false}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="json-formatter-panel-col">
          <div className="panel-header">
            Output
            {error && <span className="panel-error">Invalid JSON</span>}
          </div>
          <div className="panel-body">
            {error ? (
              <div className="json-error-message"><pre>{error}</pre></div>
            ) : formattedHtml ? (
              <div className="editor-wrapper output-wrapper">
                <div className="line-numbers-wrapper output-line-numbers" ref={outputLineNumRef}>
                  <LineNumbers count={outputLineCount} />
                </div>
                <pre
                  className="json-output-pre"
                  ref={outputBodyRef}
                  onScroll={handleOutputScroll}
                  dangerouslySetInnerHTML={{ __html: formattedHtml }}
                />
              </div>
            ) : (
              <div className="json-output-placeholder">Beautified JSON will appear here</div>
            )}
          </div>
        </div>
      </div>

      <div className="sos-page-footer">Built by <strong>@Forest</strong></div>
    </div>
  );
};

export default JsonFormatterPage;
