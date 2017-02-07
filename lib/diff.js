var _ = require('./util')
var patch = require('./patch')
var listDiff = require('list-diff2')

function diff (oldTree, newTree) {
  //当前节点的标志
  var index = 0;
  //记录每个差异节点的对象
  var patches = {};
  dfsWalk(oldTree, newTree, index, patches);
  return patches;
}
//深度优先遍历，并记录有差异的节点到一个新对象
function dfsWalk (oldNode, newNode, index, patches) {
  var currentPatch = [];
  // 如果解点被移除
  if (newNode === null) {

  // TextNode节点替换
  } else if (_.isString(oldNode) && (_.isString(newNode))) {
    if (newNode !== oldNode) {
      currentPatch.push({ 
        type: patch.TEXT, 
        content: newNode 
      });
    }
  // 节点相同，就比较节点的属性和子节点
  } else if ((oldNode.tagName === newNode.tagName) && (oldNode.key === newNode.key)) {
    // Diff props
    var propsPatches = diffProps(oldNode, newNode);
    if (propsPatches) {
      currentPatch.push({ 
        type: patch.PROPS, 
        props: propsPatches 
      });
    }
    //比较子元素，如果解点中有ignore属性，就不进行子属性的比较
    if (!isIgnoreChildren(newNode)) {
      diffChildren(
        oldNode.children,
        newNode.children,
        index,
        patches,
        currentPatch
      )
    }
  // Nodes are not the same, replace the old node with new node
  } else {
    currentPatch.push({ type: patch.REPLACE, node: newNode })
  }

  if (currentPatch.length) {
    patches[index] = currentPatch
  }
}

//子元素比较，借助库"list-diff2""
function diffChildren (oldChildren, newChildren, index, patches, currentPatch) {
  var diffs = listDiff(oldChildren, newChildren, 'key');
  newChildren = diffs.children;

  if (diffs.moves.length) {
    var reorderPatch = { 
      type: patch.REORDER, 
      moves: diffs.moves 
    };
    currentPatch.push(reorderPatch);
  }

  var leftNode = null;
  var currentNodeIndex = index;
  _.each(oldChildren, function (child, i) {
    var newChild = newChildren[i];
    currentNodeIndex = (leftNode && leftNode.count) ? currentNodeIndex + leftNode.count + 1 : currentNodeIndex + 1;
    dfsWalk(child, newChild, currentNodeIndex, patches);
    leftNode = child;
  })
}

function diffProps (oldNode, newNode) {
  var count = 0;
  var oldProps = oldNode.props;
  var newProps = newNode.props;

  var key, value, propsPatches = {}

  // 查找不同的props
  for (key in oldProps) {
    value = oldProps[key];
    if (newProps[key] !== value) {
      count++;
      propsPatches[key] = newProps[key];
    }
  }

  // 查找新的props
  for (key in newProps) {
    value = newProps[key];
    if (!oldProps.hasOwnProperty(key)) {
      count++;
      propsPatches[key] = newProps[key];
    }
  }

  // 如果所有的属性都相同
  if (count === 0) {
    return null;
  }

  return propsPatches;
}

function isIgnoreChildren (node) {
  return (node.props && node.props.hasOwnProperty('ignore'))
}

module.exports = diff
