import React from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Clock,
  GitCompareArrows,
  Globe,
  Lock,
  Key,
  FileCode,
} from 'lucide-react';
import './HomePage.css';

const tools = [
  {
    key: 'jsonformatter',
    title: 'JsonFormatter',
    icon: <FileText size={22} color="#1677ff" />,
    path: '/jsonformatter',
    features: [
      'JSON formatting & beautification',
      'Minify JSON',
      'Syntax highlighting (dark theme)',
      'Line numbers',
      'Copy to clipboard',
    ],
  },
  {
    key: 'epochconverter',
    title: 'EpochConverter',
    icon: <Clock size={22} color="#1677ff" />,
    path: '/epochconverter',
    features: [
      'Convert epoch to human-readable date',
      'Side-by-side timestamp comparison',
      'Auto-detect seconds / ms / μs / ns',
      'GMT & PST with ISO 8601 formats',
      'Time difference calculation',
    ],
  },
  {
    key: 'diffchecker',
    title: 'DiffChecker',
    icon: <GitCompareArrows size={22} color="#1677ff" />,
    path: '/diffchecker',
    features: [
      'Side-by-side text comparison',
      'Line-level diff highlighting',
      'Word-level change detection',
      'Added / removed / modified markers',
      'Real-time character counter with comparison',
    ],
  },
  {
    key: 'urldecoder',
    title: 'UrlDecoder',
    icon: <Globe size={22} color="#1677ff" />,
    path: '/urldecoder',
    features: [
      'URL encode & decode',
      'Handles percent-encoded sequences',
      'Swap output back to input',
      'One-click copy to clipboard',
    ],
  },
  {
    key: 'base64',
    title: 'Base64',
    icon: <Lock size={22} color="#1677ff" />,
    path: '/base64',
    features: [
      'Base64 encode & decode',
      'Full Unicode support',
      'Swap output back to input',
      'One-click copy to clipboard',
    ],
  },
  {
    key: 'jwtdecoder',
    title: 'JwtDecoder',
    icon: <Key size={22} color="#1677ff" />,
    path: '/jwtdecoder',
    features: [
      'Decode JWT header & payload',
      'Syntax-highlighted JSON output',
      'Token expiration check',
      'Copy individual sections',
    ],
  },
  {
    key: 'yamlvalidator',
    title: 'YamlValidator',
    icon: <FileCode size={22} color="#1677ff" />,
    path: '/yamlvalidator',
    features: [
      'Validate YAML syntax',
      'Reformat with proper indentation',
      'Convert YAML to JSON',
      'Resolve aliases & strip comments',
    ],
  },
];

const HomePage: React.FC = () => (
  <div style={{ width: '100%', maxWidth: 1400, margin: '0 auto', padding: '80px 40px 40px', minWidth: 320 }}>
    <div className="sos-notice">
      <div className="sos-notice-tagline">
        <strong>SOS: Save Our Secrets!</strong> Don't expose sensitive data to third-party websites.
        SOS provides the same developer tools without data leak risk — everything runs locally in your browser.
      </div>
    </div>

    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 32,
      }}
    >
      {tools.map((tool) => (
        <Link key={tool.key} to={tool.path} className="homepage-card">
          <div className="homepage-card-header">
            {tool.icon}
            <span>{tool.title}</span>
          </div>
          <div className="homepage-card-body">
            <ul>
              {tool.features.map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
          </div>
        </Link>
      ))}
    </div>

    <div className="sos-page-footer">
      Built by <strong>@Forest</strong>
    </div>
  </div>
);

export default HomePage;
