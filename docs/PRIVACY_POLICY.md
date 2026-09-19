# Privacy Policy for Drive Cleaner

**Effective Date**: September 18, 2026  
**Application Version**: 1.0.0  
**Application**: Drive Cleaner — Workspace Storage & Privacy Hub  

---

## 1. Introduction & Overview

Drive Cleaner ("the Application", "we", "our") is a Google Workspace add-on and web application designed to help individuals and enterprise administrators analyse storage utilization, detect duplicate and stale files, and organize Google Drive storage. This Privacy Policy governs the manner in which Drive Cleaner accesses, collects, uses, and protects information gathered during your authorized use of the application.

We take your privacy seriously. The application is architected from the ground up to minimize data access, process data strictly client-side within your authorized Google session, and never persist, monetize, or transmit your files or metadata to third-party servers.

---

## 2. Core Architectural Guarantees

* **Zero External Servers**: Drive Cleaner executes 100% within your authorized Google Workspace / Google Apps Script environment and your local browser session. There are no backend database servers, third-party cloud instances, or intermediate proxies operating outside of Google's secure infrastructure.
* **Metadata-Only Processing**: The application accesses file metadata (filenames, file sizes, creation/modification timestamps, MIME types, parent folder IDs, and MD5 checksums). We **never** read, parse, copy, index, or download the contents of your documents, spreadsheets, slides, photos, or media files.
* **Zero AI Model Training**: Neither Drive Cleaner nor any affiliated party uses Google user data or file metadata to develop, train, tune, or improve generalized machine learning or artificial intelligence models.
* **No Sale or Commercial Transfer of Data**: We do not sell, rent, lease, or monetize your personal data or Drive metadata to third parties, data brokers, advertising networks, or marketing partners.

---

## 3. Google OAuth Scopes & Data Usage

Drive Cleaner requests the following explicit OAuth 2.0 scopes during installation:

### A. `https://www.googleapis.com/auth/drive` (Restricted Scope)
* **Purpose**: Allows the application to scan file metadata across the user's Google Drive to identify duplicate files, obsolete files, large files, and empty folders, and to move user-selected unwanted items to Google Drive Trash upon explicit user command.
* **Technical Justification**: Non-restricted scopes such as `drive.file` only grant access to files created or opened by the application itself. Because Drive Cleaner's sole function is to clean pre-existing clutter across the user's storage, full Drive metadata access is technically necessary.
* **Safety Mechanism**: All file deletion operations default to Google Drive Trash ("Soft Delete"), allowing users a 30-day window to restore any files via native Google Drive before permanent deletion.

### B. `https://www.googleapis.com/auth/userinfo.email` (Non-Sensitive Scope)
* **Purpose**: Identifies the currently authenticated Google user. Used strictly within the client session to partition user preferences, record monthly cleanup quota counters in Google Apps Script `PropertiesService.getUserProperties()`, and verify license activation status.

---

## 4. Google API Services User Data Policy Compliance

Drive Cleaner's use and transfer of information received from Google APIs will adhere to the **[Google API Services User Data Policy](https://developers.google.com/terms/api-services-user-data-policy)**, including the **Limited Use** requirements.

Specifically:
1. **Limited Use**: We only use access to Google user data to provide and improve user-facing features that are prominent in the Drive Cleaner user interface.
2. **Limited Transfer**: We do not transfer Google user data to any external parties unless necessary to provide or improve these user-facing features, comply with applicable law, or as part of a merger/acquisition with prior notice.
3. **Prohibited Human Access**: No human beings at Drive Cleaner read or access your Google Drive data or metadata.

---

## 5. Data Storage & Retention

* **Ephemeral Client Memory**: File scan results and candidate lists exist strictly in volatile browser RAM (`window.sessionStorage` and React application state) and are purged immediately when the tab is closed or reloaded.
* **User Properties**: User preferences (such as selected color theme, default scan size threshold, and monthly cleanup counter) are saved in Google's secure per-user key-value store (`PropertiesService.getUserProperties()`), hosted directly on Google servers and accessible only by your Google account.
* **Data Erasure**: Users may reset all cached preferences and audit history at any time from **Settings > Data & Privacy > Reset Cache & Preferences**.

---

## 6. Security Standards

* All communications between the user's browser and Google Apps Script are encrypted in transit using Transport Layer Security (TLS 1.3).
* Authentication is handled exclusively by Google Identity Services using OAuth 2.0. Drive Cleaner never receives, stores, or processes user passwords.

---

## 7. Contact Us

If you have questions, feedback, or privacy inquiries regarding Drive Cleaner, please contact:
* **Support Email**: `andyedwardsuk@gmail.com`
* **Developer**: Andy Edwards (Antigravity Developer)
* **Website**: `https://github.com/andyedwardsuk/drive_cleaner`
