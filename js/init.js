var game = new Phaser.Game(480, 320, Phaser.AUTO, null, {preload: preload, create: create, update: update});

var ball;  //定义小球对象
var paddle;//定义桨对象
var bricks;  //定义砖块对象
var newBrick;  
var brickInfo; //定义砖块信息
var scoreText;  //定义分数文本对象
var score = 0;
var lives = 3;   
var livesText;  //定义生命值文本对象
var lifeLostText;  //定义生命值丢失文本对象
var playing = false;  //定义游戏是否开始
var startButton;  //定义开始按钮对象

//资源加载函数
function preload() {
	handleRemoteImagesOnJSFiddle();
    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    game.scale.pageAlignHorizontally = true; //水平居中画布
    game.scale.pageAlignVertically = true;//垂直居中画布
    game.stage.backgroundColor = "#eee";//设置背景颜色
    game.load.image("ball", "img/ball.png"); //使用phaser加载小球，保存在img下
    game.load.image("paddle", "img/paddle.png"); //使用phaser加载桨图形，保存在img下
    game.load.image("brick", "img/brick.png"); //使用phaser加载砖块图形，保存在img下
    game.load.spritesheet("ball", "img/wobble.png", 20, 20); //使用phaser加载小球动画，保存在img下
    game.load.spritesheet("button", "img/button.png", 120, 40); //使用phaser加载按钮动画，保存在img下
}

  //加载完成后执行一次
function create() {
    game.physics.startSystem(Phaser.Physics.ARCADE);//初始化 Arcade Physics 引擎
    game.physics.arcade.checkCollision.down = false;//设置桨不与底部碰撞
    ball = game.add.sprite(game.world.width*0.5, game.world.height-25, 'ball');
    ball.animations.add('wobble', [0,1,0,2,0,1,0,2,0], 24);
    ball.anchor.set(0.5);//设置锚点为小球中心
    game.physics.enable(ball, Phaser.Physics.ARCADE); //为小球启用物理引擎
    ball.body.collideWorldBounds = true;//设置移动边界
    ball.body.bounce.set(1);//设置小球碰到边界时的反弹效果
    ball.checkWorldBounds = true; //设置小球碰到边界时触发事件
    ball.events.onOutOfBounds.add(ballLeaveScreen, this);  //添加事件监听器，当球离开游戏边界时触发

    paddle = game.add.sprite(game.world.width*0.5, game.world.height-5, 'paddle');//创建一个 paddle 对象，并设置其初始位置为屏幕中间，图像
    paddle.anchor.set(0.5,1);//使得桨定位在底部边缘
    game.physics.enable(paddle, Phaser.Physics.ARCADE);//为桨提供物理效果，使它与球产生碰撞
    paddle.body.immovable = true;//设置桨为不可移动

    initBricks();//绘制砖块

    textStyle = { font: '18px Arial', fill: '#0095DD' };//设置文本样式
    scoreText = game.add.text(5, 5, 'Points: 0', textStyle);//用add.text方法创建得分文字
    livesText = game.add.text(game.world.width-5, 5, 'Lives: '+lives, textStyle); //用add.text方法创建生命值文字
    livesText.anchor.set(1,0);//设置文本锚点为右对齐
    lifeLostText = game.add.text(game.world.width*0.5, game.world.height*0.5, 'Life lost, tap to continue', textStyle);//用add.text方法创建生命丢失文字
    lifeLostText.anchor.set(0.5);//设置文本锚点为居中
    lifeLostText.visible = false;//设置生命丢失文本初始值不可见

    startButton = game.add.button(game.world.width*0.5, game.world.height*0.5, 'button', startGame, this, 1, 0, 2); //创建一个按钮对象，并设置其初始位置为屏幕中间，图像
    startButton.anchor.set(0.5);//使得按钮定位在屏幕中间
}

//循环处理每一帧动画
function update() {
    game.physics.arcade.collide(ball, paddle, ballHitPaddle); //启用桨和球之间的碰撞检测
    game.physics.arcade.collide(ball, bricks, ballHitBrick);//启用球和砖块之间的碰撞检测
    if(playing) {
        paddle.x = game.input.x || game.world.width*0.5;//调整桨的位置，使其始终在鼠标位置
    }
}

function initBricks() {
    brickInfo = {  // 定义砖块对象
        width: 50,  // 砖块的宽度
        height: 20,  // 砖块的高度
        count: {   // 定义砖块的行列数
            row: 7,  // 砖块的行数
            col: 3  // 砖块的列数
        },
        offset: {    // 定义砖块在画布上的初始位置
            top: 50,  // 砖块上边距
            left: 60  // 砖块左边距
        },
        padding: 10  // 砖块之间的间距
    }

    bricks = game.add.group();  // 创建一个新的砖块组，用于存储所有砖块精灵
    for(c = 0; c < brickInfo.count.col; c++) {  // 循环列数
        for(r = 0; r < brickInfo.count.row; r++) {  // 循环行数
            // 计算每个砖块的 X 坐标，考虑宽度和间距
            var brickX = (r * (brickInfo.width + brickInfo.padding)) + brickInfo.offset.left;
            // 计算每个砖块的 Y 坐标，考虑高度和间距
            var brickY = (c * (brickInfo.height + brickInfo.padding)) + brickInfo.offset.top;
            
            // 创建新的砖块精灵，位置为计算得出的 brickX 和 brickY
            newBrick = game.add.sprite(brickX, brickY, 'brick');
            
            // 启用物理引擎，使砖块可以与其他物体发生碰撞
            game.physics.enable(newBrick, Phaser.Physics.ARCADE);
            
            // 设置砖块不可移动，使得它们不会受物理引擎影响
            newBrick.body.immovable = true;
            
            // 设置砖块的锚点在中心位置，使得旋转和缩放时是围绕中心进行的
            newBrick.anchor.set(0.5);
            
            // 将创建的砖块添加到砖块组中
            bricks.add(newBrick);
        }
    }
}

function ballHitBrick(ball, brick) {
    // 创建一个粒子发射器，位置设置为砖块的中心
    var emitter = game.add.emitter(brick.x, brick.y, 50); // 50 是粒子数量
    emitter.makeParticles('brick'); // 使用砖块图像作为粒子
    emitter.setYSpeed(-200, 200);   // 设置粒子在 Y 方向上的速度范围
    emitter.setXSpeed(-200, 200);   // 设置粒子在 X 方向上的速度范围
    emitter.setScale(0.2, 0.5, 0.2, 0.5, 2000); // 设置粒子缩放范围及消失时间
    emitter.gravity = 300;         // 给粒子设置重力效果
    emitter.start(true, 2000, null, 50); // 持续 2000 毫秒，每次发射 50 个粒子

    // 添加砖块缩放消失动画
    var killTween = game.add.tween(brick.scale);
    killTween.to({ x: 0, y: 0 }, 200, Phaser.Easing.Linear.None);
    killTween.onComplete.addOnce(function () {
        brick.kill(); // 杀死砖块对象
    }, this);
    killTween.start();

    // 增加分数并更新显示文本
    score += 10;
    scoreText.setText('Points: ' + score);

    // 检查是否达到胜利条件
    if (score === brickInfo.count.row * brickInfo.count.col * 10) {
        alert('You won the game, congratulations!');
        location.reload();
    }
}

function ballLeaveScreen() {
    lives--;  // 玩家失去一条命，减少命数

    // 检查是否还有剩余的命数
    if (lives) {
        // 如果玩家还有命，更新生命数显示
        livesText.setText('Lives: ' + lives);  // 更新屏幕上的生命数显示
        
        // 显示"失去一条命"的提示文本
        lifeLostText.visible = true;

        // 重置球的位置到屏幕底部中央
        ball.reset(game.world.width * 0.5, game.world.height - 25);

        // 重置挡板的位置到屏幕底部中央
        paddle.reset(game.world.width * 0.5, game.world.height - 5);

        // 等待玩家点击屏幕，准备重新开始
        game.input.onDown.addOnce(function() {
            // 玩家点击后，隐藏"失去一条命"的提示文本
            lifeLostText.visible = false;

            // 给球设置初始的速度，向上和向右反弹（速度为 150，-150）
            ball.body.velocity.set(150, -150);
        }, this);
    } else {  // 如果玩家没有剩余的命，显示游戏结束的提示框
        alert('You lost, game over!');
        // 重新加载页面，重新开始游戏
        location.reload();
    }
}

function ballHitPaddle(ball, paddle) {   // 定义球与桨碰撞时的动画
    ball.animations.play('wobble');  // 播放“wobble”动画，让球在与桨碰撞时产生晃动效果
    ball.body.velocity.x = -1 * 5 * (paddle.x - ball.x);  // 根据球与桨的相对位置改变球的速度，使其反弹的角度与桨的位置相关
}

function startGame() {
    startButton.destroy();  // 删除开始按钮，游戏开始后按钮消失
    ball.body.velocity.set(150, -150);  // 设置球的初始速度，X 方向和 Y 方向的速度分别为 150 和 -150
    playing = true;  // 将 playing 变量设置为 true，表示游戏正在进行
}


// this function (needed only on JSFiddle) take care of loading the images from the remote server
function handleRemoteImagesOnJSFiddle() {
	game.load.baseURL = 'https://end3r.github.io/Gamedev-Phaser-Content-Kit/demos/';
	game.load.crossOrigin = 'anonymous';
}