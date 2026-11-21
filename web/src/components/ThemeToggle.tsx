// ThemeToggle.tsx — the dark/light switch owns its own state: a click redraws this button only
import { useEffect } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage.ts'
import { STORAGE } from '../storage.ts'

export default function ThemeToggle() {
  const [dark, setDark] = useLocalStorage(STORAGE.dark, false)  // 'siraj-shop:dark'
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light'
  }, [dark])

  return <button onClick={() => setDark(!dark)}>{dark ? 'الوضع الفاتح' : 'الوضع الداكن'}</button>
}
