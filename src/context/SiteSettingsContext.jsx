import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const SiteSettingsContext = createContext(null)

const defaultSettings = {
  is_maintenance_mode: false,
  maintenance_title: 'System Maintenance Underway',
  maintenance_message: 'We are currently upgrading the platform to serve you better. Public access is temporarily paused.',
  start_time: null,
  end_time: null,
}

export function SiteSettingsProvider({ children }) {
  const [settings, setSettings] = useState(defaultSettings)
  const [isLoading, setIsLoading] = useState(true)

  const fetchSettings = useCallback(async () => {
    try {
      if (supabase) {
        const { data, error } = await supabase
          .from('site_settings')
          .select('*')
          .limit(1)
          .maybeSingle()

        if (!error && data) {
          setSettings(data)
          return
        }
      }

      // Fallback to API if supabase direct query returns nothing or unavailable
      const res = await fetch('/api/site_settings', { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        if (data?.settings) {
          setSettings(data.settings)
        }
      }
    } catch {
      // Keep existing settings on error
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSettings()

    let channel = null
    if (supabase) {
      channel = supabase
        .channel('site-settings-realtime')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'site_settings' },
          (payload) => {
            if (payload?.new) {
              setSettings(payload.new)
            } else {
              fetchSettings()
            }
          }
        )
        .subscribe()
    }

    // Periodic check every 30 seconds
    const interval = setInterval(fetchSettings, 30000)

    return () => {
      if (channel && supabase) {
        supabase.removeChannel(channel)
      }
      clearInterval(interval)
    }
  }, [fetchSettings])

  const setSettingsLocally = (newSettings) => {
    setSettings((prev) => ({ ...prev, ...newSettings }))
  }

  const value = {
    settings,
    isMaintenanceMode: Boolean(settings?.is_maintenance_mode),
    isLoading,
    refreshSettings: fetchSettings,
    setSettingsLocally,
  }

  return <SiteSettingsContext.Provider value={value}>{children}</SiteSettingsContext.Provider>
}

export function useSiteSettings() {
  const context = useContext(SiteSettingsContext)
  if (!context) {
    throw new Error('useSiteSettings must be used within a SiteSettingsProvider')
  }
  return context
}
