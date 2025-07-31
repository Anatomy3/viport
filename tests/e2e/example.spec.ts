import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test('should load successfully', async ({ page }) => {
    await page.goto('/')
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle')
    
    // Check that the page title is correct
    await expect(page).toHaveTitle(/Viport/)
    
    // Check for main navigation
    await expect(page.locator('nav')).toBeVisible()
    
    // Take a screenshot for visual regression testing
    await page.screenshot({ path: 'test-results/homepage.png', fullPage: true })
  })

  test('should have working navigation', async ({ page }) => {
    await page.goto('/')
    
    // Test navigation links (customize based on your actual navigation)
    const navLinks = [
      { text: 'Home', url: '/' },
      { text: 'Posts', url: '/posts' },
      { text: 'Portfolios', url: '/portfolios' },
      { text: 'Products', url: '/products' },
    ]

    for (const link of navLinks) {
      await page.click(`text="${link.text}"`)
      await expect(page).toHaveURL(new RegExp(link.url))
      await page.goBack()
    }
  })

  test('should be responsive', async ({ page }) => {
    await page.goto('/')
    
    // Test different viewport sizes
    const viewports = [
      { width: 1920, height: 1080, name: 'desktop' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 375, height: 667, name: 'mobile' },
    ]

    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height })
      await page.waitForLoadState('networkidle')
      
      // Take screenshot for each viewport
      await page.screenshot({ 
        path: `test-results/homepage-${viewport.name}.png`,
        fullPage: true 
      })
      
      // Verify main content is visible
      await expect(page.locator('main, [role="main"]')).toBeVisible()
    }
  })
})

test.describe('Performance', () => {
  test('should load within acceptable time', async ({ page }) => {
    const startTime = Date.now()
    
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    const loadTime = Date.now() - startTime
    
    // Assert load time is under 3 seconds
    expect(loadTime).toBeLessThan(3000)
    
    console.log(`Page loaded in ${loadTime}ms`)
  })

  test('should have good Core Web Vitals', async ({ page }) => {
    await page.goto('/')
    
    // Measure Core Web Vitals
    const vitals = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const vitals: Record<string, number> = {}
          
          entries.forEach((entry) => {
            if (entry.name === 'LCP') {
              vitals.lcp = entry.startTime
            }
            if (entry.name === 'FID') {
              vitals.fid = (entry as any).processingStart - entry.startTime
            }
            if (entry.name === 'CLS') {
              vitals.cls = (entry as any).value
            }
          })
          
          resolve(vitals)
        }).observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] })
        
        // Fallback timeout
        setTimeout(() => resolve({}), 5000)
      })
    })
    
    console.log('Core Web Vitals:', vitals)
    
    // Assert acceptable thresholds (customize based on your requirements)
    if ((vitals as any).lcp) {
      expect((vitals as any).lcp).toBeLessThan(2500) // LCP < 2.5s
    }
    if ((vitals as any).fid) {
      expect((vitals as any).fid).toBeLessThan(100) // FID < 100ms
    }
    if ((vitals as any).cls) {
      expect((vitals as any).cls).toBeLessThan(0.1) // CLS < 0.1
    }
  })
})

test.describe('Accessibility', () => {
  test('should have no accessibility violations', async ({ page }) => {
    await page.goto('/')
    
    // Inject axe-core for accessibility testing
    await page.addScriptTag({ url: 'https://unpkg.com/axe-core@4.7.0/axe.min.js' })
    
    // Run axe accessibility tests
    const accessibilityResults = await page.evaluate(() => {
      return new Promise((resolve) => {
        (window as any).axe.run((err: any, results: any) => {
          if (err) throw err
          resolve(results)
        })
      })
    })
    
    const violations = (accessibilityResults as any).violations
    
    if (violations.length > 0) {
      console.log('Accessibility violations:', violations)
    }
    
    // Assert no critical accessibility violations
    const criticalViolations = violations.filter((v: any) => 
      v.impact === 'critical' || v.impact === 'serious'
    )
    
    expect(criticalViolations).toHaveLength(0)
  })

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/')
    
    // Test tab navigation
    await page.keyboard.press('Tab')
    await expect(page.locator(':focus')).toBeVisible()
    
    // Test navigation through multiple tab presses
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab')
      const focusedElement = page.locator(':focus')
      await expect(focusedElement).toBeVisible()
    }
    
    // Test Enter key on focused links
    const firstLink = page.locator('a').first()
    await firstLink.focus()
    
    // Note: Only test Enter if the link doesn't navigate away
    // await page.keyboard.press('Enter')
  })
})