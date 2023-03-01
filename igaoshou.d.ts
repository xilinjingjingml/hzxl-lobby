interface PlayerBase {
    userName: string            // 用户名
    userId: string              // 用户ID
    avatar: string              // 头像
    region: number              // 区域  
    newbie?: boolean

    games?: number              // 游戏局数
    winGames?: number           // 胜利局数
    conWinGames?: number        // 连胜局数
}

interface GameDelegate {
    onMatch: (matchInfo: any, opponentId: string, roomInfo?: any) => void
    onJoin: (players: string[], roomInfo?: any) => void
    onPlayerJoin: (player: PlayerBase) => void
    onLeave: (succ: boolean) => void
    onPlayerLeave: (openId: string) => void
    onDismiss: () => void
    onError: (err: any) => void

    onData: (name: string, data: any) => void
}

declare namespace iGaoShouApi {
    // 平台
    // 接口更新为GameDelegate 支持多状态处理
    // export interface StartGameDelegate { (matchId: string): void; } 
    // export function SetGameStartDelegate(delegate: StartGameDelegate): void;

    export function GameDelegate(delegate: GameDelegate): void
    export function Initialize(callback?: Function): void
    export function LaunchPlatform(progress?: (val: number, tip: string) => void): void;
    export function SDKVersion(): string;

    // 工具接口
    export function Random(id: number = 0): number
    export function SetBackgroundMusic(music: string | cc.AudioClip): void
    export function SetMusicVolume(volume: number): void
    export function SetEffectVolume(volume: number): void
    export function GetMusicVolume(): number
    export function GetEffectVolume(): number

    export function SetBackgroundImage(sprite: cc.SpriteFrame): void

    export function SetProto(name: string, proto: any): void
    export function UnsetProto(name: string): void
    export function SendData(route: string, packetName: string, msg: any): void

    // 玩家信息    
    export function GetSelf(): PlayerBase
    export function GetPlayer(userId: string, callback?: (player: PlayerBase) => void): void

    // 比赛
    export function AbortMatch(): void
    export function ReportFinalScore(score: number): void
    export function GetOpponents(): string | PlayerBase

    // 推广
    // export interface PromotionCallback { (res: string): void; }
    // export function GetPromotion(callback: PromotionCallback): void

    // 微信小程序
    export function NativeGame(gameId: string): void
    export function CheckWxVersion(): void

    // 广告
    // v0.4.0.43-beta 版本以上才有这个API
    export function ShowBannerAD(): void; //显示banner广告
    export function HideBannerAD(): void;//隐藏banner广告
    export function PlayAD(index: number = 0, callback?: (index: number, succ: boolean, playAdCallBack) => void): void

    // 私人房
    export function GetPrivateRuleString(matchId: string, rule: any): string[]

    // 好友
    export function GetHotFriends(gameid: string): { openid: string, time: number }[]
    export function InviteUser(inviteUserOpenId: string, roomid: string, game: string, rule: string): void

    // 解散房间
    export function ApplyDismissReq(): void
    export function ReplyDismiss(reply: boolean): void

    export function KickOut(openid: string): void
}