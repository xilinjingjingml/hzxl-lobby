/**
 * Creator by Jin on 2022.3.18
*/
import BaseUI from "../../../start/script/base/BaseUI";
import { User } from "../../../start/script/data/User";


const {ccclass, property} = cc._decorator;

@ccclass
export default class Backpack extends BaseUI {

    onOpen(): void {
        console.log("jin---Backpack")
        this.initButton()
        this.initData()
        this.initContainer()
    }

    initButton(){
        this.setButtonClick("node/btnClose", this.node, ()=>{this.close()})
    }

    initData(){

    }

    initContainer(){
        
        const content = this.getNode("node/scrollView/view/content", this.node)
        const item = this.getNode("item",content)
        item.active = false

        const data = 0

        console.log("User.Items", User.Items)
        //TODO 1.无道具 2.有道具
        if(!data){
            
            this.setActive("node/lbl_none", this.node, true)
            return
        }

        for(let i = 0; i < data; i++){
            const curItem = cc.instantiate(item)
            curItem.active = true
            curItem.parent = content

            // todo initItem
            // this.initItem()
            this.setLabelValue("card_name", curItem, "海底老岳卡")
            this.setLabelValue("num", curItem, "x10")
            this.setLabelValue("lbl_use", curItem, "去使用啦")
            // this.setSpriteFrame("icon", item, data.pic)

            const event = new cc.Component.EventHandler()
            event.target = this.node
            event.component = "Backpack"
            event.handler = "onPressUse"
            // event.customEventData = data as any //TODO 添加数据，传给点击事件
            item.getComponent(cc.Button).clickEvents.push(event)
        }
    }

    initItem(){

    }

    onPressUse(data){
        console.log("jin---onPressUse")
    }
}
