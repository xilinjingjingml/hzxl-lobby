/*
 * @Description: 
 * @Version: 1.0
 * @Autor: liuhongbin
 * @Date: 2021-10-18 14:42:13
 * @LastEditors: liuhongbin
 * @LastEditTime: 2021-10-26 10:42:47
 */
// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { igs } from "../igs";
let izx = igs.izx
const { ccclass, property } = cc._decorator;

@ccclass
export default class LoadingEx extends cc.Component implements igs.listener.IBundleBatchUpdateListener {
    onOneLoadSuccess(uds: igs.hotUpdate.UpdateData): void {
        igs.log("==onOneLoadSuccess==", uds.bundleName)
        if (uds.bundleName === "hzxlStart") {
            igs.platform.trackEvent(igs.platform.TrackNames.IGS_PRELOAD_BUNDLES_SUCCESS_igaoshou)
        }
        if (uds.bundleName !== "hzxlStart" && uds.bundleName !== "main" && uds.bundleName !== "resources") {
            igs.platform.trackEvent(igs.platform.TrackNames.IGS_PRELOAD_BUNDLES_SUCCESS_game)
        }
    }
    onOneLoadFailed(uds: igs.hotUpdate.UpdateData): void {
        igs.log("==onOneLoadFailed==", uds.bundleName)
    }
    onCheckRemoteUpdateFailed(bundles: igs.bundle.BundleConfig[]): void {
        igs.log("==onCheckRemoteUpdateFailed==", bundles.length)
    }
    onOneDownloadInfoFailed(ud: igs.hotUpdate.UpdateData): void {
        igs.log("==onOneDownloadInfoFailed==", ud.bundleName)
    }
    onOneDownloadInfoSuccess(ud: igs.hotUpdate.UpdateData): void {
        igs.log("==onOneDownloadInfoSuccess==", ud.bundleName, ud.totalToDownloadBytesCount)
    }
    onOneDownloadSuccess(ud: igs.hotUpdate.UpdateData): void {
        igs.log("==onOneDownloadSuccess==", ud.bundleName, ud.totalToDownloadBytesCount, ud.downloadedByteCount)
    }
    onDownloadProgress(data: igs.hotUpdate.UpdateData): void {
        igs.log("==onDownloadProgress==", data.bundleName, data.downloadedByteCount, data.totalToDownloadBytesCount)
        this.downloadedBytes[data.bundleName] = data.downloadedByteCount
        this.updateProgress(data)
    }
    onAllDownloadInfoSuccess(uds: igs.hotUpdate.UpdateData[]): void {
        igs.log("==onAllDownloadInfoSuccess==")
        uds.forEach((ud) => {
            igs.log("detail: ", ud.totalToDownloadBytesCount, ud.bundleName)
            this.totalBytes += ud.totalToDownloadBytesCount
        })
        igs.log("total bytes", this.totalBytes)
    }
    onSomeDownloadInfoFailed(uds: igs.hotUpdate.UpdateData[]): void {
        igs.log("==onSomeDownloadInfoFailed==", uds.length)
    }
    onAllDownloadSuccess(uds: igs.hotUpdate.UpdateData[]): void {
        igs.log("==onAllDownloadSuccess==")
        uds.forEach((ud) => {
            igs.log("detail: ", ud.totalToDownloadBytesCount, ud.downloadedByteCount, ud.bundleName)
        })
        // 清空下载文字
        this.setUpdateProgressText("")
    }
    onSomeDownloadFailed(uds: igs.hotUpdate.UpdateData[]): void {
        igs.log("==onSomeDownloadFailed==")
    }
    onAllLoadSuccess(uds: igs.hotUpdate.UpdateData[]): void {
        igs.log("==onAllLoadSuccess==", uds.length)
        uds.forEach((ud) => {
            igs.log("detail: ", ud.bundleName)
        })
        this.batchLoadSuccess(uds)
    }
    onSomeLoadFailed(uds: igs.hotUpdate.UpdateData[]): void {
        igs.log("==onSomeLoadFailed==", uds.length)
        let hasigaoshou = false,
            hasgame = false
        for (let i of uds) {
            igs.log("load failed detail", i.ret, i.downloadedByteCount, i.totalToDownloadBytesCount, i.bundleDir, i.bundleName, i.newVersion, i.oldVersion)
            if (i.bundleName === "hzxlStart") {
                hasigaoshou = true
            } else if (i.bundleName !== "resources" && i.bundleName !== "main" && i.bundleName !== "hzxlStart") {
                hasgame = true
            }
        }
        if (hasigaoshou) {
            igs.platform.trackEvent(igs.platform.TrackNames.IGS_PRELOAD_BUNDLES_FAILED_igaoshou)
        }
        if (hasgame) {
            igs.platform.trackEvent(igs.platform.TrackNames.IGS_PRELOAD_BUNDLES_FAILED_game)
        }

        igs.emit("BUNDLE_LOAD_FAILED")
    }
    onLoadProgress(uptData: igs.bundle.BundleLoadProgress): void {
        igs.log("==onLoadProgress==")
    }

    @property(cc.ProgressBar)
    progressBar: cc.ProgressBar = null;
    @property(cc.Label)
    progressText: cc.Label = null;
    @property(cc.Node)
    barLight: cc.Node = null;
    @property(cc.Label)
    tips: cc.Label = null;
    @property(cc.Node)
    bcgNode: cc.Node = null;

    _count = 0;
    _mockCount = 0;
    _countDt = 0
    _tips = ""

    private get count(): number {
        return this._count;
    }
    private set count(c: number) {
        this._count = Math.min(c, 1)
        if (c >= 1) {
            this._countDt = 1 / 5
        } else {
            this._countDt = Math.min(Math.max(c - this._mockCount, 0), 1) / 20
        }

        // this.refresh()
    }

    onLoad() {
        igs.log("loading on load")
        igs.platform.trackEvent(igs.platform.TrackNames.IGS_ENTER_LOADING)
        igs.on(igs.consts.Event.HOTUPDATE_OK, this.confirmUpdate, this)
        igs.on(igs.consts.Event.SKIP_FORCE_UPDATE, () => {
            this.doLoad()
        }, this)
        igs.on("CheckMainUpdate", () => {
            this.doLoad()
        })
    }

    confirmUpdate(data: igs.hotUpdate.UpdateData) {
        this.updateProgress(data)
        igs.emit(igs.consts.Event.CONFIRM_UPDATE_BUNDLE)
    }

    allUpdateData: igs.hotUpdate.UpdateData[] = null;
    totalBytes: number = 0
    downloadedBytes: { [key: string]: number } = {}
    updateProgress(data: igs.hotUpdate.UpdateData) {
        let totalBytes: number = this.totalBytes
        let totalDownloadedBytes: number = 0
        for (let i in this.downloadedBytes) {
            let bytes = this.downloadedBytes[i]
            totalDownloadedBytes += bytes
        }
        let rate = (totalDownloadedBytes || 0) / totalBytes//data.totalToDownloadBytesCount
        this.setProgresBar(rate)
        this.setUpdateProgressText(`${(totalDownloadedBytes / 1024 / 1024).toFixed(3)} / ${(totalBytes / 1024 / 1024).toFixed(3)}M`)
    }


    // update (dt) {}

    // update (dt) {}
    bundles: igs.bundle.BundleConfig[] = []
    doLoad() {
        try {
            let mainGameBundle = igs.exports.config['bootConfig']['mainGameBundle']
            // 是否本地缓存了
            let ret = cc.sys.localStorage.getItem("iGaoShouData110")
            if (ret) {
                mainGameBundle = ret
                mainGameBundle = mainGameBundle.replace(/"/g, "")
            }

            igs.log(`mainGameBundle: ${mainGameBundle}`)
            this.bundles.push(new igs.bundle.BundleConfig("iGaoShou", "hzxlStart", 0, igs.consts.Event.ENTER_IGAOSHOU, false, false),
                new igs.bundle.BundleConfig(mainGameBundle, mainGameBundle, 1, igs.consts.Event.ENTER_GAME, false, false)
                // new igs.bundle.BundleConfig("lobby", "lobby", 1, igs.consts.Event.ENTER_GAME, false, false),
            )
            igs.platform.trackEvent(igs.platform.TrackNames.IGS_PRELOAD_BUNDLES)
            igs.bundle.updateBundles(this.bundles, this)
        } catch (e) {
            throw new Error("must config mainGameBundle in config.json");
        }
    }

    batchDownloadInfoSuccess(uds: igs.hotUpdate.UpdateData[]) {
        igs.log("==batchDownloadInfoSuccess==", uds.length)
    }
    batchDownloadInfoFailed(uds: igs.hotUpdate.UpdateData[]) {
        igs.log("==batchDownloadInfoFailed==", uds.length)
    }
    batchDownloadSuccess(uds: igs.hotUpdate.UpdateData[]) {
        igs.log("==batchDownloadSuccess==", uds.length)
    }
    batchDownloadFailed(uds: igs.hotUpdate.UpdateData[]) {
        igs.log("==batchDownloadFailed==", uds.length)
    }
    batchLoadSuccess(uds: igs.hotUpdate.UpdateData[]) {
        igs.log("==batchLoadSuccess==", uds.length)

        igs.platform.trackEvent(igs.platform.TrackNames.IGS_LOBBY_LAUNCH)

        igs.emit(igs.consts.Event.BUNDLE_LOAD_PROGRESS, {
            progress: 1,
            tip: "正在加载资源，此过程不消耗流量"
        })

        igs.izx.AudioMgr.playMusic("bgm_game")
        cc.resources.load("bgm_game", cc.AudioClip, (err, res: cc.AudioClip) => {
            if (!err) {
                igs.log("set bgm")
                iGaoShouApi.SetBackgroundMusic(res)
            }
        })

        iGaoShouApi.GetMusicVolume() > 0 ? cc.audioEngine.setMusicVolume(iGaoShouApi.GetMusicVolume()) : cc.audioEngine.setMusicVolume(0);
        iGaoShouApi.GetEffectVolume() > 0 ? cc.audioEngine.setEffectsVolume(iGaoShouApi.GetEffectVolume()) : cc.audioEngine.setEffectsVolume(0);

        cc.assetManager.loadBundle("hzxl", (err, bundle) => {
            if (bundle) {
                bundle.loadDir("/", (err, res) => {
                    console.log("load hzxl/ ready")
                })
            }
        })

        igs.bundle.bootBundle(this.bundles.find((bundleConfig) => {
            return bundleConfig.bundle === "hzxlStart"
        }), {})
    }
    batchLoadFailed(uds: igs.hotUpdate.UpdateData[]) {
        igs.log("==batchLoadFailed==", uds.length)
    }

    setProgresBar(e) {
        this.progressBar.progress = e;
        this.barLight.x = this.progressBar.node.children[0].width - 515;
    };
    setUpdateProgressText(e) {
        this.progressText.string = e === "" ? "" : "下载中..." + e;
    };
}
