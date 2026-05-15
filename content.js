(() => {
  const BUTTON_CLASS = 'plus-address-btn';
  const WRAPPER_CLASS = 'plus-address-wrapper';
  const processed = new WeakSet();

  // Extract root domain (no subdomain, no TLD complexity needed)
  function getRootDomain() {
    const hostname = window.location.hostname;
    const parts = hostname.replace(/^www\./, '').split('.');
    // Return just the second-to-last part (e.g. "example" from "app.example.com")
    if (parts.length >= 2) {
      return parts[parts.length - 2];
    }
    return parts[0];
  }

  // Validate email format
  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  }

  // Append or replace plus tag
  function applyPlusAddress(email, tag) {
    const atIndex = email.indexOf('@');
    if (atIndex === -1) return email;

    const local = email.slice(0, atIndex);
    const domain = email.slice(atIndex);

    // Strip existing plus tag if present
    const baseLocal = local.includes('+') ? local.slice(0, local.indexOf('+')) : local;

    return `${baseLocal}+${tag}${domain}`;
  }

  // Detect email-related inputs
  function isEmailField(input) {
    if (input.type === 'email') return true;
    const name = (input.name || '').toLowerCase();
    const id = (input.id || '').toLowerCase();
    const placeholder = (input.placeholder || '').toLowerCase();
    const autocomplete = (input.autocomplete || '').toLowerCase();

    return (
      autocomplete.includes('email') ||
      name.includes('email') ||
      id.includes('email') ||
      placeholder.includes('email')
    );
  }

  function createButton(input) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = BUTTON_CLASS;
    btn.setAttribute('aria-label', 'Append plus address');
    btn.setAttribute('tabindex', '-1');
    btn.title = `Add +${getRootDomain()} to your email`;

    // SVG icon: matches toolbar icon — blue rounded square, @ center, + badge top-right
    btn.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- Blue rounded square background -->
        <rect width="20" height="20" rx="4.5" fill="#4A6FFF"/>
        <!-- @ symbol in white -->
        <text x="3.5" y="14.5" font-family="Arial, sans-serif" font-weight="bold" font-size="11" fill="white">@</text>
        <!-- + badge: white circle top-right -->
        <circle cx="15" cy="5.5" r="3.5" fill="white"/>
        <line x1="15" y1="3.5" x2="15" y2="7.5" stroke="#4A6FFF" stroke-width="1.5" stroke-linecap="round"/>
        <line x1="13" y1="5.5" x2="17" y2="5.5" stroke="#4A6FFF" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
    `;

    btn.addEventListener('mousedown', (e) => {
      e.preventDefault(); // Don't steal focus from input
      const raw = input.value.trim();
      if (!isValidEmail(raw)) return;

      const tag = getRootDomain();
      const newValue = applyPlusAddress(raw, tag);

      // Set value and trigger React/framework change events
      const nativeInputSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
      if (nativeInputSetter) {
        nativeInputSetter.call(input, newValue);
      } else {
        input.value = newValue;
      }

      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));

      // Brief success flash
      btn.classList.add('plus-address-btn--success');
      setTimeout(() => btn.classList.remove('plus-address-btn--success'), 800);
    });

    return btn;
  }

  function wrapInput(input) {
    if (processed.has(input)) return;
    processed.add(input);

    // Don't wrap if already inside a wrapper (re-entrant guard)
    if (input.closest(`.${WRAPPER_CLASS}`)) return;

    const wrapper = document.createElement('div');
    wrapper.className = WRAPPER_CLASS;

    // Preserve inline styles/layout
    const computed = window.getComputedStyle(input);
    wrapper.style.display = computed.display === 'block' ? 'block' : 'inline-block';
    wrapper.style.position = 'relative';
    wrapper.style.width = computed.width;

    input.parentNode.insertBefore(wrapper, input);
    wrapper.appendChild(input);

    const btn = createButton(input);
    wrapper.appendChild(btn);

    function updateButtonState() {
      const valid = isValidEmail(input.value);
      btn.classList.toggle('plus-address-btn--active', valid);
      btn.disabled = !valid;
    }

    function showButton() {
      btn.classList.add('plus-address-btn--visible');
      updateButtonState();
    }

    function hideButton() {
      // Small delay so click on button registers before hiding
      setTimeout(() => {
        if (!input.matches(':focus')) {
          btn.classList.remove('plus-address-btn--visible');
        }
      }, 150);
    }

    input.addEventListener('focus', showButton);
    input.addEventListener('blur', hideButton);
    input.addEventListener('input', updateButtonState);

    // If field is already focused when we attach (rare but possible)
    if (document.activeElement === input) showButton();
  }

  function scanFields() {
    const inputs = document.querySelectorAll('input[type="email"], input[type="text"], input:not([type])');
    inputs.forEach(input => {
      if (isEmailField(input)) wrapInput(input);
    });
  }

  // Initial scan
  scanFields();

  // Watch for dynamically added fields (SPAs, modals, etc.)
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node.nodeType !== 1) continue;
        if (node.matches?.('input') && isEmailField(node)) {
          wrapInput(node);
        }
        node.querySelectorAll?.('input').forEach(input => {
          if (isEmailField(input)) wrapInput(input);
        });
      }
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
})();
