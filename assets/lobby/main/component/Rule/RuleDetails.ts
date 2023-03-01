import BaseUI from "../../../start/script/base/BaseUI";
import { Constants } from "../../../start/script/igsConstants";
import { Helper } from "../../../start/script/system/Helper";


const { ccclass, property } = cc._decorator;

@ccclass
export default class RuleDetails extends BaseUI {
    @property(cc.Node)
    tabToggleContent:cc.Node = null
    @property(cc.Node)
    tabTogglebPrefab:cc.Node = null
    @property(cc.RichText)
    ruleLabel:cc.RichText = null
    @property(cc.ScrollView)
    contentScrollView:cc.ScrollView = null

    showType = 0 //0显示规则 1显示番型
    curLabel = ""
    onOpen() {
        console.log("RuleDetails onOpen", this.param)
        this.initButton()
        this.initEvent()
    }

    protected start(): void {
        this.tabTogglebPrefab.active = false
        this.initData()
    }

    initEvent() {

    }

    initButton() {
        this.setButtonClick("node/btnClose", ()=>{
            this.close()
        })

        this.setToggleClick("node/titleTab/toggle1", ()=>{
            this.onChangeTab(this.curLabel, 0)
        })

        this.setToggleClick("node/titleTab/toggle2", ()=>{
            this.onChangeTab(this.curLabel, 1)
        })
    }
    
    initData(){
        for(let v in this.gameName){
            let toggle = cc.instantiate(this.tabTogglebPrefab)
            toggle.parent = this.tabToggleContent
            toggle.active = true
            this.setLabelValue("Background/name", toggle, this.gameName[v].name)
            this.setLabelValue("checkmark/name", toggle, this.gameName[v].name)
            if(this.param.label.indexOf(v) >= 0){
                toggle.getComponent(cc.Toggle).isChecked = true                
                this.onChangeTab(v, this.showType)
            }

            this.setToggleClick(toggle, ()=>{
                this.onChangeTab(v, this.showType)
            })
        }
    }

    onChangeTab(label: string, showType:number){
        if(this.curLabel == label && this.showType == showType){
            return
        }
        this.curLabel = label
        this.showType = showType
        this.contentScrollView.stopAutoScroll()
        this.contentScrollView.scrollToTop()
        if(this.showType == 0){
            if(label == Constants.GAME_TYPE_LABLE.MAJIONG_6HZXL || label == Constants.GAME_TYPE_LABLE.MAJIONG_8HZXL){
                let text = this.gameName[Constants.GAME_TYPE_LABLE.MAJIONG_HZXL].rule1
                if(label == Constants.GAME_TYPE_LABLE.MAJIONG_6HZXL){
                    text = text.replace("4张红中", "6张红中")
                    text = text.replace("4个红中", "6个红中")
                }else if(label == Constants.GAME_TYPE_LABLE.MAJIONG_8HZXL){
                    text = text.replace("4张红中", "8张红中")
                    text = text.replace("4个红中", "8个红中")
                }
                this.ruleLabel.string = text
            }else if(this.gameName[label].rule1){
                this.ruleLabel.string = this.gameName[label].rule1
            }else{
                this.ruleLabel.string = ""
            }
        }else{
            if(label == Constants.GAME_TYPE_LABLE.MAJIONG_6HZXL || label == Constants.GAME_TYPE_LABLE.MAJIONG_8HZXL){
                this.ruleLabel.string = this.gameName[Constants.GAME_TYPE_LABLE.MAJIONG_HZXL].rule2
            }else if(label == Constants.GAME_TYPE_LABLE.MAJIONG_XZHSZ){
                this.ruleLabel.string = this.gameName[Constants.GAME_TYPE_LABLE.MAJIONG_XLCH].rule2
            }else if(this.gameName[label].rule2){
                this.ruleLabel.string = this.gameName[label].rule2
            }else{
                this.ruleLabel.string = ""
            }
        }
    }

    gameName = {
        [Constants.GAME_TYPE_LABLE.MAJIONG_HZXL]: {name: "红中血流", image: "component/Rule/images/hzxl", 
            rule1: "红中血流，在血流成河玩法的基础上增加4张红中（万能牌)，并加入更多的胡牌牌型，使得胡牌更加容易。"+
                "\r\n"+
                "\r\n基础规则"+
                "\r\n1.玩家人数：4人"+
                "\r\n2.用牌：1-9万、1-9筒、1-9条，4个红中，共112张牌"+
                "\r\n3.可以碰、杠，不可以吃"+
                "\r\n4.定庄：第一个胡牌者下局为庄，一炮多响则放炮者为庄。无人胡牌时，庄家继续当庄"+
                "\r\n5.胡牌："+
                "\r\n       1)可以点炮胡、抢杠胡、—炮多响"+
                "\r\n       2)缺—门才能胡牌，即胡牌时手牌不能超过2种花色"+
                "\r\n       3)每局每个玩家可多次胡牌，直到摸完所有牌，牌局结束"+
                "\r\n       4)每次胡牌时直接结算"+
                "\r\n"+
                "\r\n行牌规则"+
                "\r\n1.换三张：发完手牌后，每位玩家选择3张任意花色手牌，随机与其他1位玩家交换"+
                "\r\n2.定缺：在发完手牌后选择一门不要的花色即为定缺，定缺牌打不完不能听牌，在对局中不能更改定缺"+
                "\r\n3.杠牌:"+
                "\r\n      1)刮风:即点杠、直杠"+
                "\r\n      2)下雨:即暗杠"+
                "\r\n      3)杠牌直接结算输赢"+
                "\r\n4.红中:"+
                "\r\n      1)红中为万能牌，可以充当任意牌，包括已经绝张的牌"+
                "\r\n      2)红中牌可以打出去，效果与万能牌一致。大概率造成一炮多响"+
                "\r\n      3)有红中的胡牌中，可能满足多种牌型，择最大番型的牌展示"+
                "\r\n      4)打出去的红中被他人胡牌，同样付他人最大番型金币数"+
                "\r\n      5)单红中不可钓任意牌做将胡牌"+
                "\r\n      6)双红中可以钓任意牌（缺门除外）组成刻子顺子胡牌"+
                "\r\n5.退税：对局结束后，未听牌的玩家，退回全部杠牌所得"+
                "\r\n6.查大叫：牌局结束时，除花猪之外的未听牌玩家赔给听牌未胡牌玩家最大可能倍数。（不包含自摸倍数)"+
                "\r\n7.查花猪：对局结束后，所定缺花色的牌没有打完的玩家为花猪，花猪玩家赔给其他玩家一定倍数金币。"+
                "\r\n"+
                "\r\n结算说明"+
                "\r\n1.倍数封顶：各场次有不同的倍数封顶"+
                "\r\n2.结算封顶：单次胡牌不能超过携带游戏金币"+
                "\r\n3.单次胡牌封顶：部分场次存在单次胡牌游戏金币封顶",
            rule2:"1.牌型："+
                "\r\n【平胡】×1"+
                "\r\n由4个刻子或顶子加对子组成胡牌"+
                "\r\n【素胡】×2"+
                "\r\n胡牌时，没有红中赖子参与的牌型"+
                "\r\n【边张】×2"+
                "\r\n12胡3,89胡7的牌型"+
                "\r\n【坎张】×2"+
                "\r\n胡牌时，只胡顺子中间的那张牌"+
                "\r\n【单钓】×2"+
                "\r\n胡牌时，是属于钓将胡牌"+
                "\r\n【一般高】×2"+
                "\r\n胡牌时，手牌中包含同花色的3连对"+
                "\r\n【六连顺】×2"+
                "\r\n胡牌时，手牌中包含同花色的6连张"+
                "\r\n【双同刻】×2"+
                "\r\n牌型中包含2个点数相同花色不同的刻子"+
                "\r\n【老少副】×2"+
                "\r\n牌型中包含同花色的123+789这两组顺子"+
                "\r\n【碰碰胡】×2"+
                "\r\n由4个刻子（或杠牌）和将牌组成的胡牌"+
                "\r\n【断幺九】×2"+
                "\r\n不包含任何的1、9的牌"+
                "\r\n【双暗刻】×4"+
                "\r\n牌型中有2个暗杠暗刻"+
                "\r\n【捉五魁】×4"+
                "\r\n牌型中有四万六万只胡五万"+
                "\r\n【不求人】×4"+
                "\r\n胡牌时，没有碰、明杠且是自摸胡牌"+
                "\r\n【清一色】×4"+
                "\r\n全部由万简条中的一种花色组成的胡牌"+
                "\r\n【五行八卦】×5"+
                "\r\n胡牌时，有且只有两个杠"+
                "\r\n【一条龙】×6"+
                "\r\n牌型中包含同花色1-9"+
                "\r\n【三暗刻】×8"+
                "\r\n牌型中有3个暗杠/暗刻"+
                "\r\n【金钩的】×8"+
                "\r\n胡牌时，手牌只剩下一张牌单吊胡牌"+
                "\r\n【大于五】×8"+
                "\r\n胡牌牌型中所有牌的点数都大于5"+
                "\r\n【小于五】×8"+
                "\r\n胡牌牌型中所有牌的点数都小于5"+
                "\r\n【三节高】×8"+
                "\r\n牌型中包含3个同花色且点数连续的刻子/杠"+
                "\r\n【全双刻】×8"+
                "\r\n牌型中只有刻/杠和将，且刻子点数都是偶数"+
                "\r\n【百万石】×8"+
                "\r\n牌型中万字牌的点数之和≥100"+
                "\r\n【推不倒】×8"+
                "\r\n只由245689条和1234589筒当中的牌组成的胡牌"+
                "\r\n【七对】×12"+
                "\r\n由七个对子组成的胡牌"+
                "\r\n【将对】×16"+
                "\r\n所有牌都是点数2、5、8的碰胡"+
                "\r\n【十二金钗】×16"+
                "\r\n胡的牌中有3个杠"+
                "\r\n【全带幺】×16"+
                "\r\n每副刻子顺/将都包含1或9"+
                "\r\n【四节高】×16"+
                "\r\n牌型中包含4个同花色且点数连续的刻子/杠"+
                "\r\n【绿一色】×24"+
                "\r\n牌型中只由2、3、4、6、8条组成的胡牌牌型"+
                "\r\n【守中抱一】×24"+
                "\r\n牌型中只剩1张红中单钓红中胡牌"+
                "\r\n【全小】×24"+
                "\r\n胡牌时，所有手牌点数只有1、2、3"+
                "\r\n【全中】×24"+
                "\r\n胡牌时，所有手牌点数只有4、5、6"+
                "\r\n【全大】×24"+
                "\r\n胡牌时，所有手牌点数只有7、8、9"+
                "\r\n【龙七对】×32"+
                "\r\n在七对的牌型中包含1个根"+
                "\r\n【全带五】×32"+
                "\r\n牌型中所有的顺子、刻子、将都含有点数5"+
                "\r\n【四暗刻】×32"+
                "\r\n牌型中有4个暗杠/暗刻"+
                "\r\n【九莲宝灯】×64"+
                "\r\n胡牌牌型为同花色1112345678999"+
                "\r\n【双龙七对】×96"+
                "\r\n七对的牌型中含有2个根"+
                "\r\n【连七对】×96"+
                "\r\n胡牌牌型为同花色点数相连的7个对子"+
                "\r\n【全幺九】×96"+
                "\r\n胡牌牌型中只有点数1和点数9的牌组成"+
                "\r\n【十八罗汉】×128"+
                "\r\n牌型中包含4个杠和一对将"+
                "\r\n【一色双龙会】×128"+
                "\r\n胡牌牌型为同花色11223355778899"+
                "\r\n【天胡】×256"+
                "\r\n换完三张后庄家直接胡牌"+
                "\r\n【地胡】×256"+
                "\r\n非庄家第一轮摸牌就胡牌"+
                "\r\n【三龙七对】×288"+
                "\r\n七对的牌型中包含3个根"+
                "\r\n"+
                "\r\n2.翻倍："+
                "\r\n【根】×2：手中四张一样的牌为1根，每有1根，胡牌时额外×2"+
                "\r\n【门清】×2：没有吃、碰明杠、点炮胡"+
                "\r\n【自摸】×2：自摸胡牌"+
                "\r\n【杠上炮】×2：杠牌后，打出的牌给其他玩家点炮"+
                "\r\n【抢杠胡】×2：胡其他人补杠的那张牌"+
                "\r\n【杠上开花】×2：杠牌后补张胡牌"+
                "\r\n【海底捞月】×2：牌墙已摸完，胡本局打出的最后一张牌"+
                "\r\n【妙手回春】×2：摸牌墙上最后一张牌成自摸" },
        [Constants.GAME_TYPE_LABLE.MAJIONG_6HZXL]: { name: "6红中血流", image: "component/Rule/images/6hzxl" },
        [Constants.GAME_TYPE_LABLE.MAJIONG_8HZXL]: { name: "8红中血流", image: "component/Rule/images/8hzxl" },
        [Constants.GAME_TYPE_LABLE.MAJIONG_XLCH]: { name: "血流成河", image: "component/Rule/images/xlch",
            rule1:"血流成河，沿用了“血战到底”的基本打法，不同的是，场上的玩家在胡牌以后，仍可以继续游戏。别的玩家打出的牌，若正是叫牌，则可以再次胡牌。在不改变听牌的牌型的前提下，还可以杠牌。直至桌面的牌摸完，此局才算结束。"+
                "\r\n"+
                "\r\n基础规则"+
                "\r\n1.玩家人数：4人"+
                "\r\n2.用牌：1-9万、1-9筒、1-9条，共108张牌"+
                "\r\n3.可以碰、杠，不可以吃"+
                "\r\n4.定庄：第一个胡牌者下局为庄，一炮多响则放炮者为庄。无人胡牌时，庄家继续当庄"+
                "\r\n5.胡牌："+
                "\r\n       1)可以点炮胡、抢杠胡、—炮多响"+
                "\r\n       2)缺—门才能胡牌，即胡牌时手牌不能超过2种花色"+
                "\r\n       3)每局每个玩家可多次胡牌，直到摸完所有牌，牌局结束"+
                "\r\n       4)每次胡牌时直接结算"+
                "\r\n"+
                "\r\n行牌规则"+
                "\r\n1.换三张：发完手牌后，每位玩家选择3张任意花色手牌，随机与其他1位玩家交换"+
                "\r\n2.定缺：在发完手牌后选择一门不要的花色即为定缺，定缺牌打不完不能听牌，在对局中不能更改定缺"+
                "\r\n3.杠牌:"+
                "\r\n      1)刮风:即点杠、直杠"+
                "\r\n      2)下雨:即暗杠"+
                "\r\n      3)杠牌直接结算输赢"+
                "\r\n4.退税：对局结束后，未听牌的玩家，退回全部杠牌所得"+
                "\r\n5.查大叫：牌局结束时，除花猪之外的未听牌玩家赔给听牌未胡牌玩家最大可能倍数。（不包含自摸倍数)"+
                "\r\n6.查花猪：对局结束后，所定缺花色的牌没有打完的玩家为花猪，花猪玩家赔给其他玩家一定倍数金币。"+
                "\r\n"+
                "\r\n结算说明"+
                "\r\n1.倍数封顶：各场次有不同的倍数封顶"+
                "\r\n2.结算封顶：单次胡牌不能超过携带游戏金币"+
                "\r\n3.单次胡牌封顶：部分场次存在单次胡牌游戏金币封顶",
            rule2: "1.牌型："+
                "\r\n【平胡】×1"+
                "\r\n由4个刻子或顺子加对子组成胡牌"+
                "\r\n【碰碰胡】×2"+
                "\r\n由4个刻子(或杠牌)和将牌组成的胡牌"+
                "\r\n【断幺九】×2"+
                "\r\n不包含任何的1、9的牌"+
                "\r\n【幺九】×4"+
                "\r\n每副刻子/顺/将都包含1或9"+
                "\r\n【清一色】×4"+
                "\r\n全部由万筒条中的一种花色组成的胡牌"+
                "\r\n【七对】×4"+
                "\r\n由七个对子组成的胡牌"+
                "\r\n【金钩钓】×4"+
                "\r\n胡牌时，手牌只剩下一张牌单吊胡牌"+
                "\r\n【将对】×8"+
                "\r\n所有牌都是点数2、5、8的碰碰胡"+
                "\r\n【清碰】×8"+
                "\r\n清一色的碰碰胡"+
                "\r\n【龙七对】×8"+
                "\r\n在七对的牌型中包含1个根"+
                "\r\n【清七对】×16"+
                "\r\n清一色的七对"+
                "\r\n【清金钩钓】×16"+
                "\r\n清一色的金钩钓"+
                "\r\n【清幺九】×16"+
                "\r\n清一色加幺九"+
                "\r\n【将金钩钓】×16"+
                "\r\n金钩钓里的手牌、碰牌和杠牌必须是2、5、8"+
                "\r\n【清龙七对】×32"+
                "\r\n清一色的龙七对"+
                "\r\n【清双龙七对】×64"+
                "\r\n清一色的双龙七对"+
                "\r\n【十八罗汉】×64"+
                "\r\n金钩钓，且胡牌时有4个杠牌"+
                "\r\n【地胡】×64"+
                "\r\n非庄家第一轮摸牌就胡牌"+
                "\r\n【天胡】×64"+
                "\r\n换完三张后庄家直接胡牌"+
                "\r\n【清三龙七对】×128"+
                "\r\n清一色的三龙七对"+
                "\r\n【清十八罗汉】×256"+
                "\r\n清一色和十八罗汉组成的胡牌"+
                "\r\n"+
                "\r\n2.翻倍："+
                "\r\n【根】×2：手中四张一样的牌为1根，每有1根，胡牌时额外×2"+
                "\r\n【自摸】×2：自摸胡牌"+
                "\r\n【杠上开花】×2：杠牌后补张胡牌"+
                "\r\n【杠上炮】×2：杠牌后，打出的牌给其他玩家点炮"+
                "\r\n【抢杠胡】×2：胡其他人补杠的那张牌"+
                "\r\n【海底捞月】×2：牌墙已摸完，胡本局打出的最后一张牌"+
                "\r\n【门清】×2：没有吃、碰明杠、点炮胡"},
        [Constants.GAME_TYPE_LABLE.MAJIONG_XZHSZ]: { name: "血战换三张", image: "component/Rule/images/xzdd",
            rule1:"血战到底，四川乃至全国都非常流行的麻将游戏打法，主要特点为一家胡了并不结束该局，而是未胡的玩家继续打，直到有3家都胡或者余下的玩家流局。"+
                "\r\n"+
                "\r\n基础规则"+
                "\r\n1.玩家人数：4人"+
                "\r\n2.用牌：1-9万、1-9筒、1-9条，共108张牌"+
                "\r\n3.可以碰、杠，不可以吃"+
                "\r\n4.定庄：第一个胡牌者下局为庄，一炮多响则放炮者为庄。无人胡牌时，庄家继续当庄"+
                "\r\n5.胡牌："+
                "\r\n       1)可以点炮胡、抢杠胡、—炮多响"+
                "\r\n       2)缺—门才能胡牌，即胡牌时手牌不能超过2种花色"+
                "\r\n       3)每局每个玩家可多次胡牌，直到摸完所有牌，牌局结束"+
                "\r\n       4)每次胡牌时直接结算"+
                "\r\n"+
                "\r\n行牌规则"+
                "\r\n1.换三张：发完手牌后，每位玩家选择3张任意花色手牌，随机与其他1位玩家交换"+
                "\r\n2.定缺：在发完手牌后选择一门不要的花色即为定缺，定缺牌打不完不能听牌，在对局中不能更改定缺"+
                "\r\n3.杠牌:"+
                "\r\n      1)刮风:即点杠、直杠"+
                "\r\n      2)下雨:即暗杠"+
                "\r\n      3)杠牌直接结算输赢"+
                "\r\n4.退税：对局结束后，未听牌的玩家，退回全部杠牌所得"+
                "\r\n5.查大叫：牌局结束时，除花猪之外的未听牌玩家赔给听牌未胡牌玩家最大可能倍数。（不包含自摸倍数)"+
                "\r\n6.查花猪：对局结束后，所定缺花色的牌没有打完的玩家为花猪，花猪玩家赔给其他玩家一定倍数金币。"+
                "\r\n"+
                "\r\n结算说明"+
                "\r\n1.倍数封顶：各场次有不同的倍数封顶"+
                "\r\n2.结算封顶：单次胡牌不能超过携带游戏金币"+
                "\r\n3.单次胡牌封顶：部分场次存在单次胡牌游戏金币封顶" },        
    }
}
