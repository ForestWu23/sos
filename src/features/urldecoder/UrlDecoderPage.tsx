import React, { useState } from 'react';
import { Unlock, Lock, Copy, Trash2, ArrowLeftRight, FlaskConical } from 'lucide-react';
import Button from '../../components/Button';
import { toast } from '../../components/Toast';
import './UrlDecoderPage.css';

const SAMPLE_URL = 'https%3A%2F%2Fexample.com%2Fsearch%3Fq%3Dhello%20world%26lang%3Den%26page%3D1';

const UrlDecoderPage: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  const handleDecode = () => {
    setError('');
    if (!input.trim()) { setOutput(''); return; }
    try {
      setOutput(decodeURIComponent(input));
    } catch {
      setError('Failed to decode: the input contains malformed percent-encoded sequences.');
      setOutput('');
    }
  };

  const handleEncode = () => {
    setError('');
    if (!input.trim()) { setOutput(''); return; }
    try {
      setOutput(encodeURIComponent(input));
    } catch {
      setError('Failed to encode the input.');
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
    <div className="urldecoder-container">
      <h2>URL Encoder / Decoder</h2>

      <div className="urldecoder-label">Input</div>
      <textarea
        className="urldecoder-input"
        placeholder="Enter text to encode or decode..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        spellCheck={false}
      />

      <div className="urldecoder-buttons">
        <Button type="primary" icon={<Unlock size={14} />} onClick={handleDecode}>Decode</Button>
        <Button type="primary" icon={<Lock size={14} />} onClick={handleEncode}>Encode</Button>
        <Button icon={<ArrowLeftRight size={14} />} onClick={handleSwap} disabled={!output}>
          Use Output as Input
        </Button>
        <Button icon={<Copy size={14} />} onClick={handleCopy} disabled={!output}>Copy Output</Button>
        <Button icon={<Trash2 size={14} />} onClick={handleClear}>Clear</Button>
        <Button icon={<FlaskConical size={14} />} onClick={() => setInput(SAMPLE_URL)}>Sample</Button>
      </div>

      {error && <div className="urldecoder-error">{error}</div>}

      <div className="urldecoder-output-wrap">
        <div className="urldecoder-label">Output</div>
        <textarea
          className="urldecoder-output"
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

export default UrlDecoderPage;
