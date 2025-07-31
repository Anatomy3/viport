'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Performance monitoring component
export function PerformanceMonitor() {
  const router = useRouter()

  useEffect(() => {
    // Web Vitals monitoring
    if (typeof window !== 'undefined' && 'performance' in window) {
      // Core Web Vitals
      import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
        getCLS(sendToAnalytics)
        getFID(sendToAnalytics)
        getFCP(sendToAnalytics)
        getLCP(sendToAnalytics)
        getTTFB(sendToAnalytics)
      })

      // Navigation timing
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming
            sendToAnalytics({
              name: 'navigation-timing',
              value: navEntry.loadEventEnd - navEntry.fetchStart,
              delta: navEntry.loadEventEnd - navEntry.fetchStart,
              entries: [navEntry],
            })
          }
        })
      })

      observer.observe({ entryTypes: ['navigation'] })

      return () => observer.disconnect()
    }
  }, [])

  useEffect(() => {
    // Monitor route changes
    const handleRouteChangeStart = (url: string) => {
      performance.mark('route-change-start')
    }

    const handleRouteChangeComplete = (url: string) => {
      performance.mark('route-change-end')
      performance.measure('route-change', 'route-change-start', 'route-change-end')
      
      const measure = performance.getEntriesByName('route-change')[0]
      if (measure) {
        sendToAnalytics({
          name: 'route-change',
          value: measure.duration,
          delta: measure.duration,
          entries: [measure],
        })
      }
    }

    router.events?.on('routeChangeStart', handleRouteChangeStart)
    router.events?.on('routeChangeComplete', handleRouteChangeComplete)

    return () => {
      router.events?.off('routeChangeStart', handleRouteChangeStart)
      router.events?.off('routeChangeComplete', handleRouteChangeComplete)
    }
  }, [router])

  return null
}

// Send performance data to analytics
function sendToAnalytics(metric: any) {
  // Development logging
  if (process.env.NODE_ENV === 'development') {
    console.group(`🚀 Performance Metric: ${metric.name}`)
    console.log(`Value: ${metric.value}ms`)
    console.log(`Delta: ${metric.delta}ms`)
    console.log('Entries:', metric.entries)
    console.groupEnd()
  }

  // Send to analytics service
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', metric.name, {
      event_category: 'Web Vitals',
      event_label: metric.id,
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      non_interaction: true,
    })
  }

  // Send to custom analytics endpoint
  if (process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT) {
    fetch(process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        metric: metric.name,
        value: metric.value,
        delta: metric.delta,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
      }),
    }).catch(console.error)
  }
}

// Resource timing monitor
export function ResourceTimingMonitor() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'resource') {
            const resourceEntry = entry as PerformanceResourceTiming
            
            // Monitor slow resources
            if (resourceEntry.duration > 1000) {
              console.warn(`Slow resource detected: ${resourceEntry.name} (${resourceEntry.duration}ms)`)
              
              sendToAnalytics({
                name: 'slow-resource',
                value: resourceEntry.duration,
                delta: resourceEntry.duration,
                entries: [resourceEntry],
              })
            }
          }
        })
      })

      observer.observe({ entryTypes: ['resource'] })

      return () => observer.disconnect()
    }
  }, [])

  return null
}

// Memory usage monitor
export function MemoryMonitor() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'memory' in performance) {
      const checkMemory = () => {
        const memory = (performance as any).memory
        const used = memory.usedJSHeapSize / 1048576 // Convert to MB
        const total = memory.totalJSHeapSize / 1048576
        const limit = memory.jsHeapSizeLimit / 1048576

        // Log high memory usage
        if (used > 50) { // More than 50MB
          console.warn(`High memory usage: ${used.toFixed(2)}MB / ${total.toFixed(2)}MB`)
          
          sendToAnalytics({
            name: 'memory-usage',
            value: used,
            delta: used,
            entries: [{ used, total, limit }],
          })
        }
      }

      const interval = setInterval(checkMemory, 30000) // Check every 30 seconds

      return () => clearInterval(interval)
    }
  }, [])

  return null
}

// Bundle size monitor
export function BundleSizeMonitor() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Monitor bundle size through resource timing
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          const resourceEntry = entry as PerformanceResourceTiming
          
          if (resourceEntry.name.includes('/_next/static/chunks/')) {
            const size = resourceEntry.transferSize || resourceEntry.encodedBodySize
            
            if (size > 500000) { // Chunks larger than 500KB
              console.warn(`Large bundle chunk: ${resourceEntry.name} (${(size / 1024).toFixed(2)}KB)`)
            }
          }
        })
      })

      observer.observe({ entryTypes: ['resource'] })

      return () => observer.disconnect()
    }
  }, [])

  return null
}

// Combined performance monitoring wrapper
export function PerformanceMonitorProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <PerformanceMonitor />
      <ResourceTimingMonitor />
      <MemoryMonitor />
      <BundleSizeMonitor />
    </>
  )
}