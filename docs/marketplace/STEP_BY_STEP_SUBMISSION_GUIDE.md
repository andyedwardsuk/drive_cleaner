# Google Workspace Marketplace Submission: Step-by-Step Guide

This guide walks you through submitting **Drive Cleaner** to the Google Workspace Marketplace and navigating the Google Cloud OAuth Verification process.

---

## Phase 1: Record & Upload the OAuth Consent Demo Video (2 Minutes)

Before submitting, Google requires an unlisted YouTube video showing the consent screen and the app in action.

1. **Open Google Chrome in an Incognito / Clean Window**.
2. Start your screen recorder (QuickTime, OBS, or Loom).
3. Follow the exact storyboard in [`docs/marketplace/OAUTH_VERIFICATION_MANIFESTO.md`](file:///Users/andyedwards/Developer/_active/drive_cleaner/docs/marketplace/OAUTH_VERIFICATION_MANIFESTO.md#4-oauth-consent-demo-video-recording-script):
   - **Address Bar Focus**: Show the browser address bar with the Google Cloud OAuth Client ID clearly visible.
   - **Consent Screen**: Show the permissions requested (`See, edit, create, and delete all of your Google Drive files`).
   - **Feature Walkthrough**:
     - Run a quick scan (Smart Scan or Quick Duplicate Scan).
     - Show the ROT / Duplicate analysis results.
     - Move test candidate files to Trash (show that they are placed in Google Drive Trash safely).
     - Open Settings > Data & Privacy > Reset Cache.
4. **Upload to YouTube as "Unlisted"**:
   - Title: `Drive Cleaner - Google OAuth Verification Demo`
   - Description: Include app name and contact email.
   - Copy the YouTube video URL for Phase 2.

---

## Phase 2: Google Cloud Console — OAuth Consent Screen

1. Open the [Google Cloud Console — OAuth Consent Screen](https://console.cloud.google.com/apis/credentials/consent).
2. Select your Google Cloud Project associated with Drive Cleaner.
3. **Step 1: OAuth Consent Screen Details**:
   - **App Name**: `Drive Cleaner - Workspace Storage & Privacy Hub`
   - **User Support Email**: Select your developer email (`andyedwardsuk@gmail.com`).
   - **App Logo**: Upload [`assets/marketplace/app_icon_128x128.png`](file:///Users/andyedwards/Developer/_active/drive_cleaner/assets/marketplace/app_icon_128x128.png).
   - **App Domain Endpoints**:
     - **Application Home Page**: `https://script.google.com/macros/s/AKfycbyMGwEbepgATR-CRv_jvyqHTNA302vqVKNtEQdGR4lL8cSBrsgtT4Cyy8RnhYnivTg3jg/exec`
     - **Application Privacy Policy Link**: `https://script.google.com/macros/s/AKfycbyMGwEbepgATR-CRv_jvyqHTNA302vqVKNtEQdGR4lL8cSBrsgtT4Cyy8RnhYnivTg3jg/exec#/privacy`
     - **Application Terms of Service Link**: `https://script.google.com/macros/s/AKfycbyMGwEbepgATR-CRv_jvyqHTNA302vqVKNtEQdGR4lL8cSBrsgtT4Cyy8RnhYnivTg3jg/exec#/terms`
   - **Authorized Domains**: Add `script.google.com` (and your custom domain or GitHub domain if configured).
   - **Developer Contact Information**: `andyedwardsuk@gmail.com`.
   - Click **Save and Continue**.

4. **Step 2: Scopes**:
   - Click **Add or Remove Scopes**.
   - Select:
     - `https://www.googleapis.com/auth/drive` (Restricted)
     - `https://www.googleapis.com/auth/userinfo.email` (Non-sensitive)
   - Click **Save and Continue**.

5. **Step 3: Verification Submission (Scope Justification)**:
   - Paste the justification from [`docs/marketplace/OAUTH_VERIFICATION_MANIFESTO.md`](file:///Users/andyedwards/Developer/_active/drive_cleaner/docs/marketplace/OAUTH_VERIFICATION_MANIFESTO.md#1-scope-by-scope-technical-justification):
     - Explain why `drive.file` is technically insufficient (the app cleans pre-existing clutter across the entire Drive, which requires `drive` scope).
   - Paste the **YouTube Unlisted Demo Video URL**.
   - Click **Submit for Verification**.

---

## Phase 3: Google Workspace Marketplace SDK Configuration

1. In the Google Cloud Console, navigate to **APIs & Services > Library**.
2. Search for **Google Workspace Marketplace SDK** and ensure it is **Enabled**.
3. In the left navigation, click **Google Workspace Marketplace SDK > Configuration**.

### 3.1 App Configuration
- **Application Visibility**: Public (available to all Google Workspace domains and personal Google accounts) or Unlisted (for staging/testing).
- **Installation Settings**:
  - Check **Individual Install** (allows individual users to install from the marketplace).
  - Check **Admin Install** (allows domain admins to install for their entire organization).
- **App Integration**:
  - Check **Web App**.
  - Set the Web App URL to the Multi-Tenant Deployment:
    `https://script.google.com/macros/s/AKfycbwndFB_mpxjP0opcf0liPJXm4E6qys_HK7tl6lg38Y9xWt1ar-8WGUc_b5iDyU7qc23lA/exec`
- **OAuth Scopes**:
  - `https://www.googleapis.com/auth/drive`
  - `https://www.googleapis.com/auth/userinfo.email`
- Click **Save**.

### 3.2 Store Listing Configuration
In the left navigation, click **Google Workspace Marketplace SDK > Store Listing**.

1. **Application Info**:
   - **Application Name**: `Drive Cleaner - Workspace Storage & Privacy Hub`
   - **Short Description**: `Clean Google Drive storage: find duplicates, purge ROT files, and save space.` (77 characters)
   - **Detailed Description**: Copy and paste the Markdown/HTML description from [`docs/marketplace/STORE_LISTING_METADATA.md`](file:///Users/andyedwards/Developer/_active/drive_cleaner/docs/marketplace/STORE_LISTING_METADATA.md#detailed-description).

2. **Graphic Assets (Upload from `assets/marketplace/`)**:
   - **Application Icon**: Upload [`app_icon_128x128.png`](file:///Users/andyedwards/Developer/_active/drive_cleaner/assets/marketplace/app_icon_128x128.png) (128x128).
   - **Card Banner**: Upload [`store_card_banner_440x280.png`](file:///Users/andyedwards/Developer/_active/drive_cleaner/assets/marketplace/store_card_banner_440x280.png) (440x280).
   - **Promo Graphic**: Upload [`promo_hero_920x680.png`](file:///Users/andyedwards/Developer/_active/drive_cleaner/assets/marketplace/promo_hero_920x680.png) (920x680).
   - **Screenshots (Upload all 3)**:
     1. [`screenshot_smart_scan_1280x800.png`](file:///Users/andyedwards/Developer/_active/drive_cleaner/assets/marketplace/screenshot_smart_scan_1280x800.png)
     2. [`screenshot_storage_analytics_1280x800.png`](file:///Users/andyedwards/Developer/_active/drive_cleaner/assets/marketplace/screenshot_storage_analytics_1280x800.png)
     3. [`screenshot_rot_clutter_1280x800.png`](file:///Users/andyedwards/Developer/_active/drive_cleaner/assets/marketplace/screenshot_rot_clutter_1280x800.png)

3. **Categorization & Pricing**:
   - **Category**: `Productivity`, `Admin Tools`, `Utilities`
   - **Pricing**: `Free with in-app purchases` (Freemium)

4. **Support & Legal URLs**:
   - **Terms of Service URL**: `https://script.google.com/macros/s/AKfycbyMGwEbepgATR-CRv_jvyqHTNA302vqVKNtEQdGR4lL8cSBrsgtT4Cyy8RnhYnivTg3jg/exec#/terms`
   - **Privacy Policy URL**: `https://script.google.com/macros/s/AKfycbyMGwEbepgATR-CRv_jvyqHTNA302vqVKNtEQdGR4lL8cSBrsgtT4Cyy8RnhYnivTg3jg/exec#/privacy`
   - **Support URL / Email**: `andyedwardsuk@gmail.com`

5. Click **Publish** / **Submit for Review**.

---

## Phase 4: Responding to Google Review & CASA Assessment

1. **Google Trust & Safety Email**: Within 24-72 hours, Google Trust & Safety will acknowledge the submission.
2. **CASA Assessment Invitation**: If prompted to complete the CASA Tier 2 questionnaire or initiate an automated scan:
   - Use the pre-filled responses in [`docs/marketplace/CASA_TIER2_ASSESSMENT.md`](file:///Users/andyedwards/Developer/_active/drive_cleaner/docs/marketplace/CASA_TIER2_ASSESSMENT.md).
   - Confirm that all code runs inside Google Apps Script with zero external data storage.
3. Once approved, the app status changes to **Published** on the Google Workspace Marketplace!
