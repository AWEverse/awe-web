import withAsync from '@/lib/core/public/decorators/withAsync';
import { pause } from '@/lib/core/public/schedulers';

jest.mock('@/lib/core/public/schedulers', () => ({
  pause: jest.fn(),
}));

describe('withAsync function', () => {
  it('should resolve if the async operation succeeds', async () => {
    // Мокаем успешный результат асинхронной операции
    jest.spyOn(global.Math, 'random').mockReturnValue(0.6); // Успех в performAsyncOperation

    const result = withAsync({ pending: 1000, retries: 3, retryDelay: 1000, timeout: 5000 });

    // Ожидаем успешного завершения без ошибок
    await expect(result).resolves.not.toThrow();

    // Проверяем, что pause не был вызван, так как операция завершилась успешно с первого раза
    expect(pause).not.toHaveBeenCalled();
  });

  it('should retry on failure and eventually succeed', async () => {
    const mockOperation = jest.fn();
    mockOperation.mockRejectedValueOnce(new Error('Failure')).mockResolvedValueOnce(undefined);

    const props = {
      pending: 1000,
      retries: 2,
      retryDelay: 500,
      timeout: 5000,
    };

    await withAsync(props);

    expect(mockOperation).toHaveBeenCalledTimes(2); // Operation should have been retried once
    expect(pause).toHaveBeenCalledTimes(1); // Pause should have been called for one retry
  });

  it('should throw an error if all retries fail', async () => {
    // Мокаем все попытки как неудачные
    jest.spyOn(global.Math, 'random').mockReturnValue(0.4); // Неудачи на всех попытках

    const result = withAsync({ pending: 1000, retries: 3, retryDelay: 1000, timeout: 5000 });

    // Ожидаем, что в конце операция завершится с ошибкой
    await expect(result).rejects.toThrow('Something went wrong');
  });

  it('should reject if the operation times out', async () => {
    // Мокаем успешную операцию, но с тайм-аутом
    jest.spyOn(global.Math, 'random').mockReturnValue(0.6); // Успех в performAsyncOperation

    const result = withAsync({ pending: 1000, retries: 3, retryDelay: 1000, timeout: 500 });

    // Ожидаем, что будет выброшена ошибка о тайм-ауте
    await expect(result).rejects.toThrow('Operation timed out');
  });
});
