/**
 * Drive Cleaner - IndexedDB Cache Engine
 * Provides persistent, zero-memory-leak browser storage for 50,000+ Drive files.
 * Tracks local file catalog and Change Token metadata.
 */

const DB_NAME = 'drive_cleaner_db'
const DB_VERSION = 1
const STORE_FILES = 'files'
const STORE_META = 'sync_meta'

let dbInstance = null

/**
 * Initializes and opens the IndexedDB database
 * @returns {Promise<IDBDatabase>}
 */
export function initDB() {
  if (dbInstance) return Promise.resolve(dbInstance)

  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this environment'))
      return
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = (event) => {
      const db = event.target.result

      // Store for Drive files
      if (!db.objectStoreNames.contains(STORE_FILES)) {
        const fileStore = db.createObjectStore(STORE_FILES, { keyPath: 'fileId' })
        fileStore.createIndex('fileName', 'fileName', { unique: false })
        fileStore.createIndex('modifiedDate', 'modifiedDate', { unique: false })
        fileStore.createIndex('fileSizeBytes', 'fileSizeBytes', { unique: false })
        fileStore.createIndex('mimeType', 'mimeType', { unique: false })
      }

      // Store for sync metadata (change tokens, timestamp, stats)
      if (!db.objectStoreNames.contains(STORE_META)) {
        db.createObjectStore(STORE_META, { keyPath: 'key' })
      }
    }

    request.onsuccess = (event) => {
      dbInstance = event.target.result
      resolve(dbInstance)
    }

    request.onerror = (event) => {
      console.error('IndexedDB open error:', event.target.error)
      reject(event.target.error)
    }
  })
}

/**
 * Bulk upserts file records into the files object store
 * @param {Array<Object>} files
 * @returns {Promise<number>} Number of files saved
 */
export async function putFiles(files) {
  if (!files || files.length === 0) return 0
  const db = await initDB()

  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_FILES], 'readwrite')
    const store = tx.objectStore(STORE_FILES)

    files.forEach((file) => {
      const normalized = {
        ...file,
        fileId: file.fileId || file.id,
        fileName: file.fileName || file.title || file.name || 'Untitled',
        fileSizeBytes: parseInt(file.fileSizeBytes || file.sizeBytes || file.size || 0, 10),
      }
      store.put(normalized)
    })

    tx.oncomplete = () => resolve(files.length)
    tx.onerror = (event) => reject(event.target.error)
  })
}

/**
 * Bulk deletes files by their fileId
 * @param {Array<string>} fileIds
 * @returns {Promise<number>} Number of files deleted
 */
export async function deleteFiles(fileIds) {
  if (!fileIds || fileIds.length === 0) return 0
  const db = await initDB()

  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_FILES], 'readwrite')
    const store = tx.objectStore(STORE_FILES)

    fileIds.forEach((id) => {
      store.delete(id)
    })

    tx.oncomplete = () => resolve(fileIds.length)
    tx.onerror = (event) => reject(event.target.error)
  })
}

/**
 * Retrieves all cached files
 * @returns {Promise<Array<Object>>}
 */
export async function getAllFiles() {
  const db = await initDB()

  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_FILES], 'readonly')
    const store = tx.objectStore(STORE_FILES)
    const request = store.getAll()

    request.onsuccess = () => resolve(request.result || [])
    request.onerror = (event) => reject(event.target.error)
  })
}

/**
 * Gets the total count of cached files
 * @returns {Promise<number>}
 */
export async function getFileCount() {
  const db = await initDB()

  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_FILES], 'readonly')
    const store = tx.objectStore(STORE_FILES)
    const request = store.count()

    request.onsuccess = () => resolve(request.result || 0)
    request.onerror = (event) => reject(event.target.error)
  })
}

/**
 * Saves a metadata key-value pair
 * @param {string} key
 * @param {any} value
 * @returns {Promise<void>}
 */
export async function saveSyncMeta(key, value) {
  const db = await initDB()

  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_META], 'readwrite')
    const store = tx.objectStore(STORE_META)
    store.put({ key, value, updatedAt: new Date().toISOString() })

    tx.oncomplete = () => resolve()
    tx.onerror = (event) => reject(event.target.error)
  })
}

/**
 * Retrieves a metadata value by key
 * @param {string} key
 * @returns {Promise<any>}
 */
export async function getSyncMeta(key) {
  const db = await initDB()

  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_META], 'readonly')
    const store = tx.objectStore(STORE_META)
    const request = store.get(key)

    request.onsuccess = () => {
      resolve(request.result ? request.result.value : null)
    }
    request.onerror = (event) => reject(event.target.error)
  })
}

/**
 * Purges all records from both stores
 * @returns {Promise<void>}
 */
export async function clearCache() {
  const db = await initDB()

  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_FILES, STORE_META], 'readwrite')
    tx.objectStore(STORE_FILES).clear()
    tx.objectStore(STORE_META).clear()

    tx.oncomplete = () => resolve()
    tx.onerror = (event) => reject(event.target.error)
  })
}
