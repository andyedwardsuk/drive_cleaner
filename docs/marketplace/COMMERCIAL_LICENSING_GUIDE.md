# Drive Cleaner — Commercial Licensing & Vendor Integration Guide

This guide details how to monetize **Drive Cleaner**, generate and distribute cryptographically signed Pro license keys, and configure automated fulfillment with platforms like **Gumroad**, **Lemon Squeezy**, or **Stripe**.

---

## 1. Licensing Architecture & Key Format

Drive Cleaner uses a **zero-server cryptographic checksum algorithm** (derived from 32-bit FNV-1a polynomial hashing with master salt) to validate license authenticity entirely client-side/in-runtime.

### Key Format: `DC-PRO-XXXX-YYYY-ZZZZ`
* **`DC-PRO-`**: Product prefix identifying the license tier.
* **`XXXX-YYYY`**: 8-character alphanumeric payload (customer hash, timestamp, or random seed).
* **`ZZZZ`**: 4-character deterministic checksum mathematically bound to `XXXX-YYYY` and the secret salt.

### Security Guarantees:
1. **Zero External API Calls**: The app verifies keys locally in Google Apps Script runtime using `PropertiesService.getUserProperties()`. No phone-home network requests to external servers are needed.
2. **Tamper Resistant**: Changing even a single character in the payload invalidates the checksum (1 in 1,679,616 random guess resistance).
3. **Test / Reviewer Keys**: Built-in evaluation keys (`DC-PRO-TEST-2026`, `DC-PRO-EVAL-2026`) are pre-authorized for 30-day reviewer testing and demo recording.

---

## 2. Generating License Keys via CLI

The repository includes a command-line tool for issuing and verifying keys:

### Generate a Single Key for a Customer:
```bash
npm run license:gen -- --email customer@example.com
```
*Output:*
```text
=== Drive Cleaner Commercial License Generator ===
  Tier:        PRO
  Customer:    customer@example.com
  License Key: DC-PRO-1P6H-N9DC-MV7W
  Verification: PASS (Checksum: MV7W)
```

### Generate a Batch of Keys for Gumroad / Lemon Squeezy:
```bash
npm run license:gen -- --batch 200 --out gumroad_keys.csv
```
This generates a formatted CSV with columns `license_key,tier,created_at`, ready for 1-click import into Gumroad.

### Verify Key Authenticity:
```bash
npm run license:verify -- DC-PRO-1P6H-N9DC-MV7W
```

---

## 3. Selling on Gumroad (Recommended Setup)

Gumroad provides built-in license key management and automated customer delivery:

### Step 1: Create Product in Gumroad
1. Log into [Gumroad Dashboard](https://app.gumroad.com/).
2. Click **New Product** > **Digital Product**.
3. Name: `Drive Cleaner Pro - Unlimited Storage Optimization`.
4. Pricing: Recommended `$4.99/month` or `$29.00 lifetime`.

### Step 2: Enable License Keys
1. In product settings, scroll down to the **License Keys** section.
2. Toggle on **Generate a unique license key per sale** OR **Use my own license keys**.
3. Select **Use my own license keys** and click **Upload CSV**.
4. Upload `gumroad_keys.csv` generated via:
   ```bash
   npm run license:gen -- --batch 500 --out gumroad_keys.csv
   ```
5. Gumroad will automatically issue a unique key to each buyer upon checkout and display it on their receipt.

### Step 3: Customer Instructions on Receipt
In the Gumroad **Receipt / Delivery** text, add:
> **Thank you for purchasing Drive Cleaner Pro!**  
> 1. Open Drive Cleaner in your Google Drive or browser.  
> 2. Click **Settings** (gear icon) in the bottom-left of the sidebar.  
> 3. Navigate to **Plan & Licensing**.  
> 4. Paste your unique license key into the **Activate Pro License** input and click **Activate Pro**.  
> 5. All monthly cleanup limits and automated triggers will be instantly unlocked!

---

## 4. Automated Webhook Integration (doPost)

Drive Cleaner's Web App includes an automated `doPost(e)` endpoint capable of receiving real-time purchase webhooks from Gumroad or Stripe.

### Webhook URL:
```text
https://script.google.com/macros/s/AKfycbwndFB_mpxjP0opcf0liPJXm4E6qys_HK7tl6lg38Y9xWt1ar-8WGUc_b5iDyU7qc23lA/exec
```

### Inbound Webhook Payload:
When Gumroad fires a webhook ping upon purchase (`url_encoded_param` or `application/json`), the Web App automatically computes a signed key for the customer's email and returns:
```json
{
  "success": true,
  "licenseKey": "DC-PRO-94GR-ZOPT-O2TN",
  "customerEmail": "buyer@domain.com",
  "saleId": "gumroad_sale_12345",
  "tier": "pro",
  "timestamp": "2026-09-20T13:00:00.000Z",
  "message": "License key generated successfully. Enter this key into Drive Cleaner > Settings > Plan & Licensing."
}
```

---

## 5. Enterprise Domain Tokens

For enterprise Google Workspace domain deployments:
* Enterprise keys use the format `DC-ENT-[DOMAIN_HASH]-[CHECKSUM]`.
* Example: `DC-ENT-ACMECO-7K2M`
* Enter into **Settings > Plan & Licensing** to unlock unlimited cleanup across all domain accounts.
