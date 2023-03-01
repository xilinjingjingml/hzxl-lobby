import BaseUI from "../../../start/script/base/BaseUI";
import { DataMgr } from "../../../start/script/base/DataMgr";
import { EventMgr } from "../../../start/script/base/EventMgr";
import { User } from "../../../start/script/data/User";
import { Constants } from "../../../start/script/igsConstants";
import { Helper } from "../../../start/script/system/Helper";
import { UserSrv } from "../../../start/script/system/UserSrv";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GetAwardEntry extends BaseUI {
    @property(cc.Layout)
    itemArea: cc.Layout = null
    @property(cc.Node)
    itemNode: cc.Node = null

    onOpen() {
        console.log("GetAwardEntry onOpen", this.param)
        this.initEvent()
        this.initData()
        this.initButton()
        // this.updateData()
        this.node.zIndex = 11

        EventMgr.dispatchEvent(Constants.EVENT_DEFINE.SHOW_BANNER)

        let bgAni = this.getNode("node/bgAni").getComponent(sp.Skeleton)
        bgAni.setCompleteListener(() => {
            this.setSpineAni("node/bgAni", "xunhuan", true)
        })
    }

    onClose() {
        cc.log("===getAwardclose")
        EventMgr.dispatchEvent(Constants.EVENT_DEFINE.HIDE_BANNER)
    }

    protected start(): void {
        //this.runTween("node/light", cc.tween().repeatForever(cc.tween().to(2, { angle: 180 }).to(2, { angle: 360 }).set({ angle: 0 })))
        this.itemNode.active = false

        DataMgr.data.Bundle.load("sound/gxhd", cc.AudioClip, (err, res: cc.AudioClip) => {
            if (err) {
                return
            }

            cc.audioEngine.playEffect(res, false)
        })
    }

    setParam(data) {
        this.param = data
    }

    initEvent() {
        EventMgr.once(Constants.EVENT_DEFINE.BANNER_HEIGHT, (msg) => {            
            // this.getNode("node/bgAni").scaleY = 0.8
            // this.getNode("node").y += 80
            // this.getNode("node/tip").y += 60
        }, this)
    }

    initButton() {
        this.setButtonClick("btnClose", ()=>{
            this.close()
        })
    }

    initData() {
        if (this.param.member) {
            cc.find("node/membertip", this.node).active = true
        }

        let awards = this.param.awards
        if (!awards) {
            this.close()
        }

        
        for (let i in awards) {
            let a = awards[i]
            let node = cc.instantiate(this.itemNode)            
            this.itemArea.node.addChild(node)
            node.active = true
            node.name = "item" + a.item_id
            this.runTween(node.getChildByName("light"), cc.tween().repeatForever(cc.tween().to(2, { angle: 180 }).to(2, { angle: 360 }).set({ angle: 0 })))

            if (a.item_id === DataMgr.data.Config.mainItemId) {
                this.setSpriteFrame("icon", node, "image/common_hzxl/jinbi1", true)
                this.setLabelValue("num", node, "" + Helper.FormatNumWYCN(a.item_num))
            } else if (a.item_id === Constants.ITEM_INDEX.GAME_DIAMOND) {
                this.setSpriteFrame("icon", node, "image/common_hzxl/zuanshi1", true)
                this.setLabelValue("num", node, "" + a.item_num)
            } else if (a.item_id === Constants.ITEM_INDEX.GAME_BEAN) {
                this.setSpriteFrame("icon", node, "image/common_hzxl/bean", true)
                this.setLabelValue("num", node, "" + Helper.FormatNumWYCN(a.item_num))
            } else if (a.item_id === Constants.ITEM_INDEX.MemberCard) {
                this.setSpriteFrame("icon", node, "image/awardPop/touxiangframe", true)
                this.setLabelValue("num", node, "" + a.item_num + "天")
                this.setSpriteFrame("itemname", node, "image/awardPop/huiyuantouxiangkuang", true)
            }else if (a.item_id === Constants.ITEM_INDEX.ROTARY_TABLE_COIN) {
                this.setSpriteFrame("icon", node, "image/common_hzxl/icon_zhuanpan", true)
                this.setLabelValue("num", node, "" + Helper.FormatNumWYCN(a.item_num))
            }else if (a.item_id === Constants.ITEM_INDEX.MJ_DOUBLE_CARD) {
                this.setSpriteFrame("icon", node, "image/common_hzxl/double_card/double", false)
                this.getNode("icon", node).scale = 0.4
                this.setLabelValue("num", node, "" + Helper.FormatNumWYCN(a.item_num))
            }else if (a.item_id === Constants.ITEM_INDEX.MJ_CAPPED_CARD) {
                this.setSpriteFrame("icon", node, "image/common_hzxl/double_card/cappend", false)
                this.getNode("icon", node).scale = 0.4
                this.setLabelValue("num", node, "" + Helper.FormatNumWYCN(a.item_num))
            }
            if (UserSrv.GetItemInfo(a.item_id)) {
                this.setLabelValue("name", node, UserSrv.GetItemInfo(a.item_id).name)
            }
        }

        // EventMgr.dispatchEvent(Constants.EVENT_DEFINE.UPDATE_USER_ITEM)
        //TODO 界面动画弹出        
        // let nodes = this.getNode("node")
        // nodes.active = false
        // cc.tween(nodes)
        //     .call(() => {
        //         nodes.active = true
        //         nodes.opacity = 0
        //         nodes.scale = 0.1
        //     })
        //     .to(0.25, { opacity: 255, scale: 1.2 })
        //     .to(0.06, { scale: 1 })
        //     .start()
    }

    showAni() {
        this.node.children.forEach(i => i.active = false)
        let awards = this.param.awards
        for (let i in awards) {
            let a = awards[i]
            let n = this.getNode("item" + a.item_id)
            let pos = this.node.convertToWorldSpaceAR(n.position)

            this.createAni(a.item_id, Number(a.item_num), pos)
        }
    }

    createAni(id: number, num: number, startPos: cc.Vec3) {
        let src = num
        num = Math.max(10, num > 20 ? 20 : num)
        for (let i = 0; i < num; i++) {
            let pos = cc.Vec2.ZERO
            pos.x = startPos.x + Math.random() * 100 - 50
            pos.y = startPos.y + Math.random() * -20
            let spt = new cc.Node()
            spt.addComponent(cc.Sprite)
            cc.director.getScene().addChild(spt)
            spt.getComponent(cc.Sprite).sizeMode = cc.Sprite.SizeMode.TRIMMED
            let tPos = cc.Vec2.ZERO
            if (id === Constants.ITEM_INDEX.WCOIN) {
                this.setSpriteFrame(spt, "image/icon/big_weibi")
                tPos = this.node.convertToNodeSpace(cc.v2(cc.winSize.width / 3 + 50, cc.winSize.height - 120))
            } else if (id === Constants.ITEM_INDEX.LOTTERY) {
                this.setSpriteFrame(spt, "image/icon/daoju-jiangquan1")
                tPos = this.node.convertToNodeSpace(cc.v2(cc.winSize.width / 3 - 50, cc.winSize.height - 120))
            } else if (id === Constants.ITEM_INDEX.DIAMOND) {
                this.setSpriteFrame(spt, "image/icon/big_zuanshi")
                tPos = this.node.convertToNodeSpace(cc.v2(cc.winSize.width / 3 * 2 + 80, cc.winSize.height - 120))
            }

            spt.width = 39
            spt.height = 40

            spt.setPosition(startPos)
            spt.setScale(1)

            let x = Math.random() * 200 - 100
            let y = Math.random() * 200

            var born = [cc.v2(startPos.x, startPos.y), cc.v2(startPos.x + (pos.x - startPos.x) / 2, startPos.y + Math.random() * 80), pos]
            var bezier = [cc.v2(pos.x - x, pos.y + y), cc.v2(pos.x - x, pos.y + y), tPos]//cc.v2(cc.winSize.width / 2 - 40, cc.winSize.height - 126)];
            var bezierTo = cc.bezierTo(.8, bezier);
            let t = null
            if (i === num - 1) {
                t = cc.tween()
                    .call(() => {
                        if (id === Constants.ITEM_INDEX.LOTTERY) {
                            User.Lottery += src
                        } else if (id === Constants.ITEM_INDEX.DIAMOND) {
                            User.Diamond += src
                        }
                        EventMgr.dispatchEvent(Constants.EVENT_DEFINE.UPDATE_USER_ITEM, { bAni: true })
                        this.close()
                    })
            } else {
                t = cc.tween().delay(0)
            }

            cc.tween(spt)
                .delay(0.02 * i)
                .parallel(
                    cc.tween()
                        .delay(.1)
                        .to(.1, { position: cc.v3(born[1]) })
                        .to(.15, { position: cc.v3(born[2]) }),
                    cc.tween()
                        .to(.2, { scale: 1.5 })
                )
                .delay(.3)
                .parallel(
                    cc.tween().then(bezierTo),
                    cc.tween().to(.8, { scale: 1 })
                )
                .to(0.2, { opacity: 0 })
                .then(t)
                .call(() => {
                    spt.destroy()
                })
                .start()
        }
    }
}
