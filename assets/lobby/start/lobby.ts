import { PlatformApi } from "./script/api/platformApi";
import BaseUI from "./script/base/BaseUI";

const { ccclass, property } = cc._decorator;

@ccclass
export default class lobby extends BaseUI {
    protected onLoad(): void {
        console.log("lobbyScene onLoad")
    }

    protected start(): void {
        console.log("lobbyScene start")
    }

    onEnable() {
        PlatformApi.isInLobby = true
    }

    onDisable(){
        PlatformApi.isInLobby = false
    }
}
