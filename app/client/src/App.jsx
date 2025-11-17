import { useState, useEffect } from 'react'
import FileTable from './components/FileTable'
import DrivePicker from './components/DrivePicker'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RefreshCw, FolderSearch } from 'lucide-react'

function App() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [folderId, setFolderId] = useState('')

  // Check if running in Google Apps Script environment
  const isGAS = typeof google !== 'undefined' && google.script && google.script.run

  // Load data from GAS
  const loadData = (folderIdToLoad, corpora = 'user') => {
    if (!isGAS) {
      // Mock data for development
      setData([
        {
          icon: '📂',
          fileName: 'Sample Folder',
          fileId: '1234567890abcdef',
          parentName: 'Root',
          parentId: 'root',
          mimeType: 'application/vnd.google-apps.folder'
        },
        {
          icon: '📃',
          fileName: 'Sample Document.docx',
          fileId: 'abcdef1234567890',
          parentName: 'Sample Folder',
          parentId: '1234567890abcdef',
          mimeType: 'application/vnd.google-apps.document'
        },
        {
          icon: '📃',
          fileName: 'Sample Spreadsheet.xlsx',
          fileId: 'xyz123abc456',
          parentName: 'Sample Folder',
          parentId: '1234567890abcdef',
          mimeType: 'application/vnd.google-apps.spreadsheet'
        }
      ])
      return
    }

    setLoading(true)
    setError(null)

    const payload = JSON.stringify({
      urlId: folderIdToLoad || 'root',
      corpora: corpora
    })

    google.script.run
      .withSuccessHandler((result) => {
        setLoading(false)
        if (result && result.data) {
          // Transform the data from GAS format to our component format
          const transformedData = result.data.map(item => ({
            icon: item[0],
            fileName: item[1],
            fileId: item[2],
            parentName: item[3],
            parentId: item[4],
            mimeType: item[5]
          }))
          setData(transformedData)
        } else {
          setData(result || [])
        }
      })
      .withFailureHandler((err) => {
        setLoading(false)
        setError(err.message || 'Failed to load data')
        console.error('Error loading data:', err)
      })
      .getFilesAndFoldersForWeb(payload)
  }

  // Load cached data on mount
  useEffect(() => {
    if (isGAS) {
      // Try to load the last used folder ID
      google.script.run
        .withSuccessHandler((cachedData) => {
          if (cachedData && cachedData.folderId) {
            setFolderId(cachedData.folderId)
            loadData(cachedData.folderId, cachedData.corpora)
          }
        })
        .withFailureHandler((err) => {
          console.error('Error loading cached data:', err)
        })
        .getCachedFolderId()
    } else {
      // Load mock data for development
      loadData()
    }
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    loadData(folderId)
  }

  const handleFolderSelected = (folder) => {
    setFolderId(folder.id)
    loadData(folder.id)
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Drive Cleaner</h1>
          <p className="text-muted-foreground">
            List and manage your Google Drive files and folders
          </p>
        </div>

        <div className="mb-6 p-4 border rounded-lg bg-card">
          <form onSubmit={handleSubmit} className="flex items-end gap-4">
            <div className="flex-1">
              <Label htmlFor="folderId">Folder ID or URL</Label>
              <div className="flex gap-2">
                <Input
                  id="folderId"
                  type="text"
                  placeholder="Enter folder ID, URL, or use Browse to select"
                  value={folderId}
                  onChange={(e) => setFolderId(e.target.value)}
                  disabled={loading}
                  className="flex-1"
                />
                <DrivePicker
                  onFolderSelected={handleFolderSelected}
                  disabled={loading}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Leave empty for My Drive root, or click Browse to select a folder
              </p>
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <FolderSearch className="mr-2 h-4 w-4" />
                  Load Folder
                </>
              )}
            </Button>
          </form>
        </div>

        {error && (
          <div className="mb-6 p-4 border border-destructive rounded-lg bg-destructive/10 text-destructive">
            <p className="font-semibold">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center p-12">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <FileTable data={data} />
        )}
      </div>
    </div>
  )
}

export default App
