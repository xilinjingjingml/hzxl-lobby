
import { igs } from "../igs";
import izx = igs.izx;
import { Constants } from "../lobby/start/script/igsConstants";
import { EventMgr } from "../lobby/start/script/base/EventMgr";
import { scmjUtil } from "./hzxl-Util";

const GAME_BUNDLE_NAME = "hzxl"
const GAME_ID = "09965902-5d1e-4632-ac38-8d4551dc1142"

const HZXL_SVR = "hzxl_svr"

export default class Scmj {
    // class Scmj {
    private static _first = true
    private static _instance: Scmj
    static getInstance(): Scmj {
        if (!Scmj._instance) {
            Scmj._instance = new Scmj()
            Scmj._instance._init()
        }

        return Scmj._instance
    }

    private _init() {
        console.log("Scmj init")
        // izx.preloadBundle.push(GAME_BUNDLE_NAME)

        // izx.on(Constants.EventName.ROOM_JOIN_NOTIFY, this.enterGame, this)
        EventMgr.on("room_enter_game", this.enterGame, this)
        EventMgr.on("room_exit_game", this.exitGame, this)


        EventMgr.on(Constants.EVENT_DEFINE.GAME_START, this.onGameStart, this)
        EventMgr.on(Constants.EVENT_DEFINE.REALTIME_MATCH_CONFIRM_NOT, this.onGameStart, this)
        // this.loadGame()
        // if (!CC_EDITOR){
        //   scmjUtil.preLoadPic()
        // }
        // this._scmj.autoRegHander()
    }

    onGameStart() {
    }

    private enterGame(msg) {
        console.log("Scmj enterGame", msg)
        if (msg.matchInfo.gameId === GAME_ID) {
            // if (!izx.isInGameScene) {
            this.loadGame()
            // Scmj.getInstance()._scmj.unLoad()
            // Scmj.getInstance().loadGame()
            // } else {
            //     this._scmj.afterEnterScmj()
            // }
        }
    }

    private exitGame(msg) {
        console.log("Scmj exitGame")
        
    }

    private loadGame() {
        console.log("Scmj loadGame")
        scmjUtil.loadDir([""], () => {
            let onProgress = function (finish: number, total: number, item: cc.AssetManager.RequestItem){
                igs.emit("load_asset_progress", {finish:finish, total:total, item:item})
            }
            cc.assetManager.getBundle(scmjUtil.BUNDLE_NAME).loadScene("Main", onProgress, (err, scene) => {
                cc.director.runSceneImmediate(scene)
            })
        })
    }
}

let scmj = Scmj.getInstance()
// export default scmj
// EventMgr.once(Constants.EVENT_DEFINE.LOGIN_SUCCESS, () => {
//     let scmj = Scmj.getInstance()
// })