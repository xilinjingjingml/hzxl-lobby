import BaseUI from "../../script/base/BaseUI"

const { ccclass, property } = cc._decorator;

@ccclass
export default class BaseTopRight extends BaseUI {

    onOpen() {
        this.initData()
        this.initEvent()
        this.initButton()
    }

    protected start(): void {
        this.setActive("ItemBean", false)
    }

    setParam(param: any){
        console.log("BaseTopRight setParam", param)
        if(param.itemClick == false){
            this.getNode("ItemBean/btn").getComponent(cc.Button).interactable = false
            this.getNode("ItemGold/btn").getComponent(cc.Button).interactable = false
            this.getNode("ItemDiamond/btn").getComponent(cc.Button).interactable = false
        }

        if(param.showBean){
           this.setActive("ItemBean", true)
        }
    }

    initEvent() {
    }

    initButton(){
    }

    initData() {
    }
}
