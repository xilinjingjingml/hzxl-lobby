import BaseUI from "../../script/base/BaseUI";
import { DataMgr } from "../../script/base/DataMgr";
import { EventMgr } from "../../script/base/EventMgr";
import { Constants } from "../../script/igsConstants";


const { ccclass, property } = cc._decorator;

@ccclass
export default class BaseSceneJuese extends BaseUI {
    @property(dragonBones.ArmatureDisplay)
    playerSke:dragonBones.ArmatureDisplay = null
    start() {
        this.initEvent()
        // this.updateUserSex()

        
        let nLoopCount = 0;
        let nLoopCount2 = 0;
        // this.playerSke.playAnimation("donghua1", 1)
        // this.playerSke.addEventListener(dragonBones.EventObject.COMPLETE, () => {
        //     if (nLoopCount % 2 == 0) {
        //         if (nLoopCount2 % 2 == 0) {
        //             this.playerSke.playAnimation("donghua3", 1)
        //         }
        //         else {
        //             this.playerSke.playAnimation("donghua3", 1)
        //         }
        //         nLoopCount2++;
        //     }
        //     else {
        //         this.playerSke.playAnimation("donghua1", 1)
        //     }
        //     nLoopCount++
        // })
    }

    initEvent() {
        // EventMgr.on(Constants.EVENT_DEFINE.UPDATE_USER_SEX, this.updateUserSex, this)
    }

    updateUserSex(){
        let sex:number = DataMgr.getData(Constants.DATA_DEFINE.USER_SEX) || 0
        this.setActive("nan", sex==1)
        this.setActive("nv", !(sex==1))
     }
}
