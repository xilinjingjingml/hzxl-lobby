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

    /** 按目录预加载资源 */
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

    /** 按目录加载资源 */
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


    /** 按单个文件路径加载资源 */
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
                return "十八罗汉"
            case Fan.DaSanYuan:
                return "大三元"
            case Fan.DaSiXi:
                return "大四喜"
            case Fan.ShiSanYao:
                return "十三幺"
            case Fan.JiuBaoLianDeng:
                return "九宝莲灯"
            case Fan.QingLongQiDui:
                return "清龙七对"
            case Fan.TianHu:
                return "天胡"
            case Fan.DiHu:
                return "地胡"
            case Fan.XiaoSiXi:
                return "小四喜"
            case Fan.XiaoSanYuan:
                return " 小三元"
            case Fan.ZiYiSe:
                return "字一色"
            case Fan.QingQiDui:
                return "清七对"
            case Fan.QingPeng:
                return "清碰"
            case Fan.QiDui:
                return "七对"
            case Fan.QingYiSe:
                return "清一色"
            case Fan.HunPeng:
                return "混碰"
            case Fan.GangShangKaiHua:
                return " 杠上开花"
            case Fan.PengPengHu:
                return "碰碰胡"
            case Fan.HunYiSe:
                return "混一色"
            case Fan.MenQianQing:
                return "门前清"
            case Fan.ZiMo:
                return "自摸"
            case Fan.GangHouPao:
                return "杠后炮"
            case Fan.QiangGangHu:
                return "抢杠胡"
            case Fan.PingHu:
                return "平胡"
            case Fan.MingGang:
                return "明杠"
            case Fan.AnGang:
                return "暗杠"
            case Fan.BuGang:
                return "补杠"
            case Fan.JinGouGou:
                return "金钩钓"
            case Fan.DaiYaoJiu:
                return "带幺九"
            case Fan.JiangDui:
                return "将对"
            case Fan.QingJinGouGou:
                return "清金钩钓"
            case Fan.QingDaiYaoJiu:
                return "清幺九"
            case Fan.QingShiBaLuoHan:
                return "清十八罗汉"
            case Fan.HaiDiLaoYue:
                return "海底捞月"
            case Fan.HaiDiPao:
                return "海底炮"
            case Fan.SuHu:
                return "素胡"
            case Fan.BianZhang:
                return "边张"
            case Fan.KanZhang:
                return "坎张"
            case Fan.DanDiao:
                return "单钓"
            case Fan.YiBanGao:
                return "一般高"
            case Fan.LiuLianShun:
                return "六连顺"
            case Fan.ShuangTongKe:
                return "双同刻"
            case Fan.LaoShaoPei:
                return "老少配"
            case Fan.DuanYaoJiu:
                return "断幺九"
            case Fan.ShuangAnKe:
                return "双暗刻"
            case Fan.ZhuoWuKui:
                return "捉五魁"
            case Fan.BuQiuRen:
                return "不求人"
            case Fan.WuXingBaGua:
                return "五行八卦"
            case Fan.YiTiaoLong:
                return "一条龙"
            case Fan.SanAnKe:
                return "三暗刻"
            case Fan.DaYuWu:
                return "大于五"
            case Fan.XiaoYuWu:
                return "小于五"
            case Fan.SanJieGao:
                return "三节高"
            case Fan.QuanShuangKe:
                return "全双刻"
            case Fan.BaiWanShi:
                return "百万石"
            case Fan.TuiBuDao:
                return "推不倒"
            case Fan.ShiErJinChai:
                return "十二金钗"
            case Fan.SiJieGao:
                return "四节高"
            case Fan.LvYiSe:
                return "绿一色"
            case Fan.ShouZhongBaoYi:
                return "守中抱一"
            case Fan.QuanXiao:
                return "全小"
            case Fan.QuanZhong:
                return "全中"
            case Fan.QuanDa:
                return "全大"
            case Fan.LongQiDui:
                return "龙七对"
            case Fan.QuanDaiWu:
                return "全带五"
            case Fan.SiAnKe:
                return "四暗刻"
            case Fan.ShuangLongQiDui:
                return "双龙七对"
            case Fan.LianQiDui:
                return "连七对"
            case Fan.QuanYaoJiu:
                return "全幺九"
            case Fan.YiSeShuangLongHui:
                return "一色双龙会"
            case Fan.SanLongQiDui:
                return "三龙七对"
        }
        return ""
    }

    export function opcodeConfig(op): string {
        switch (op) {
            case OperatorCode.OP_KONG:
            case OperatorCode.OP_KONG_TURN:
                return "刮风"
            case OperatorCode.OP_KONG_DARK:
                return "下雨"
            case OperatorCode.OP_HU_DIANPAO:
                return "吃胡"
            case OperatorCode.OP_HU_ZIMO:
                return "自摸"
            case OperatorCode.OP_HU_AFTER_KONG_TURN:
                return "抢杠胡"
        }
        return ""
    }

    export function checkTypeConfig(type): string {
        switch (type) {
            case CheckType.ChaHuaZhu:
                return "查花猪"
            case CheckType.ChaDaJiao:
                return "查大叫"
            case CheckType.ChaTingTuiShui:
                return "查听退税"
            case CheckType.GangShangPaoTuiGang:
                return "呼叫转移"
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

    //保留2位小数，如：2，还会保留2 不会补0
    export function toDecimal2NoZero(x) {
        var f = Math.round(x * 100) / 100;
        var s = f.toString();
        return s;
    }

    // 数字转换
    export function numberFormat2(value) {
        let param = null;
        param = {}
        let k = 10000,
            sizes = ['', '万', '亿', '万亿'],
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

    //设置对手信息
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

    // 增加第一局匹配
    export function addGameRoundMatch() {
        let track = cc.sys.localStorage.getItem(TrackNames.GAME_ROUND_41_MATCH)
        if (track && track.length > 0) {
        } else {
            EventTrack.add(TrackNames.GAME_ROUND_41_MATCH)
            cc.sys.localStorage.setItem(TrackNames.GAME_ROUND_41_MATCH, "41")
        }
    }

    // 增加第一局、第二局开始游戏
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

    // 增加第一局、第二局结束游戏
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

    // 增加第一局再来一局
    export function addGameRoundNextGame() {
        let track = cc.sys.localStorage.getItem(TrackNames.GAME_ROUND_44_NEXT_GAME)
        if (track && track.length > 0) {
        } else {
            EventTrack.add(TrackNames.GAME_ROUND_44_NEXT_GAME)
            cc.sys.localStorage.setItem(TrackNames.GAME_ROUND_44_NEXT_GAME, "44")
        }
    }
}
