# Plus Address

A Chromium extension that appends a `+tag` to your email address with one click so you always know who leaked or sold it.

## How it works

When you focus an email field, a small button appears inside it. Once you've typed a valid email, click the button and it automatically transforms:

```
you@gmail.com → you+sitename@gmail.com
```

No config. No account. No data sent anywhere. Purely local.

## Why

If `you+somesite@gmail.com` starts receiving spam from an unrelated sender, you know somesite leaked or sold your email. Block that address and move on.

## Demo

<img width="482" height="106" alt="recording" src="https://github.com/user-attachments/assets/0f3d964b-0e8e-44c8-b9d9-719d1f8ebd77" />

## Installation

### Chrome Web Store
> _Coming soon_

### Manual (Developer Mode)
1. Download or clone this repo
2. Go to `chrome://extensions`
3. Enable **Developer mode**
4. Click **Load unpacked** and select the repo folder

## Details

- Detects email fields by `type="email"`, name, id, placeholder, and autocomplete attributes
- Strips subdomains — `app.example.com` becomes `+example`
- Replaces existing plus tags instead of stacking them
- Works with React, Vue, and other SPAs via native input events
- Watches for dynamically rendered forms via MutationObserver

## License

MIT
