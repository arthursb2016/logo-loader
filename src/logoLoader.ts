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
  static observedAttributes: string[] = ['src', 'width', 'height']

  private currStep = 0
  private timeout: NodeJS.Timeout | null = null
  private speed = 115

  private hasSlotContent = false
  private elements: { container: HTMLSpanElement, slot: HTMLSlotElement, img: HTMLImageElement, animator: HTMLSpanElement }

  constructor() {
    super()
    this.attachShadow({ mode: 'open' })

    const container = document.createElement('span')
    container.setAttribute('class', 'logo-loader-container')

    const slot = document.createElement('slot')
    container.appendChild(slot)

    const img = document.createElement('img')
    img.setAttribute('class', 'logo-loader-img')
    container.appendChild(img)

    const animator = document.createElement('span')
    animator.setAttribute('class', 'logo-loader-animator')
    container.appendChild(animator)

    const style = document.createElement('style')
    style.textContent = styles;

    this.shadowRoot!.appendChild(style)
    this.shadowRoot!.appendChild(container)

    this.elements = { container, slot, img, animator }
  }

  connectedCallback() {
    this.updateHasSlotContent()

    if (this.hasSlotContent) {
      const container = this.shadowRoot!.querySelector('.logo-loader-container')
      this.elements.container.removeChild(this.elements.img)
    } else if (this.hasAttribute('src')) {
      this.updateImgAttributes()
    } else {
      console.error('You must set either a src attribute or a slot element for the logo-loader component.')
      return
    }

    this.init()
  }

  disconnectedCallback() {
    if (this.timeout) clearTimeout(this.timeout)
  }

  attributeChangedCallback(name: string, oldValue: any, newValue: any) {
    this.updateHasSlotContent()
    if (this.hasSlotContent) return
    this.updateImgAttributes()
  }

  getWidth() {
    return this.getAttribute('width') ?? 'auto'
  }

  getHeight() {
    return this.getAttribute('height') ?? 'auto'
  }

  getAnimatorBackground(index: number) {
    let color = 'white'
    const parent = this.parentElement
    if (parent) {
      const parentStyle = getComputedStyle(parent)
      color = parentStyle.backgroundColor
    }
    return `linear-gradient(44deg, ${Array(5).fill('$color').map((_, i) => i === index ? color : 'transparent').join(', ')})`
  }

  init() {
    const animate = () => {
      this.elements.animator.style.setProperty('background-image', this.getAnimatorBackground(this.currStep))
      this.currStep = this.currStep === 4 ? 0 : this.currStep + 1
      this.timeout = setTimeout(animate, this.speed)
    }
    animate()
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