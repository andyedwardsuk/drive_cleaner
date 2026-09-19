import { useState, useEffect, useCallback } from 'react'
import licenseService from '@/services/licenseService'

export function useLicense() {
  const [license, setLicense] = useState({
    tier: 'free',
    isPro: false,
    licenseKey: null,
    activatedAt: null,
    expiresAt: null,
    monthlyUsage: {
      month: '',
      cleaned: 0,
      limit: 100,
      remaining: 100,
      percent: 0,
    },
  })
  const [loading, setLoading] = useState(true)
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false)

  const fetchLicense = useCallback(async () => {
    try {
      setLoading(true)
      const state = await licenseService.getLicenseState()
      if (state) {
        setLicense(state)
      }
    } catch (err) {
      console.warn('Error fetching license:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLicense()

    const handleLicenseUpdated = () => fetchLicense()
    const handleFilesTrashed = () => fetchLicense()

    window.addEventListener('drive_cleaner_license_updated', handleLicenseUpdated)
    window.addEventListener('drive_cleaner_files_trashed', handleFilesTrashed)
    window.addEventListener('focus', handleLicenseUpdated)

    return () => {
      window.removeEventListener('drive_cleaner_license_updated', handleLicenseUpdated)
      window.removeEventListener('drive_cleaner_files_trashed', handleFilesTrashed)
      window.removeEventListener('focus', handleLicenseUpdated)
    }
  }, [fetchLicense])

  const activateKey = useCallback(async (key) => {
    try {
      const res = await licenseService.activateLicenseKey(key)
      if (res.success) {
        if (res.state) {
          setLicense(res.state)
        } else {
          await fetchLicense()
        }
        window.dispatchEvent(new CustomEvent('drive_cleaner_license_updated'))
        return { success: true, message: res.message }
      }
      return { success: false, error: res.error || 'Failed to activate key' }
    } catch (err) {
      return { success: false, error: err.message || 'Key activation error' }
    }
  }, [fetchLicense])

  const deactivateKey = useCallback(async () => {
    try {
      const res = await licenseService.deactivateLicenseKey()
      if (res.success) {
        if (res.state) {
          setLicense(res.state)
        } else {
          await fetchLicense()
        }
        window.dispatchEvent(new CustomEvent('drive_cleaner_license_updated'))
        return { success: true, message: res.message }
      }
      return { success: false, error: res.error || 'Failed to deactivate key' }
    } catch (err) {
      return { success: false, error: err.message || 'Key deactivation error' }
    }
  }, [fetchLicense])

  const checkQuota = useCallback(async (fileCount) => {
    return await licenseService.checkCleanupQuota(fileCount)
  }, [])

  const openUpgradeModal = useCallback(() => setUpgradeModalOpen(true), [])
  const closeUpgradeModal = useCallback(() => setUpgradeModalOpen(false), [])

  return {
    license,
    tier: license.tier,
    isPro: license.isPro,
    monthlyUsage: license.monthlyUsage,
    loading,
    upgradeModalOpen,
    openUpgradeModal,
    closeUpgradeModal,
    activateKey,
    deactivateKey,
    checkQuota,
    refetch: fetchLicense,
  }
}

export default useLicense
