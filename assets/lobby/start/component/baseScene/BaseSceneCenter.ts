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
export default class BaseSceneCenter extends BaseUI {

   start() {
      this.initData()
      this.initEvent()
      this.initButton()
   }

   initEvent() {
   }

   initData() {
      let matchInfo: IMatchInfo = DataMgr.getData(Constants.DATA_DEFINE.GAMEING_MATCH_INFO)
      console.log("matchInfo", matchInfo)
      if (matchInfo) {
         if (matchInfo.labals.indexOf(Constants.GAME_TYPE_LABLE.MAJIONG_HZXL) >= 0
            || matchInfo.labals.indexOf(Constants.GAME_TYPE_LABLE.MAJIONG_6HZXL) >= 0
            || matchInfo.labals.indexOf(Constants.GAME_TYPE_LABLE.MAJIONG_XLCH) >= 0) {
            this.onPressHzxl()
         } else if (matchInfo.labals.indexOf(Constants.GAME_TYPE_LABLE.MAJIONG_XZHSZ) >= 0) {
            this.onPressXzhsz()
         } else if (matchInfo.labals.indexOf(Constants.GAME_TYPE_LABLE.MAJIONG_8HZXL) >= 0) {
            this.onPressFk8hz()
         } else if (matchInfo.labals.indexOf(Constants.GAME_TYPE_LABLE.DDZ_SANREN) >= 0
            || matchInfo.labals.indexOf(Constants.GAME_TYPE_LABLE.DDZ_BXP) >= 0
            || matchInfo.labals.indexOf(Constants.GAME_TYPE_LABLE.DDZ_QDZ) >= 0
            || matchInfo.labals.indexOf(Constants.GAME_TYPE_LABLE.DDZ_ERDDZ) >= 0) {
            this.onPressSanren()
         }
      }
   }

   initButton() {
      this.setButtonClick("right/room/hzxl", () => {
         this.onPressHzxl()
      })

      this.setButtonClick("right/room/fk8hz", () => {
         this.onPressFk8hz()
      })

      this.setButtonClick("right/room/xzhsz", () => {
         this.onPressXzhsz()
      })

      this.setButtonClick("right/room/xlhsz", () => {
         this.onPressXlhsz()
      })

      this.setButtonClick("right/room/sanren", () => {
         this.onPressSanren()
      })

      this.setButtonClick("right/room/btnPaiWei", () => {
         Helper.OpenTip("敬请期待")
      })

      this.setButtonClick("right/room/btnOtherGame", () => {
         UIMgr.OpenUI("component/OtherGames/OtherGames", { single: true, param: {} })
      })

      this.setButtonClick("right/room/btnMore", () => {
         UIMgr.OpenUI("component/MoreGame/MoreGame", { single: true, param: {} })
      })

      this.setButtonClick("right/room/btnJoinRoom", () => {
         UIMgr.OpenUI("component/PrivateRoom/JoinRoom", { single: true })
      })

      this.setButtonClick("right/room/btnCreateRoom", () => {
         UIMgr.OpenUI("component/PrivateRoom/PrivateRoom", { single: true })
      })

      this.setButtonClick("right/room/btnHaoyoufang", () => {
         // 好友房界面
         UIMgr.OpenUI("component/PrivateRoom/PrivateRoomPop", {single:true, param:{}})
      })
   }

   setParam(param: any) {
      this.param = param
      this.setChildParam("btnQuickGame", { label: this.param.gameLabel })
   }

   onPressHzxl() {
      let labels = [
         Constants.GAME_TYPE_LABLE.MAJIONG_HZXL,
         Constants.GAME_TYPE_LABLE.MAJIONG_6HZXL,
         Constants.GAME_TYPE_LABLE.MAJIONG_XLCH
      ]
      UIMgr.OpenUI("component/GameSession/GameSession", { single: true, param: { labels: labels } })
   }

   onPressXzhsz() {
      UIMgr.OpenUI("component/GameSession/GameSession", { single: true, param: { labels: [Constants.GAME_TYPE_LABLE.MAJIONG_XZHSZ] } })
   }

   onPressFk8hz() {
      UIMgr.OpenUI("component/GameSession/GameSession", { single: true, param: { labels: [Constants.GAME_TYPE_LABLE.MAJIONG_8HZXL] } })
   }

   onPressXlhsz() {
      UIMgr.OpenUI("component/GameSession/GameSession", { single: true, param: { labels: [Constants.GAME_TYPE_LABLE.MAJIONG_XLCH] } })
   }

   onPressSanren() {
      let labels = [
         Constants.GAME_TYPE_LABLE.DDZ_BXP,
         Constants.GAME_TYPE_LABLE.DDZ_SANREN,
         Constants.GAME_TYPE_LABLE.DDZ_QDZ,
         Constants.GAME_TYPE_LABLE.DDZ_ERDDZ
      ]
      UIMgr.OpenUI("component/GameSession/GameSession", { single: true, param: { labels: labels } })
   }
}
