import { CardIndex, Fan, OperatorCode, CheckType, LackType } from "./hzxl-Constants";

import { igs } from "../igs";
import EventTrack, { TrackNames } from "./hzxl-EventTrack";

export namespace scmjUtil {
    var chairId = -1
    var isPicReady = false
    var loadTimer = 0
    export const BUNDLE_NAME = "hzxl"

    export function setChairId(chairId) {
        this.chairId = chairId
    }

    export function s2c(index) {
        let maxPlyNum = 4
        return (index - this.chairId + maxPlyNum) % maxPlyNum + 1
    }

    export function c2s(index) {
        let maxPlyNum = 4
        return (this.chairId + index + maxPlyNum) % maxPlyNum - 1
    }

    export function pathNode(name, mapPaths, parent): cc.Node {
        let node = null
        for (let key in mapPaths) {
            node = cc.find(mapPaths[key] + name, parent)
            if (node) {
                break
            }
        }
        if (node) {
            return node
        } else {
            console.log("pathNode did't find node of name ", name)
            return null
        }
    }

    export function addIntoPath(name, mapPaths, parent, child) {
        console.log("addIntoPath name ", name)
        let node = this.pathNode(name, mapPaths, parent)
        if (node) {
            node.addChild(child)
        }
    }

    export function stopLoaderTimer() {
        if (this.loadTimer != 0) {
            clearInterval(this.loadTimer)
            this.loadTimer = 0
        }
    }

    export function startLoaderTimer(callback) {
        this.stopLoaderTimer()
        this.loadTimer = setInterval(() => {
            if (isPicReady) {
                this.stopLoaderTimer()
                callback && callback()
                return
            }
        }, 1.0)
    }

    export function preLoadPic(callback?) {
        if (isPicReady) {
            callback && callback()
            return
        } else if (callback) {
            this.startLoaderTimer(callback)
            return
        }
        cc.assetManager.loadBundle("hzxl", (err, bundle) => {
            if (err) {

            } else {
                bundle.loadDir("images/", (err, res) => {
                    console.log("load hzxl images ready")
                    isPicReady = true
                    callback && callback()
                })
            }
        });
    }

    /** ???????????????????????? */
    export function preLoadDir(dirs: string[], callback?: () => void) {
        let bundle = cc.assetManager.getBundle(BUNDLE_NAME)
        let dir = dirs.pop()
        if (bundle) {
            bundle.preloadDir(dir + "/", (err, res) => {
                console.log("preload " + BUNDLE_NAME + "/" + dir + " ready")
                if (dirs.length > 0) {
                    scmjUtil.preLoadDir(dirs, callback)
                } else {
                    callback && callback()
                }
            })
        } else {
            cc.assetManager.loadBundle(BUNDLE_NAME, (err, bundle) => {
                if (err) {

                } else {
                    bundle.preloadDir(dir + "/", (err, res) => {
                        console.log("preload " + BUNDLE_NAME + "/" + dir + " ready")
                        if (dirs.length > 0) {
                            scmjUtil.preLoadDir(dirs, callback)
                        } else {
                            callback && callback()
                        }
                    })
                }
            })
        }
    }

    /** ????????????????????? */
    export function loadDir(dirs: string[], callback?: () => void) {
        let bundle = cc.assetManager.getBundle(BUNDLE_NAME)
        let dir = dirs.pop()
        if (bundle) {
            let onProgress = function (finish: number, total: number, item: cc.AssetManager.RequestItem) {
                igs.emit("load_asset_progress", { finish: finish, total: total, item: item })
            }
            bundle.loadDir(dir + "/", onProgress, (err, res) => {
                console.log("load " + BUNDLE_NAME + "/" + dir + " ready")
                if (dirs.length > 0) {
                    scmjUtil.loadDir(dirs, callback)
                } else {
                    callback && callback()
                }
            })
        } else {
            cc.assetManager.loadBundle(BUNDLE_NAME, (err, bundle) => {
                if (err) {

                } else {
                    bundle.loadDir(dir + "/", (err, res) => {
                        console.log("load " + BUNDLE_NAME + "/" + dir + " ready")
                        if (dirs.length > 0) {
                            scmjUtil.loadDir(dirs, callback)
                        } else {
                            callback && callback()
                        }
                    })
                }
            })
        }
    }


    /** ????????????????????????????????? */
    export function loadAsset(pathName: string, type: typeof cc.Asset, callback: (asset: any) => void): any {
        let bundle = cc.assetManager.getBundle(BUNDLE_NAME)
        if (bundle) {
            let asset = bundle.get(pathName, type)
            if (asset) {
                callback(asset)
            } else {
                bundle.load(pathName, type, (err, res) => {
                    if (err) {

                    } else {
                        callback(res)
                    }
                })
            }
        } else {
            cc.assetManager.loadBundle(BUNDLE_NAME, (err, bundle) => {
                if (err) {

                } else {
                    bundle.load(pathName, type, (err, res) => {
                        if (err) {

                        } else {
                            callback(res)
                        }
                    })
                }
            })
        }
    }

    export function playDiceAni(vecDices, parent, callback) {
        cc.log("playDiceAni")
        this.loadAsset("images/dice/ani", cc.Texture2D, (res) => {
            if (!res) {
                callback()
                return
            }
            for (let key in vecDices) {
                let nPoint = vecDices[key]
                let sRect = cc.rect(0, 0, 900, 1932)
                let size = cc.size(0, 0)
                let offset = cc.v2(0, 0)
                let frames = []
                for (let i = 0; i < 9; ++i) {
                    size.width = 100
                    size.height = 322
                    let width = 100
                    let height = 322
                    let orgPoint = sRect.origin
                    let rect = cc.rect(orgPoint.x + ((nPoint - 1) * 9 + i) % 9 * 100, orgPoint.y + Math.floor(((nPoint - 1) * 9 + i) / 9) % 6 * 322, size.width, size.height)
                    frames[i] = new cc.SpriteFrame(res, rect, false, offset, size)
                }
                let nodeDice = new cc.Node();
                nodeDice.scale = 0.4
                nodeDice.name = 'NodeDice';
                let sprite = nodeDice.addComponent(cc.Sprite);
                sprite.spriteFrame = frames[8]
                nodeDice.parent = parent;
                nodeDice.x = (key == "1" ? -22 : 8)
                nodeDice.y = 125
                let animation = nodeDice.addComponent(cc.Animation);
                let clip = cc.AnimationClip.createWithSpriteFrames(frames, 9);
                clip.name = 'anim_dice';
                clip.wrapMode = cc.WrapMode.Default;
                clip.speed = 2
                animation.addClip(clip)
                if (key == "1") {
                    animation.on('finished', () => {
                        nodeDice.runAction(cc.sequence(cc.delayTime(1.0), cc.removeSelf(true)))
                    })
                } else {
                    animation.on('finished', () => {
                        nodeDice.runAction(cc.sequence(cc.delayTime(1.0), cc.callFunc(callback), cc.removeSelf(true)))
                    })
                }
                animation.play("anim_dice")
            }
        })
    }

    export function isCrak(card) {
        if (card >= CardIndex.CrakStart && card <= CardIndex.CrakEnd) {
            return true
        } else {
            return false
        }
    }

    export function isBam(card) {
        if (card >= CardIndex.BamStart && card <= CardIndex.BamEnd) {
            return true
        } else {
            return false
        }
    }

    export function isDot(card) {
        if (card >= CardIndex.DotStart && card <= CardIndex.DotEnd) {
            return true
        } else {
            return false
        }
    }

    export function sortLack(handcards, lack = -1) {
        // console.log("sortLack lack = ", lack)
        if (handcards[0] == -1) {
            return handcards
        }
        let lacks = []
        let laizis = []
        let crak = []
        let bam = []
        let dot = []

        for (let card of handcards) {
            let cardValue = parseInt(card / 10 + "")
            if (card == 41) {
                laizis.push(card)
            } else if (lack != -1 && cardValue == lack) {
                lacks.push(card)
            } else if (cardValue == LackType.CRAK) {
                crak.push(card)
            } else if (cardValue == LackType.BAM) {
                bam.push(card)
            } else if (cardValue == LackType.DOT) {
                dot.push(card)
            }
        }
        let temp = [crak, bam, dot]
        temp.sort(function (a, b) { return b.length - a.length })
        for (let v of temp) {
            for (let card of v) {
                laizis.push(card)
            }
        }
        for (let card of lacks) {
            laizis.push(card)
        }
        console.log("sortLack return ", lacks, laizis, crak, bam, dot)

        return laizis
    }

    export function fanConfig(fan): string {
        switch (fan) {
            case Fan.ShiBaLuoHan:
                return "????????????"
            case Fan.DaSanYuan:
                return "?????????"
            case Fan.DaSiXi:
                return "?????????"
            case Fan.ShiSanYao:
                return "?????????"
            case Fan.JiuBaoLianDeng:
                return "????????????"
            case Fan.QingLongQiDui:
                return "????????????"
            case Fan.TianHu:
                return "??????"
            case Fan.DiHu:
                return "??????"
            case Fan.XiaoSiXi:
                return "?????????"
            case Fan.XiaoSanYuan:
                return " ?????????"
            case Fan.ZiYiSe:
                return "?????????"
            case Fan.QingQiDui:
                return "?????????"
            case Fan.QingPeng:
                return "??????"
            case Fan.QiDui:
                return "??????"
            case Fan.QingYiSe:
                return "?????????"
            case Fan.HunPeng:
                return "??????"
            case Fan.GangShangKaiHua:
                return " ????????????"
            case Fan.PengPengHu:
                return "?????????"
            case Fan.HunYiSe:
                return "?????????"
            case Fan.MenQianQing:
                return "?????????"
            case Fan.ZiMo:
                return "??????"
            case Fan.GangHouPao:
                return "?????????"
            case Fan.QiangGangHu:
                return "?????????"
            case Fan.PingHu:
                return "??????"
            case Fan.MingGang:
                return "??????"
            case Fan.AnGang:
                return "??????"
            case Fan.BuGang:
                return "??????"
            case Fan.JinGouGou:
                return "?????????"
            case Fan.DaiYaoJiu:
                return "?????????"
            case Fan.JiangDui:
                return "??????"
            case Fan.QingJinGouGou:
                return "????????????"
            case Fan.QingDaiYaoJiu:
                return "?????????"
            case Fan.QingShiBaLuoHan:
                return "???????????????"
            case Fan.HaiDiLaoYue:
                return "????????????"
            case Fan.HaiDiPao:
                return "?????????"
            case Fan.SuHu:
                return "??????"
            case Fan.BianZhang:
                return "??????"
            case Fan.KanZhang:
                return "??????"
            case Fan.DanDiao:
                return "??????"
            case Fan.YiBanGao:
                return "?????????"
            case Fan.LiuLianShun:
                return "?????????"
            case Fan.ShuangTongKe:
                return "?????????"
            case Fan.LaoShaoPei:
                return "?????????"
            case Fan.DuanYaoJiu:
                return "?????????"
            case Fan.ShuangAnKe:
                return "?????????"
            case Fan.ZhuoWuKui:
                return "?????????"
            case Fan.BuQiuRen:
                return "?????????"
            case Fan.WuXingBaGua:
                return "????????????"
            case Fan.YiTiaoLong:
                return "?????????"
            case Fan.SanAnKe:
                return "?????????"
            case Fan.DaYuWu:
                return "?????????"
            case Fan.XiaoYuWu:
                return "?????????"
            case Fan.SanJieGao:
                return "?????????"
            case Fan.QuanShuangKe:
                return "?????????"
            case Fan.BaiWanShi:
                return "?????????"
            case Fan.TuiBuDao:
                return "?????????"
            case Fan.ShiErJinChai:
                return "????????????"
            case Fan.SiJieGao:
                return "?????????"
            case Fan.LvYiSe:
                return "?????????"
            case Fan.ShouZhongBaoYi:
                return "????????????"
            case Fan.QuanXiao:
                return "??????"
            case Fan.QuanZhong:
                return "??????"
            case Fan.QuanDa:
                return "??????"
            case Fan.LongQiDui:
                return "?????????"
            case Fan.QuanDaiWu:
                return "?????????"
            case Fan.SiAnKe:
                return "?????????"
            case Fan.ShuangLongQiDui:
                return "????????????"
            case Fan.LianQiDui:
                return "?????????"
            case Fan.QuanYaoJiu:
                return "?????????"
            case Fan.YiSeShuangLongHui:
                return "???????????????"
            case Fan.SanLongQiDui:
                return "????????????"
        }
        return ""
    }

    export function opcodeConfig(op): string {
        switch (op) {
            case OperatorCode.OP_KONG:
            case OperatorCode.OP_KONG_TURN:
                return "??????"
            case OperatorCode.OP_KONG_DARK:
                return "??????"
            case OperatorCode.OP_HU_DIANPAO:
                return "??????"
            case OperatorCode.OP_HU_ZIMO:
                return "??????"
            case OperatorCode.OP_HU_AFTER_KONG_TURN:
                return "?????????"
        }
        return ""
    }

    export function checkTypeConfig(type): string {
        switch (type) {
            case CheckType.ChaHuaZhu:
                return "?????????"
            case CheckType.ChaDaJiao:
                return "?????????"
            case CheckType.ChaTingTuiShui:
                return "????????????"
            case CheckType.GangShangPaoTuiGang:
                return "????????????"
        }
        return ""
    }

    export function isKong(op): boolean {
        switch (op) {
            case OperatorCode.OP_KONG:
            case OperatorCode.OP_KONG_TURN:
            case OperatorCode.OP_KONG_DARK:
                return true
        }
        return false
    }

    export function isHu(op): boolean {
        switch (op) {
            case OperatorCode.OP_HU_DIANPAO:
            case OperatorCode.OP_HU_ZIMO:
            case OperatorCode.OP_HU_AFTER_KONG_TURN:
                return true
        }
        return false
    }

    export function hex2color(hexColor: string) {
        const hex = hexColor.replace(/^#?/, "0x");
        const c = parseInt(hex);
        const r = c >> 16;
        const g = (65280 & c) >> 8;
        const b = 255 & c;
        return cc.color(r, g, b, 255);
    };

    //??????2??????????????????2???????????????2 ?????????0
    export function toDecimal2NoZero(x) {
        var f = Math.round(x * 100) / 100;
        var s = f.toString();
        return s;
    }

    // ????????????
    export function numberFormat2(value) {
        let param = null;
        param = {}
        let k = 10000,
            sizes = ['', '???', '???', '??????'],
            i;
        if (value < k) {
            param.value = value
            param.unit = ''
        } else {
            i = Math.floor(Math.log(value) / Math.log(k));

            param.value = ((value / Math.pow(k, i))).toFixed(2);
            param.value = toDecimal2NoZero(param.value)
            param.unit = sizes[i];
        }
        return param.value + param.unit;
    }

    export function FormatNumWYCN(num: number): string {
        if (num < 100000) {
            return num.toString()
        }
        let strNum = "" + num
        let len = strNum.length
        let head = parseInt(strNum.substr(0, 4))
        let point = len % 4
        point = point === 0 ? 4 : point
        let strHead = "" + head / Math.pow(10, (4 - point))
        // if (len / 5 > 4)
        //     return strHead + "t"
        // else if (len / 5 > 3)
        //     return strHead + "b"
        // else 
        if (len / 4 > 3)
            return strHead + "wy"
        else if (len / 4 > 2)
            return strHead + "y"
        else if (len / 4 > 1)
            return strHead + "w"
        return strNum
    }

    //??????????????????
    export function setupAvatarImage(e, t) {
        if (t) {
            var n = e,
                o = n.getComponent(cc.Sprite),
                i = n.width,
                a = n.height;
            cc.assetManager.loadRemote(t, {
                ext: ".png"
            }, function (e, t: cc.Texture2D) {
                if (!e) {
                    var r = new cc.SpriteFrame(t);
                    if (n.isValid) {
                        o.spriteFrame = r;
                        n.setContentSize(i, a);
                    }
                }
            });
        }
    };

    // ?????????????????????
    export function addGameRoundMatch() {
        let track = cc.sys.localStorage.getItem(TrackNames.GAME_ROUND_41_MATCH)
        if (track && track.length > 0) {
        } else {
            EventTrack.add(TrackNames.GAME_ROUND_41_MATCH)
            cc.sys.localStorage.setItem(TrackNames.GAME_ROUND_41_MATCH, "41")
        }
    }

    // ???????????????????????????????????????
    export function addGameRoundBeginGame() {
        let track = cc.sys.localStorage.getItem(TrackNames.GAME_ROUND_42_BEGIN_GAME)
        if (track && track.length > 0) {
            track = parseInt(track)
            if (42 == track) {
                track = cc.sys.localStorage.getItem(TrackNames.GAME_ROUND_51_BEGIN_GAME)
                if (track && track.length > 0) {
                } else {
                    EventTrack.add(TrackNames.GAME_ROUND_51_BEGIN_GAME)
                    cc.sys.localStorage.setItem(TrackNames.GAME_ROUND_51_BEGIN_GAME, "51")
                }
            }
        } else {
            EventTrack.add(TrackNames.GAME_ROUND_42_BEGIN_GAME)
            cc.sys.localStorage.setItem(TrackNames.GAME_ROUND_42_BEGIN_GAME, "42")
        }
    }

    // ???????????????????????????????????????
    export function addGameRoundEndGame() {
        let track = cc.sys.localStorage.getItem(TrackNames.GAME_ROUND_43_END_GAME)
        if (track && track.length > 0) {
            track = parseInt(track)
            if (43 == track) {
                track = cc.sys.localStorage.getItem(TrackNames.GAME_ROUND_52_END_GAME)
                if (track && track.length > 0) {
                } else {
                    EventTrack.add(TrackNames.GAME_ROUND_52_END_GAME)
                    cc.sys.localStorage.setItem(TrackNames.GAME_ROUND_52_END_GAME, "52")
                }
            }
        } else {
            EventTrack.add(TrackNames.GAME_ROUND_43_END_GAME)
            cc.sys.localStorage.setItem(TrackNames.GAME_ROUND_43_END_GAME, "43")
        }
    }

    // ???????????????????????????
    export function addGameRoundNextGame() {
        let track = cc.sys.localStorage.getItem(TrackNames.GAME_ROUND_44_NEXT_GAME)
        if (track && track.length > 0) {
        } else {
            EventTrack.add(TrackNames.GAME_ROUND_44_NEXT_GAME)
            cc.sys.localStorage.setItem(TrackNames.GAME_ROUND_44_NEXT_GAME, "44")
        }
    }
}
