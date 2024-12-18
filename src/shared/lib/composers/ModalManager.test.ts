import { registerModal, unregisterModal, bringModalToFront, unregisterAllModals, closeTopModal, getModals } from './ModalManager';

interface ModalRef {
  onClose: jest.Mock;
  setIsVisible: jest.Mock;
}

// Helper function to create a mock modal
const createMockModal = (): ModalRef => ({
  onClose: jest.fn(),
  setIsVisible: jest.fn(),
});

describe('Modal Manager', () => {
  beforeEach(() => {
    unregisterAllModals(); // Reset modals before each test
  });

  it('should register a modal', () => {
    const mockModal = createMockModal();
    registerModal('modal1', mockModal);

    // Simulate bringing the modal to the front
    expect(getModals()).toHaveLength(1);
    expect(getModals()[0][0]).toBe('modal1');
    expect(getModals()[0][1]).toBe(mockModal);
  });

  it('should unregister a modal', () => {
    const mockModal = createMockModal();
    registerModal('modal1', mockModal);
    unregisterModal('modal1');

    expect(getModals()).toHaveLength(0);
  });

  it('should bring a modal to the front', () => {
    const modal1 = createMockModal();
    const modal2 = createMockModal();
    registerModal('modal1', modal1);
    registerModal('modal2', modal2);

    bringModalToFront('modal1');

    expect(getModals()[1][0]).toBe('modal1'); // modal1 should now be on top
    expect(getModals()[0][0]).toBe('modal2'); // modal2 should now be second
  });

  it('should unregister all modals', () => {
    const modal1 = createMockModal();
    const modal2 = createMockModal();
    registerModal('modal1', modal1);
    registerModal('modal2', modal2);

    unregisterAllModals();

    expect(getModals()).toHaveLength(0);
  });

  it('should close the top modal', () => {
    const modal1 = createMockModal();
    const modal2 = createMockModal();
    registerModal('modal1', modal1);
    registerModal('modal2', modal2);

    closeTopModal();

    expect(modal2.onClose).toHaveBeenCalled(); // Top modal should be closed
    expect(getModals()).toHaveLength(1); // One modal should remain
    expect(getModals()[0][0]).toBe('modal1'); // modal1 should be left
  });
});
