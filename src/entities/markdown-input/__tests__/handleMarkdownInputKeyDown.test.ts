import handleMarkdownInputKeyDown from '../handlers/handleMarkdownInputKeyDown';

describe('handleMarkdownInputKeyDown', () => {
  it('calls handleSubmit on Enter', () => {
    const handleSubmit = jest.fn();
    const event = {
      key: 'Enter',
      preventDefault: jest.fn(),
      shiftKey: false,
      ctrlKey: false,
      metaKey: false,
    } as any;
    handleMarkdownInputKeyDown(event, {
      submitKey: 'Enter',
      submitOnCtrlEnter: false,
      handleSubmit,
      enableTabCharacter: false,
      tabSize: 2,
    });
    expect(handleSubmit).toHaveBeenCalled();
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('inserts tab when Tab is pressed and enableTabCharacter is true', () => {
    const handleSubmit = jest.fn();
    const event = {
      key: 'Tab',
      preventDefault: jest.fn(),
    } as any;
    // window.getSelection is not tested here (DOM)
    handleMarkdownInputKeyDown(event, {
      submitKey: 'Enter',
      submitOnCtrlEnter: false,
      handleSubmit,
      enableTabCharacter: true,
      tabSize: 2,
    });
    expect(event.preventDefault).toHaveBeenCalled();
  });
});
