import { Util } from "../../../start/script/api/utilApi";
import BaseUI from "../../../start/script/base/BaseUI";
import { DataMgr } from "../../../start/script/base/DataMgr";
import { UIMgr } from "../../../start/script/base/UIMgr";
import { User } from "../../../start/script/data/User";
import { Constants } from "../../../start/script/igsConstants";
import { ActivitySrv } from "../../../start/script/system/ActivitySrv";
import { Helper } from "../../../start/script/system/Helper";




const { ccclass, property } = cc._decorator;

@ccclass
export default class SettingPop extends BaseUI {
    onOpen() {
        console.log("SettingPop this.param", this.param)

        this.initData()
        this.initEvent()
        this.initButton()
    }

    protected start(): void {
        if(!Helper.isInLobbyScene()){
            this.setActive("bg_Popup", false)
        }
    }
    
    initEvent() {
       
    }

    initButton(){
        this.setButtonClick("node/item1/btnBind", ()=>{
            this.onPressBind()
        })

        this.setButtonClick("node/item1/btnSwitch", ()=>{
            this.onPressSwitch()
        })

        this.setButtonClick("node/item3/btnDHM", ()=>{
            this.onPressDHM()
        })

        this.setButtonClick("node/item3/btnSM", ()=>{
            this.onPressSM()
        })

        this.setButtonClick("node/item3/btnZHAQ", ()=>{
            this.onPressZHAQ()
        })

        this.setButtonClick("node/item3/btnKF", ()=>{
            this.onPressKF()
        })

        this.setButtonClick("node/item3/btnFWXY", ()=>{
            this.onPressFWXY()
        })

        this.setButtonClick("node/item3/btnJZJH", ()=>{
            this.onPressJZJH()
        })

        this.setButtonClick("node/item3/btnYSXY", ()=>{
            this.onPressYSXY()
        })
        
        this.setButtonClick("node/btnClose", ()=>{
            this.close()
        })

        this.setToggleClick("node/item2/music/toggle", ()=>{
            let toggle = cc.find("node/item2/music/toggle", this.node)
            Util.SetMusicVolume(toggle.getComponent(cc.Toggle).isChecked?1:0)
        })

        this.setToggleClick("node/item2/effect/toggle", ()=>{
            let toggle = cc.find("node/item2/effect/toggle", this.node)
            Util.SetEffectVolume(toggle.getComponent(cc.Toggle).isChecked?1:0)
        })

        this.setToggleClick("node/item2/vibration/toggle", ()=>{
            let toggle = cc.find("node/item2/vibration/toggle", this.node)
            Util.SetVibrationVolume(toggle.getComponent(cc.Toggle).isChecked?1:0)
        })
    }

    initData() {        
        let showId = User.Data.openId.split("-")
        this.setLabelValue("node/item1/userInfo/gold/num", User.MainToken)
        this.setLabelValue("node/item1/userInfo/nickName", User.UserName)
        this.setLabelValue("node/item1/userInfo/uid", "ID:" + showId[showId.length-1])
        this.setSpriteFrame("node/item1/userInfo/head/spt", User.Avatar, true)

        let env = ""
        let igsEnv = DataMgr.getData(Constants.DATA_DEFINE.IGS_ENV)
        if(igsEnv == Constants.ENV.ENV_SANDBOX){
            env = ".t"
        }else if(igsEnv == Constants.ENV.ENV_ABROAD){
            env = ".a"
        }
        this.setLabelValue("node/item3/version/ver", Constants.version + "." + Constants.auditCode + env)

        let toggle = cc.find("node/item2/music/toggle", this.node)
        toggle.getComponent(cc.Toggle).isChecked = Util.GetMusicVolume() == 1
        toggle = cc.find("node/item2/effect/toggle", this.node)
        toggle.getComponent(cc.Toggle).isChecked = Util.GetEffectVolume() == 1
        toggle = cc.find("node/item2/vibration/toggle", this.node)
        toggle.getComponent(cc.Toggle).isChecked = Util.GetVibrationVolume() == 1

        if(DataMgr.data.OnlineParam.custom_service != 1){
            this.setActive("node/item3/btnKF", false)
        }
    }

    //????????????
    onPressBind(){
        console.log("onPressBind")
    }

    //????????????
    onPressSwitch(){
        console.log("onPressSwitch")
    }

    //?????????
    onPressDHM(){
        console.log("onPressDHM")
        UIMgr.OpenUI("component/Setting/ExchangePop", {single:true})
    }

    //??????
    onPressSM(){
        console.log("onPressSM")
    }
    
    //????????????
    onPressZHAQ(){
        console.log("onPressZHAQ")
    }

    //??????
    onPressKF(){
        console.log("onPressKF")
        UIMgr.OpenUI("component/Setting/KeFu", {single: true, param:{}})
    }

    //????????????
    onPressFWXY(){
        console.log("onPressFWXY")
        UIMgr.OpenUI("component/Setting/Agreement", {single: true, param:{type: 1}})
    }

    //????????????
    onPressJZJH(){
        console.log("onPressJZJH")
    }

    //????????????
    onPressYSXY(){
        console.log("onPressYSXY")
        UIMgr.OpenUI("component/Setting/Agreement", {single: true, param:{type: 2}})
    }
}
