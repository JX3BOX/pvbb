const path = require("path");
const pkg = require("./package.json");
const { JX3BOX, SEO } = require("@jx3box/jx3box-common");
const Setting = require("./setting.json");
const commonDomains = require("@jx3box/jx3box-common/data/jx3box.json");

module.exports = {
    // map
    productionSourceMap: false,
    // 临时关闭 lint-on-save（Vue3 升级中的语法调整较多，避免阻塞启动）
    lintOnSave: false,
    css: {
        loaderOptions: {
            sass: {
                sassOptions: {
                    quietDeps: true,
                },
            },
            scss: {
                sassOptions: {
                    quietDeps: true,
                },
            },
        },
    },
    //❤️ Multiple pages ~
    // pages: {},

    //⚛️ Proxy ~
    devServer: {
        host: "localhost",
        // 与 @jx3box/jx3box-common/js/api.js 对齐：
        // 本地开发开启 `VUE_APP_PROXY_ENABLE=1` 后，会把请求 baseURL 切到 `${VUE_APP_PROXY_PREFIX}/${serviceKey}`
        proxy: buildEnvProxy(),
        allowedHosts: "all",
        port: process.env.DEV_PORT || 12028,
    },

    outputDir: process.env["BUILD_MODE"] == "preview" ? path.resolve(__dirname, pkg.name) : "dist", // 指定构建输出的目录

    //❤️ define path for static files ~
    publicPath:
        //FOR Localhost => development
        (process.env.NODE_ENV === "development" && "/") ||
        //BY relative path
        (process.env.BUILD_MODE === "preview" && `/${pkg.name}/`) ||
        //BY origin
        (process.env.STATIC_PATH === "origin" && `${JX3BOX.__staticPath["origin"]}${pkg.name}/`) ||
        //BY github
        (process.env.STATIC_PATH === "github" && `${JX3BOX.__staticPath["github"]}${pkg.name}/`) ||
        //BY jsdelivr
        (process.env.STATIC_PATH === "jsdelivr" && `${JX3BOX.__staticPath["jsdelivr"]}${pkg.name}@gh-pages/`) ||
        //BY OSS=>CDN
        (process.env.STATIC_PATH === "mirror" && `${JX3BOX.__staticPath["mirror"]}${pkg.name}/`) ||
        //BY relative path
        (process.env.STATIC_PATH === "repo" && `/${pkg.name}/`) ||
        //BY root path or bind a domain
        (process.env.STATIC_PATH == "root" && "/") ||
        //for lost
        "/",

    // 过滤依赖包里的已知兼容性 warning（不影响运行，但会刷屏）
    configureWebpack: {
        stats: {
            warningsFilter: [/node_modules[\\\\/]+@jx3box[\\\\/]+jx3box-common[\\\\/]+/],
        },
    },

    // 奇怪的打包错误 ThreadLoader 会和 WorkerLoader 冲突
    // 禁用并行打包
    parallel: false,
    chainWebpack: (config) => {
        //💘 html-webpack-plugin ~
        // Multiple pages disable the block below
        config.plugin("html").tap((args) => {
            args[0].meta = {
                //------设置SEO信息
                Keywords: Setting.keys,
                Description: Setting.desc,
            };
            args[0].title = Setting.title + SEO.title; //------自动添加标题后缀
            return args;
        });

        //💝 in-line small imgs ~
        config.module.rule("images").set("parser", {
            dataUrlCondition: {
                maxSize: 10 * 1024,
            },
        });

        //💝 in-line svg imgs ~
        config.module.rule("vue").use("vue-svg-inline-loader").loader("vue-svg-inline-loader");

        //💖 import common less var * mixin ~
        //💖 import common less var * mixin ~
        const types = ["vue-modules", "vue", "normal-modules", "normal"];
        types.forEach((type) => addStyleResource(config.module.rule("less").oneOf(type)));

        config.externals = {
            tinyMCE: "tinyMCE",
        };
    },
};

// 注入全局样式资源（变量、mixin 等）
// 本地css/var.less、mixin.less会覆盖node_modules里的同名文件，方便定制化
// 注意此类文件都是变量和mixin函数，不要写全局样式，否则可能会被重复注入多次
function addStyleResource(rule) {
    var preload_styles = [];
    preload_styles.push(
        path.resolve(__dirname, "./node_modules/@jx3box/jx3box-common/css/var.less"),
        path.resolve(__dirname, "./node_modules/@jx3box/jx3box-common/css/mixin.less"),
        path.resolve(__dirname, "./assets/css/var.less"),
        path.resolve(__dirname, "./assets/css/mixin.less"),
        path.resolve(__dirname, "./node_modules/csslab/base.less")
    );
    rule.use("style-resource").loader("style-resources-loader").options({
        patterns: preload_styles,
    });
}

function normalizeTarget(value) {
    if (!value) return "";
    const trimmed = String(value).trim();
    if (!trimmed) return "";
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return `https://${trimmed.replace(/^\/+/, "")}`;
}

function escapeRegExp(str) {
    return String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildEnvProxy() {
    const nodeEnv = String(process.env.NODE_ENV || "").toLowerCase();
    if (nodeEnv && nodeEnv !== "development") return {};

    // Vue CLI 加载 .env 的时机/覆盖关系可能导致这里读不到或读到意外值：
    // - 明确设置为 false 才禁用
    // - 未设置/无法读取时，仍然生成代理（仅在 devServer 生效）
    const rawEnabled = String(process.env.VUE_APP_PROXY_ENABLE || "").toLowerCase();
    const disabled = ["0", "false", "no", "off"].includes(rawEnabled);
    if (disabled) return {};

    const prefix = process.env.VUE_APP_PROXY_PREFIX || "/__proxy";
    const mk = (serviceKey, target) => {
        const normalized = normalizeTarget(target);
        if (!normalized) return {};
        const context = `${prefix}/${serviceKey}`;
        const contextRe = new RegExp(`^${escapeRegExp(context)}`);
        return {
            [context]: {
                target: normalized,
                changeOrigin: true,
                secure: false,
                // API 代理不需要 websocket，避免给 dev server 叠加 upgrade 监听器
                ws: false,
                cookieDomainRewrite: "",
                pathRewrite: (p) => p.replace(contextRe, ""),
            },
        };
    };

    const serviceTargets = {
        cms: process.env.VUE_APP_CMS_API || commonDomains.__cms,
        next: process.env.VUE_APP_NEXT_API || commonDomains.__next,
        team: process.env.VUE_APP_TEAM_API || commonDomains.__team,
        pay: process.env.VUE_APP_PAY_API || commonDomains.__pay,
        lua: process.env.VUE_APP_LUA_API || commonDomains.__lua,
        node: process.env.VUE_APP_NODE_API || commonDomains.__node,
        helper: process.env.VUE_APP_HELPER_API || commonDomains.__helperUrl,
    };

    return Object.keys(serviceTargets).reduce((acc, key) => Object.assign(acc, mk(key, serviceTargets[key])), {});
}
