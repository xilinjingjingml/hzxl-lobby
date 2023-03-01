import { igs } from "../../../../igs";
import BaseUI from "../../script/base/BaseUI";
import { EventMgr } from "../../script/base/EventMgr";
import { UIMgr } from "../../script/base/UIMgr";
import { User } from "../../script/data/User";
import { Constants } from "../../script/igsConstants";
import { WxProxyWrapper } from "../../script/pulgin/WxProxyWrapper";
import { AccountSrv } from "../../script/system/AccountSrv";
import { ActivitySrv } from "../../script/system/ActivitySrv";
import { Helper } from "../../script/system/Helper";


const { ccclass, property } = cc._decorator;

@ccclass
export default class BaseSceneTop extends BaseUI {

    _lottery: number = null


    start() {
        this.initData()
        this.initButton()
        this.initEvent()
        // this.getNode("left/content").x += igs.exports.safeArea.left
    }

    initEvent() {
        EventMgr.on(Constants.EVENT_DEFINE.LOGIN_SUCCESS, () => {
            this.updateData()
        }, this)
    }

    initButton() {
        this.setButtonClick("left/content/btnHead", () => {
            if (cc.sys.platform == cc.sys.WECHAT_GAME) {
                WxProxyWrapper.checkUserScope("userInfo", (canUse)=>{
                    if(!canUse){
                        let userInfoTask = ActivitySrv.GetActivityById(1001)
                        if (userInfoTask && (!userInfoTask.receive_num || userInfoTask.receive_num < 1)) {
                            let param = {
                                callback: ()=>{
                                    this.onPressHead()
                                }
                            }
                            UIMgr.OpenUI("component/Activity/UserInfoConsent", { single: true , param : param})
                        }else{
                            this.onPressHead()
                        }
                    }else{
                        this.onPressHead()
                    }
                })
                
            }else{
                this.onPressHead()
            }            
        })
    }

    initData() {
        this.updateData()
    }

    updateData() {
        this.setLabelValue("left/content/nickName", User.UserName)
        this.setSpriteFrame("left/content/head/spt", User.Avatar, true)
    }

    onPressHead() {
        UIMgr.OpenUI("component/Personal/PersonalPop", { single: true })
    }
}
