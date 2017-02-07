var _ = require('./util')

//替换节点
var REPLACE = 0;
//节点顺序有改动
var REORDER = 1;
//修改了节点属性
var PROPS = 2;
//修改了节点的内容
var TEXT = 3;

function patch (node, patches) {
  var walker = {index: 0};
  dfsWalk(node, walker, patches);
}

function dfsWalk (node, walker, patches) {
  //当前节点的差异
  var currentPatches = patches[walker.index];
  var len = node.childNodes ? node.childNodes.length : 0;
  for (var i = 0; i < len; i++) {
    //遍历子节点
    var child = node.childNodes[i];
    walker.index++;
    dfsWalk(child, walker, patches);
  }
  //应用修改
  if (currentPatches) {
    applyPatches(node, currentPatches);
  }
}

function applyPatches (node, currentPatches) {
  _.each(currentPatches, function (currentPatch) {
    switch (currentPatch.type) {
      case REPLACE:
        var newNode = (typeof currentPatch.node === 'string')
          ? document.createTextNode(currentPatch.node)
          : currentPatch.node.render();
        node.parentNode.replaceChild(newNode, node);
        break;
      case REORDER:
        reorderChildren(node, currentPatch.moves);
        break
      case PROPS:
        setProps(node, currentPatch.props);
        break
      case TEXT:
        // ie9+,ff2,opera9.64+,chrome, safari3+
        if (node.textContent) {
          node.textContent = currentPatch.content;
        } else {
          // fuck ie
          node.nodeValue = currentPatch.content;
        }
        break;
      default:
        throw new Error('Unknown patch type ' + currentPatch.type)
    }
  })
}

function setProps (node, props) {
  for (var key in props) {
    if (props[key] === undefined) {
      node.removeAttribute(key)
    } else {
      var value = props[key];
      _.setAttr(node, key, value);
    }
  }
}
/**
 * 节点重排最复杂，如果p>ul>div重排为 div>p>ul，实际上不用替换节点，而只需要移动节点即可
 * 这个实际上就是 最小编辑距离问题（https://en.wikipedia.org/wiki/Edit_distance），对应的算法是
 * 莱文斯坦距离（https://zh.wikipedia.org/wiki/%E8%90%8A%E6%96%87%E6%96%AF%E5%9D%A6%E8%B7%9D%E9%9B%A2）
 */
function reorderChildren (node, moves) {
  var staticNodeList = _.toArray(node.childNodes);
  var maps = {};

  _.each(staticNodeList, function (node) {
    if (node.nodeType === 1) {
      var key = node.getAttribute('key');
      if (key) {
        maps[key] = node;
      }
    }
  })

  _.each(moves, function (move) {
    var index = move.index;
    //删除元素
    //https://www.npmjs.com/package/list-diff2
    if (move.type === 0) { 
      if (staticNodeList[index] === node.childNodes[index]) {
        node.removeChild(node.childNodes[index]);
      }
      staticNodeList.splice(index, 1)
    } else if (move.type === 1) { // insert item
      var insertNode = maps[move.item.key]
        ? maps[move.item.key] // reuse old item
        : (typeof move.item === 'object')
            ? move.item.render()
            : document.createTextNode(move.item);
      staticNodeList.splice(index, 0, insertNode);
      node.insertBefore(insertNode, node.childNodes[index] || null);
    }
  })
}

patch.REPLACE = REPLACE;
patch.REORDER = REORDER;
patch.PROPS = PROPS;
patch.TEXT = TEXT;

module.exports = patch;
