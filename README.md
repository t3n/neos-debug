[![CircleCI](https://circleci.com/gh/t3n/neos-debug.svg?style=svg)](https://circleci.com/gh/t3n/neos-debug) [![Latest Stable Version](https://poser.pugx.org/t3n/neos-debug/v/stable)](https://packagist.org/packages/t3n/neos-debug) [![License](https://poser.pugx.org/t3n/neos-debug/license)](https://packagist.org/packages/t3n/neos-debug)

# t3n.Neos.Debug

The t3n.Neos.Debug package is a small helper package to add a debug panel to your Neos CMS website. 
At this point in time you're able to debug your content cache configuration as well as sql queries.
Additionally, the Server-Timing http header can be enabled that will add request timings to responses. 
Those then can be viewed in the browser network tab.

_Note: This is still a very early rough version. Contributions are welcome in any Error. Nevertheless, it's already adding value to your debug experience_

![Neos CMS Demo Site with enabled debug console](t3n-neos-debug.jpg 'Neos CMS Demo Site with enabled debug console')
![Server-Timing header in the browser network tab](server-timing-example.jpg 'Viewing the timings in the browser network tab')

## Installation & configuration

Install the package via composer

```
composer require t3n/neos-debug --dev
```

The debug mode is disabled by default. To enable it add this to your Settings.yaml

```yaml
t3n:
  Neos:
    Debug:
      enabled: true
```

To bring up the debug panel run this command in your js console:
```js
__enable_neos_debug__()
```

_Disclaimer: Once the debug mode is enabled you might expose sensitive data. Make sure to **not** use this in production. At least be warned_

In a previous version of this package your current user needed a specific role as well. We dropped this requirement for now as you could not use this package if you don't have a frontend login on your site. Once the package is active it will render some metadata in your html output.

To get the debugger running you now need to include some javascript and css to actually render the debug console. This package ships two fusion prototypes to include all resources. If your Document extends `Neos.Neos:Page` you don't need to include anything. We already added the resources to `Neos.Neos:Page` prototype.

Note: If you are using `Sandstorm.CookiePunch`, make sure to unblock the debugger js. This can be done using this configuration snippet:

```yaml
Sandstorm:
  CookiePunch:
    blocking:
      tagPatterns:
        script:
          "Packages/t3n.Neos.Debug":
            block: false
```

### HTTP Server-Timing header   

The header is disabled by default. To enable it add this to your Settings.yaml

```yaml
t3n:
  Neos:
    Debug:
      serverTimingHeader:
        enabled: true
```   

If you only want the header with all timings but not the debug mode, do this:

```yaml
t3n:
  Neos:
    Debug:                                                  
      enabled: true
      htmlOutput:
        enabled: false
      serverTimingHeader:
        enabled: true
```

## Usage

To enable the cache visualization open your browsers developer console and execute
`__enable_neos_debug__()`. This will bring up the debug console at the bottom of your screen.

### 🔦 Inspect

Once you enable the inspect mode a visualization will pop up and add overlays on your cached parts. Cached parts are marked green, uncached red and dynamic caches are marked yellow. If you hover the loupe you will also see some meta data regarding the cache.

### ⚡️ Cache

This module will add a new modal including some statistics regarding cache hits and misses as well as a table of all rendered cache entries.

### 🗄 SQL

In addition to the content cache we're also exposing some debug SQL informations and statistics. It will also detect slow queries. You can configure from when a query should be marked as slow:

```yaml
t3n:
  Neos:
    Debug:
      sql:
        # Set when a query should be considered as slow query. In ms
        slowQueryAfter: 10
```

### 🚫 Close

To shutdown the debug console simply close it. If you'd like to persist the active debug state you can add a `true` to the method

```
__enable_neos_debug__(true)
```

This will set a cookie and the debug mode will still be active after a page refresh.
