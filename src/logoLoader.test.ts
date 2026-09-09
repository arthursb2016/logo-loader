import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import './logoLoader'
import type LogoLoader from './logoLoader'

describe('LogoLoader', () => {
  let element: LogoLoader

  beforeEach(() => {
    element = document.createElement('logo-loader') as LogoLoader
  })

  afterEach(() => {
    if (element.isConnected) element.remove()
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  describe('constructor / shadow DOM structure', () => {
    it('attaches an open shadow root with the expected internal elements', () => {
      expect(element.shadowRoot).not.toBeNull()
      expect(element.shadowRoot!.mode).toBe('open')
      expect(element.shadowRoot!.querySelector('.logo-loader-container')).not.toBeNull()
      expect(element.shadowRoot!.querySelector('.logo-loader-logo-display')).not.toBeNull()
      expect(element.shadowRoot!.querySelector('slot')).not.toBeNull()
      expect(element.shadowRoot!.querySelector('.logo-loader-img')).not.toBeNull()
      expect(element.shadowRoot!.querySelector('.logo-loader-animator')).not.toBeNull()
      expect(element.shadowRoot!.querySelector('style')).not.toBeNull()
    })
  })

  describe('getWidth / getHeight', () => {
    it('returns "auto" when width/height attributes are not set', () => {
      expect(element.getWidth()).toBe('auto')
      expect(element.getHeight()).toBe('auto')
    })

    it('returns the attribute value when set', () => {
      element.setAttribute('width', '120px')
      element.setAttribute('height', '80px')
      expect(element.getWidth()).toBe('120px')
      expect(element.getHeight()).toBe('80px')
    })
  })

  describe('getMode', () => {
    it('defaults to "classic" when the mode attribute is missing or invalid', () => {
      expect(element.getMode()).toBe('classic')
      element.setAttribute('mode', 'not-a-mode')
      expect(element.getMode()).toBe('classic')
    })

    it('returns the mode attribute when it is a valid mode', () => {
      for (const mode of ['classic', 'pulse', 'buildup']) {
        element.setAttribute('mode', mode)
        expect(element.getMode()).toBe(mode)
      }
    })
  })

  describe('isPaused', () => {
    it('is false by default', () => {
      expect(element.isPaused()).toBe(false)
    })

    it('is true when the pause attribute is empty or "true"', () => {
      element.setAttribute('pause', '')
      expect(element.isPaused()).toBe(true)
      element.setAttribute('pause', 'true')
      expect(element.isPaused()).toBe(true)
    })

    it('is false when pause is set to "false"', () => {
      element.setAttribute('pause', 'false')
      expect(element.isPaused()).toBe(false)
    })
  })

  describe('getAnimatorBackgroundKey', () => {
    it('returns "background" for buildup mode and "background-image" otherwise', () => {
      expect(element.getAnimatorBackgroundKey()).toBe('background-image')
      element.setAttribute('mode', 'pulse')
      expect(element.getAnimatorBackgroundKey()).toBe('background-image')
      element.setAttribute('mode', 'buildup')
      expect(element.getAnimatorBackgroundKey()).toBe('background')
    })
  })

  describe('getStepCount', () => {
    it('returns 41 for buildup mode and 5 for every other mode', () => {
      expect(element.getStepCount()).toBe(5)
      element.setAttribute('mode', 'pulse')
      expect(element.getStepCount()).toBe(5)
      element.setAttribute('mode', 'buildup')
      expect(element.getStepCount()).toBe(41)
    })
  })

  describe('getAnimatorOpacity', () => {
    it('returns "1" for buildup mode and "0.3" otherwise', () => {
      expect(element.getAnimatorOpacity()).toBe('0.3')
      element.setAttribute('mode', 'buildup')
      expect(element.getAnimatorOpacity()).toBe('1')
    })
  })

  describe('getPulseContainerTransform', () => {
    it('returns increasing scale values based on index', () => {
      expect(element.getPulseContainerTransform(0)).toBe('scale(0.85)')
      expect(element.getPulseContainerTransform(1)).toBe('scale(0.93)')
      expect(element.getPulseContainerTransform(2)).toBe('scale(0.98)')
      expect(element.getPulseContainerTransform(99)).toBe('scale(0.98)')
    })
  })

  describe('getAnimationSpeed', () => {
    it('returns a fixed speed in classic mode', () => {
      expect(element.getAnimationSpeed(false, 0)).toBe(115)
      expect(element.getAnimationSpeed(true, 3)).toBe(115)
    })

    it('returns pulse speeds depending on whether it is the last step', () => {
      element.setAttribute('mode', 'pulse')
      expect(element.getAnimationSpeed(false, 2)).toBe(130)
      expect(element.getAnimationSpeed(true, 2)).toBe(550)
    })

    it('returns buildup speeds based on the current step', () => {
      element.setAttribute('mode', 'buildup')
      expect(element.getAnimationSpeed(true, 10)).toBe(700)
      expect(element.getAnimationSpeed(false, 10)).toBe(150 - 10 * 3.75)
    })
  })

  describe('rgbToRgbaTemplate', () => {
    it('converts an rgb color into a rgba template with an $alpha placeholder', () => {
      expect(element.rgbToRgbaTemplate('rgb(10, 20, 30)')).toBe('rgba(10, 20, 30, $alpha)')
    })

    it('converts an rgba color, discarding its existing alpha value', () => {
      expect(element.rgbToRgbaTemplate('rgba(10, 20, 30, 0.5)')).toBe('rgba(10, 20, 30, $alpha)')
    })

    it('caches the result for repeated colors', () => {
      const first = element.rgbToRgbaTemplate('rgb(1, 2, 3)')
      const second = element.rgbToRgbaTemplate('rgb(1, 2, 3)')
      expect(second).toBe(first)
      expect((element as any).rgbTemplateColorCache.get('rgb(1, 2, 3)')).toBe(first)
    })

    it('logs an error and returns the original string for an invalid format', () => {
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const result = element.rgbToRgbaTemplate('not-a-color')
      expect(result).toBe('not-a-color')
      expect(errorSpy).toHaveBeenCalledTimes(1)
    })
  })

  describe('getAnimatorBackgroundValue', () => {
    it('produces a radial-gradient in pulse mode', () => {
      element.setAttribute('mode', 'pulse')
      expect(element.getAnimatorBackgroundValue(0)).toContain('radial-gradient(circle')
    })

    it('produces a linear-gradient in classic mode', () => {
      expect(element.getAnimatorBackgroundValue(0)).toContain('linear-gradient(44deg')
    })

    it('produces two repeating-linear-gradients in buildup mode', () => {
      element.setAttribute('mode', 'buildup')
      const value = element.getAnimatorBackgroundValue(0)
      expect(value).toContain('repeating-linear-gradient(0deg')
      expect(value).toContain('repeating-linear-gradient(90deg')
    })
  })

  describe('getAnimatorHeightValue', () => {
    it('is always "100%" outside of buildup mode', () => {
      expect(element.getAnimatorHeightValue(0)).toBe('100%')
      expect(element.getAnimatorHeightValue(3)).toBe('100%')
    })

    it('decreases across steps in buildup mode and never goes below 0%', () => {
      element.setAttribute('mode', 'buildup')
      expect(element.getAnimatorHeightValue(0)).toBe('100%')
      const farStep = element.getAnimatorHeightValue(1000)
      expect(farStep).toBe('0%')
    })
  })

  describe('updateAnimatorModeClass', () => {
    it('adds the current mode class to the animator element', () => {
      const animator = element.shadowRoot!.querySelector('.logo-loader-animator')!
      element.updateAnimatorModeClass()
      expect(animator.classList.contains('classic')).toBe(true)
    })

    it('replaces the previous mode class when the mode changes', () => {
      const animator = element.shadowRoot!.querySelector('.logo-loader-animator')!
      element.updateAnimatorModeClass()
      expect(animator.classList.contains('classic')).toBe(true)

      element.setAttribute('mode', 'buildup')
      element.updateAnimatorModeClass()
      expect(animator.classList.contains('buildup')).toBe(true)
      expect(animator.classList.contains('classic')).toBe(false)
    })

    it('does not touch the classList when the mode is unchanged', () => {
      const animator = element.shadowRoot!.querySelector('.logo-loader-animator')!
      element.updateAnimatorModeClass()
      const removeSpy = vi.spyOn(animator.classList, 'remove')
      const addSpy = vi.spyOn(animator.classList, 'add')
      element.updateAnimatorModeClass()
      expect(removeSpy).not.toHaveBeenCalled()
      expect(addSpy).not.toHaveBeenCalled()
    })
  })

  describe('updateHasSlotContent', () => {
    it('is false when there is no slotted content', () => {
      element.updateHasSlotContent()
      expect((element as any).hasSlotContent).toBe(false)
    })

    it('is true when there is slotted content', () => {
      const child = document.createElement('span')
      element.appendChild(child)
      element.updateHasSlotContent()
      expect((element as any).hasSlotContent).toBe(true)
    })
  })

  describe('updateImgAttributes', () => {
    it('sets width, height and src on the internal img element', () => {
      element.setAttribute('src', 'logo.png')
      element.setAttribute('width', '50')
      element.setAttribute('height', '60')
      element.updateImgAttributes()
      const img = element.shadowRoot!.querySelector('.logo-loader-img') as HTMLImageElement
      expect(img.getAttribute('src')).toBe('logo.png')
      expect(img.getAttribute('width')).toBe('50')
      expect(img.getAttribute('height')).toBe('60')
    })
  })

  describe('start / stop', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    it('sets the animator opacity and schedules the animation loop', () => {
      const animator = element.shadowRoot!.querySelector('.logo-loader-animator') as HTMLElement
      element.start()
      expect(animator.style.opacity).toBe('0.3')
      expect((element as any).timeout).not.toBeNull()
    })

    it('advances currStep on each tick and wraps back to 0 after the last step', () => {
      element.start()
      const stepCount = element.getStepCount()
      // start() advances currStep synchronously once before scheduling any timer,
      // so only stepCount - 1 timer ticks are needed to wrap back around to 0.
      for (let i = 0; i < stepCount - 1; i++) {
        vi.runOnlyPendingTimers()
      }
      expect((element as any).currStep).toBe(0)
    })

    it('resets opacity, background-image and currStep, and clears the pending timeout', () => {
      const animator = element.shadowRoot!.querySelector('.logo-loader-animator') as HTMLElement
      element.start()
      vi.runOnlyPendingTimers()
      element.stop()
      expect(animator.style.opacity).toBe('0')
      expect(animator.style.backgroundImage).toBe('none')
      expect((element as any).currStep).toBe(0)
    })
  })

  describe('connectedCallback', () => {
    it('logs an error and does not start the animation when there is no src and no slot content', () => {
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const startSpy = vi.spyOn(element, 'start')
      document.body.appendChild(element)
      expect(errorSpy).toHaveBeenCalledTimes(1)
      expect(startSpy).not.toHaveBeenCalled()
    })

    it('removes the internal img element when slot content is present', () => {
      element.appendChild(document.createElement('span'))
      document.body.appendChild(element)
      expect(element.shadowRoot!.querySelector('.logo-loader-img')).toBeNull()
    })

    it('applies attributes to the internal img element when there is no slot content', () => {
      element.setAttribute('src', 'logo.png')
      document.body.appendChild(element)
      const img = element.shadowRoot!.querySelector('.logo-loader-img') as HTMLImageElement
      expect(img.getAttribute('src')).toBe('logo.png')
    })

    it('starts the animation by default', () => {
      vi.useFakeTimers()
      element.setAttribute('src', 'logo.png')
      document.body.appendChild(element)
      expect((element as any).timeout).not.toBeNull()
    })

    it('does not start the animation when the pause attribute is set', () => {
      vi.useFakeTimers()
      element.setAttribute('src', 'logo.png')
      element.setAttribute('pause', 'true')
      document.body.appendChild(element)
      expect((element as any).timeout).toBeNull()
    })
  })

  describe('disconnectedCallback', () => {
    it('stops the animation when the element is removed from the DOM', () => {
      vi.useFakeTimers()
      element.setAttribute('src', 'logo.png')
      document.body.appendChild(element)
      expect((element as any).timeout).not.toBeNull()
      element.remove()
      // stop() clears the pending timer via clearTimeout, so no timers should remain scheduled.
      expect(vi.getTimerCount()).toBe(0)
      expect((element as any).currStep).toBe(0)
    })
  })

  describe('attributeChangedCallback', () => {
    it('starts the animation when the pause attribute is removed', () => {
      vi.useFakeTimers()
      element.setAttribute('src', 'logo.png')
      element.setAttribute('pause', 'true')
      document.body.appendChild(element)
      expect((element as any).timeout).toBeNull()
      element.removeAttribute('pause')
      expect((element as any).timeout).not.toBeNull()
    })

    it('stops the animation when the pause attribute is set to true', () => {
      vi.useFakeTimers()
      element.setAttribute('src', 'logo.png')
      document.body.appendChild(element)
      expect((element as any).timeout).not.toBeNull()
      element.setAttribute('pause', 'true')
      // stop() clears the pending timer via clearTimeout, so no timers should remain scheduled.
      expect(vi.getTimerCount()).toBe(0)
      expect((element as any).currStep).toBe(0)
    })

    it('updates the animator mode class when the mode attribute changes', () => {
      element.setAttribute('src', 'logo.png')
      document.body.appendChild(element)
      const animator = element.shadowRoot!.querySelector('.logo-loader-animator')!
      expect(animator.classList.contains('classic')).toBe(true)

      element.setAttribute('mode', 'pulse')
      expect(animator.classList.contains('pulse')).toBe(true)
      expect(animator.classList.contains('classic')).toBe(false)
    })

    it('updates img attributes when width changes and there is no slot content', () => {
      element.setAttribute('src', 'logo.png')
      document.body.appendChild(element)
      element.setAttribute('width', '200')
      const img = element.shadowRoot!.querySelector('.logo-loader-img') as HTMLImageElement
      expect(img.getAttribute('width')).toBe('200')
    })
  })
})
