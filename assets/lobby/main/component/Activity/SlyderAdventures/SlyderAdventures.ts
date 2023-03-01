/**
 * Creator by Jin on 2022.3.16
*/
import BaseUI from "../../../../start/script/base/BaseUI";
import { UIMgr } from "../../../../start/script/base/UIMgr";
import { ActivitySrv } from "../../../../start/script/system/ActivitySrv";
import { Constants } from "../../../../start/script/igsConstants";
import { Helper } from "../../../../start/script/system/Helper";
import { AdSrv } from "../../../../start/script/system/AdSrv";
import { EventMgr } from "../../../../start/script/base/EventMgr";
import { User } from "../../../../start/script/data/User";
import { DataMgr } from "../../../../start/script/base/DataMgr";

//转盘类型
enum RotaryTable {
    None = -1,
    Free,
    Advanced,
    Max,
}

const {ccclass, property} = cc._decorator;

@ccclass
export default class SlyderAdventures extends BaseUI {
    @property(cc.SpriteFrame)
    goldSpriteFrame: cc.SpriteFrame = null
    @property(cc.SpriteFrame)
    diamondSpriteFrame: cc.SpriteFrame = null

    curRotaryTable:RotaryTable = RotaryTable.None //当前显示
    buyFristBox = true  //首充礼包是否购买
    itemPrefab: cc.Node = null
    curActivityConfig:any = null

    onOpen(): void {
        this.initData()
        this.initButton()
        this.initEvent()
    }

    protected start(): void {
        this.itemPrefab = this.getNode("node/item")
        this.itemPrefab.active = false
        this.setActive("block", false)
        this.setActive("node/rt/free/btns/btn_buyCount", this.node, false)
        
        this.setActive("node/rt/free/btns/btn_addCount", false)
        this.setActive("node/rt/free/btns/btn_buyCount", false)
        this.setActive("node/rt/free/btns/btn_countOver", false)
        this.setActive("node/rt/free/btns/btn_freeGet", true)        
        this.setActive("node/rt/gold", false)
    }

    initButton(){
        this.setButtonClick("node/btnClose", this.node, ()=>{this.close()})
        this.setButtonClick("node/rt/free/btns/btn_addCount", this.node, this.onPressAddCount.bind(this))
        this.setButtonClick("node/rt/free/btns/btn_buyCount", this.node, this.onPressBuyCount.bind(this))
        this.setButtonClick("node/rt/free/btns/btn_freeGet", this.node, this.onPressFreeGet.bind(this))

        this.setButtonClick("node/rt/gold/btn_start", this.node, this.onPressStart.bind(this))
        this.setButtonClick("node/rt/gold/tableGolden", this.node, this.onPressRotaryTableBox.bind(this))

        this.setToggleClick("node/tab/toggle/toggle1", ()=>{
            this.onChangePage(RotaryTable.Free)
        })

        this.setToggleClick("node/tab/toggle/toggle2", ()=>{
            this.onChangePage(RotaryTable.Advanced)
        })

        this.setButtonClick("node/btnHelp", this.node, ()=>{
            UIMgr.OpenUI("component/Activity/SlyderAdventures/SlyderAdventuresHelp", { single: true, param: { } })
        })
    }

    initData(){
        this.onChangePage(RotaryTable.Free)        
        this.updateRotaryGolden()
    }

    initEvent() {
        EventMgr.on(Constants.EVENT_DEFINE.UPDATE_USER_ITEM, this.updateRotaryGolden, this)  
    }

    onChangePage(rt: RotaryTable){
        if(this.curRotaryTable != rt){
            this.curRotaryTable = rt
            let info = null
            if(rt == RotaryTable.Free){
                info = ActivitySrv.GetActivityById(4)
                this.setActive("node/rt/free",true)
                this.setActive("node/rt/gold", false)
            }else if(rt == RotaryTable.Advanced){
                info = ActivitySrv.GetActivityById(1014)
                this.setActive("node/rt/free",false)
                this.setActive("node/rt/gold", true)
            }
            this.initRotaryTableData(info)
        }
    }

    initRotaryTableData(activityConfig:any){
        const node_table = this.getNode("node/rt/RT_table")
        node_table.rotation = 0
        node_table.removeAllChildren()

        
        console.log("activityConfig", activityConfig)
        if(activityConfig){
            this.curActivityConfig = activityConfig
            //角度
            let angle = 0
            
            for(let i = 0; i < activityConfig.weight.length; i++){
                const item = cc.instantiate(this.itemPrefab)
                item.angle = angle + 45*i
                item.active = true
                item.parent = node_table
                
                //ITEM DATA
                this.setLabelValue("lbl_rewardNum", item, activityConfig.weight[i].rewards[0].min_num )
                if(activityConfig.weight[i].rewards[0].item_id == DataMgr.data.Config.mainItemId){
                    this.setSpriteFrame("icon", item, this.goldSpriteFrame, true)
                }else{
                    this.setSpriteFrame("icon", item, this.diamondSpriteFrame, true)
                }                
                item.active = true
            }
            
            this.updateCurCount()
            if(this.curRotaryTable == RotaryTable.Advanced){                
                this.setLabelValue("node/rt/gold/btn_start/lbl", activityConfig.cost_item.item_num )
            }
        }
    }

    updateRotaryTableData(){
        if(this.curRotaryTable == RotaryTable.Free){
            this.curActivityConfig = ActivitySrv.GetActivityById(4)
        }else if(this.curRotaryTable == RotaryTable.Advanced){
            this.curActivityConfig = ActivitySrv.GetActivityById(1014)
        }
        this.updateCurCount()
    }

    

    //剩余次数 1.今日免费：（8~7） 2.看广告、购买次数（6~1）3.用完（0）
    updateCurCount(){
        if(this.curRotaryTable == RotaryTable.Free){
            this.curActivityConfig.receive_num = this.curActivityConfig.receive_num || 0
            let day_times = this.curActivityConfig.day_times
            if(this.buyFristBox){//首充礼包购买过总次数-1
                // day_times = this.curActivityConfig.day_times - 1
            }
            let count = day_times - this.curActivityConfig.receive_num

            let cur_count_free = 0
            if(this.curActivityConfig.receive_num == 0){
                cur_count_free = 2
            }else if(this.curActivityConfig.receive_num == 1){
                cur_count_free = 1
            }
            this.setLabelValue("node/rt/free/lbl_count", this.node, cur_count_free + "次")            
            
            this.setActive("node/rt/free/btns/btn_addCount", this.node, false)
            this.setActive("node/rt/free/btns/btn_buyCount", this.node, false)
            this.setActive("node/rt/free/btns/btn_countOver", this.node, false)
            this.setActive("node/rt/free/btns/btn_freeGet", this.node, false)

            if(count == 0){
                this.setActive("node/rt/free/btns/btn_countOver", this.node, true)
            }else if(this.curActivityConfig.receive_num >= 2){
                if(count > 1 || (count == 1 && this.buyFristBox)){
                    this.setActive("node/rt/free/btns/btn_addCount", this.node, true)
                }
                if(!this.buyFristBox){
                    this.setActive("node/rt/free/btns/btn_buyCount", this.node, true)                    
                }
            }else{
                this.setActive("node/rt/free/btns/btn_freeGet", this.node, true)
            }
        }
    }

    //FREE四个按钮：1.增加次数 2.购买次数 3.免费获取
    onPressAddCount(){
        console.log("jin---onPressAddCount")
        //看广告
        if (this.curActivityConfig.ad_aid && this.curActivityConfig.ad_aid > 0) {
            AdSrv.createAdOrder(this.curActivityConfig.ad_aid, JSON.stringify(this.curActivityConfig), (res: IPlayAdCallBack) => {
                if (res && res.order_no && res.order_no.length > 0) {
                    AdSrv.completeAdOrder((res) => {
                        if (res && res.code == "00000") {
                            ActivitySrv.GetActivityConfig(this.curActivityConfig.activity_id)
                            if (res.award_list) {
                                let res1 = Helper.ParseJson(res.award_list, "slyderAdventures")
                                if (res1 && res1.err_code == 1) {
                                    res1.reward_index = res1.reward_index || 0
                                    if (res1.reward_index) {
                                        this.startTurnAni(res1, RotaryTable.Free)
                                    }
                                } else if (res1.err_msg) {
                                    Helper.OpenTip(res1.err_msg)
                                } else {
                                    Helper.OpenTip("未知错误")
                                }
                            }
                        }
                    })
                } else {
                    console.log("jin---onPressAddCount err")
                }
            })
        }
    }

    onPressBuyCount(){
        console.log("jin---onPressBuyCount")
    }
 
    onPressFreeGet(){
        console.log("jin---onPressFreeGet")

        let param = {
            activity_id: this.curActivityConfig.activity_id,
            delay_award: 1
        }
        ActivitySrv.GetRewardParam(param, (res) => {
            if (res && res.err_code == 1) {
                res.reward_index = res.reward_index || 0
                this.startTurnAni(res, RotaryTable.Free)
            } else if (res.err_msg) {
                Helper.OpenTip(res.err_msg)
            }
        })
            
    }

    onPressStart(){
        console.log("jin---onPressStart") 
        const cost_num = this.curActivityConfig.cost_item.item_num
        if(User.RotaryTableCoin < cost_num){
            this.onPressRotaryTableBox()
            Helper.OpenTip("转盘币不足")
            return
        }

        let param = {
            activity_id: this.curActivityConfig.activity_id,
            delay_award: 1
        }

        ActivitySrv.GetRewardParam(param, (res) => {
            if (res && res.err_code == 1) {
                res.reward_index = res.reward_index || 0
                this.startTurnAni(res, RotaryTable.Advanced)
            } else if (res.err_msg) {
                Helper.OpenTip(res.err_msg)
            }
        })
    }

    //刷新 转盘币 数量
    updateRotaryGolden(){
        this.setLabelValue("node/rt/gold/tableGolden/num",this.node, User.RotaryTableCoin)
    }

    onPressRotaryTableBox(){
        if(Helper.isAudit()){
            //IOS审核处理
        }else{
            UIMgr.OpenUI("component/Activity/SlyderAdventures/SlyderAdventuresBox", { single: true, param: { } })
        }
    }


    startTurnAni(res: any, rt:RotaryTable) {
        //0.转的角度 1.转盘 2.转完打开奖励界面
        const table = this.getNode("node/rt/RT_table")
        let angle = 3600 + (res.reward_index * (360 / this.curActivityConfig.weight.length))
        angle = -angle
        console.log("jin---startTurnAni reward_index: ", res.reward_index)

        let param = {
            activity_id: rt == RotaryTable.Free ? this.curActivityConfig.activity_id : this.curActivityConfig.activity_id
        }
        let openAward = (cb:Function)=>{
            ActivitySrv.GetDelayReward(param, () => {
                UIMgr.OpenUI("component/Shop/GetAwardEntry",
                {
                    param: { awards: res.award_item, autoOpenBox: true },
                },  () => {
                    cb && cb()
                })
            })
        }
        
        this.setActive("block", true)
        //加上指定物品 所对应角度  angle + 45*i(从0开始)
        cc.tween(table)
            .to(5, { angle: angle }, { easing: "cubicInOut" })
            .set({ angle: angle % 360 })
            // .call(() => {
            // })
            .delay(.2)
            .call(() => {
                openAward && openAward(()=>{                    
                    this.setActive("block", false)
                    ActivitySrv.GetActivityConfig(this.curActivityConfig.activity_id, ()=>{
                        this.updateRotaryTableData()
                    })
                })
            })
            .start()
    }
}
