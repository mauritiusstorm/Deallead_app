import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { initNativeApp } from '@/lib/capacitor/native'

/** Mounted once inside the router so deep links can navigate via react-router. */
export function NativeBootstrap() {
  const navigate = useNavigate()

  useEffect(() => {
    void initNativeApp((path) => navigate(path))
  }, [navigate])

  return null
}
