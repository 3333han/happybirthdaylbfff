window.BIRTHDAY_CONFIG = {
  // 轻松、好玩的版本。只改这个文件就能替换大部分内容。
  name: "lbfff",
  age: "",
  heroTitle: "Happy Birthday",
  heroSubtitle: "生日快乐！。",
  startButton: "start advanture",

  // 小人形象。faceImage 可以填写图片路径，例如 "./assets/face.jpg"。
  // 留空也可以：进入游戏后点击 HUD 上的“换脸”临时上传。
  character: {
    faceImage: "./assets/face1.jpg",
    hurtFaceImage: "./assets/face2.jpg"
  },

  // 开场日历：选对日期后放烟花，并显示年龄祝福。
  birthday: {
    year: 2026,
    month: 10,
    day: 5,
    age: 19,
    title: "今天是几号",
    prompt: "click it",
    success: "日期锁定成功，庆祝程序启动！",
    wrong: "再想想",
    reveal: "十九岁生日快乐！!"
  },

  // 其他固定页面文字：以后都可以在这里统一修改。
  texts: {
    brandTitle: "Birthday Run",
    brandSubtitle: " ",
    landingControls: "移动，躲开障碍去拆礼物",
    heroCaptionText: "好多份礼物等你抵达",
    landingFooterLeft: "键盘、滑动或点按都可以控制",
    landingFooterRight: "撞到障碍也可以无所谓",
    calendarEyebrow: "SAVE THE DATE",
    landingEyebrow: "HAPPY BIRTHDAY RUN",
    finishEyebrow: "ALL GIFTS COLLECTED",
    cakeEyebrow: "CAKE WORKSHOP",
    stage1: "part1",
    stage2: "part2",
    stage3: "part3",
    fragmentLabel: "星星碎片",
    faceButton: "换脸",
    faceButtonDone: "换脸 ✓",
    restartButton: "重来",
    gameIntroTitle: "礼物正在前面的路上等你",
    gameIntroHelp: "上下移动，碰到障碍也ok",
    controlHint: "或滑动控制",
    giftClick: "拉一下丝带",
    giftHold: "按住不放，等盒子发光",
    giftMulti: "快速连点三次",
    rewardContinue: "收下，继续前进",
    finishTitle: "跑完啦！生日快乐！",
    finishText: "赛博蛋糕来袭",
    goCake: "去蛋糕工坊",
    cakeFlavorLabel: "奶油颜色",
    cakeToppingLabel: "顶部装饰",
    cakeCandleLabel: "蜡烛数量",
    cakeFlavorBerry: "莓果粉",
    cakeFlavorSunny: "阳光橙",
    cakeFlavorMint: "薄荷绿",
    cakeToppingBerry: "草莓",
    cakeToppingStar: "星星",
    cakeToppingFlag: "小旗",
    confirmCake: "就选这个，准备吹蜡烛",
    micButton: "允许麦克风，真的吹气",
    blowButton: "用魔法吹一下",
    cakeDone: "蜡烛全部吹灭，快乐额度 +100",
    goLetter: "看视频祝福",
    finalLink: "打开彩蛋"
  },
  // 三份礼物分别在第一、第二、第三段结束时出现。
  // giftAction: click = 点一下，hold = 按住一秒，multi = 连点三次。
  rewards: [
    {
      threshold: 0.33,
      icon: "🥤",
      badge: "礼物 01",
      title: "鳄鱼一只 剩下的在路上",
      note: "第一关完成",
      giftAction: "click"
    },
    {
      threshold: 0.66,
      icon: "🎐",
      badge: "礼物 02",
      title: "挂件x2",
      description: "金牌教练生日快乐！",
      note: "第二关完成",
      giftAction: "hold"
    },
    {
      threshold: 0.99,
      icon: "⚡",
      badge: "礼物 03",
      title: "灵魂力量已送达",
      description: "明年暑假弹起 包包背起 ",
      note: "第三关完成",
      giftAction: "multi"
    }
  ],
  // 最后直接播放的视频
  videoSrc: "./20251005.mp4",

  // 背景音乐。src 留空时使用内置生日快乐旋律；也可以填写 "./assets/music.mp3"。
  music: {
    src: "./butterfly.mp3",
    volume: 0.28
  },
  // 最后的小彩蛋：可以留空，也可以填写图片路径或链接。
  finalGift: {
    title: "还有礼物在路上",
    text: "剩下的神秘礼物正在慢慢抵达。",
    url: ""
  }
};
