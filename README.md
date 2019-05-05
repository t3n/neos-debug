# Yeebase.Fusion.ContentCacheDebug

The Yeebase.Fusion.ContentCacheDebug package is a helper package to visualize your cache configuration. Once the package is active, administrators can view a cache configuration overlay on the website to see exactly which parts of the website are cached like


## Installation & configuration

Install the package via composer
```
composer require yeebase/fusion-contentcachedebug
```

The debug mode is disabled by default. To enable it add this to your Settings.yaml

```yaml
Yeebase:
  Fusion:
    ContentCacheDebug:
      enabled: true

```

Now the package is active and will render some metadata in your html output if the current user
inherits the role `Yeebase.Fusion.ContentCacheDebug:Debug`. Only user with this role will be able to see the debug information.

To get the debugger running you now need to include some javascript and css to acutally be able to render the output. For Neos we already adjusted the `Neos.Neos.Page` prototype. Include this in your Root.fusion of your site package:
```
include: resource://Yeebase.Fusion.ContentCacheDebug/Private/Fusion/Root.fusion
```

If you're running a fusion standalone app check that code and include it the js and css files to your page.

## Usage
To enable the cache visualization open your browsers developer console and execute
`__enable_content_cache_debug__()`. This will add three new buttons.

🔦  toggle visualization

📋  displays a list of used cached entries in a hierarchical order

❌ disable debug mode

If you'd like to persist the active debug state you can add a `true` to the method
```
__enable_content_cache_debug__(true)
```
This will set a cookie and the debug mode will still be active after a page refresh.

![Demo](demo.gif)
