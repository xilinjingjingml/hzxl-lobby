import { igs } from "../../../../igs";
import BaseUI from "../../script/base/BaseUI";
import { DataMgr } from "../../script/base/DataMgr";
import { EventMgr } from "../../script/base/EventMgr";
import { UIMgr } from "../../script/base/UIMgr";
import { Constants } from "../../script/igsConstants";
import { AccountSrv } from "../../script/system/AccountSrv";
import { ActivitySrv, RolledCoinsSrv } from "../../script/system/ActivitySrv";
import { Helper } from "../../script/system/Helper";


const { ccclass, property } = cc._decorator;

@ccclass
export default class BaseSceneLeft extends BaseUI {
   @property(cc.Node)
   btnFirstBox: cc.Node = null
   @property(cc.Node)
   btnZhuanPan: cc.Node = null
   @property(cc.Node)
   btnYaoJinBi: cc.Node = null
   @property(cc.Node)
   btnMianFeiJinBi: cc.Node = null
   @property(cc.Node)
   btnChaoJiZheKou: cc.Node = null
   @property(cc.Node)
   btnSubscribe: cc.Node = null
   start() {
      this.initData()
      this.initEvent()
      this.initButton()

      // this.getNode("content").x += igs.exports.safeArea.left
      console.log("igs.exports.safeArea", igs.exports.safeArea)
   }
   initEvent() {
      EventMgr.on(Constants.EVENT_DEFINE.REFRESH_ACTIVITY, () => {
         this.checkZhuanPanShow()
         this.checkFreeGoldShow()
      }, this)

      EventMgr.on(Constants.EVENT_DEFINE.REFRESH_ACTIVITY_ROOLED_CONINS, () => {
         this.checkYaoJinBiShow()
      }, this)

      EventMgr.on(Constants.EVENT_DEFINE.SUBSCRIBE_UPDATE, () => {
         this.checkSubscribeShow()
      }, this)

      igs.on(igs.consts.Event.IGS_SAFEAREA_CHANGED, ()=>{
         console.log("IGS_SAFEAREA_CHANGED igs.exports.safeArea", igs.exports.safeArea)
      }, this)
   }

   initData() {
      this.checkFirstBoxShow()
      this.checkZhuanPanShow()
      this.checkYaoJinBiShow()
      this.checkFreeGoldShow()
      this.checkChaoJiZheKouBoxShow()
      this.checkSubscribeShow()
   }

   initButton(){
      this.setButtonClick(this.btnFirstBox, ()=>{
         UIMgr.OpenUI("component/Activity/FirstBox", { single: true, param: { }, closeCb: ()=>{
            this.checkFirstBoxShow()
         }})
      })
      
      this.setButtonClick(this.btnZhuanPan, ()=>{
         UIMgr.OpenUI("component/Activity/SlyderAdventures/SlyderAdventures", { single: true, param: {}, closeCb: ()=>{
            this.checkZhuanPanShow()
         }})         
      })

      this.setButtonClick(this.btnYaoJinBi, ()=>{
         UIMgr.OpenUI("component/Activity/RolledCoins/RolledCoins", { single: true, param: {} })
      })

      this.setButtonClick(this.btnMianFeiJinBi, ()=>{
         UIMgr.OpenUI("component/Activity/FreeGold/FreeGold", { single: true, param: {}, closeCb: ()=>{
            this.checkFreeGoldShow()
         }}) 
      })

      this.setButtonClick(this.btnChaoJiZheKou, ()=>{
         UIMgr.OpenUI("component/Activity/discount/DiscountBox", { single: true, param: {}, closeCb: ()=>{
            this.checkChaoJiZheKouBoxShow()
         }}) 
      }) 
      
      this.setButtonClick(this.btnSubscribe, ()=>{
         UIMgr.OpenUI("component/Activity/Subscribe/Subscribe", { single: true, param: {} })
      }) 
   }

   //????????????????????????
   checkFirstBoxShow() {
      this.setActive(this.btnFirstBox, false)
      if (Helper.isAudit() == false && DataMgr.data.OnlineParam.firstbox !== 0) {
         let boxes = DataMgr.getData<TShopBoxes>(Constants.DATA_DEFINE.SHOP_BOXES)
         if (boxes && boxes[Constants.SHOP_TYPE.FIRST_PAY]) {
            for (let idx in boxes[Constants.SHOP_TYPE.FIRST_PAY]) {
               if (!boxes[Constants.SHOP_TYPE.FIRST_PAY][idx].isBuy) {
                  this.setActive(this.btnFirstBox, true)
               }
            }
         }
      }
   }

   //??????????????????
   checkZhuanPanShow() {
      this.btnZhuanPan.active =  false
      if (DataMgr.data.OnlineParam.zhuanpan !== 0) {
         this.btnZhuanPan.active = true
      }

      this.setActive("red", this.btnZhuanPan, false)
      // let res = ActivitySrv.GetActivityById(4)
      // if(res){
      //    if (res.day_times && res.receive_num && res.receive_num >= res.day_times){
      //       this.setActive("red", this.btnZhuanPan, false)
      //    }else{
      //       this.setActive("red", this.btnZhuanPan, true)
      //    }
      // }   
   }

   //?????????????????????
   checkYaoJinBiShow() {
         this.btnYaoJinBi.active = false
      if (Helper.isAudit() == false && DataMgr.data.OnlineParam.yaojinbi !== 0) {  
         this.btnYaoJinBi.active = true       
         this.setActive("red", this.btnYaoJinBi, false)
         // RolledCoinsSrv.GetConfig(true, (res)=>{
         //    if(res.day_times-res.receive_num){
         //       this.setActive("red", this.btnYaoJinBi, true)
         //    }
         // })
      }
   }

   checkFreeGoldShow() {
      // this.setActive("red", this.btnMianFeiJinBi, false)
      this.setActive(this.btnMianFeiJinBi, false)
      if (DataMgr.data.OnlineParam.freegold !== 0) {
         this.setActive(this.btnMianFeiJinBi, true)
      let res = ActivitySrv.GetActivityById(3)
         if (res) {
            if (res.day_times && res.receive_num && res.receive_num >= res.day_times) {
            this.setActive(this.btnMianFeiJinBi, false)
            } else {
            this.setActive(this.btnMianFeiJinBi, true)
         }
         }
      }
   }

   //????????????????????????
   checkChaoJiZheKouBoxShow() {
      this.btnChaoJiZheKou.active = false

      this.setActive("red", this.btnChaoJiZheKou, false)
      if (Helper.isAudit() === false && DataMgr.data.OnlineParam.chaojizhekou !== 0) {         
         this.btnChaoJiZheKou.active = true
         // let boxList:IShopInfo[] = []
         // let boxs = DataMgr.getData<TShopBoxes>(Constants.DATA_DEFINE.SHOP_BOXES)
         // if(!boxs){
         //    return
         // }
         // for(let k in boxs[Constants.SHOP_TYPE.PREFERENCE]){
         //    if(boxs[Constants.SHOP_TYPE.PREFERENCE][k].param && boxs[Constants.SHOP_TYPE.PREFERENCE][k].param.show_in_discount == 1){
         //          boxList.push(boxs[Constants.SHOP_TYPE.PREFERENCE][k])
         //    }
         // }
         // console.log("checkChaoJiZheKouBoxShow boxList", boxList)
         // for(let box of boxList){
         //    if(!box.isBuy){
         //       this.setActive("red", this.btnChaoJiZheKou, true)
         //       break
         //    }
         // }
      }
   }

   //??????????????????
   checkSubscribeShow() {
      this.setActive(this.btnSubscribe, false)
      if (DataMgr.data.OnlineParam.dingyu !== 0) {
      let ret = false
      let res = ActivitySrv.GetActivityById(1012)
         if (res) {
            if (res.receive_num < res.day_times) {
            ret = true
         }
      }
      this.setActive(this.btnSubscribe, ret)
      this.setActive("red", this.btnSubscribe, false)
   }
   }
}
