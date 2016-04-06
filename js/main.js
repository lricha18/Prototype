window.onload = function () {

    "use strict";
    
    var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'game', { preload: preload, create: create, update: update, render: render });
    
    
    
    function preload() {
        // Load an image and call it 'logo'.
        game.load.image('logo', 'assets/phaser.png');
        game.load.image('background', 'assets/background.jpg');
        game.load.image('ledge', 'assets/brick2.png');
        game.load.image('star', 'assets/star2.png');
        game.load.image('bullet', 'assets/bullet.png');
        //game.load.image('player', 'assets/ufo.png');
        //game.load.image('player2', 'assets/ufo2.png');
        game.load.image('start', 'assets/start.png');
        game.load.image('tiles', 'assets/steampunkish-tileb.png');
        
        
        game.load.audio('music', 'assets/creepy.wav');
        game.load.audio('bulletHit', 'assets/bulletHit.wav');
        game.load.audio('bulletFire', 'assets/bulletFire.wav');
        game.load.audio('collision', 'assets/collision.wav');
        game.load.audio('capture', 'assets/capture.wav');
        game.load.audio('crouch', 'assets/crouch.wav');
        game.load.audio('jump','assets/jump.wav');
        game.load.audio('superJump', 'assets/superJump.wav');
        
        game.load.tilemap('map', 'assets/map.json', null, Phaser.Tilemap.TILED_JSON);
        
        game.load.spritesheet('player', 'assets/dude2.png', 32, 48);
    }
    
    
    var background;
    var start;
    
    var player;
 
    
    //Input from players
    var cursors;

    
    //Groups
    var stars;
    var bullets;

    var bullet;
    
    
    var text;
    var winText;
    var sound;
    var soundCount =0;
    
    //For Score Text
    var score1 = 0;
    var scoreString1;
    var scoreText1;

    
    var speed = 4;
    var music;
    
    //Used so player cannot fire continuously 
    var playerFireCounter = 0;
    var crouchCount=0;
    
    //Players' fire buttons and lock spacebar
    var playerFireButton;
    var killSpace;
    
    
    var map;
    var tileset;
    var layer, layer2,layer3;
    var facing = 'left';
    
    
    function create() {
        //Change the background image and scale to fit screen
        game.world.setBounds(0, 0, 800, 600);
        //background = game.add.tileSprite(0, 0, 800, 600, 'background');
        game.stage.backgroundColor = '#787878';
        
        game.physics.startSystem(game, Phaser.Physics.ARCADE);
        
    
        map = game.add.tilemap('map');
        map.addTilesetImage('steampunkish-tileb', 'tiles');
        layer = map.createLayer('Tile Layer 1');
        layer2 = map.createLayer('Tile Layer 2');
        layer3 = map.createLayer('Tile Layer 3');
        layer.resizeWorld();
        
        map.setCollision(18);
        map.setLayer(layer3);
        map.setCollision(6);
        map.setLayer(layer2);
        map.setCollision(109);
        
        
        //layer.debug = true;
        
        //Creates the star group to be collected
        stars = game.add.physicsGroup();
        var star;
        stars.physicsBodyType = Phaser.Physics.ARCADE;
        
        //  Player 1 bullet group
        bullets = game.add.group();
        bullets.enableBody = true;
        bullets.physicsBodyType = Phaser.Physics.ARCADE;
        bullets.createMultiple(30, 'bullet');
        bullets.setAll('anchor.x', 0.5);
        bullets.setAll('anchor.y', 1);
        bullets.setAll('outOfBoundsKill', true);
        bullets.setAll('checkWorldBounds', true);
        
       
        //Creates the initial star with world out of bounds detection
        //star = stars.create(400, 300, 'star');
        game.physics.enable(stars, Phaser.Physics.ARCADE);
        
        //Creates the background Music
        music = game.add.audio('music');
        music.play();
       
        
       
        // Create a sprite to be the player
        player = game.add.sprite(50, 1210, 'player');
        
        // Turn on the arcade physics engine for this sprite.
        game.physics.enable(player, Phaser.Physics.ARCADE);
        
        player.animations.add('left', [0, 1, 2, 3], 10, true);
        player.animations.add('turn', [4], 20, true);
        player.animations.add('right', [5, 6, 7, 8], 10, true);
        

        game.camera.follow(player);
        
        
        //Set the anchor to the middle of the players
        player.anchor.setTo(0.5,0.5);

        
        player.body.gravity.y=250;
        
        //Makes it so the players may not leave the screen
        player.body.collideWorldBounds = true;
        
        
        killSpace = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        
        //Makes the controls the arrow keys on the keyboard
        cursors = game.input.keyboard.createCursorKeys();
        
        
        
        // Add some text using a CSS style.
        // Center it in X, and position its top 15 pixels from the top of the world.
        var style = { font: "25px Verdana", fill: "#ffffff", align: "center" };
        //text = game.add.text(400, 10, "Capture the Star!", style);
        //text.anchor.setTo(0.5, 0.0);
        
        start = game.add.image(0,0,'start');
        game.paused = true;
        music.paused=true;
        game.input.onTap.addOnce(restart,this);
    }
    
    function update()
    {

        player.body.velocity.x = 0;
        

        game.physics.arcade.collide(player, layer);
        
        
        //Checks if the player has hit a star
        //game.physics.arcade.overlap(player, stars, hitStar1, null, this);
        //game.physics.arcade.overlap(player2, stars, hitStar2, null, this);
        
        game.physics.arcade.overlap(player, layer2, finishLevel, null, this);
        game.physics.arcade.collide(bullets, layer, killBullet, null, this);
        game.physics.arcade.overlap(bullets, layer3, antiGravity, null, this);
        //game.physics.arcade.overlap(player2, bullets, player2Hit, null, this);

        
        //Loops the Background Music
        loopMusic();
        
        //Input detection
        detectInput();

        
    }
    
    
    //Detects if the player has given input
    function detectInput()
    {
        crouchCount-=1;
        soundCount-=1;
        
        //Player 1 input
        if (cursors.left.isDown)
    {
        player.body.velocity.x = -150;

        if (facing != 'left')
        {
            player.animations.play('left');
            facing = 'left';
        }
    }
    else if (cursors.right.isDown)
    {
        player.body.velocity.x = 150;

        if (facing != 'right')
        {
            player.animations.play('right');
            facing = 'right';
        }
    }
    else
    {
        if (facing != 'idle')
        {
            player.animations.stop();

            if (facing == 'left')
            {
                player.frame = 0;
            }
            else
            {
                player.frame = 5;
            }

            facing = 'idle';
        }
    }
    
    
    if (cursors.up.isDown && player.body.onFloor())
        {   
            if(crouchCount>0)
                {
                    player.body.velocity.y = -350;
                    sound = game.sound.play('superJump');
                }
            else
                {
                    player.body.velocity.y = -250;
                    sound = game.sound.play('jump');
                }
           
        }
    else if(cursors.down.isDown && player.body.onFloor())
        {
            if (soundCount<0)
                {
                    sound = game.sound.play('crouch');
                    soundCount = 60;
                }
            
            crouchCount =10;
        }
        
        if (game.input.activePointer.justPressed())
            {
                fireBullet1();
            }
    
        
    }
    

    
    function render()
    {
        //game.debug.body(player);
        //game.debug.body(player2);
    }
    
    
    //Loops the Background Music
    function loopMusic()
    {            
        if (music.isPlaying == false)
            {
                music.restart();
            }
    }
    
    //Player 1 captured the star
    function hitStar1(player, star)
    {
        sound = game.sound.play('capture');
        star.destroy();
        var randomX = game.rnd.integerInRange(30,770);
        var randomY = game.rnd.integerInRange(100,570);
        star = stars.create(randomX, randomY, 'star');
        score1 += 1;
        scoreText1.text = scoreString1 + score1;
    }
    

    
    
    function resetPlayers()
    {
        player.kill();

        
        
        sound = game.sound.play('collision');
        
        // Recreate players at start
        player = game.add.sprite(100, 460, 'player');

        //Set the anchor to the middle of the players
        player.anchor.setTo(0.5,0.5);

        
        // Turn on the arcade physics engine for this sprite.
        game.physics.enable(player, Phaser.Physics.ARCADE);

        
        //Makes it so the players may not leave the screen
        player.body.collideWorldBounds = true;

        
    }

    
    
    //Fires a bullet from player 1
    function fireBullet1() 
    {

        //  To avoid them being allowed to fire too fast we set a time limit
        if (game.time.now > playerFireCounter)
        {
            //  Grab the first bullet we can from the pool
            bullet = bullets.getFirstExists(false);

            if (bullet)
            {
                //  And fire it
                bullet.reset(player.x, player.y + 8);
                game.physics.arcade.moveToPointer(bullet, 400);
                sound = game.sound.play('bulletFire');
                playerFireCounter = game.time.now + 400;
            }
        }

    }
    

    function restart()
    {
        start.visible = false;
        game.paused = false;
        score1 =0;

        scoreText1.text = scoreString1 + score1;
        winText.visible = false;
        
        player.x=100;
        player.y=460;

        music.paused= false;
    }
    
    function endGame()
    {
        music.paused= true;
        bullets.callAll('kill');
        if (score1 >=20)
            {
            var style = { font: "25px Verdana", fill: "#ffffff", align: "center" };
            winText = game.add.text(game.camera.x+300, game.camera.y + 300 , "Player 1 Wins! Click to play again!", style);
            game.paused = true;
            game.input.onTap.addOnce(restart,this);
            }

    }
    
    function killBullet(currentBullet)
    {
        currentBullet.kill();
    }
    
    function antiGravity()
    {
        bullet.kill();
        if(player.body.gravity.y>0)
        {
            player.body.gravity.y = -250;
        }
        else
        {
            player.body.gravity.y=250;
        }
    }
    function finishLevel()
    {
        var style = { font: "25px Verdana", fill: "#ffffff", align: "center" };
        winText = game.add.text(game.camera.x+200, game.camera.y + 250 , "You have finished the current level.\nMore levels to come soon!", style);
        game.paused = true;
    }
    
};
