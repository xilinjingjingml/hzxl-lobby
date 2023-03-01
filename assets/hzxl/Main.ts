import { igs } from "../igs";
import { PlatformApi } from "../lobby/start/script/api/platformApi";

let izx = igs.izx
// let BaseUI = izx.BaseUI

const { ccclass, property } = cc._decorator;

@ccclass
export default class Main extends cc.Component {
    onOpen() {
        izx.log("CardLayer onOpen")

    }

    onClose() {
        izx.log("CardLayer onClose")
    }

    protected onLoad(): void {
        PlatformApi.GotoLobby()
    }
}
