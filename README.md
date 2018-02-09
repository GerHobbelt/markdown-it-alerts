# markdown-it-vtrans
[Markdown-it][markdown-it] plugin for supporting indic scripts via ITRANS.

E.g.:

```md
::: vtrans
shri rAma rAmeti .,
:::
```

Gets converted to:

```html
<div class="vtrans vtrans-devanagari" lang="sa">

  श्री राम रामेति ॥

</div>
```


## Install

```bash
$ npm install markdown-it-vtrans --save
```


## Usage


### Enable plugin

```js
var md = require('markdown-it');
var vtrans = require('markdown-it-vtrans');

md().use(vtrans);
```


### Options

Enable/disable adding class `alert-link` to links inside alerts.

```js
var md = require('markdown-it');
var alerts = require('markdown-it-alerts');

md().use(alerts, {links: false});
```


### Example

With option `links` enabled (by default):

```md
This is a test. [Link](#).

::: success
Hello world! [Link](#).
:::

This is a test. [Link](#).
```

Gets converted to:

```html
<p>This is a test. <a href="#">Link</a>.</p>
<div class="alert alert-success" role="alert">
<p>Hello world! <a href="#" class="alert-link">Link</a>.</p>
</div>
<p>This is a test. <a href="#">Link</a>.</p>
```


[markdown-it]: https://github.com/markdown-it/markdown-it
