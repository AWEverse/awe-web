import { AnimatePresence, motion } from "motion/react";
import React, { useState, useRef, useEffect } from "react";

import "./styles.scss";
import { AccordionGroup, AccordionItem } from "@/shared/ui/AccordionSwift";

const TestPage: React.FC = () => {
  return (
    <div className="p-12">
      <AccordionGroup allowMultiple>
        <AccordionItem title="Item 1">
          <div>
            <p>Content 1</p>
            Lorem ipsum, dolor sit amet consectetur adipisicing elit. Iste
            distinctio autem adipisci voluptatum nulla perspiciatis illum
            similique, dolor doloremque quas esse! Rerum nulla eveniet sed qui
            earum accusantium? Fugit, corporis.
          </div>
        </AccordionItem>
        <AccordionItem title="Item 2">
          <div>
            <p>Content 2</p>
            Lorem ipsum, dolor sit amet consectetur adipisicing elit. Iste
            distinctio autem adipisci voluptatum nulla perspiciatis illum
            similique, dolor doloremque quas esse! Rerum nulla eveniet sed qui
            earum accusantium? Fugit, corporis.
          </div>
        </AccordionItem>
        <AccordionItem title="Item 3">
          <div>
            <p>Content 3</p>
            Lorem ipsum, dolor sit amet consectetur adipisicing elit. Iste
            distinctio autem adipisci voluptatum nulla perspiciatis illum
            similique, dolor doloremque quas esse! Rerum nulla eveniet sed qui
            earum accusantium? Fugit, corporis.
          </div>
        </AccordionItem>
        <AccordionItem title="Item 4">
          <div>
            <p>Content 4</p>
            Lorem ipsum, dolor sit amet consectetur adipisicing elit. Iste
            distinctio autem adipisci voluptatum nulla perspiciatis illum
            similique, dolor doloremque quas esse! Rerum nulla eveniet sed qui
            earum accusantium? Fugit, corporis.
          </div>
        </AccordionItem>
        <AccordionItem title="Item 5">
          <div>
            <p>Content 5</p>
            Lorem ipsum, dolor sit amet consectetur adipisicing elit. Iste
            distinctio autem adipisci voluptatum nulla perspiciatis illum
            similique, dolor doloremque quas esse! Rerum nulla eveniet sed qui
            earum accusantium? Fugit, corporis.
          </div>
        </AccordionItem>
        <AccordionItem title="Item 6">
          <div>
            <p>Content 6</p>
            Lorem ipsum, dolor sit amet consectetur adipisicing elit. Iste
            distinctio autem adipisci voluptatum nulla perspiciatis illum
            similique, dolor doloremque quas esse! Rerum nulla eveniet sed qui
            earum accusantium? Fugit, corporis.
          </div>
        </AccordionItem>
        <AccordionItem title="Item 7">
          <div>
            <p>Content 7</p>
            Lorem ipsum, dolor sit amet consectetur adipisicing elit. Iste
            distinctio autem adipisci voluptatum nulla perspiciatis illum
            similique, dolor doloremque quas esse! Rerum nulla eveniet sed qui
            earum accusantium? Fugit, corporis.
          </div>
        </AccordionItem>
      </AccordionGroup>
    </div>
  );
};

export default TestPage;
