import React, { useEffect, useRef } from 'react'

const DEFAULT_TEST_SITE_KEY = '0x4AAAAAADwNsSvJ_osyapea'

export default function TurnstileWidget({
  siteKey = import.meta.env.VITE_CLOUDFLARE_TURNSTILE_SITE_KEY || DEFAULT_TEST_SITE_KEY,
  onVerify,
  onExpire,
  onError,
  theme = 'light',
  resetTrigger = 0
}) {
  const containerRef = useRef(null)
  const widgetIdRef = useRef(null)

  useEffect(() => {
    let isMounted = true

    const renderWidget = () => {
      if (!containerRef.current || !window.turnstile) return

      try {
        // Clear previous widget if existing
        if (widgetIdRef.current !== null) {
          window.turnstile.remove(widgetIdRef.current)
          widgetIdRef.current = null
        }

        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          theme: theme,
          callback: (token) => {
            if (isMounted && onVerify) onVerify(token)
          },
          'expired-callback': () => {
            if (isMounted && onExpire) onExpire()
          },
          'error-callback': (err) => {
            if (isMounted && onError) onError(err)
          }
        })
      } catch (err) {
        console.error('Failed to render Turnstile widget:', err)
      }
    }

    if (window.turnstile) {
      renderWidget()
    } else {
      // Check if script tag is already injected
      const scriptId = 'cloudflare-turnstile-script'
      let script = document.getElementById(scriptId)

      if (!script) {
        script = document.createElement('script')
        script.id = scriptId
        script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
        script.async = true
        script.defer = true
        document.body.appendChild(script)
      }

      const checkTurnstileInterval = setInterval(() => {
        if (window.turnstile) {
          clearInterval(checkTurnstileInterval)
          if (isMounted) renderWidget()
        }
      }, 100)

      return () => {
        clearInterval(checkTurnstileInterval)
        isMounted = false
        if (widgetIdRef.current !== null && window.turnstile) {
          window.turnstile.remove(widgetIdRef.current)
        }
      }
    }

    return () => {
      isMounted = false
      if (widgetIdRef.current !== null && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current)
      }
    }
  }, [siteKey, theme])

  // Handle reset trigger
  useEffect(() => {
    if (resetTrigger > 0 && widgetIdRef.current !== null && window.turnstile) {
      window.turnstile.reset(widgetIdRef.current)
      if (onExpire) onExpire()
    }
  }, [resetTrigger])

  return (
    <div className="d-flex justify-content-center my-3">
      <div ref={containerRef} />
    </div>
  )
}
