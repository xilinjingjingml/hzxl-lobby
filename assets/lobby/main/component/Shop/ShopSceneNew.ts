/**
 * Creater by Jin on 2022.3.7
 */

import BaseUI from "../../../start/script/base/BaseUI";
import { DataMgr } from "../../../start/script/base/DataMgr";
import { EventMgr } from "../../../start/script/base/EventMgr";
import { UIMgr } from "../../../start/script/base/UIMgr";
import { User } from "../../../start/script/data/User";
import { Constants } from "../../../start/script/igsConstants";
import { ActivitySrv } from "../../../start/script/system/ActivitySrv";
import { ExchangeSrv } from "../../../start/script/system/ExchangeSrv";
import { Helper } from "../../../start/script/system/Helper";
import { ShopSvr } from "../../../start/script/system/ShopSvr";
import { UserSrv } from "../../../start/script/system/UserSrv";

// 0:特惠 1:钻石 2:金币 3:道具
 export enum ShopType {
    None = 0,
    Sale,
    Diamond,
    Gold,
    Prop,
    Max,
}

interface ItemDataInfo {
    name: string 
    price: number
    payType: number
    items: IItemInfo[]
    btnClick: Function
    discount?: number
    gift?: number
}

interface activityNode {
    activityId: number
    node:cc.Node
}

const {ccclass, property} = cc._decorator;

@ccclass
export default class ShopSceneNew extends BaseUI {
    curBox: IShopInfo = null
    curTab: ShopType = ShopType.None //当前显示
    activityNodeList:activityNode[] = new Array()

    @property(cc.SpriteFrame)
    diamondSFList:cc.SpriteFrame[] = new Array()
    @property(cc.SpriteFrame)
    goldSFList:cc.SpriteFrame[] = new Array()

    @property(cc.Node)
    contentNode:cc.Node = null
    @property(cc.Node)
    itemPrefab:cc.Node= null
    @property(cc.Node)
    yaoJinBiNode:cc.Node = null
    protected start(): void {
        this.initButton()
        this.initEvent()

        //初始化界面
        this.itemPrefab.active = false  
        this.yaoJinBiNode.active = false

        if(Helper.isAudit()){
            this.setActive("node/tab/toggle1", false)
            this.setActive("node/tab/toggle2", false)
            this.getNode("node/tab/toggle3").getComponent(cc.Toggle).isChecked = true
            this.onPressTab(ShopType.Gold)
        }else{
            let tab = this.param.tab || ShopType.Sale
            if(tab == ShopType.Sale){
                this.getNode("node/tab/toggle1").getComponent(cc.Toggle).isChecked = true
            }
            else if(tab == ShopType.Diamond){
                this.getNode("node/tab/toggle2").getComponent(cc.Toggle).isChecked = true
            }
            else if(tab == ShopType.Gold){
                this.getNode("node/tab/toggle3").getComponent(cc.Toggle).isChecked = true
            }
            else if(tab == ShopType.Prop){
                this.getNode("node/tab/toggle4").getComponent(cc.Toggle).isChecked = true
            }
            this.onPressTab(tab)
        }
    }

    initEvent() {
        EventMgr.on(Constants.EVENT_DEFINE.REFRESH_ACTIVITY, this.refreshActivityData, this)
    }

    refreshActivityData(param: any) {
        for(let v of this.activityNodeList){
            let activity = ActivitySrv.GetActivityById(v.activityId)
            if(activity.receive_num >= activity.day_times){
                this.getNode("node/btnBuy", v.node).getComponent(cc.Button).interactable = false
                this.setLabelValue("node/btnBuy/Background/node/lbl_getMode", v.node, "明日再来")
                this.setLabelInfo("node/btnBuy/Background/node/lbl_getMode", v.node, {color: cc.color(61, 65, 68)})
            }else{
                this.getNode("node/btnBuy", v.node).getComponent(cc.Button).interactable = true
            }
        }        
    }

    initButton(){
        this.setButtonClick("node/btnClose", this.node, ()=>{this.close()})
        this.setButtonClick("btn", this.yaoJinBiNode, this.onPressRockGold.bind(this))

        for(let i=1;i<5;i++){
            this.setToggleClick("node/tab/toggle"+i, ()=>{
                this.onPressTab(i)
            })
        }
    }

    getBoxList(type:ShopType): IShopInfo[]{
        let boxList:IShopInfo[] = []
        let boxs = DataMgr.getData<TShopBoxes>(Constants.DATA_DEFINE.SHOP_BOXES)
        if(this.curTab == ShopType.Sale){
            for(let k in boxs[Constants.SHOP_TYPE.PREFERENCE]){
                if(boxs[Constants.SHOP_TYPE.PREFERENCE][k].param && boxs[Constants.SHOP_TYPE.PREFERENCE][k].param.show_in_shop){
                    boxList.push(boxs[Constants.SHOP_TYPE.PREFERENCE][k])
                }
            }
        }
        else if(this.curTab == ShopType.Diamond){
            for(let k in boxs[Constants.SHOP_TYPE.NORMAL]){
                let hasDiamond = false
                for(let k1 in boxs[Constants.SHOP_TYPE.NORMAL][k].items){
                    if(boxs[Constants.SHOP_TYPE.NORMAL][k].items[k1].id == Constants.ITEM_INDEX.GAME_DIAMOND){
                        hasDiamond = true
                        break
                    }
                }
                if(hasDiamond){
                    boxList.push(boxs[Constants.SHOP_TYPE.NORMAL][k])
                }
            }
        }
        else if(this.curTab == ShopType.Gold){
        }
        else if(this.curTab == ShopType.Prop){
            
        }
        return boxList
    }

    onPressTab(tab){
        if(this.curTab == tab){
            return
        }

        this.curTab = tab
        let curTitle = "商城 · "
        if(this.curTab == ShopType.Sale){
            curTitle += "特惠"
        }
        else if(this.curTab == ShopType.Diamond){
            curTitle += "钻石"
        }
        else if(this.curTab == ShopType.Gold){
            curTitle += "金币"
        }
        else if(this.curTab == ShopType.Prop){
            curTitle += "道具"
        }
        
        if(Helper.isAudit()){
            curTitle = "兑换"
        }
        
        this.initContent()
    }

    initContent(){
        //摇金币显示
        this.yaoJinBiNode.active = this.curTab == ShopType.Sale

        const widget = this.contentNode.getComponent(cc.Widget)
        widget.left = (this.curTab == ShopType.Sale) ? 280 : 0
        widget.updateAlignment()
        
        this.contentNode.removeAllChildren(true)
        let itemIndex = 0
        if(this.curTab == ShopType.Gold){
            let param = {
                typeId: 1
            }
            ExchangeSrv.getExchangeTemplateInfo(param, (res)=>{
                console.log("getExchangeTemplateInfo", res)
                if (res && res.code == "0000") {                
                    if (res.result) {
                        res.result.sort((a ,b)=>{
                            a.output_list[0].item_num = Number(a.output_list[0].item_num)
                            b.output_list[0].item_num = Number(b.output_list[0].item_num)
                            return a.output_list[0].item_num < b.output_list[0].item_num ? -1 : 1
                        })
                        for(let v of res.result){
                            if(v.exchange_conditions && v.exchange_conditions.show_in_shop == 1){
                                let item = cc.instantiate(this.itemPrefab)
                                item.active = true
                                item.parent = this.contentNode

                                let itemInfo: ItemDataInfo = {
                                    name: v.output_list[0].item_name, 
                                    price: v.consume_list[0].item_num,
                                    payType: v.consume_list[0].item_id,
                                    items: [],
                                    btnClick: ()=>{
                                        this.exchangeTemplateInfo(v)
                                    }                                
                                }
                                for(let d of v.output_list){
                                    itemInfo.items.push({
                                        id: d.item_id,
                                        num: d.item_num,
                                    })
                                }
                                itemInfo.discount = v.exchange_conditions ? v.exchange_conditions.discount : null
                                this.initItem(item, itemInfo, itemIndex)
                                itemIndex++
                            }
                        }
                    }
                }
            })
        }else{
            //特惠界面加上免费金币
            if(this.curTab == ShopType.Sale){
                let activity = ActivitySrv.GetActivityById(10)
                if(activity){
                    let item = cc.instantiate(this.itemPrefab)
                    item.active = true
                    item.parent = this.contentNode

                    let itemInfo: ItemDataInfo = {
                        name: activity.name, 
                        price: 0,
                        payType: -1,
                        items: [],
                        btnClick: ()=>{                            
                            this.getNode("node/btnBuy", item).getComponent(cc.Button).interactable = false
                            ActivitySrv.OnClickActivity(activity)
                        }
                    }
                    for(let d of activity.weight[0].rewards){
                        itemInfo.items.push({
                            id: d.item_id,
                            num: d.max_num,
                        })
                    }
                    this.initItem(item, itemInfo, itemIndex)
                    itemIndex++
                    if(activity.receive_num >= activity.day_times){
                        this.getNode("node/btnBuy", item).getComponent(cc.Button).interactable = false
                        this.setLabelValue("node/btnBuy/Background/node/lbl_getMode", item, "明日再来")
                        this.setLabelInfo("node/btnBuy/Background/node/lbl_getMode", item, {color: cc.color(61, 65, 68)})
                    }
                    this.activityNodeList.push({activityId:10, node:item})
                }
            }

            let boxs = this.getBoxList(this.curTab)
            for(const d of boxs){
                let item = cc.instantiate(this.itemPrefab)
                item.active = true
                item.parent = this.contentNode

                
                let itemInfo: ItemDataInfo = {
                    name: d.name, 
                    price: d.price,
                    payType: -1,
                    items: [],
                    btnClick: ()=>{
                        this.onPressBuy(d)
                    }
                }

                for(let k in d.items){
                    itemInfo.items.push(d.items[k])
                }
                itemInfo.discount = d.param ? d.param.discount : null
                itemInfo.gift = d.param ? d.param.gift : null
                this.initItem(item, itemInfo, itemIndex)
                itemIndex++

                if(this.curTab == ShopType.Sale){
                    if(d.isBuy){
                        this.getNode("node/btnBuy", item).getComponent(cc.Button).interactable = false
                        this.setLabelValue("node/btnBuy/Background/node/lbl_getMode", item, "明日再来")
                        this.setLabelInfo("node/btnBuy/Background/node/lbl_getMode", item, {color: cc.color(61, 65, 68)})
                    }
                }
            }
        }
    }

    initItem(item: cc.Node, data: ItemDataInfo, itemIndex:number){
        this.setActive("node/item_kuang_1", item, this.curTab == ShopType.Sale)
        this.setActive("node/item_kuang_2", item, this.curTab != ShopType.Sale)

        this.setLabelValue("node/lbl_top", item, data.name)
        
        if(data.price == 0){
            this.setLabelValue("node/btnBuy/Background/node/lbl_getMode", item, "免费领取")
        }else if(data.payType == -1){
            this.setLabelValue("node/btnBuy/Background/node/lbl_getMode", item, "￥" + data.price/100)
        }else if(data.payType == Constants.ITEM_INDEX.GAME_DIAMOND){
            this.setActive("node/btnBuy/Background/node/icon", item, true)
            this.setLabelValue("node/btnBuy/Background/node/lbl_getMode", item, data.price)
        }

        let dataItem = data.items[0]
        if(dataItem && dataItem.id == Constants.ITEM_INDEX.GAME_DIAMOND){
            if(itemIndex < this.diamondSFList.length){
                this.setSpriteFrame("node/icon", item, this.diamondSFList[itemIndex], false)
            }else{
                this.setSpriteFrame("node/icon", item, this.diamondSFList[this.diamondSFList.length-1], false)
            }
        }else if(dataItem && dataItem.id == DataMgr.data.Config.mainItemId){    
            if(itemIndex < this.goldSFList.length){        
                this.setSpriteFrame("node/icon", item, this.goldSFList[itemIndex], false)
            }else{
                this.setSpriteFrame("node/icon", item, this.goldSFList[this.goldSFList.length-1], false)
            }
        }

        //TODO 折扣标记
        this.setActive("node/nodeSale", item, false)
        this.setActive("node/nodeGift", item, false)
        if(data.discount){
            this.setActive("node/nodeSale", item, true)
            this.setLabelValue("node/nodeSale/zhe/num", item, data.discount)
        }else if(data.gift){
            this.setActive("node/nodeGift", item, true)
            this.setLabelValue("node/nodeGift/node/num", item, data.gift)
        }

        this.setButtonClick("node/btnBuy", item, ()=>{
            data.btnClick()
        })
    }

    //支付
    onPressBuy(box: IShopInfo) {//sender, data: IShopBox
        //TODO 1.sound 2.支付
        console.log("jin---onPressBuy TODO", box)
        this.curBox = box
        if(Helper.checkPayResult()){
            this.registPayResultEvent()
        }
        ShopSvr.Pay(box, (res)=>{
            if(res && res.code == 0){
                Helper.OpenTip("支付成功")
                UserSrv.UpdateItem()
                this.onPaySuccess(box)
            }else if(res && res.msg){
                Helper.OpenTip(res.msg)
            }
        })
    }

    //todo 摇金币
    onPressRockGold(){
        console.log("jin---onPressRockGold TODO")
        UIMgr.OpenUI("component/Activity/RolledCoins/RolledCoins", { single: true, param: {} })
    }

    exchangeTemplateInfo(box: any) {
        Helper.exchangeTemplateInfo(box, (success) => {
        })
    }

    registPayResultEvent(){
        EventMgr.once(Constants.EVENT_DEFINE.FOREGROUND, ()=>{            
            if(this.curBox){
                let param = {
                    box_gid: this.curBox.boxId
                }
                ActivitySrv.GetShopPayResult(param, (res)=>{
                    if(res && res.err && res.err.code == 200){
                        UserSrv.UpdateItem(()=>{                    
                            this.onPaySuccess(this.curBox)
                        })
                    }
                })
            }            
        }, this)
    }

    onPaySuccess(box: IShopInfo){
        if(box){
            let boxes:TShopBoxes = DataMgr.getData<TShopBoxes>(Constants.DATA_DEFINE.SHOP_BOXES)
            if(boxes && boxes[box.type] && boxes[box.type][box.boxId]){
                boxes[box.type][box.boxId].isBuy = true
                DataMgr.setData(Constants.DATA_DEFINE.SHOP_BOXES, boxes)
                this.initContent()
            }
        
            let award_list = []
            for (let k in box.items) {
                award_list.push({
                    item_id: box.items[k].id,
                    item_num: box.items[k].num
                })
            }
            UIMgr.OpenUI("component/Shop/GetAwardEntry", { param: { awards: award_list, autoOpenBox: true } })
        }
    }
}
