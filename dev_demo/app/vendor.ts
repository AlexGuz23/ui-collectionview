// Snapshot the ~/app.css and the theme
const application = require("application");
require("ui/styling/style-scope");
const appCssContext = require.context("~/", false, /^\.\/app\.(css|scss|less|sass)$/);
global.registerWebpackModules(appCssContext);
application.loadAppCss();

require("./vendor-platform");

require("nativescript-collectionview"); // Added for snapshots

require("bundle-entry-points");
