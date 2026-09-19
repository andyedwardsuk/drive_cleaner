# Google OAuth Verification & Scope Justification Manifesto
**Application Name**: Drive Cleaner - Workspace Storage & Privacy Hub  
**Application Version**: v1.0.0  
**Developer / Publisher**: Andy Edwards (`support@andyedwards.uk`)  
**Deployment Context**: Multi-Tenant Google Apps Script (`USER_ACCESSING`)  
**Hosting Architecture**: Google Cloud & Google Apps Script (Zero External Servers)  

---

## 1. Executive Summary & Review Context

Drive Cleaner is a workspace storage optimization, privacy governance, and digital clutter remediation utility built natively on Google Apps Script. It empowers Google Workspace and personal Google account users to audit storage consumption, identify redundant/obsolete/trivial (ROT) files, audit external file sharing permissions, and safely reclaim storage by moving unwanted items to Google Drive Trash.

This manifesto provides the technical, architectural, and security documentation required for **Google Cloud Trust & Safety OAuth App Verification** and **Cloud Application Security Assessment (CASA)**.

---

## 2. Scope-by-Scope Technical Justification

Drive Cleaner adheres strictly to the principle of least privilege. The requested scopes have been audited and minimized to the absolute minimum required for the application's core functionality:

```json
"oauthScopes": [
  "https://www.googleapis.com/auth/drive",
  "https://www.googleapis.com/auth/userinfo.email"
]
```

### A. Scope: `https://www.googleapis.com/auth/drive`
- **Classification**: Restricted Scope
- **Why this scope is essential**:
  Drive Cleaner's primary utility is enabling users to identify and clean files that **already exist in their Google Drive** (e.g., large stale ISO files, duplicate PDFs, temporary cache files, empty folders).
- **Why narrower scopes (`drive.file`, `drive.readonly`) are technically insufficient**:
  1. **`drive.file` is technically impossible for this use case**:
     The `drive.file` scope only grants access to files created or opened by *this specific application*. A storage cleaner cannot perform its function if it can only see files it created itself; it must be able to inspect and act upon the user's *existing* files.
  2. **`drive.readonly` cannot execute cleanup actions**:
     Drive Cleaner allows users to move clutter to the Google Drive Trash (`Drive.Files.trash(id)` / `file.setTrashed(true)`), restore files via the Safety Vault (`Drive.Files.untrash(id)`), organize unorganized files into designated folders, and apply Drive labels. A read-only scope cannot perform any of these user-directed write operations.
  3. **`drive.metadata.readonly` cannot trash or reorganize**:
     While scanning could theoretically read metadata, the app would then be unable to move items to Trash when the user clicks "Move to Trash".
- **Safety Guarantee**:
  - All cleanup operations move items to **Google Drive Trash** (`trashed: true`).
  - Items remain fully recoverable for 30 days under Google Drive's standard retention policy.
  - The application provides a 48-hour persistent **Safety Vault** for 1-click multi-session restoration.
  - Permanent purge requires explicit multi-step user confirmation with safety warnings.

---

### B. Scope: `https://www.googleapis.com/auth/userinfo.email`
- **Classification**: Non-sensitive / Basic Scope
- **Why this scope is essential**:
  1. Identifies the accessing user in multi-tenant mode (`USER_ACCESSING`).
  2. Tracks monthly Free tier cleanup allowances (100 files/month) stored in `PropertiesService.getUserProperties()`.
  3. Associates Pro license activations with the customer's Google identity.
- **Data Minimization**:
  The user's email is used solely within the user's private Google Apps Script property store and is never transmitted to external databases or ad networks.

---

## 3. Compliance with Google API Services User Data Policy ("Limited Use")

Drive Cleaner strictly complies with the [Google API Services User Data Policy](https://developers.google.com/terms/api-services-user-data-policy), including the Limited Use requirements:

1. **Metadata-Only Processing**:
   Drive Cleaner only inspects file metadata attributes:
   - File ID, name, file size in bytes, MIME type, modified date, MD5 checksum, and sharing permissions.
   - **Drive Cleaner NEVER reads, parses, downloads, copies, or transmits the internal contents of documents, spreadsheets, presentations, PDFs, images, or databases.**
2. **Zero External Data Transmission**:
   - The application runs 100% within Google Apps Script and the client browser (`window.google.script.run`).
   - There are zero external API servers, zero third-party databases, and zero analytics trackers with network egress (`UrlFetchApp` is not utilized or scoped).
3. **No AI Model Training**:
   - User data is never used to train, fine-tune, or validate machine learning or generalized AI models.
4. **No Advertising or Brokerage**:
   - User data is never transferred or sold to data brokers, ad networks, or third-party marketers.

---

## 4. YouTube OAuth Demo Video Walkthrough Script

Google Trust & Safety requires an unlisted YouTube video demonstrating the application, the OAuth consent flow, and each requested scope in action.

### Video Requirements Checklist
- [ ] Browser URL bar is clearly visible, showing the standard Google OAuth Client ID matching the Google Cloud Console project.
- [ ] Shows the OAuth consent screen with requested scopes (`See, edit, create, and delete all of your Google Drive files` and `See your primary Google Account email address`).
- [ ] Demonstrates the core user workflow.
- [ ] Video duration: 2 to 3 minutes.
- [ ] Audio narration or clear captions in English.

### Step-by-Step Script (2 Minutes 30 Seconds)

| Timestamp | Screen Display | Narration Script |
| :--- | :--- | :--- |
| **0:00 - 0:25** | Browser showing the Apps Script web app URL with OAuth Consent Screen. Zoom in on URL bar to clearly show `client_id=...apps.googleusercontent.com`. | "Hello Google Trust & Safety Review Team. This video demonstrates Drive Cleaner, a workspace storage management and clutter optimization tool. Here is the standard Google OAuth Consent Screen. You can see our Project Client ID in the URL bar above. We are requesting `https://www.googleapis.com/auth/drive` and `userinfo.email`." |
| **0:25 - 0:45** | Click 'Allow' to grant permissions. App loads into Dashboard. | "Upon authorization, Drive Cleaner opens the Spatial Workspace Dashboard. Notice the Live Google Drive API beacon in the header, confirming a secure, direct connection to the user's Google Drive. In the upper-right corner, the user's plan and monthly quota are displayed." |
| **0:45 - 1:15** | Navigate to 'Smart Scan' or 'Large Files' Hub. Run a scan. | "Here in Smart Scan, Drive Cleaner queries the Drive API to inspect file metadata — analyzing file sizes, modified dates, duplicate MD5 hashes, and sharing states. At no point are private document contents read or downloaded. All processing is strictly metadata-based." |
| **1:15 - 1:45** | Select 3 large files. Click 'Move to Trash'. Show Confirmation Modal. | "Now we demonstrate why the write scope `auth/drive` is required. The user selects obsolete files to clean up and clicks 'Move to Trash'. The confirmation modal highlights starred or shared files for safety and displays our chunked progress indicator. When the user confirms, Drive Cleaner moves the items to Google Drive Trash." |
| **1:45 - 2:10** | Show Undo Toast and the Safety Vault banner. Click '1-Click Undo'. | "Items are never permanently deleted upon cleanup; they are placed safely in Google Drive Trash where they remain recoverable for 30 days. Drive Cleaner also persists a Safety Vault snapshot in the user's private properties, providing a multi-session 1-click Undo banner across page reloads. We will click '1-Click Undo' to instantly restore the files back to their original locations." |
| **2:10 - 2:30** | Navigate to Settings > 'Plan & Licensing' and 'Data & Privacy'. | "In Settings, users can review their monthly cleanup quota, manage license activation, or wipe all local audit history. Finally, our dedicated Privacy Policy and Terms of Service are accessible directly from the sidebar. Thank you for reviewing Drive Cleaner." |

---

## 5. Cloud Application Security Assessment (CASA) Readiness

Drive Cleaner is engineered to meet Tier 2 CASA requirements:

1. **Authentication & Session Security**:
   - Relies exclusively on Google Account OAuth 2.0 sessions managed natively by Google Apps Script (`google.script.run`).
   - No custom session tokens or external cookies that could be hijacked.
2. **Data Protection in Transit & at Rest**:
   - All client-to-server communication occurs over enforced HTTPS on Google infrastructure (`script.google.com`).
   - User settings and Safety Vault batches reside in `PropertiesService.getUserProperties()`, isolated to each authenticated Google account.
3. **Cross-Site Scripting (XSS) Prevention**:
   - React 18 built-in DOM escaping.
   - Google Apps Script `HtmlService.XFrameOptionsMode.ALLOWALL` scoped to standard Workspace iframes.
   - Singlefile inlined bundle contains zero unvetted external scripts.
