import React, { useState } from 'react';
import { Lock, Unlock, Copy, Trash2, ArrowLeftRight, FlaskConical } from 'lucide-react';
import Button from '../../components/Button';
import { toast } from '../../components/Toast';
import './Base64Page.css';

const SAMPLE_TEXT = 'The quick brown fox jumps over the lazy dog 🦊';

const Base64Page: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  const handleEncode = () => {
    setError('');
    if (!input.trim()) { setOutput(''); return; }
    try {
      setOutput(btoa(unescape(encodeURIComponent(input))));
    } catch {
      setError('Failed to encode the input.');
      setOutput('');
    }
  };

  const handleDecode = () => {
    setError('');
    if (!input.trim()) { setOutput(''); return; }
    try {
      setOutput(decodeURIComponent(escape(atob(input))));
    } catch {
      setError('Failed to decode: the input is not valid Base64.');
      setOutput('');
    }
  };

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output).then(() => toast.success('Copied to clipboard'));
  };

  const handleClear = () => { setInput(''); setOutput(''); setError(''); };

  const handleSwap = () => { setInput(output); setOutput(''); setError(''); };

  return (
    <div className="base64-container">
      <h2>Base64 Encoder / Decoder</h2>

      <div className="base64-label">Input</div>
      <textarea
        className="base64-input"
        placeholder="Enter text to encode or Base64 string to decode..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        spellCheck={false}
      />

      <div className="base64-buttons">
        <Button type="primary" icon={<Lock size={14} />} onClick={handleEncode}>Encode</Button>
        <Button type="primary" icon={<Unlock size={14} />} onClick={handleDecode}>Decode</Button>
        <Button icon={<ArrowLeftRight size={14} />} onClick={handleSwap} disabled={!output}>
          Use Output as Input
        </Button>
        <Button icon={<Copy size={14} />} onClick={handleCopy} disabled={!output}>Copy Output</Button>
        <Button icon={<Trash2 size={14} />} onClick={handleClear}>Clear</Button>
        <Button icon={<FlaskConical size={14} />} onClick={() => setInput(SAMPLE_TEXT)}>Sample</Button>
      </div>

      {error && <div className="base64-error">{error}</div>}

      <div className="base64-output-wrap">
        <div className="base64-label">Output</div>
        <textarea
          className="base64-output"
          value={output}
          readOnly
          placeholder="Result will appear here..."
          spellCheck={false}
        />
      </div>

      <div className="sos-page-footer">Built by <strong>@Forest</strong></div>
    </div>
  );
};

export default Base64Page;
