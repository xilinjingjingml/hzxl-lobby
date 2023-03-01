import BaseUI from "../../script/base/BaseUI";
import { EventMgr } from "../../script/base/EventMgr";
import { UIMgr } from "../../script/base/UIMgr";
import { User } from "../../script/data/User";
import { Constants } from "../../script/igsConstants";
import { Helper } from "../../script/system/Helper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ItemGold extends BaseUI {

    protected start(): void {
        this.initData()
        this.initEvent()
        this.initButton()
    }

    initEvent() {
        EventMgr.on(Constants.EVENT_DEFINE.UPDATE_USER_ITEM, this.initData, this)  
    }

    initButton(){
        this.setButtonClick("btn", ()=>{
            UIMgr.OpenUI("component/Shop/ExchangeBean", { single: true, param: {  } })
        })
    }

    initData() {
        this.setLabelValue("num", Helper.FormatNumWYCN(User.GameBean))
    }
}
