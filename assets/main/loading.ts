import { igs } from "../igs";

/*
 * @Description: 
 * @Version: 1.0
 * @Autor: liuhongbin
 * @Date: 2020-11-02 10:40:56
 * @LastEditors: liuhongbin
 * @LastEditTime: 2021-10-18 16:56:53
 */
let izx = igs.izx
let BaseUI = izx.BaseUI
const {ccclass, property} = cc._decorator;


@ccclass
export default class Loading extends BaseUI {

    @property([dragonBones.ArmatureDisplay])
    dragonBones: dragonBones.ArmatureDisplay[] = []
    @property([dragonBones.ArmatureDisplay])
    liziDragonBones: dragonBones.ArmatureDisplay[] = []

    preType:number = -1
    tetrisRandCache = [0,0,0,0]
    onLoad () {
        this.schedule(() => {
            let type
            do {
                type = Math.floor(Math.random() * 4)
                if (this.preType != type && this.tetrisRandCache[type] < 1) {
                    this.preType = type
                    this.tetrisRandCache[type] += 1;
                } else {
                    type = false;
                }
            } while ( type === false );
    
            if (this.tetrisRandCache.every(function (n) {
                return n >= 1;
            })) {
                this.tetrisRandCache = [0, 0, 0, 0];
            }
            this.dragonBones[type].playAnimation("newAnimation", 1)
            this.scheduleOnce(()=>{
                this.liziDragonBones[type].playAnimation("newAnimation", 1)
            },1.3)
        }, 1)

        let background = cc.find("background", this.node)
        background.scale = cc.winSize.height / 720
    }

    onDestroy() {
        super.onDestroy()
        this.unscheduleAllCallbacks()
    }
}
