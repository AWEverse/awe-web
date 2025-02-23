import React from "react";
import "./styles.scss";
import { AccordionGroup, AccordionItem } from "@/shared/ui/AccordionSwift";

const TestPage: React.FC = () => {
  return (
    <div className="p-12 overflow-auto h-screen">
      <AccordionGroup>
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
      </AccordionGroup>
    </div>
  );
};

export default TestPage;
