import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { FolderSearch } from 'lucide-react'

/**
 * Drive Picker Component
 * Opens Google Drive Picker to select a folder
 */
export default function DrivePicker({ onFolderSelected, disabled }) {
  const [pickerApiLoaded, setPickerApiLoaded] = useState(false)
  const [oauthToken, setOauthToken] = useState(null)
  const [isAuthorizing, setIsAuthorizing] = useState(false)

  // Load Google Picker API
  useEffect(() => {
    // Check if we're in Google Apps Script environment
    const isGAS = typeof google !== 'undefined' && google.script && google.script.run

    if (isGAS) {
      // In GAS, we need to get the OAuth token from the server
      loadGASPicker()
    } else {
      // In development, load the picker API directly
      loadPickerApi()
    }
  }, [])

  const loadPickerApi = () => {
    // Load Google API client and picker libraries
    const script = document.createElement('script')
    script.src = 'https://apis.google.com/js/api.js'
    script.onload = () => {
      window.gapi.load('picker', () => {
        setPickerApiLoaded(true)
      })
    }
    document.body.appendChild(script)
  }

  const loadGASPicker = () => {
    // For Google Apps Script, we can use the picker without explicit OAuth
    // GAS handles authentication automatically
    loadPickerApi()
  }

  const getOAuthToken = () => {
    return new Promise((resolve, reject) => {
      const isGAS = typeof google !== 'undefined' && google.script && google.script.run

      if (isGAS) {
        // In GAS, get token from server
        google.script.run
          .withSuccessHandler((token) => {
            setOauthToken(token)
            resolve(token)
          })
          .withFailureHandler((error) => {
            console.error('Failed to get OAuth token:', error)
            reject(error)
          })
          .getOAuthToken()
      } else {
        // In development, we don't have a real token
        // You would need to implement OAuth flow for standalone deployment
        resolve(null)
      }
    })
  }

  const showPicker = async () => {
    if (!pickerApiLoaded) {
      alert('Picker API is not loaded yet. Please try again.')
      return
    }

    setIsAuthorizing(true)

    try {
      let token = oauthToken

      // Get OAuth token if we don't have one
      if (!token) {
        token = await getOAuthToken()
      }

      // Create and render the picker
      // My Drive folders view
      const myDriveView = new google.picker.DocsView(google.picker.ViewId.FOLDERS)
        .setIncludeFolders(true)
        .setMimeTypes('application/vnd.google-apps.folder')
        .setSelectFolderEnabled(true)
        .setLabel('My Drive')

      // Shared Drives view
      const sharedDrivesView = new google.picker.DocsView(google.picker.ViewId.FOLDERS)
        .setIncludeFolders(true)
        .setEnableDrives(true)
        .setSelectFolderEnabled(true)
        .setLabel('Shared Drives')

      // Recent folders view
      const recentView = new google.picker.DocsView(google.picker.ViewId.RECENTLY_PICKED)
        .setIncludeFolders(true)
        .setMimeTypes('application/vnd.google-apps.folder')
        .setSelectFolderEnabled(true)
        .setLabel('Recent')

      // Starred folders view
      const starredView = new google.picker.DocsView(google.picker.ViewId.FOLDERS)
        .setIncludeFolders(true)
        .setStarred(true)
        .setSelectFolderEnabled(true)
        .setLabel('Starred')

      let pickerOrigin = window.location.protocol + '//' + window.location.host
      if (typeof google !== 'undefined' && google.script && google.script.host && google.script.host.origin) {
        pickerOrigin = google.script.host.origin
      } else if (pickerOrigin.includes('googleusercontent.com')) {
        pickerOrigin = 'https://script.google.com'
      }

      if (!token && isGAS) {
        alert('Could not obtain an OAuth token. Please ensure Drive Cleaner is authorized in Google Apps Script.')
        setIsAuthorizing(false)
        return
      }

      const builder = new google.picker.PickerBuilder()
        .setTitle('Select a Google Drive Folder')
        .addView(myDriveView)
        .addView(sharedDrivesView)
        .addView(recentView)
        .addView(starredView)
        .setCallback(pickerCallback)
        .setOrigin(pickerOrigin)
        .enableFeature(google.picker.Feature.SUPPORT_DRIVES)
        .setMaxItems(1)

      if (token) {
        builder.setOAuthToken(token)
      }

      const picker = builder.build()
      picker.setVisible(true)
    } catch (error) {
      console.error('Error showing picker:', error)
      alert(`Failed to open Drive Picker: ${error.message || error}`)
    } finally {
      setIsAuthorizing(false)
    }
  }

  const pickerCallback = (data) => {
    if (data.action === google.picker.Action.PICKED) {
      const folder = data.docs[0]
      if (folder) {
        // Call the callback with folder ID
        onFolderSelected({
          id: folder.id,
          name: folder.name,
          url: folder.url
        })
      }
    } else if (data.action === google.picker.Action.CANCEL) {
      console.log('User cancelled picker')
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={showPicker}
      disabled={disabled || isAuthorizing || !pickerApiLoaded}
    >
      {isAuthorizing ? (
        'Loading...'
      ) : (
        <>
          <FolderSearch className="mr-2 h-4 w-4" />
          Browse
        </>
      )}
    </Button>
  )
}
