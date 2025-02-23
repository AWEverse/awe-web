import React from "react";
import "./styles.scss";
import { AccordionGroup, AccordionItem } from "@/shared/ui/AccordionSwift";

const TestPage: React.FC = () => {
  return (
    <div className="p-12 overflow-auto">
      <AccordionGroup allowMultiple>
        <AccordionItem title="Accordion Item 1">
          <div>
            <p>
              <strong>Overview:</strong> This item provides a detailed overview
              of our product's features.
            </p>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur
              vel dolor eget urna consectetur tincidunt.
            </p>
            <ul>
              <li>Feature A: Excellent performance</li>
              <li>Feature B: User-friendly interface</li>
              <li>Feature C: Robust design</li>
            </ul>
            <p>
              Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
          </div>
        </AccordionItem>
        <AccordionItem title="Accordion Item 2">
          <div>
            <p>
              <strong>Details:</strong> Item 2 dives into technical details.
            </p>
            <p>
              Vivamus lacinia odio vitae vestibulum vestibulum. Cras venenatis
              euismod malesuada. Integer ac volutpat metus.
            </p>
            <ol>
              <li>Step 1: Initialization</li>
              <li>Step 2: Processing</li>
              <li>Step 3: Finalization</li>
            </ol>
            <p>
              Duis aute irure dolor in reprehenderit in voluptate velit esse
              cillum dolore eu fugiat nulla pariatur.
            </p>
          </div>
        </AccordionItem>
        <AccordionItem title="Accordion Item 3">
          <div>
            <p>
              <strong>Highlights:</strong>
            </p>
            <p>Here are some notable highlights:</p>
            <blockquote>
              "The journey of a thousand miles begins with a single step." – Lao
              Tzu
            </blockquote>
            <p>
              Praesent auctor purus luctus enim egestas, ac scelerisque ante
              pulvinar. Integer faucibus sapien vel nulla tempor, nec dapibus
              elit fermentum.
            </p>
          </div>
        </AccordionItem>
        <AccordionItem title="Accordion Item 4">
          <div>
            <p>
              <strong>Technical Specs:</strong>
            </p>
            <p>
              Item 4 is equipped with cutting-edge technology. Below is a
              summary of key specifications:
            </p>
            <table>
              <thead>
                <tr>
                  <th>Parameter</th>
                  <th>Specification</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Speed</td>
                  <td>High</td>
                </tr>
                <tr>
                  <td>Efficiency</td>
                  <td>Optimized</td>
                </tr>
                <tr>
                  <td>Scalability</td>
                  <td>Unlimited</td>
                </tr>
              </tbody>
            </table>
            <p>
              Nulla facilisi. Curabitur ac libero id libero sollicitudin
              bibendum.
            </p>
          </div>
        </AccordionItem>
        <AccordionItem title="Accordion Item 5">
          <div>
            <p>
              <strong>Usage Instructions:</strong>
            </p>
            <p>Follow these steps to get started:</p>
            <pre>
              {`npm install package-name
npm start`}
            </pre>
            <p>
              Once installed, refer to the documentation for further
              configuration.
            </p>
          </div>
        </AccordionItem>
        <AccordionItem title="Accordion Item 6">
          <div>
            <p>
              <strong>User Testimonials:</strong>
            </p>
            <p>"This product revolutionized my workflow!" – John Doe</p>
            <p>
              "Absolutely fantastic and incredibly easy to use." – Jane Smith
            </p>
            <p>"A game changer for our entire team." – Alex Johnson</p>
          </div>
        </AccordionItem>
        <AccordionItem title="Accordion Item 7">
          <div>
            <p>
              <strong>Final Thoughts:</strong>
            </p>
            <p>
              This section summarizes our detailed discussion and provides
              closing insights. Lorem ipsum dolor sit amet, consectetur
              adipiscing elit.
            </p>
            <p>
              Donec sit amet semper sapien. Vivamus hendrerit arcu sed erat
              molestie vehicula.
            </p>
          </div>
        </AccordionItem>
      </AccordionGroup>
    </div>
  );
};

export default TestPage;
