# Homey ZWaveDriver

[![npm](https://img.shields.io/npm/v/homey-zwavedriver)](https://www.npmjs.com/package/homey-zwavedriver) [![Lint](https://github.com/athombv/node-homey-zwavedriver/actions/workflows/lint.yml/badge.svg?branch=master)](https://github.com/athombv/node-homey-zwavedriver/actions/workflows/lint.yml) [![NPM](https://github.com/athombv/node-homey-zwavedriver/actions/workflows/deploy.yml/badge.svg)](https://github.com/athombv/node-homey-zwavedriver/actions/workflows/deploy.yml) [![Deploy Documentation To GitHub Pages](https://github.com/athombv/node-homey-zwavedriver/actions/workflows/docs.yml/badge.svg?branch=master)](https://github.com/athombv/node-homey-zwavedriver/actions/workflows/docs.yml)

This module can be used to make the development of Z-Wave apps for Homey easier.

It is essentially a map-tool from Homey-capabilities to Z-Wave Command Classes.

This module requires Homey Apps SDK v3.

## Related Modules

* [node-homey-rfdriver](https://athombv.github.io/node-homey-rfdriver) — Module for RF drivers
* [node-homey-zigbeedriver](https://athombv.github.io/node-homey-zigbeedriver) — Module for Zigbee drivers
* [node-homey-oauth2app](https://athombv.github.io/node-homey-oauth2app) — Module for OAuth2 apps
* [node-homey-log](https://athombv.github.io/node-homey-log) — Module to log unhandled errors to Sentry

## Installation

```bash
$ npm install homey-zwavedriver
```

## Requirements

This module requires Homey Apps SDK v3.

## Usage

Your device should extend ZwaveDevice. Start by looking at the docs for [`ZwaveDevice`](https://athombv.github.io/node-homey-zwavedriver/ZwaveDevice.html). This is the class you most likely want to extend from. If you are implementing a `light` device take a look at
 [`ZwaveLightDevice`](https://athombv.github.io/node-homey-zwavedriver/ZwaveLightDevice.html).

See [examples/fibaroplug.js](https://github.com/athombv/node-homey-zwavedriver/blob/master/examples/fibaroplug.js) and [examples/fibaroplug.json](https://github.com/athombv/node-homey-zwavedriver/blob/master/examples/fibaroplug.json)

## Documentation
See [https://athombv.github.io/node-homey-zwavedriver](https://athombv.github.io/node-homey-zwavedriver)

## Deprecations and breaking changes for homey-zwavedriver

This is a non exhaustive list of deprecations and breaking changes in `homey-zwavedriver` with respect to `homey-meshdriver` which might be good to be aware of:

- `MeshDevice` is removed in favour of `ZwaveDevice`.
- `onMeshInit()` is deprecated in favour of `onNodeInit()`.
- `calculateZwaveDimDuration` is deprecated in favour of `calculateDimDuration`.
- `ZwaveMeteringDevice` and `ZwaveLockDevice` are removed.
