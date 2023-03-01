/*
 * @Description: 
 * @Version: 1.0
 * @Autor: liuhongbin
 * @Date: 2021-07-15 11:05:27
 * @LastEditors: liuhongbin
 * @LastEditTime: 2021-12-01 09:23:12
 */
"use strict";
let bootOver = false
let step = 0,
    preStep = 1,
    stepAll = 2
let doing = false
let openid = wx.getStorageSync("iGaoShouData5")
var settings
let eventStr
window.boot = function() {
    if (doing) {
        return
    }
    doing = true
    if (window._CCSettings) {
        settings = window._CCSettings;
        window._CCSettings = undefined;
    }
    var launchScene = settings.launchScene; // load scene
    
    var onStart = function onStart() {
        cc.view.enableRetina(true);
        cc.view.resizeWithBrowserSize(true);

        cc.game.emit("EVENT_BEFORE_LOAD_LAUNCHSCENE", function() {
            wx.igsEvent.report("闪屏-1.4loading界面资源加载-" + (openid ? "false" : "true"))
            cc.director.loadScene(launchScene, null, function () {
                console.log('Success to load scene: ' + launchScene);
                // 加载启动场景结束
                wx.igsEvent.report("闪屏-1.4.1loading界面资源加载结束-" + (openid ? "false" : "true"))
                doing = false
                step = stepAll
            });
        })
    }

    var option = {
        id: 'GameCanvas',
        debugMode: settings.debug ? cc.debug.DebugMode.INFO : cc.debug.DebugMode.ERROR,
        showFPS: !isSubContext && settings.debug,
        frameRate: 60,
        groupList: settings.groupList,
        collisionMatrix: settings.collisionMatrix
    };

    if (step === 0) {
        var isSubContext = cc.sys.platform === cc.sys.WECHAT_GAME_SUB;
        cc.assetManager.init({
            bundleVers: settings.bundleVers,
            subpackages: settings.subpackages,
            remoteBundles: settings.remoteBundles,
            server: settings.server,
            subContextRoot: settings.subContextRoot
        });
        var RESOURCES = cc.AssetManager.BuiltinBundleName.RESOURCES;
        var INTERNAL = cc.AssetManager.BuiltinBundleName.INTERNAL;
        var MAIN = cc.AssetManager.BuiltinBundleName.MAIN;
        var START_SCENE = cc.AssetManager.BuiltinBundleName.START_SCENE;
        var bundleRoot = [INTERNAL];
        settings.hasResourcesBundle && bundleRoot.push(RESOURCES);
        settings.hasStartSceneBundle && bundleRoot.push(MAIN);
        var count = 0;

        console.log(bundleRoot)

        function cb(err) {
            if (err) return console.error(err.message, err.stack);
            count++;

            if (count === bundleRoot.length + 1) {
                // if there is start-scene bundle. should load start-scene bundle in the last stage
                // Otherwise the main bundle should be the last
                cc.assetManager.loadBundle(settings.hasStartSceneBundle ? START_SCENE : MAIN, function (err) {
                    if (!err) {
                        // 加载脚本和启动包完成
                        wx.igsEvent.report("闪屏-1.3.1加载脚本和启动包完成-" + (openid ? "false" : "true"))
                        cc.director.preloadScene(launchScene)
                        step = preStep
                        if (window.boot['stepStop'] === stepAll) {
                            cc.game.run(option, onStart);
                        } else {
                            doing = false
                        }
                    } else {
                        // 加载启动包失败
                        wx.igsEvent.report("闪屏-1.3.2加载启动包失败-" + (openid ? "false" : "true"))
                        console.error("加载启动包失败")
                    }
                });
            }
        } // load plugins

        // 加载脚本和启动包开始
        wx.igsEvent.report("闪屏-1.3加载脚本和启动包-" + (openid ? "false" : "true"))
        cc.assetManager.loadScript(settings.jsList.map(function(x) {
            return 'src/' + x;
        }), cb); // load bundles
        
        for (var i = 0; i < bundleRoot.length; i++) {
            cc.assetManager.loadBundle(bundleRoot[i], cb);
        }
    } else if (step === preStep) {
        if (window.boot['stepStop'] === stepAll) {
            cc.game.run(option, onStart);
        }
    }
};
window.boot['stepAll'] = stepAll
window.boot['preStep'] = preStep
window.boot['stepStop'] = step