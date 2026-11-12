/**
 * REDFLAME LPG AGENCY & DELIVERY — CONSUMER DASHBOARD SCRIPT
 * Manages Dashboard Tab Navigation, Live Refill Pricing, Booking Flow, Delivery Tracking & Invoices
 */

document.addEventListener('DOMContentLoaded', () => {
  // Check user session
  const storedUser = localStorage.getItem('redflame_user');
  if (storedUser) {
    try {
      const u = JSON.parse(storedUser);
      const userNameEls = document.querySelectorAll('.dynamic-user-name');
      userNameEls.forEach(el => el.textContent = u.name || 'Consumer');
    } catch (e) {}
  }

  // Dashboard Mobile/Tablet Sidebar Drawer (<= 1024px)
  const dashHamburgerBtn = document.querySelector('.dash-hamburger-btn');
  const dashSidebar = document.querySelector('#dashSidebarDrawer');
  const dashOverlay = document.querySelector('.dash-sidebar-overlay');
  const dashCloseBtn = document.querySelector('.dash-drawer-close');

  function openDashDrawer() {
    if (!dashSidebar || !dashOverlay || !dashHamburgerBtn) return;
    dashSidebar.classList.add('active');
    dashOverlay.classList.add('active');
    dashHamburgerBtn.classList.add('active');
    dashHamburgerBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeDashDrawer() {
    if (!dashSidebar || !dashOverlay || !dashHamburgerBtn) return;
    dashSidebar.classList.remove('active');
    dashOverlay.classList.remove('active');
    dashHamburgerBtn.classList.remove('active');
    dashHamburgerBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  if (dashHamburgerBtn && dashSidebar && dashOverlay) {
    dashHamburgerBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (dashSidebar.classList.contains('active')) {
        closeDashDrawer();
      } else {
        openDashDrawer();
      }
    });

    if (dashCloseBtn) {
      dashCloseBtn.addEventListener('click', (e) => {
        e.preventDefault();
        closeDashDrawer();
      });
    }

    dashOverlay.addEventListener('click', closeDashDrawer);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && dashSidebar.classList.contains('active')) {
        closeDashDrawer();
      }
    });

    window.matchMedia('(min-width: 1025px)').addEventListener('change', (mq) => {
      if (mq.matches) closeDashDrawer();
    });
  }

  // Dashboard Sidebar & Mobile Tab Switching
  const menuItems = document.querySelectorAll('.dash-menu-item, .dash-mobile-tab-btn');
  const panes = document.querySelectorAll('.dash-pane');

  menuItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const targetPaneId = item.getAttribute('data-pane');
      if (!targetPaneId) return;

      closeDashDrawer();

      // Handle Logout
      if (targetPaneId === 'logout') {
        localStorage.removeItem('redflame_user');
        showToast('You have been logged out securely.');
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 800);
        return;
      }

      // Update active states
      menuItems.forEach(i => {
        if (i.getAttribute('data-pane') === targetPaneId) {
          i.classList.add('active');
        } else {
          i.classList.remove('active');
        }
      });

      panes.forEach(pane => {
        if (pane.id === targetPaneId) {
          pane.classList.add('active');
        } else {
          pane.classList.remove('active');
        }
      });

      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

  // Live Price Calculation in "Book a Refill" Pane
  const dashService = document.querySelector('#dashBookService');
  const dashHours = document.querySelector('#dashBookHours');
  const dashEstPrice = document.querySelector('#dashEstPrice');
  const dashBookingForm = document.querySelector('#dashBookingForm');

  function calculateDashEstimate() {
    if (!dashEstPrice) return;
    const service = dashService ? dashService.value : 'domestic-14';
    const quantity = dashHours ? parseInt(dashHours.value, 10) || 1 : 1;
    let unitCost = 853;

    switch (service) {
      case 'domestic-14':
        unitCost = 853;
        break;
      case 'commercial-19':
        unitCost = 1780;
        break;
      case 'compact-5':
        unitCost = 340;
        break;
      case 'industrial-47':
        unitCost = 4450;
        break;
      case 'new-connection':
        unitCost = 2250;
        break;
      case 'safety-inspection':
        unitCost = 199;
        break;
      default:
        unitCost = 853;
    }
    const total = unitCost * quantity;
    dashEstPrice.textContent = '₹' + total.toLocaleString('en-IN');
  }

  if (dashService) dashService.addEventListener('change', calculateDashEstimate);
  if (dashHours) dashHours.addEventListener('input', calculateDashEstimate);
  calculateDashEstimate();

  // Booking Form Submission Inside Dashboard
  if (dashBookingForm) {
    dashBookingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const serviceText = dashService.options[dashService.selectedIndex].text;
      const pickup = document.querySelector('#dashBookPickup')?.value || 'Registered Domestic Address';
      const date = document.querySelector('#dashBookDate')?.value || new Date().toISOString().split('T')[0];
      const qty = dashHours ? dashHours.value : '1';
      const price = dashEstPrice.textContent;
      const newBookingId = 'LPG-' + Math.floor(1000 + Math.random() * 9000);

      // Add to bookings table
      const bookingsTable = document.querySelector('#myBookingsTableBody');
      if (bookingsTable) {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td><strong>#${newBookingId}</strong></td>
          <td>${date}</td>
          <td>${serviceText}</td>
          <td>Express Ward Hub (Agent: Ramesh K.)</td>
          <td><span class="status-pill status-confirmed">Dispatched</span></td>
          <td>${qty} Cylinder(s)</td>
          <td><strong>${price}</strong></td>
        `;
        bookingsTable.prepend(row);
      }

      // Increment stats
      const totalBookingsStat = document.querySelector('#totalBookingsCount');
      if (totalBookingsStat) {
        const cur = parseInt(totalBookingsStat.textContent, 10) || 14;
        totalBookingsStat.textContent = cur + 1;
      }

      showToast(`🎉 Refill Order #${newBookingId} placed! Cylinder dispatched with calibrated weight certificate.`, 'success');
      dashBookingForm.reset();
      calculateDashEstimate();

      // Switch to My Bookings tab
      setTimeout(() => {
        const bookingsMenuBtn = document.querySelector('[data-pane="my-bookings"]');
        if (bookingsMenuBtn) bookingsMenuBtn.click();
      }, 1200);
    });
  }
});

