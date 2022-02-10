const { override, fixBabelImports, addWebpackAlias, addLessLoader } = require('customize-cra')
const path = require('path');

module.exports =  {
  webpack:
    override(
      // 按需加载
      fixBabelImports(
        "import",
        {
          "libraryName": "antd",
          "libraryDirectory": "es",
          "style": "css"
        }
      ),
      // add less config
      // addLessLoader(),
      // alias
      addWebpackAlias({
        // @: src
        "@": path.resolve(__dirname, './src')
      })
    ),
    devServer: function(configFunction) {
      return function(proxy, allowedHost) {
        const config = configFunction(proxy, allowedHost);
        return config;
      }
    }

}