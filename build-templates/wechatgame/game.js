
"use strict";
require("./report.js")
GameGlobal.igsgame = wx
var openid = wx.getStorageSync("iGaoShouData5")
// 初始化开始
wx.igsEvent.report("闪屏-1.1引擎加载-" + (openid ? "false" : "true"))

require('adapter-min.js');
__globalAdapter.init();
const firstScreen = require('./first-screen');

// Polyfills bundle.
require("src/polyfills.bundle.js");

// SystemJS support.
require("src/system.bundle.js");

// Adapt for IOS, swap if opposite
if (canvas) {
    var _w = canvas.width;
    var _h = canvas.height;
    if (screen.width < screen.height) {
        if (canvas.width > canvas.height) {
            _w = canvas.height;
            _h = canvas.width;
        }
    } else {
        if (canvas.width < canvas.height) {
            _w = canvas.height;
            _h = canvas.width;
        }
    }
    canvas.width = _w;
    canvas.height = _h;
}
// Adjust initial canvas size
if (canvas && window.devicePixelRatio >= 2) { canvas.width *= 2; canvas.height *= 2; }

const importMap = require("src/import-map.js").default;
System.warmup({
    importMap,
    importMapUrl: 'src/import-map.js',
    defaultHandler: (urlNoSchema) => {
        require('.' + urlNoSchema);
    },
    handlers: {
        'plugin:': (urlNoSchema) => {
            requirePlugin(urlNoSchema);
        },
    },
});

/**
 * Fetch WebAssembly binaries.
 * 
 * Whereas WeChat expects the argument passed to `WebAssembly.instantiate`
 * to be file path and the path should be relative from project's root dir,
 * we do the path conversion and directly return the converted path.
 * 
 * @param path The path to `.wasm` file **relative from engine's out dir**(no leading `./`).
 * See 'assetURLFormat' field of build engine options.
 */
function fetchWasm(path) {
    const engineDir = 'cocos-js'; // Relative from project out
    return `${engineDir}/${path}`;
}

let timeStart = 0
// 闪屏开始
wx.igsEvent.report("闪屏-1.2闪屏开始-" + (openid ? "false" : "true"))
firstScreen.start('default', 'default').then(() => {
    timeStart = Date.now()
    return System.import('./application.js');
}).then((module) => {
    return firstScreen.setProgress(0.2).then(() => Promise.resolve(module));
}).then(({ createApplication }) => {
    return createApplication({
        loadJsListFile: (url) => require(url),
        fetchWasm,
    });
}).then((application) => {
    return firstScreen.setProgress(0.4).then(() => Promise.resolve(application));
}).then((application) => {
    return onApplicationCreated(application);
}).catch((err) => {
    console.error(err);
});

function onApplicationCreated(application) {

    return Promise.resolve().then(() => {
        __globalAdapter.adaptEngine();
        return firstScreen.setProgress(0.6).then(() => Promise.resolve(module));
    }).then(() => {
        require('./ccRequire');
        return firstScreen.setProgress(0.7).then(() => Promise.resolve(module));
    }).then(() => {
        require('./src/settings'); // Introduce Cocos Service here
        return firstScreen.setProgress(0.8).then(() => Promise.resolve(module));
    }).then(() => {
        require('./main');
        cc.view._maxPixelRatio = 4;

        if (cc.sys.platform !== cc.sys.WECHAT_GAME_SUB) {
            // Release Image objects after uploaded gl texture
            cc.macro.CLEANUP_IMAGE_CACHE = true;
        }
        return firstScreen.setProgress(0.95).then(() => Promise.resolve(module));
    }).then(() => {
        return firstScreen.end().then(() => {
            let timeEnd = Date.now()
            let showTime = 1000
            let dt = timeEnd - timeStart
            console.log("=dt=", dt)
            // 闪屏结束
            let boot = window.boot,
                stepAll = boot['stepAll'],
                preStep = boot['preStep']
            
            wx.igsEvent.report("闪屏-1.2.1闪屏结束-" + (openid ? "false" : "true"))
            if (dt > showTime) {
                boot['stepStop'] = stepAll
                boot()
            } else {
                boot['stepStop'] = preStep
                boot()
                setTimeout(() => {
                    boot['stepStop'] = stepAll
                    boot()
                }, showTime - dt);
            }
        })
    })
}
