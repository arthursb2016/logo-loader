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
    opacity: 0.3;
  }
`

class LogoLoader extends HTMLElement {
  static observedAttributes: string[] = ['src', 'mode', 'width', 'height', 'pause']

  private currStep = 0
  private stepCount = 5
  private timeout: NodeJS.Timeout | null = null

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
    return modeParam && ['default', 'pulse'].includes(modeParam) ? modeParam : 'default'
  }

  getParentBackgroundColor() {
    let color = 'white'
    const parent = this.parentElement
    if (parent) {
      const parentStyle = getComputedStyle(parent)
      color = parentStyle.backgroundColor
    }
    if (color === 'rgba(0, 0, 0, 0)') {
      color = 'white'
    } else if (color.startsWith('rgba') && color.endsWith('0)')) {
      color = 'black'
    }
    return color
  }

  getAnimatorBackground(index: number) {
    const color = this.getParentBackgroundColor()
    if (this.getMode() === 'pulse') {
      return `radial-gradient(circle, ${Array(this.stepCount).fill('$color').map((_, i) => i === index ? color : 'transparent').join(', ')})`
    }
    return `linear-gradient(44deg, ${Array(this.stepCount).fill('$color').map((_, i) => i === index ? color : 'transparent').join(', ')})`
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
    return 115
  }

  start() {
    const animate = () => {
      const isLastStep = this.currStep === this.stepCount - 1
      this.elements.animator.style.setProperty('background-image', this.getAnimatorBackground(this.currStep))
      if (this.getMode() === 'pulse') {
        this.elements.logoDisplay.style.setProperty('transform', this.getContainerTransform(this.currStep))
      }
      this.currStep = isLastStep ? 0 : this.currStep + 1
      this.timeout = setTimeout(animate, this.getAnimationSpeed(isLastStep))
    }
    animate()
  }

  stop() {
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