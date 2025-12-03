import { useEffect, useRef } from 'react'

export const useOnMount = (callback: () => void) => {
  const isMounted = useRef(false)

  useEffect(() => {
    if (!isMounted.current) {
      callback()
      isMounted.current = true
    }
  }, [])
}
