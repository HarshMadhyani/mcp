document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  // Mobile Sidebar Toggle
  const menuToggle = document.getElementById('menuToggle');
  const sidebarClose = document.getElementById('sidebarClose');
  const sidebar = document.getElementById('sidebar');
  const sidebarOverlay = document.getElementById('sidebarOverlay');

  if (menuToggle && sidebar && sidebarOverlay && sidebarClose) {
    function openSidebar() {
      sidebar.classList.add('open');
      sidebarOverlay.classList.add('active');
    }

    function closeSidebar() {
      sidebar.classList.remove('open');
      sidebarOverlay.classList.remove('active');
    }

    menuToggle.addEventListener('click', openSidebar);
    sidebarClose.addEventListener('click', closeSidebar);
    sidebarOverlay.addEventListener('click', closeSidebar);
  }

  // Auto-dismiss flash messages
  const flashAlerts = document.querySelectorAll('#flashAlert');
  flashAlerts.forEach(alert => {
    setTimeout(() => {
      alert.style.opacity = '0';
      alert.style.transition = 'opacity 0.3s ease';
      setTimeout(() => alert.remove(), 300);
    }, 5000);
  });
});
