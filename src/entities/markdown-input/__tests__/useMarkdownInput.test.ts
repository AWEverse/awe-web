import { renderHook, act } from '@testing-library/react-hooks';
import useMarkdownInput from '../hooks/useMarkdownInput';

describe('useMarkdownInput', () => {
  it('should update text and call onChange', () => {
    const onChange = jest.fn();
    const { result } = renderHook(() => useMarkdownInput({ onChange }));
    act(() => {
      result.current.handleTextChange('test');
    });
    expect(result.current.text).toBe('test');
    expect(onChange).toHaveBeenCalledWith('test');
  });

  it('should validate input and set error', () => {
    const validate = (v: string) => v.length > 3 || 'Too short';
    const { result } = renderHook(() => useMarkdownInput({ validate }));
    act(() => {
      result.current.handleTextChange('no');
    });
    expect(result.current.error).toBe('Too short');
    act(() => {
      result.current.handleTextChange('long enough');
    });
    expect(result.current.error).toBeNull();
  });

  it('should clear on submit if clearOnSubmit is true', () => {
    const onSubmit = jest.fn();
    const { result } = renderHook(() => useMarkdownInput({ clearOnSubmit: true, onSubmit }));
    act(() => {
      result.current.handleTextChange('abc');
      result.current.handleSubmit();
    });
    expect(result.current.text).toBe('');
    expect(onSubmit).toHaveBeenCalledWith('abc');
  });
});
