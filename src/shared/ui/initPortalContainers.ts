export function initPortalContainers() {
  // Initialize tooltips container
  if (!document.getElementById('tooltips-root')) {
    const tooltipsContainer = document.createElement('div');
    tooltipsContainer.id = 'tooltips-root';
    document.body.appendChild(tooltipsContainer);
  }

  // Initialize modals container if it doesn't exist
  if (!document.getElementById('modals-root')) {
    const modalsContainer = document.createElement('div');
    modalsContainer.id = 'modals-root';
    document.body.appendChild(modalsContainer);
  }
}
