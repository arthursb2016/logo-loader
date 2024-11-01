# logo-loader

Web component to seamlessly create a loader from your logo image or icon

## Installation

```HTML
<head>
  <script type="module" src="https://cdn.jsdelivr.net/npm/logo-loader@0.0.1/dist/logoLoader.esm.min.js"></script>
</head>
```

or

```JavaScript
// javascript file
import 'logo-loader'
```

## Demo

![Logo Loader Demo](logo-loader-demo.gif)

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
    <img src="my-logo.png">
  </logo-loader>
</body>
```

## Attributes

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