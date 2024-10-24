class LogoLoader extends HTMLElement {
  static observedAttributes: string[] = ['src', 'width', 'height', 'speed']

  constructor() {
    super()
  }

  connectedCallback() {
    const shadow = this.attachShadow({ mode: 'open' })

    const container = document.createElement('span')
    container.setAttribute('class', 'logo-loader-container')

    // Create the image
    // Create the loader layer

    const style = document.createElement('style')
    style.textContent = `
      .logo-loader-container {
        position: relative;
        display: inline-block;
        vertical-align: middle;
        max-width: 100%;
        height: auto;
      }
    `;


    shadow.appendChild(style)
  }

  attributeChangedCallback(name: string, oldValue: any, newValue: any) {
    console.log(
      `Attribute ${name} has changed from ${oldValue} to ${newValue}.`,
    );
  }
}