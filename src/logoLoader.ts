/*!
  * The logo-laoder package <https://www.npmjs.com/package/logo-loader>
  * @author   Arthur Borba <https://arthurborba.dev>
  * @license  MIT
  */
if (!window.customElements) {
  import('@webcomponents/webcomponentsjs/webcomponents-bundle.js');
}

const styles = `
  .logo-loader-container {
    position: relative;
    display: inline-block;
    vertical-align: middle;
    max-width: 100%;
    height: auto;
  }
  .logo-loader-logo-display {
    width: auto;
    height: auto;
    transition: transform 120ms ease-in;
  }
  .logo-loader-animator {
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    position: absolute;
  }
`

class LogoLoader extends HTMLElement {
  static observedAttributes: string[] = ['src', 'mode', 'width', 'height', 'pause']

  private currStep = 0
  private timeout: NodeJS.Timeout | null = null
  private rgbTemplateColorCache = new Map<string, string>()
  private buildupBackgroundOptionIndex = 0

  private hasSlotContent = false
  private elements: {
    container: HTMLSpanElement,
    logoDisplay: HTMLDivElement,
    slot: HTMLSlotElement,
    img: HTMLImageElement,
    animator: HTMLSpanElement
  }

  constructor() {
    super()
    this.attachShadow({ mode: 'open' })

    const container = document.createElement('span')
    container.setAttribute('class', 'logo-loader-container')

    const logoDisplay = document.createElement('div')
    logoDisplay.setAttribute('class', 'logo-loader-logo-display')

    const slot = document.createElement('slot')
    logoDisplay.appendChild(slot)

    const img = document.createElement('img')
    img.setAttribute('class', 'logo-loader-img')
    logoDisplay.appendChild(img)

    container.appendChild(logoDisplay)

    const animator = document.createElement('span')
    animator.setAttribute('class', 'logo-loader-animator')
    container.appendChild(animator)

    const style = document.createElement('style')
    style.textContent = styles;

    this.shadowRoot!.appendChild(style)
    this.shadowRoot!.appendChild(container)

    this.elements = { container, logoDisplay, slot, img, animator }
  }

  connectedCallback() {
    this.updateHasSlotContent()

    if (this.hasSlotContent) {
      this.elements.logoDisplay.removeChild(this.elements.img)
    } else if (this.hasAttribute('src')) {
      this.updateImgAttributes()
    } else {
      console.error('You must set either a src attribute or a slot element for the logo-loader component.')
      return
    }

    if (!this.isPaused()) this.start()
  }

  disconnectedCallback() {
    this.stop()
  }

  attributeChangedCallback(name: string, oldValue: any, newValue: any) {
    if (name === 'pause') {
      if (this.isPaused()) {
        this.stop()
      } else {
        this.start()
      }
      return
    }
    this.updateHasSlotContent()
    if (this.hasSlotContent) return
    this.updateImgAttributes()
  }

  isPaused() {
    const value = this.getAttribute('pause')
    return (this.hasAttribute('pause') && !value) || value === 'true'
  }

  getWidth() {
    return this.getAttribute('width') ?? 'auto'
  }

  getHeight() {
    return this.getAttribute('height') ?? 'auto'
  }

  getMode() {
    const modeParam = this.getAttribute('mode')
    return modeParam && ['classic', 'pulse', 'buildup'].includes(modeParam) ? modeParam : 'classic'
  }

  getParentBackgroundColor() {
    let color = 'rgb(255, 255, 255)'
    const parent = this.parentElement
    if (parent) {
      const parentStyle = getComputedStyle(parent)
      color = parentStyle.backgroundColor
    }
    if (color === 'rgba(0, 0, 0, 0)') {
      color = 'rgb(255, 255, 255)'
    } else if (color.startsWith('rgba') && color.endsWith('0)')) {
      color = 'rgb(0, 0, 0)'
    }
    return color
  }

  getAnimatorBackgroundKey() {
    if (this.getMode() === 'buildup') {
      return 'background'
    }
    return 'background-image'
  }

  getBuildUpBackgroundOptions(rgbaTemplate: string) {
    return [
      `repeating-linear-gradient(
          90deg,
          ${rgbaTemplate.replace('$alpha', '0.5')} 0 10%,
          ${rgbaTemplate.replace('$alpha', '0.3')} 10% 20%
      ), repeating-linear-gradient(180deg, ${rgbaTemplate.replace('$alpha', '0.1')}, transparent max(10%, 10px)`,
      `repeating-linear-gradient(
          90deg,
          ${rgbaTemplate.replace('$alpha', '0.3')} 0 10%,
          ${rgbaTemplate.replace('$alpha', '0.5')} 10% 20%
      ), repeating-linear-gradient(180deg, ${rgbaTemplate.replace('$alpha', '0.1')}, transparent max(10%, 10px)`
    ]
  }

  getAnimatorBackgroundValue(index: number) {
    const color = this.getParentBackgroundColor()
    if (this.getMode() === 'pulse') {
      return `radial-gradient(circle, ${Array(this.getStepCount()).fill('$color').map((_, i) => i === index ? color : 'transparent').join(', ')})`
    }
    if (this.getMode() === 'buildup') {
      const rgbaTemplate = this.rgbToRgbaTemplate(color)
      const xRepeatingLinearGradientLines = Array(this.getStepCount() - 1)
            .fill(rgbaTemplate + ' $sp $ep')
            .map((_, i) => _
              .replace('$alpha', i >= index ? '0.5' : '0.3')
              .replace('$sp', `${i * 10}%`)
              .replace('$ep', `${(i + 1) * 10}%`)
            ).join(', ')
      const xRepeatingLinearGradient = `repeating-linear-gradient(90deg, ${xRepeatingLinearGradientLines})`
      const yRepeatingLinearGradient = `repeating-linear-gradient(180deg, ${rgbaTemplate.replace('$alpha', '0.1')}, transparent max(10%, 10px)`
      return `${xRepeatingLinearGradient}, ${yRepeatingLinearGradient}`

    }
    return `linear-gradient(44deg, ${Array(this.getStepCount()).fill('$color').map((_, i) => i === index ? color : 'transparent').join(', ')})`
  }

  getAnimatorHeightValue(index: number) {
    let percentage = 100
    if (this.getMode() === 'buildup') {
      const stepCount = this.getStepCount()
      percentage = 100 - (index * (100 / (stepCount - 1)))
    }
    return `${percentage}%`
  }

  rgbToRgbaTemplate(color: string): string {
    if (this.rgbTemplateColorCache.has(color)) {
      return this.rgbTemplateColorCache.get(color)!;
    }
    const match = color.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*[\d.]+\s*)?\)/);
    if (!match) {
      console.error('logo-loader: Invalid parent element background-color format, expected rgb or rgba.', color);
      return color
    }
    const [, r, g, b] = match;
    const result = `rgba(${r}, ${g}, ${b}, $alpha)`;
    this.rgbTemplateColorCache.set(color, result);
    return result;
  }

  getContainerTransform(index: number) {
    if (index === 0) {
      return 'scale(0.85)'
    }
    if (index === 1) {
      return 'scale(0.93)'
    }
    return 'scale(0.98)'
  }

  getAnimationSpeed(isLastStep: boolean) {
    if (this.getMode() === 'pulse') {
      return isLastStep ? 550 : 130
    }
    if (this.getMode() === 'buildup') {
      return isLastStep ? 800 : 400
    }
    return 115
  }

  getStepCount() {
    if (this.getMode() === 'buildup') {
      return 11
    }
    return 5
  }

  getAnimatorOpacity() {
    if (this.getMode() === 'buildup') {
      return '1'
    }
    return '0.3'
  }

  start() {
    this.elements.animator.style.setProperty('opacity', this.getAnimatorOpacity())
    const animate = () => {
      const isLastStep = this.currStep === this.getStepCount() - 1
      this.elements.animator.style.setProperty('height', this.getAnimatorHeightValue(this.currStep))
      this.elements.animator.style.setProperty(this.getAnimatorBackgroundKey(), this.getAnimatorBackgroundValue(this.currStep))
      if (this.getMode() === 'pulse') {
        this.elements.logoDisplay.style.setProperty('transform', this.getContainerTransform(this.currStep))
      }
      this.currStep = isLastStep ? 0 : this.currStep + 1
      this.timeout = setTimeout(animate, this.getAnimationSpeed(isLastStep))
    }
    animate()
  }

  stop() {
    this.elements.animator.style.setProperty('opacity', '0')
    this.elements.animator.style.setProperty('background-image', 'none')
    this.currStep = 0
    if (this.timeout) clearTimeout(this.timeout)
  }

  updateHasSlotContent() {
    this.hasSlotContent = this.elements.slot.assignedNodes().length > 0
  }

  updateImgAttributes() {
    this.elements.img.setAttribute('width', this.getWidth())
    this.elements.img.setAttribute('height', this.getHeight())
    this.elements.img.setAttribute('src', this.getAttribute('src')!)
  }
}

if (!customElements.get('logo-loader')) {
  customElements.define('logo-loader', LogoLoader)
}

export default LogoLoader