/*
 * @作者：rocyuan（袁鹏）
 * @邮箱：roc@rocyuan.top、rocyuan666@163.com
 * @微信：rocyuan666
 * @个人网站：http://rocyuan.top
 *
 * rem屏幕适应 不开发移动端，建议
 * 1. 移除postcss-pxtorem插件 npm uninstall postcss-pxtorem
 * 2. 删除/postcss.config.js配置文件
 * 3. 修改vite.config.js中的 css:postcss 选项
 * 4. 删除/src/common/rem.js
 */
;(function (win, doc) {
  if (!win.addEventListener) return
  function setFont() {
    const html = document.documentElement
    // 注意此值要与 postcss.config.js 文件中的 rootValue保持一致
    const baseSize = 375
    // 当前页面宽度相对于 375宽的缩放比例，可根据自己需要修改,一般设计稿都是宽750(图方便可以拿到设计图后改过来)。
    const scale = document.documentElement.clientWidth / 375
    // 设置页面根节点字体大小（“Math.min(scale, 2)” 指最高放大比例为2，可根据实际业务需求调整）
    html.style.fontSize = baseSize * Math.min(scale, 2) + 'px'
  }
  setFont()
  setTimeout(function () {
    setFont()
  }, 300)
  doc.addEventListener('DOMContentLoaded', setFont, false)
  win.addEventListener('resize', setFont, false)
  win.addEventListener('load', setFont, false)
})(window, document)
