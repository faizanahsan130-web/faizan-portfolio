# Faizan Ahsan — Premium 3D AI Developer Portfolio

This is the upgraded version of the supplied standalone HTML portfolio. It preserves the original profile content, portrait, five project concepts, services, and experience details while adding a premium responsive layout and optional Three.js hero effects.

## Project structure

```text
faizan-ahsan-3d-portfolio/
├── index.html
├── styles.css
├── app.js
├── config.js
├── netlify.toml
├── README.md
└── assets/
    ├── faizan-portrait.jpg
    └── faizan-ahsan-cv.pdf   (add your real CV here)
```

## Before publishing

1. Open `config.js`.
2. Replace `YOUR_EMAIL@example.com` with your public contact email.
3. Replace the LinkedIn and GitHub placeholder URLs with your actual profile URLs.
4. Replace `YOUR_NUMBER_WITH_COUNTRY_CODE` with your WhatsApp number in international format, digits only. For example, a Pakistan number starts with `92` and has no `+`, spaces, or leading local `0`.
5. Add your actual CV PDF as `assets/faizan-ahsan-cv.pdf`. The CV download button stays hidden until the file exists.
6. Do not add API keys, private tokens, passwords, or database credentials to `config.js`, `app.js`, or browser JavaScript.

## 3D and performance

The hero scene loads Three.js from jsDelivr when the device supports it. It is intentionally disabled on small screens, devices reporting four or fewer CPU cores, and when the visitor has enabled reduced motion. CSS visuals remain as a graceful fallback if WebGL or the CDN is unavailable.

Google Fonts and the Three.js CDN require an internet connection. The rest of the website is static.

## Contact form — Netlify Forms

The form is marked for Netlify Forms and submits to the site root. No API key or separate backend server is needed for the standard Netlify Forms workflow.

1. Deploy the site to Netlify using the instructions below.
2. In the Netlify site dashboard, open **Forms** and confirm form detection is enabled. If Netlify asks to enable form detection, enable it and redeploy.
3. Submit a test enquiry from the live website.
4. Check the Forms area in Netlify to confirm the submission arrived.
5. Configure notification emails in the Netlify form settings if you want submissions forwarded to your inbox.

The form does not send messages when opened directly from a local `file://` path. Test the real submission after deploying to Netlify.

## Test locally

You can open `index.html` directly for visual checks. For a more realistic local test, use a local static server, for example:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000`. The Netlify form will not send from localhost; that requires the deployed Netlify site.

## Free Netlify deployment

1. Extract the ZIP file to a folder on your computer.
2. Visit https://app.netlify.com/ and sign in or create a free account.
3. From the Netlify dashboard, choose **Add new site** → **Deploy manually** (wording may vary).
4. Drag the extracted `faizan-ahsan-3d-portfolio` folder into the deployment drop area. Upload the folder contents with `index.html` at the publish root.
5. Wait for Netlify to finish. It will provide a temporary `*.netlify.app` website address.
6. Open that address on desktop and mobile. Test navigation, theme switch, project filters, social links, and contact form.
7. If the contact form is not detected, enable form detection in Netlify and trigger a new deploy.

`netlify.toml` sets the publish directory to the project root and adds basic security headers.

## Connect a custom domain later

1. Purchase a domain from a registrar of your choice.
2. In Netlify, open **Domain management** → **Add a domain** (or **Add a domain you own**).
3. Enter the domain and follow Netlify's verification steps.
4. At your domain registrar, add the DNS records Netlify displays. Common setups use Netlify DNS or a CNAME for `www` plus the apex records Netlify specifies.
5. Wait for DNS propagation. Netlify can then provision HTTPS automatically.
6. Set your preferred primary domain in Netlify and test both the root domain and `www`.

Do not copy generic DNS values from a tutorial: use the exact records shown in your Netlify dashboard.

## Honest content notes

- The five showcased projects retain their concept/demo labels. They are not presented as verified client deployments.
- No client names, client testimonials, or unverified business results have been invented.
- The experience statement remains the 3 years supplied in the portfolio brief.
- Add only a real, current CV PDF before enabling the download.
