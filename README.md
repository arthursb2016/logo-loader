# logo-loader

Web component to seamlessly create a loader from your logo image or icon

## Installation

#### 1) NPM

```
npm i logo-loader
```

then import it in your app entry point (index.js, main.js...)

```JavaScript
// main.js|ts
import 'logo-loader'
```

#### 2) CDN / Script tag

Alternatively, include the script tag in your HTML header:

```HTML
<head>
  <script type="module" src="https://cdn.jsdelivr.net/npm/logo-loader@1.0.0/dist/logoLoader.esm.min.js"></script>
</head>
```

## Demo

#### Classic mode:

<img src="https://lnx-tech.atl1.cdn.digitaloceanspaces.com/open-source/logo-loader/classic-mode-demo-teams.gif" alt="Logo Loader Demo - Classic Mode" width="300px" />

#### Pulse mode:

<img src="https://lnx-tech.atl1.cdn.digitaloceanspaces.com/open-source/logo-loader/pulse-mode-demo-teams.gif" alt="Logo Loader Demo - Pulse Mode" width="300px" />

#### Buildup mode:

<img src="https://lnx-tech.atl1.cdn.digitaloceanspaces.com/open-source/logo-loader/buildup-mode-demo-teams.gif" alt="Logo Loader Demo - Buildup Mode" width="300px" />

## Usage

```HTML
<body>
  <logo-loader src="my-logo.png"></logo-loader>
</body>
```

or pass the image/icon as a slot:

```HTML
<body>
  <logo-loader>
    <img src="my-logo.svg">
  </logo-loader>
</body>
```

## Attributes

### mode

Defines the animation style ("classic", "pulse" or "buildup")

```HTML
<logo-loader src="..." mode="pulse"></logo-loader>
```

### pause

Pauses the animation:

```HTML
<logo-loader src="..." pause></logo-loader>
```

or

```HTML
<logo-loader src="..." pause="true"></logo-loader>
```

### width & height (works only when using the src attribute)

Sets the logo size:

```HTML
<logo-loader src="..." width="150" height="150"></logo-loader>
```

or

```HTML
<logo-loader src="..." width="5rem" height="5rem"></logo-loader>
```

## Note

1. You must apply the component in a single colored background in order for it correctly animate
2. You might find some distortions if the parent background has an alpha channel (e.g. `rgba(x, x, x, 0.3)`)