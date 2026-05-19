import React, { useState } from 'react';
import { Key, Copy, Trash2, FlaskConical } from 'lucide-react';
import Button from '../../components/Button';
import Tag from '../../components/Tag';
import { toast } from '../../components/Toast';
import './JwtDecoderPage.css';

// A well-known public test JWT (jwt.io example token, signed with "secret")
const SAMPLE_JWT =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9' +
  '.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFsaWNlIiwiaWF0IjoxNzE2MTM0NDAwLCJleHAiOjE3NDc2NzA0MDB9' +
  '.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

const base64UrlDecode = (str: string): string => {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const pad = base64.length % 4;
  if (pad) base64 += '='.repeat(4 - pad);
  return decodeURIComponent(escape(atob(base64)));
};

const highlightJson = (json: string): string => {
  if (!json) return '';
  const escaped = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return escaped.replace(
    /("(\\u[a-fA-F0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
    (match) => {
      let cls = 'jwt-number';
      if (/^"/.test(match)) cls = /:$/.test(match) ? 'jwt-key' : 'jwt-string';
      else if (/true|false/.test(match)) cls = 'jwt-boolean';
      else if (/null/.test(match)) cls = 'jwt-null';
      return `<span class="${cls}">${match}</span>`;
    },
  );
};

const formatExpiry = (exp: number) => {
  const expiryDate = new Date(exp * 1000);
  const now = new Date();
  const isExpired = expiryDate < now;
  const diffMs = Math.abs(expiryDate.getTime() - now.getTime());
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  let relativeStr = '';
  if (diffDays > 0) relativeStr += `${diffDays}d `;
  if (diffHours > 0) relativeStr += `${diffHours}h `;
  relativeStr += `${diffMins}m`;
  return {
    isExpired,
    dateStr: expiryDate.toUTCString(),
    relativeStr: isExpired ? `${relativeStr} ago` : `in ${relativeStr}`,
  };
};

const JwtDecoderPage: React.FC = () => {
  const [input, setInput] = useState('');
  const [header, setHeader] = useState<Record<string, unknown> | null>(null);
  const [payload, setPayload] = useState<Record<string, unknown> | null>(null);
  const [signature, setSignature] = useState('');
  const [headerText, setHeaderText] = useState('');
  const [payloadText, setPayloadText] = useState('');
  const [error, setError] = useState('');

  const handleDecode = () => {
    setError(''); setHeader(null); setPayload(null); setSignature(''); setHeaderText(''); setPayloadText('');
    const token = input.trim();
    if (!token) return;
    const parts = token.split('.');
    if (parts.length !== 3) {
      setError('Invalid JWT: a token must have exactly 3 parts separated by dots (header.payload.signature).');
      return;
    }
    try {
      const headerJson = base64UrlDecode(parts[0]);
      const headerObj = JSON.parse(headerJson);
      setHeader(headerObj);
      setHeaderText(JSON.stringify(headerObj, null, 2));
    } catch {
      setError('Failed to decode the JWT header — it is not valid Base64 or JSON.');
      return;
    }
    try {
      const payloadJson = base64UrlDecode(parts[1]);
      const payloadObj = JSON.parse(payloadJson);
      setPayload(payloadObj);
      setPayloadText(JSON.stringify(payloadObj, null, 2));
    } catch {
      setError('Failed to decode the JWT payload — it is not valid Base64 or JSON.');
      return;
    }
    setSignature(parts[2]);
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => toast.success(`${label} copied to clipboard`));
  };

  const handleClear = () => {
    setInput(''); setHeader(null); setPayload(null); setSignature('');
    setHeaderText(''); setPayloadText(''); setError('');
  };

  const expiryInfo = (payload?.exp as number | undefined) ? formatExpiry(payload!.exp as number) : null;
  const issuedInfo = (payload?.iat as number | undefined)
    ? new Date((payload!.iat as number) * 1000).toUTCString()
    : null;

  return (
    <div className="jwt-container">
      <h2>JWT Decoder</h2>

      <div className="jwt-label">Encoded Token</div>
      <textarea
        className="jwt-input"
        placeholder="Paste your JWT token here... (⌘+Enter to decode)"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); handleDecode(); }
        }}
        spellCheck={false}
      />

      <div className="jwt-buttons">
        <Button type="primary" icon={<Key size={14} />} onClick={handleDecode}>Decode</Button>
        <Button icon={<Trash2 size={14} />} onClick={handleClear}>Clear</Button>
        <Button
          icon={<FlaskConical size={14} />}
          onClick={() => {
            setInput(SAMPLE_JWT);
            setError('');
          }}
        >
          Sample
        </Button>
      </div>

      {error && <div className="jwt-error">{error}</div>}

      {header && (
        <div className="jwt-sections">
          {expiryInfo && (
            <div className="jwt-expiry-bar">
              <Tag color={expiryInfo.isExpired ? 'red' : 'green'}>
                {expiryInfo.isExpired ? 'EXPIRED' : 'VALID'}
              </Tag>
              <span className="jwt-expiry-text">
                {expiryInfo.isExpired ? 'Expired' : 'Expires'}{' '}
                {expiryInfo.relativeStr} — {expiryInfo.dateStr}
              </span>
            </div>
          )}
          {issuedInfo && (
            <div className="jwt-issued-bar">
              <Tag color="blue">ISSUED</Tag>
              <span className="jwt-expiry-text">{issuedInfo}</span>
            </div>
          )}

          {[
            { title: 'Header', text: headerText },
            { title: 'Payload', text: payloadText },
          ].map(({ title, text }) => (
            <div key={title} className="jwt-section">
              <div className="jwt-section-header">
                <span className="jwt-section-title">{title}</span>
                <Button size="small" icon={<Copy size={12} />} onClick={() => handleCopy(text, title)}>
                  Copy
                </Button>
              </div>
              <pre className="jwt-section-body" dangerouslySetInnerHTML={{ __html: highlightJson(text) }} />
            </div>
          ))}

          <div className="jwt-section">
            <div className="jwt-section-header">
              <span className="jwt-section-title">Signature</span>
              <Button size="small" icon={<Copy size={12} />} onClick={() => handleCopy(signature, 'Signature')}>
                Copy
              </Button>
            </div>
            <pre className="jwt-section-body jwt-signature">{signature}</pre>
          </div>
        </div>
      )}

      <div className="sos-page-footer">Built by <strong>@Forest</strong></div>
    </div>
  );
};

export default JwtDecoderPage;
