/**
 * col-filter.js — Qranty shared "Cột hiển thị" component
 *
 * Wires up every `.col-filter-wrap` on the page: open/close the dropdown,
 * and hide/show table columns via checkboxes.
 *
 * Markup expected inside each `.col-filter-wrap`:
 *   <button class="btn-outline">...Cột hiển thị</button>
 *   <div class="col-filter-menu" data-table="yourTableId">
 *     <div class="col-filter-title">Hiển thị cột</div>
 *     <label class="col-filter-item"><input type="checkbox" checked data-col="1"> Tên cột</label>
 *     ...
 *   </div>
 *
 * The page itself only needs to provide the table-specific `#tableId.hide-cN`
 * CSS rules for its columns (column count differs per table, so that part
 * stays page-local) — everything else here is generic.
 */
(function () {
  function wireMenu(wrap) {
    var btn = wrap.querySelector('.btn-outline');
    var menu = wrap.querySelector('.col-filter-menu');
    if (!btn || !menu) return;

    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      document.querySelectorAll('.col-filter-menu').forEach(function (m) {
        if (m !== menu) m.classList.remove('open');
      });
      menu.classList.toggle('open');
    });

    menu.querySelectorAll('input[type="checkbox"]').forEach(function (cb) {
      cb.addEventListener('change', function () {
        var table = document.getElementById(menu.dataset.table);
        if (table) table.classList.toggle('hide-c' + cb.dataset.col, !cb.checked);
      });
    });
  }

  document.addEventListener('click', function (e) {
    document.querySelectorAll('.col-filter-wrap').forEach(function (wrap) {
      if (!wrap.contains(e.target)) {
        var m = wrap.querySelector('.col-filter-menu');
        if (m) m.classList.remove('open');
      }
    });
  });

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.col-filter-wrap').forEach(wireMenu);
  });
})();

/**
 * Global Pagination Helper for Qranty Tables
 * Handles rendering of pagination info (e.g. "Hiển thị 1-10...") and dynamic controls (Prev, numbers, Next).
 */
window.setupPagination = function (options) {
  var totalItems = options.totalItems;
  var currentPage = options.currentPage || 1;
  var pageSize = options.pageSize || 10;
  var infoEl = typeof options.infoElement === 'string' ? document.querySelector(options.infoElement) : options.infoElement;
  var ctrlEl = typeof options.controlsElement === 'string' ? document.querySelector(options.controlsElement) : options.controlsElement;
  var onPageChange = options.onPageChange;
  var itemName = options.itemName || 'mục';

  var totalPages = Math.ceil(totalItems / pageSize) || 1;
  if (currentPage > totalPages) currentPage = totalPages;
  if (currentPage < 1) currentPage = 1;

  // 1. Render info
  if (infoEl) {
    var start = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
    var end = Math.min(currentPage * pageSize, totalItems);
    infoEl.textContent = 'Hiển thị ' + start + '–' + end + ' trong tổng số ' + totalItems + ' ' + itemName;
  }

  // 2. Render controls
  if (ctrlEl) {
    if (totalItems === 0) {
      ctrlEl.innerHTML = '';
      return;
    }
    
    var html = '';

    // Prev button
    html += '<button class="kh-page-btn" ' + (currentPage === 1 ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : '') + ' data-page="' + (currentPage - 1) + '">';
    html += '<svg width="14" height="14" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M11 3 6 9l5 6"/></svg>';
    html += '</button>';

    // Page numbers
    var pages = [];
    if (totalPages <= 7) {
      for (var i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        pages = [1, 2, 3, 4, 5, '...', totalPages];
      } else if (currentPage >= totalPages - 3) {
        pages = [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
      } else {
        pages = [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
      }
    }

    pages.forEach(function (p) {
      if (p === '...') {
        html += '<button class="kh-page-btn" disabled style="cursor:default;border-color:transparent;background:transparent;color:var(--text-4);">...</button>';
      } else {
        html += '<button class="kh-page-btn ' + (p === currentPage ? 'active' : '') + '" data-page="' + p + '">' + p + '</button>';
      }
    });

    // Next button
    html += '<button class="kh-page-btn" ' + (currentPage === totalPages ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : '') + ' data-page="' + (currentPage + 1) + '">';
    html += '<svg width="14" height="14" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 3 12 9l-5 6"/></svg>';
    html += '</button>';

    ctrlEl.innerHTML = html;

    // Attach click handlers
    ctrlEl.querySelectorAll('button[data-page]').forEach(function (btn) {
      btn.onclick = function (e) {
        e.preventDefault();
        var page = parseInt(this.getAttribute('data-page'), 10);
        if (onPageChange) onPageChange(page);
      };
    });
  }
};
