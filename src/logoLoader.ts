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
  static observedAttributes: string[] = ['src', 'width', 'height', 'speed']

  private currStep = 0
  private timeout: NodeJS.Timeout | null = null
  private speed = 115

  constructor() {
    super()
  }

  connectedCallback() {
    const shadow = this.attachShadow({ mode: 'open' })

    const container = document.createElement('span')
    container.setAttribute('class', 'logo-loader-container')

    // const slot = document.createElement('slot')
    const hasSlot = false

    if (hasSlot) {
      console.warn('Implementation in progress...')
    } else if (this.hasAttribute('src')) {
      const img = document.createElement('img')
      img.setAttribute('class', 'logo-loader-icon')
      img.setAttribute('width', this.getWidth())
      img.setAttribute('height', this.getHeight())
      img.setAttribute('src', this.getAttribute('src')!)
      container.appendChild(img)
    } else {
      console.error('You must set either a src attribute or slot element for the LogoLoader component.')
    }

    const animator = document.createElement('span')
    animator.setAttribute('class', 'logo-loader-animator')
    container.appendChild(animator)

    const style = document.createElement('style')
    style.textContent = styles;


    shadow.appendChild(style)
    shadow.appendChild(container)

    this.init(shadow)
  }

  disconnectedCallback() {
    if (this.timeout) clearTimeout(this.timeout)
  }

  attributeChangedCallback(name: string, oldValue: any, newValue: any) {
    console.log(
      `Attribute ${name} has changed from ${oldValue} to ${newValue}.`,
    );
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

  init(shadow: ShadowRoot) {
    const animator = shadow.querySelector('.logo-loader-animator') as HTMLElement
    const animate = () => {
      animator!.style.setProperty('background-image', this.getAnimatorBackground(this.currStep))
      this.currStep = this.currStep === 4 ? 0 : this.currStep + 1
      this.timeout = setTimeout(animate, this.speed)
    }
    animate()
  }
}

if (!customElements.get('logo-loader')) {
  customElements.define('logo-loader', LogoLoader)
}

export default LogoLoader