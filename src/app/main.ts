import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

import '@/styles/global.scss';
import '@/styles/index.css';
import '@/styles/reboot.css';

const root = createRoot(document.getElementById('root')!);
root.render(createElement(App));
