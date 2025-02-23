import React from "react";
import "./styles.scss";
import { AccordionGroup, AccordionItem } from "@/shared/ui/AccordionSwift";

const TestPage: React.FC = () => {
  return (
    <div className="p-12 overflow-auto h-screen">
      <AccordionGroup allowMultiple>
        <AccordionItem title="Step 1: Project Setup">
          <div>
            <p>
              <strong>Initialize Vite Project</strong>
            </p>
            <pre>
              {`npm create vite@latest my-react-app -- --template react
cd my-react-app`}
            </pre>
            <p>Key actions:</p>
            <ul>
              <li>Choose React as framework</li>
              <li>Select variant (TypeScript recommended)</li>
              <li>Install initial dependencies</li>
            </ul>
          </div>
        </AccordionItem>

        <AccordionItem title="Step 2: Install Dependencies">
          <div>
            <p>
              <strong>Essential Packages</strong>
            </p>
            <pre>
              {`npm install @headlessui/react react-icons
npm install -D tailwindcss postcss autoprefixer`}
            </pre>
            <p>Packages included:</p>
            <ol>
              <li>Tailwind CSS for styling</li>
              <li>Headless UI for accessible components</li>
              <li>React Icons for iconography</li>
            </ol>
          </div>
        </AccordionItem>

        <AccordionItem title="Step 3: Configure Tailwind CSS">
          <div>
            <p>
              <strong>Configuration Files</strong>
            </p>
            <pre>{`npx tailwindcss init -p`}</pre>
            <p>
              Update <code>tailwind.config.js</code>:
            </p>
            <pre>
              {`module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: { extend: {} },
  plugins: [],
}`}
            </pre>
            <p>
              Add base styles to <code>index.css</code>:
            </p>
            <pre>
              {`@tailwind base;
@tailwind components;
@tailwind utilities;`}
            </pre>
          </div>
        </AccordionItem>

        <AccordionItem title="Step 4: Create Accordion Components">
          <div>
            <p>
              <strong>Component Structure</strong>
            </p>
            <p>
              Create <code>AccordionItem.tsx</code>:
            </p>
            <pre>
              {`import { useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

export const AccordionItem = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex justify-between w-full p-4"
      >
        {title}
        <ChevronDownIcon className={\`w-5 transition-transform \${isOpen ? 'rotate-180' : ''}\`} />
      </button>
      {isOpen && <div className="p-4 bg-gray-50">{children}</div>}
    </div>
  );
};`}
            </pre>
          </div>
        </AccordionItem>

        <AccordionItem title="Step 5: Implement Accordion Group">
          <div>
            <p>
              <strong>Main Component Integration</strong>
            </p>
            <p>
              Create <code>AccordionGroup.tsx</code>:
            </p>
            <pre>
              {`export const AccordionGroup = ({ children, allowMultiple = false }) => {
  const [openIndex, setOpenIndex] = useState(null);

  const handleItemClick = (index) => {
    setOpenIndex(prev => prev === index ? null : index);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {Children.map(children, (child, index) =>
        cloneElement(child, {
          isOpen: openIndex === index,
          onToggle: () => handleItemClick(index)
        })
      )}
    </div>
  );
};`}
            </pre>
          </div>
        </AccordionItem>

        <AccordionItem title="Step 6: Application Integration">
          <div>
            <p>
              <strong>Implement in Main App</strong>
            </p>
            <p>
              Update <code>App.tsx</code>:
            </p>
            <pre>
              {`import { AccordionGroup, AccordionItem } from './components/Accordion';

function App() {
  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <h1 className="mb-6 text-3xl font-bold">Project Guide</h1>
      <AccordionGroup>
        {/* Add your accordion items here */}
      </AccordionGroup>
    </div>
  );
}`}
            </pre>
          </div>
        </AccordionItem>

        <AccordionItem title="Step 7: Run and Test">
          <div>
            <p>
              <strong>Start Development Server</strong>
            </p>
            <pre>{`npm run dev`}</pre>
            <p>Key checks:</p>
            <ul>
              <li>Accordion items open/close smoothly</li>
              <li>Multiple open items (if allowed)</li>
              <li>Responsive behavior</li>
              <li>Accessibility features</li>
            </ul>
          </div>
        </AccordionItem>
      </AccordionGroup>
    </div>
  );
};

export default TestPage;
