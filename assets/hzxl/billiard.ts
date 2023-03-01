import { igs } from "../igs";

// igs注册启动项
export default class hzxl extends igs.listener.DefaultBundleBooter {
    onMatch = function (matchInfo, opponentId, roomInfo) {
        cc.log("====hzxl onMatch ====")
        
    };
    onJoin = function (players, roomInfo) {
        cc.log("===hzxl onJoin ====")
        
        setTimeout(() => {
            window["iGaoShouApi"].ReportFinalScore(3500 + Math.floor(Math.random() * 100))
        }, 3000)
    };
    init = function (bundleConfig, initparams, cb) {
        cc.log("===hzxl init ===")
        cb(this, { success: true });
    };
}
// 模块中注册
console.log("hzxl registerBooter")
window["igs"].bundle.registerBooter("hzxl", hzxl)