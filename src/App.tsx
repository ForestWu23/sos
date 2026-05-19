import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import { ToastProvider } from './components/Toast';
import HomePage from './features/home/HomePage';
import JsonFormatterPage from './features/jsonformatter/JsonFormatterPage';
import EpochConverterPage from './features/epochconverter/EpochConverterPage';
import DiffCheckerPage from './features/diffchecker/DiffCheckerPage';
import UrlDecoderPage from './features/urldecoder/UrlDecoderPage';
import Base64Page from './features/base64/Base64Page';
import JwtDecoderPage from './features/jwtdecoder/JwtDecoderPage';
import YamlValidatorPage from './features/yamlvalidator/YamlValidatorPage';

const App: React.FC = () => (
  <HashRouter>
    <ToastProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/jsonformatter" element={<JsonFormatterPage />} />
          <Route path="/epochconverter" element={<EpochConverterPage />} />
          <Route path="/diffchecker" element={<DiffCheckerPage />} />
          <Route path="/urldecoder" element={<UrlDecoderPage />} />
          <Route path="/base64" element={<Base64Page />} />
          <Route path="/jwtdecoder" element={<JwtDecoderPage />} />
          <Route path="/yamlvalidator" element={<YamlValidatorPage />} />
        </Routes>
      </Layout>
    </ToastProvider>
  </HashRouter>
);

export default App;
