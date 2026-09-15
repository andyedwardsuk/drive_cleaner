import { useState, useEffect, useCallback } from 'react'
import {
  getSettings,
  saveSettings,
  updateSettingValue,
  resetSettings as resetSettingsStorage,
  exportAllAppData,
  clearAllLocalCaches,
  SETTINGS_UPDATED_EVENT,
  DEFAULT_SETTINGS,
} from '@/lib/settings/settingsStorage'

/**
 * Apply theme classes to document root element
 * @param {'dark'|'light'|'system'} theme
 */
function applyTheme(theme) {
  if (typeof document === 'undefined') return

  const root = document.documentElement
  let isDark = true

  if (theme === 'dark') {
    isDark = true
  } else if (theme === 'light') {
    isDark = false
  } else if (theme === 'system' && typeof window !== 'undefined') {
    isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  }

  if (isDark) {
    root.classList.add('dark')
    root.classList.remove('light')
  } else {
    root.classList.remove('dark')
    root.classList.add('light')
  }
}

/**
 * Hook providing reactive access to Drive Cleaner configuration and thresholds
 */
export function useSettings() {
  const [settings, setSettings] = useState(getSettings)

  // Listen for storage changes across tabs & window events
  useEffect(() => {
    const handleUpdate = (e) => {
      if (e.detail) {
        setSettings(e.detail)
      } else {
        setSettings(getSettings())
      }
    }

    window.addEventListener(SETTINGS_UPDATED_EVENT, handleUpdate)
    return () => {
      window.removeEventListener(SETTINGS_UPDATED_EVENT, handleUpdate)
    }
  }, [])

  // Apply visual theme whenever theme changes
  useEffect(() => {
    applyTheme(settings.appearance?.theme || 'dark')

    if (settings.appearance?.theme === 'system' && typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const listener = () => applyTheme('system')
      mediaQuery.addEventListener('change', listener)
      return () => mediaQuery.removeEventListener('change', listener)
    }
  }, [settings.appearance?.theme])

  const updateSetting = useCallback((section, key, value) => {
    const updated = updateSettingValue(section, key, value)
    setSettings(updated)
    return updated
  }, [])

  const updateSection = useCallback((section, partial) => {
    const current = getSettings()
    const updated = saveSettings({
      [section]: { ...current[section], ...partial },
    })
    setSettings(updated)
    return updated
  }, [])

  const resetToDefaults = useCallback(() => {
    const reset = resetSettingsStorage()
    setSettings(reset)
    return reset
  }, [])

  return {
    settings,
    thresholds: settings.thresholds,
    scanning: settings.scanning,
    appearance: settings.appearance,
    safety: settings.safety,
    notifications: settings.notifications,
    updateSetting,
    updateSection,
    resetToDefaults,
    exportAllAppData,
    clearAllLocalCaches,
    DEFAULT_SETTINGS,
  }
}
