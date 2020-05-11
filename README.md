# markdown-it-vtrans

[Markdown-it][markdown-it] plugin for supporting indic scripts via ITRANS.

For example:

```md

::: vtrans devanagari
  
  shri rAma rAmeti ||
  
:::

```

Gets converted to:

```html
<div class="vtrans vtrans-devanagari">
<p>श्रि राम रामॆति ॥</p>
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

[markdown-it]: https://github.com/markdown-it/markdown-it
