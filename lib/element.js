var _ = require('./util')

/**
 * Virtual-Dom Element.
 * @param {String} tagName
 * @param {Object} props - Element's properties,
 *                       - using object to store key-value pair
 * @param {Array<Element|String>} - This element's children elements.
 *                                - Can be Element instance or just a piece plain text.
 */
function Element (tagName, props, children) {
  if (!(this instanceof Element)) {
    if (!(_.isArray(children)) && (children != null)) {
      children = _.slice(arguments, 2).filter(_.truthy);
    }
    return new Element(tagName, props, children);
  }
  //if props attribute is not defined
  if (_.isArray(props)) {
    children = props;
    props = {};
  }

  this.tagName = tagName;
  this.props = props || {};
  this.children = children || [];
  this.key = props ? props.key : undefined;

  var count = 0;
  _.each(this.children, function (child, i) {
    if (child instanceof Element) {
      count += child.count;
    } else {
      children[i] = '' + child;
    }
    count++;
  })

  this.count = count;
}

/**
 * Render the element tree.
 * 
 */
Element.prototype.render = function () {
  //TODO: the element not controlled by ns 
  //reference  https://developer.mozilla.org/zh-CN/docs/Web/API/Document/createElementNS
  var el = document.createElement(this.tagName);
  var props = this.props;

  for (var propName in props) {
    var propValue = props[propName];
    _.setAttr(el, propName, propValue);
  }

  _.each(this.children, function (child) {
    var childEl = (child instanceof Element) ? child.render() : document.createTextNode(child);
    el.appendChild(childEl);
  })
  return el;
}

module.exports = Element;
