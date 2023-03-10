const utils = require('../../../common/utils');

if (window.__globalAdapter) {
    let globalAdapter = window.__globalAdapter;
    // SystemInfo
    let systemInfo = wx.getSystemInfoSync();
    let windowWidth = systemInfo.windowWidth;
    let windowHeight = systemInfo.windowHeight;
    let isLandscape = windowWidth > windowHeight;
    globalAdapter.isSubContext = (wx.getOpenDataContext === undefined);
    globalAdapter.isDevTool = (systemInfo.platform === 'devtools');
    utils.cloneMethod(globalAdapter, wx, 'getSystemInfoSync');

    // TouchEvent
    utils.cloneMethod(globalAdapter, wx, 'onTouchStart');
    utils.cloneMethod(globalAdapter, wx, 'onTouchMove');
    utils.cloneMethod(globalAdapter, wx, 'onTouchEnd');
    utils.cloneMethod(globalAdapter, wx, 'onTouchCancel');

    // Audio
    utils.cloneMethod(globalAdapter, wx, 'createInnerAudioContext');

    // AudioInterruption Evnet
    utils.cloneMethod(globalAdapter, wx, 'onAudioInterruptionEnd');
    utils.cloneMethod(globalAdapter, wx, 'onAudioInterruptionBegin');

    // Video
    utils.cloneMethod(globalAdapter, wx, 'createVideo');

    // FrameRate
    utils.cloneMethod(globalAdapter, wx, 'setPreferredFramesPerSecond');

    // Keyboard
    utils.cloneMethod(globalAdapter, wx, 'showKeyboard');
    utils.cloneMethod(globalAdapter, wx, 'hideKeyboard');
    utils.cloneMethod(globalAdapter, wx, 'updateKeyboard');
    utils.cloneMethod(globalAdapter, wx, 'onKeyboardInput');
    utils.cloneMethod(globalAdapter, wx, 'onKeyboardConfirm');
    utils.cloneMethod(globalAdapter, wx, 'onKeyboardComplete');
    utils.cloneMethod(globalAdapter, wx, 'offKeyboardInput');
    utils.cloneMethod(globalAdapter, wx, 'offKeyboardConfirm');
    utils.cloneMethod(globalAdapter, wx, 'offKeyboardComplete');

    // Message
    utils.cloneMethod(globalAdapter, wx, 'getOpenDataContext');
    utils.cloneMethod(globalAdapter, wx, 'onMessage');

    // SharedCanvas
    utils.cloneMethod(globalAdapter, wx, 'getSharedCanvas');

    // Font
    utils.cloneMethod(globalAdapter, wx, 'loadFont');

    // hide show Event
    utils.cloneMethod(globalAdapter, wx, 'onShow');
    utils.cloneMethod(globalAdapter, wx, 'onHide');

    // onError
    utils.cloneMethod(globalAdapter, wx, 'onError');
    // offError
    utils.cloneMethod(globalAdapter, wx, 'offError');

    // Accelerometer
    let isAccelerometerInit = false;
    let deviceOrientation = 1;
    if (wx.onDeviceOrientationChange) {
        wx.onDeviceOrientationChange(function (res) {
            if (res.value === 'landscape') {
            deviceOrientation = 1;
            }
            else if (res.value === 'landscapeReverse') {
            deviceOrientation = -1;
            }
        });
    }
    Object.assign(globalAdapter, {
        startAccelerometer (cb) {
            if (!isAccelerometerInit) {
                isAccelerometerInit = true;
                wx.onAccelerometerChange && wx.onAccelerometerChange(function (res) {
                    let resClone = {};
                    let x = res.x;
                    let y = res.y;
                    if (isLandscape) {
                        let tmp = x;
                        x = -y;
                        y = tmp;
                    }

                    resClone.x = x * deviceOrientation;
                    resClone.y = y * deviceOrientation;
                    resClone.z = res.z;
                    cb && cb(resClone);
                });
            }
            else {
                wx.startAccelerometer && wx.startAccelerometer({
                    fail (err) {
                        console.error('start accelerometer failed', err);
                    },
                    // success () {},
                    // complete () {},
                });
            }
        },

        stopAccelerometer () {
            wx.stopAccelerometer && wx.stopAccelerometer({
                fail (err) {
                    console.error('stop accelerometer failed', err);
                },
                // success () {},
                // complete () {},
            });
        },
    });

    // safeArea
    // origin point on the top-left corner
    globalAdapter.getSafeArea = function () {
        let safeAreaInfo = systemInfo.safeArea
        console.info('getSafeArea', systemInfo);
        if (!safeAreaInfo) {
            safeAreaInfo = {top:systemInfo.statusBarHeight, left:0, bottom:systemInfo.windowHeight, right:systemInfo.windowWidth, width:systemInfo.windowWidth, height:systemInfo.windowHeight-systemInfo.statusBarHeight}
            console.warn('getSafeArea failed', safeAreaInfo);
        } else {
            console.info('getSafeArea', safeAreaInfo);
        }
        let { top, left, bottom, right, width, height } = safeAreaInfo;
        // HACK: on iOS device, the orientation should mannually rotate
        if (systemInfo.platform === 'ios' && !globalAdapter.isDevTool && isLandscape) {
            let tempData = [right, top, left, bottom, width, height];
            top = windowHeight - tempData[0];
            left = tempData[1];
            bottom = windowHeight - tempData[2];
            right = tempData[3];
            height = tempData[4];
            width = tempData[5];
        }
        return { top, left, bottom, right, width, height };
    }
}