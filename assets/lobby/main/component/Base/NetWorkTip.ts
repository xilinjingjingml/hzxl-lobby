import BaseUI from "../../../start/script/base/BaseUI";



const { ccclass, property } = cc._decorator;

@ccclass
export default class NetWorkTip extends BaseUI {
    timer = null
    count = 15
    protected start(): void {
        this.initData()
        this.node.zIndex = 999
    }

    protected onDestroy(): void {
        if (this.timer != 0) {
            clearInterval(this.timer)
            this.timer = 0
        }
    }
     
    initData() {        
        this.updateData()

        this.timer = setInterval(() => {
            this.count--
            this.count = this.count < 1 ? 15 : this.count
            this.updateData()
        }, 1000)
    }



    updateData() {
        this.setLabelValue("mask/msg", "与服务器连接断开，正在努力连接中..."+"("+this.count+"s)")
    }
}
