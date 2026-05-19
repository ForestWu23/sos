import React, { useState, useCallback, useRef } from 'react';
import { ArrowLeftRight, Trash2, FlaskConical } from 'lucide-react';
import Button from '../../components/Button';
import './DiffCheckerPage.css';

const SAMPLE_ORIGINAL = `function greet(name) {
  console.log("Hello, " + name);
  return true;
}

const config = {
  host: "localhost",
  port: 3000,
  debug: false,
};`;

const SAMPLE_CHANGED = `function greet(name, greeting = "Hello") {
  console.log(greeting + ", " + name + "!");
  return name.length > 0;
}

const config = {
  host: "example.com",
  port: 8080,
  debug: true,
  timeout: 5000,
};`;

interface DiffOp {
  type: 'equal' | 'remove' | 'add';
  oldLine?: number;
  newLine?: number;
  value: string;
}

interface DiffRow {
  type: 'equal' | 'remove' | 'add' | 'modify';
  oldLine?: number;
  newLine?: number;
  value?: string;
  oldSegs?: Segment[];
  newSegs?: Segment[];
}

interface Segment {
  type: 'equal' | 'remove' | 'add';
  value: string;
}

const diffLines = (oldText: string, newText: string): DiffOp[] => {
  const oldLines = oldText.split('\n');
  const newLines = newText.split('\n');
  const m = oldLines.length;
  const n = newLines.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        oldLines[i - 1] === newLines[j - 1]
          ? dp[i - 1][j - 1] + 1
          : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }
  const ops: DiffOp[] = [];
  let i = m, j = n;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldLines[i - 1] === newLines[j - 1]) {
      ops.push({ type: 'equal', oldLine: i, newLine: j, value: oldLines[i - 1] });
      i--; j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      ops.push({ type: 'add', newLine: j, value: newLines[j - 1] });
      j--;
    } else {
      ops.push({ type: 'remove', oldLine: i, value: oldLines[i - 1] });
      i--;
    }
  }
  return ops.reverse();
};

const diffWords = (oldStr: string, newStr: string): { oldSegs: Segment[]; newSegs: Segment[] } => {
  const splitTokens = (s: string): string[] => {
    const tokens: string[] = [];
    let current = '';
    for (const ch of s) {
      if (/\s/.test(ch)) {
        if (current) { tokens.push(current); current = ''; }
        tokens.push(ch);
      } else {
        current += ch;
      }
    }
    if (current) tokens.push(current);
    return tokens;
  };
  const oldTokens = splitTokens(oldStr);
  const newTokens = splitTokens(newStr);
  const m = oldTokens.length;
  const n = newTokens.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let a = 1; a <= m; a++) {
    for (let b = 1; b <= n; b++) {
      dp[a][b] =
        oldTokens[a - 1] === newTokens[b - 1]
          ? dp[a - 1][b - 1] + 1
          : Math.max(dp[a - 1][b], dp[a][b - 1]);
    }
  }
  const oldStack: Segment[] = [];
  const newStack: Segment[] = [];
  let a = m, b = n;
  while (a > 0 || b > 0) {
    if (a > 0 && b > 0 && oldTokens[a - 1] === newTokens[b - 1]) {
      oldStack.push({ type: 'equal', value: oldTokens[a - 1] });
      newStack.push({ type: 'equal', value: newTokens[b - 1] });
      a--; b--;
    } else if (b > 0 && (a === 0 || dp[a][b - 1] >= dp[a - 1][b])) {
      newStack.push({ type: 'add', value: newTokens[b - 1] });
      b--;
    } else {
      oldStack.push({ type: 'remove', value: oldTokens[a - 1] });
      a--;
    }
  }
  return { oldSegs: oldStack.reverse(), newSegs: newStack.reverse() };
};

const buildDiffRows = (ops: DiffOp[]): DiffRow[] => {
  const rows: DiffRow[] = [];
  let i = 0;
  while (i < ops.length) {
    const op = ops[i];
    if (op.type === 'equal') {
      rows.push({ type: 'equal', oldLine: op.oldLine, newLine: op.newLine, value: op.value });
      i++;
    } else if (op.type === 'remove' && i + 1 < ops.length && ops[i + 1].type === 'add') {
      const rem = op;
      const add = ops[i + 1];
      const { oldSegs, newSegs } = diffWords(rem.value, add.value);
      rows.push({ type: 'modify', oldLine: rem.oldLine, newLine: add.newLine, oldSegs, newSegs });
      i += 2;
    } else if (op.type === 'remove') {
      rows.push({ type: 'remove', oldLine: op.oldLine, value: op.value });
      i++;
    } else {
      rows.push({ type: 'add', newLine: op.newLine, value: op.value });
      i++;
    }
  }
  return rows;
};

const DiffStats: React.FC<{ rows: DiffRow[] }> = ({ rows }) => {
  let added = 0, removed = 0, modified = 0;
  rows.forEach((r) => {
    if (r.type === 'add') added++;
    else if (r.type === 'remove') removed++;
    else if (r.type === 'modify') modified++;
  });
  return (
    <div className="diff-stats">
      {removed > 0 && <span className="diff-stat-removed">−{removed}</span>}
      {added > 0 && <span className="diff-stat-added">+{added}</span>}
      {modified > 0 && <span className="diff-stat-modified">~{modified}</span>}
    </div>
  );
};

const LeftLine: React.FC<{ row: DiffRow }> = ({ row }) => {
  if (row.type === 'equal') return (
    <div className="diff-line diff-equal">
      <span className="diff-linenum">{row.oldLine}</span>
      <span className="diff-marker"> </span>
      <span className="diff-text">{row.value}</span>
    </div>
  );
  if (row.type === 'remove') return (
    <div className="diff-line diff-removed">
      <span className="diff-linenum">{row.oldLine}</span>
      <span className="diff-marker">−</span>
      <span className="diff-text">{row.value}</span>
    </div>
  );
  if (row.type === 'modify') return (
    <div className="diff-line diff-removed">
      <span className="diff-linenum">{row.oldLine}</span>
      <span className="diff-marker">−</span>
      <span className="diff-text">
        {row.oldSegs?.map((seg, i) => (
          <span key={i} className={seg.type === 'remove' ? 'diff-word-removed' : ''}>{seg.value}</span>
        ))}
      </span>
    </div>
  );
  if (row.type === 'add') return (
    <div className="diff-line diff-empty">
      <span className="diff-linenum" />
      <span className="diff-marker" />
      <span className="diff-text" />
    </div>
  );
  return null;
};

const RightLine: React.FC<{ row: DiffRow }> = ({ row }) => {
  if (row.type === 'equal') return (
    <div className="diff-line diff-equal">
      <span className="diff-linenum">{row.newLine}</span>
      <span className="diff-marker"> </span>
      <span className="diff-text">{row.value}</span>
    </div>
  );
  if (row.type === 'add') return (
    <div className="diff-line diff-added">
      <span className="diff-linenum">{row.newLine}</span>
      <span className="diff-marker">+</span>
      <span className="diff-text">{row.value}</span>
    </div>
  );
  if (row.type === 'modify') return (
    <div className="diff-line diff-added">
      <span className="diff-linenum">{row.newLine}</span>
      <span className="diff-marker">+</span>
      <span className="diff-text">
        {row.newSegs?.map((seg, i) => (
          <span key={i} className={seg.type === 'add' ? 'diff-word-added' : ''}>{seg.value}</span>
        ))}
      </span>
    </div>
  );
  if (row.type === 'remove') return (
    <div className="diff-line diff-empty">
      <span className="diff-linenum" />
      <span className="diff-marker" />
      <span className="diff-text" />
    </div>
  );
  return null;
};

const DiffCheckerPage: React.FC = () => {
  const [originalText, setOriginalText] = useState('');
  const [changedText, setChangedText] = useState('');
  const [diffRows, setDiffRows] = useState<DiffRow[] | null>(null);
  const [originalCharCount, setOriginalCharCount] = useState(0);
  const [changedCharCount, setChangedCharCount] = useState(0);

  const handleFindDiff = useCallback(() => {
    const ops = diffLines(originalText, changedText);
    setDiffRows(buildDiffRows(ops));
  }, [originalText, changedText]);

  const handleClear = useCallback(() => {
    setOriginalText('');
    setChangedText('');
    setDiffRows(null);
    setOriginalCharCount(0);
    setChangedCharCount(0);
  }, []);

  const leftBodyRef = useRef<HTMLDivElement>(null);
  const rightBodyRef = useRef<HTMLDivElement>(null);
  const scrollingRef = useRef(false);

  const handleLeftScroll = useCallback(() => {
    if (scrollingRef.current) return;
    scrollingRef.current = true;
    if (leftBodyRef.current && rightBodyRef.current)
      rightBodyRef.current.scrollTop = leftBodyRef.current.scrollTop;
    requestAnimationFrame(() => { scrollingRef.current = false; });
  }, []);

  const handleRightScroll = useCallback(() => {
    if (scrollingRef.current) return;
    scrollingRef.current = true;
    if (leftBodyRef.current && rightBodyRef.current)
      leftBodyRef.current.scrollTop = rightBodyRef.current.scrollTop;
    requestAnimationFrame(() => { scrollingRef.current = false; });
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleFindDiff();
    }
  };

  return (
    <div className="diff-container">
      {!diffRows ? (
        <>
          <div className="diff-toolbar">
            <div style={{ display: 'flex', gap: 6 }}>
              <Button type="primary" icon={<ArrowLeftRight size={14} />} onClick={handleFindDiff}>
                Find Difference
              </Button>
              <Button icon={<Trash2 size={14} />} onClick={handleClear}>Clear</Button>
              <Button
                icon={<FlaskConical size={14} />}
                onClick={() => {
                  setOriginalText(SAMPLE_ORIGINAL);
                  setChangedText(SAMPLE_CHANGED);
                  setOriginalCharCount(SAMPLE_ORIGINAL.length);
                  setChangedCharCount(SAMPLE_CHANGED.length);
                }}
              >
                Sample
              </Button>
            </div>
            <span className="diff-hint">⌘+Enter to compare</span>
          </div>
          <div className="diff-input-panels">
            <div className="diff-input-panel">
              <div className="diff-panel-header">
                <span>Original Text</span>
                <span className="diff-char-counter-header">
                  Characters: {originalCharCount.toLocaleString()}
                  {originalCharCount > 0 && changedCharCount > 0 && (
                    <span
                      className="diff-char-diff"
                      style={{ color: originalCharCount > changedCharCount ? '#1a7f37' : '#cf222e' }}
                    >
                      {' '}({originalCharCount > changedCharCount ? '+' : ''}
                      {(originalCharCount - changedCharCount).toLocaleString()})
                    </span>
                  )}
                </span>
              </div>
              <textarea
                className="diff-textarea"
                value={originalText}
                onChange={(e) => { setOriginalText(e.target.value); setOriginalCharCount(e.target.value.length); }}
                onKeyDown={handleKeyDown}
                placeholder="Paste original text here..."
                spellCheck={false}
              />
            </div>
            <div className="diff-input-panel">
              <div className="diff-panel-header">
                <span>Changed Text</span>
                <span className="diff-char-counter-header">
                  Characters: {changedCharCount.toLocaleString()}
                  {originalCharCount > 0 && changedCharCount > 0 && (
                    <span
                      className="diff-char-diff"
                      style={{ color: changedCharCount > originalCharCount ? '#1a7f37' : '#cf222e' }}
                    >
                      {' '}({changedCharCount > originalCharCount ? '+' : ''}
                      {(changedCharCount - originalCharCount).toLocaleString()})
                    </span>
                  )}
                </span>
              </div>
              <textarea
                className="diff-textarea"
                value={changedText}
                onChange={(e) => { setChangedText(e.target.value); setChangedCharCount(e.target.value.length); }}
                onKeyDown={handleKeyDown}
                placeholder="Paste changed text here..."
                spellCheck={false}
              />
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="diff-toolbar">
            <div style={{ display: 'flex', gap: 6 }}>
              <Button onClick={() => setDiffRows(null)}>← Edit</Button>
              <Button type="primary" icon={<ArrowLeftRight size={14} />} onClick={handleFindDiff}>
                Re-compare
              </Button>
              <Button icon={<Trash2 size={14} />} onClick={handleClear}>Clear</Button>
            </div>
            <DiffStats rows={diffRows} />
          </div>
          <div className="diff-result-panels">
            <div className="diff-result-panel">
              <div className="diff-panel-header">Original</div>
              <div className="diff-result-body" ref={leftBodyRef} onScroll={handleLeftScroll}>
                {diffRows.map((row, i) => <LeftLine key={i} row={row} />)}
              </div>
            </div>
            <div className="diff-result-panel">
              <div className="diff-panel-header">Changed</div>
              <div className="diff-result-body" ref={rightBodyRef} onScroll={handleRightScroll}>
                {diffRows.map((row, i) => <RightLine key={i} row={row} />)}
              </div>
            </div>
          </div>
        </>
      )}
      <div className="sos-page-footer">Built by <strong>@Forest</strong></div>
    </div>
  );
};

export default DiffCheckerPage;
