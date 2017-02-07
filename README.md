# simple-visual-dom
A simple visual DOM

###Virtual DOM 算法。包括几个步骤：
1、用 JavaScript 对象结构表示 DOM 树的结构；然后用这个树构建一个真正的 DOM 树，插到文档当中<br>
2、当状态变更的时候，重新构造一棵新的对象树。然后用新的树和旧的树进行比较，记录两棵树差异<br>
3、把2所记录的差异应用到步骤1所构建的真正的DOM树上，视图就更新了
###在网页中引用的bundle.js 
  暂未提供，稍微补充
###example 
  暂未提供，稍微补充
###用法
```javascript
var svd = require('simple-virtual-dom')

var el = svd.el
var diff = svd.diff
var patch = svd.patch

// 1. use `el(tagName, [propeties], children)` to create a virtual dom tree
var tree = el('div', {'id': 'container'}, [
    el('h1', {style: 'color: blue'}, ['simple virtal dom']),
    el('p', ['Hello, virtual-dom']),
    el('ul', [el('li')])
])

// 2. generate a real dom from virtual dom. `root` is a `div` element
var root = tree.render()

// 3. generate another different virtual dom tree
var newTree = el('div', {'id': 'container'}, [
    el('h1', {style: 'color: red'}, ['simple virtal dom']),
    el('p', ['Hello, virtual-dom']),
    el('ul', [el('li'), el('li')])
])

// 4. diff two virtual dom trees and get patches
var patches = diff(tree, newTree)

// 5. apply patches to real dom
patch(root, patches)

// now the `root` dom is updated
```
### 参考
[https://github.com/Matt-Esch/virtual-dom](https://github.com/Matt-Esch/virtual-dom) <br>
[http://teropa.info/blog/2015/03/02/change-and-its-detection-in-javascript-frameworks.html](http://teropa.info/blog/2015/03/02/change-and-its-detection-in-javascript-frameworks.html)