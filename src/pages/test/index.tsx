import React from "react";
import { ChatStateFlags, useChatState } from "../chat/store/ui.state";
import "./styles.scss";

const TestPage: React.FC = () => {
  const {
    isLeftPanelOpen,
    isSearchActive,
    isHeaderActive,
    isRightPanelOpen,
    toggleLeftPanel,
    toggleSearch,
    toggleHeader,
    toggleRightPanel,
    setMultiple,
    clear,
  } = useChatState();

  return (
    <div className="container">
      <div className="button-grid">
        <button
          className="btn"
          data-testid="toggle-left"
          onClick={toggleLeftPanel}
        >
          Left Panel: {isLeftPanelOpen ? "Open" : "Closed"}
        </button>
        <button
          className="btn"
          data-testid="toggle-search"
          onClick={toggleSearch}
        >
          Search: {isSearchActive ? "Active" : "Inactive"}
        </button>
        <button
          className="btn"
          data-testid="toggle-header"
          onClick={toggleHeader}
        >
          Header: {isHeaderActive ? "Active" : "Inactive"}
        </button>
        <button
          className="btn"
          data-testid="toggle-right"
          onClick={toggleRightPanel}
        >
          Right Panel: {isRightPanelOpen ? "Open" : "Closed"}
        </button>
        <button
          className="btn btn-success"
          data-testid="set-multiple"
          onClick={() =>
            setMultiple([
              ChatStateFlags.SEARCH_ACTIVE,
              ChatStateFlags.HEADER_ACTIVE,
            ])
          }
        >
          Set Multiple
        </button>
        <button className="btn btn-danger" data-testid="clear" onClick={clear}>
          Clear
        </button>
      </div>
    </div>
  );
};

export default TestPage;
