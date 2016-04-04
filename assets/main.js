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
        game.load.image('player1', 'assets/ufo.png');
        game.load.image('player2', 'assets/ufo2.png');
        game.load.image('start', 'assets/start.png');
        
        
        game.load.audio('music', 'assets/Jupiter.wav');
        game.load.audio('bulletHit', 'assets/bulletHit.wav');
        game.load.audio('bulletFire', 'assets/bulletFire.wav');
        game.load.audio('collision', 'assets/collision.wav');
        game.load.audio('capture', 'assets/capture.wav');
    }
    
    
    var background;
    var start;
    
    var player1;
    var player2;
    
    //Input from players
    var cursors;
    var cursors2;
    
    //Groups
    var stars;
    var bullets;
    var enemyBullets;
    var bullet;
    var enemyBullet;
    
    var text;
    var winText;
    var sound;
    
    //For Score Text
    var score1 = 0;
    var scoreString1;
    var scoreText1;
    var score2 = 0;
    var scoreString2;
    var scoreText2;
    
    var speed = 4;
    var music;
    
    //Used so player cannot fire continuously 
    var player1FireCounter = 0;
    var player2FireCounter = 0;
    
    //Players' fire buttons and lock spacebar
    var player1FireButton;
    var player2FireButton;
    var killSpace;
    
    
    function create() {
        //Change the background image and scale to fit screen
        game.world.setBounds(0, 0, 800, 600);
        background = game.add.tileSprite(0, 0, 800, 600, 'background');
        
        game.physics.startSystem(game, Phaser.Physics.ARCADE);
    
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
        
        // Player 2 bullet group
        enemyBullets = game.add.group();
        enemyBullets.enableBody = true;
        enemyBullets.physicsBodyType = Phaser.Physics.ARCADE;
        enemyBullets.createMultiple(30, 'bullet');
        enemyBullets.setAll('anchor.x', 0.5);
        enemyBullets.setAll('anchor.y', 1);
        enemyBullets.setAll('outOfBoundsKill', true);
        enemyBullets.setAll('checkWorldBounds', true);
        
        //Creates the initial star with world out of bounds detection
        star = stars.create(400, 300, 'star');
        game.physics.enable(stars, Phaser.Physics.ARCADE);
        
        //Creates the background Music
        music = game.add.audio('music');
        music.play();
        //music.loop = true;
        
        
        //  The score String is made and displayed here
        scoreString1 = 'Player 1 : ';
        scoreText1 = game.add.text(10, 10, scoreString1 + score1, { font: '34px Arial', fill: '#fff' });
        scoreString2 = 'Player 2 : ';
        scoreText2 = game.add.text(600, 10, scoreString2 + score2, { font: '34px Arial', fill: '#fff' });
        
        // Create a sprite to be the player
        player1 = game.add.sprite(0, 560, 'player1');
        player2 = game.add.sprite(790, 560, 'player2');
        
        //Set the anchor to the middle of the players
        player1.anchor.setTo(0.5,0.5);
        player2.anchor.setTo(0.5,0.5);
        
        // Turn on the arcade physics engine for this sprite.
        game.physics.enable(player1, Phaser.Physics.ARCADE);
        game.physics.enable(player2, Phaser.Physics.ARCADE);
        
        //Makes it so the players may not leave the screen
        player1.body.collideWorldBounds = true;
        player2.body.collideWorldBounds = true;
        
        killSpace = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        
        //Makes the controls the arrow keys on the keyboard
        cursors = game.input.keyboard.createCursorKeys();
        player1FireButton = game.input.keyboard.addKey(Phaser.Keyboard.M);
        player2FireButton = game.input.keyboard.addKey(Phaser.Keyboard.F)
        cursors2 = {up: game.input.keyboard.addKey(Phaser.Keyboard.W), down: game.input.keyboard.addKey(Phaser.Keyboard.S), left: game.input.keyboard.addKey(Phaser.Keyboard.A), right: game.input.keyboard.addKey(Phaser.Keyboard.D)};
        
        // Add some text using a CSS style.
        // Center it in X, and position its top 15 pixels from the top of the world.
        var style = { font: "25px Verdana", fill: "#ffffff", align: "center" };
        text = game.add.text(400, 10, "Capture the Star!", style);
        text.anchor.setTo(0.5, 0.0);
        
        
        start = game.add.image(0,0,'start');
        game.paused = true;
        music.paused=true;
        game.input.onTap.addOnce(restart,this);
    }
    
    function update()
    {
        if(score1 >=20 || score2 >=20)
            {
                endGame();
            }

        player1.body.velocity.x = 0;
        player1.body.velocity.y = 0;
        player2.body.velocity.y = 0;
        player2.body.velocity.x = 0;
       
        
        //Checks if the player has hit a star
        game.physics.arcade.overlap(player1, stars, hitStar1, null, this);
        game.physics.arcade.overlap(player2, stars, hitStar2, null, this);
        
        game.physics.arcade.overlap(player1, player2,resetPlayers, null, this);
        game.physics.arcade.overlap(player1, enemyBullets, player1Hit, null, this);
        game.physics.arcade.overlap(player2, bullets, player2Hit, null, this);

        
        //Loops the Background Music
        loopMusic();
        
        //Input detection
        detectInput();

        
    }
    
    
    //Detects if the player has given input
    function detectInput()
    {
        //Player 1 input
        if (cursors.left.isDown)
        {
            player1.x -= speed;
            player1.angle = -15;
        }
        if (cursors.right.isDown)
        {
            player1.x += speed;
            player1.angle = 15;
        }
        if (cursors.up.isDown)
        {
            player1.y -= speed;
        }
        if (cursors.down.isDown)
        {
            player1.y += speed;
        }
        if (cursors.up.isDown == false && cursors.down.isDown == false && cursors.left.isDown == false && cursors.right.isDown == false)
        {
            player1.angle = 0;
        }
        if (player1FireButton.isDown)
            {
                fireBullet1();
            }
        
        //Player 2 input
        if (cursors2.left.isDown)
        {
            player2.x -= speed;
            player2.angle = -15;
        }
        if (cursors2.right.isDown)
        {
            player2.x += speed;
            player2.angle = 15;
        }
        if (cursors2.up.isDown)
        {
            player2.y -= speed;
        }
        if (cursors2.down.isDown)
        {
            player2.y += speed;
        }
        if (cursors2.up.isDown == false && cursors2.down.isDown == false && cursors2.left.isDown == false && cursors2.right.isDown == false) 
        {
            player2.angle = 0;
        }
        if (player2FireButton.isDown)
            {
                fireBullet2();
            }
        
    }
    

    
    function render()
    {
        //game.debug.body(player1);
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
    function hitStar1(player1, star)
    {
        sound = game.sound.play('capture');
        star.destroy();
        var randomX = game.rnd.integerInRange(30,770);
        var randomY = game.rnd.integerInRange(100,570);
        star = stars.create(randomX, randomY, 'star');
        score1 += 1;
        scoreText1.text = scoreString1 + score1;
    }
    
    //Player 2 capture the star
    function hitStar2(player2, star)
    {
        sound = game.sound.play('capture');
        star.destroy();
        var randomX = game.rnd.integerInRange(30,770);
        var randomY = game.rnd.integerInRange(100,570);
        star = stars.create(randomX, randomY, 'star');
        score2 += 1;
        scoreText2.text = scoreString2 + score2;
    }
    
    
    function resetPlayers()
    {
        player1.kill();
        player2.kill();
        
        
        sound = game.sound.play('collision');
        
        // Recreate players at start
        player1 = game.add.sprite(0, 560, 'player1');
        player2 = game.add.sprite(790, 560, 'player2');
        
        //Set the anchor to the middle of the players
        player1.anchor.setTo(0.5,0.5);
        player2.anchor.setTo(0.5,0.5);
        
        // Turn on the arcade physics engine for this sprite.
        game.physics.enable(player1, Phaser.Physics.ARCADE);
        game.physics.enable(player2, Phaser.Physics.ARCADE);
        
        //Makes it so the players may not leave the screen
        player1.body.collideWorldBounds = true;
        player2.body.collideWorldBounds = true;
        
    }
    
    
   //When player 1 is hit by a bullet
    function player1Hit(player1, bullet)
    {
        //When a bullet hits player 1 both are killed
        bullet.kill();
        player1.kill();
        
        player1.x=0;
        player1.y=560;    
        player1.revive();
        sound = game.sound.play('bulletHit');

        //Increase the score
        score2 +=1;
        scoreText2.text = scoreString2 + score2;
        
    }
    
    //When player 2 is hit by a bullet
    function player2Hit(player2, bullet)
    {
        //When bullet hits player 2 both are killed
        bullet.kill();
        player2.kill();
        
        player2.x=790;
        player2.y=560;
        player2.revive(); 
        sound = game.sound.play('bulletHit');
        
        score1 += 1;
        scoreText1.text = scoreString1 + score1;
        
    }
    
    
    //Fires a bullet from player 1
    function fireBullet1() 
    {

        //  To avoid them being allowed to fire too fast we set a time limit
        if (game.time.now > player1FireCounter)
        {
            //  Grab the first bullet we can from the pool
            bullet = bullets.getFirstExists(false);

            if (bullet)
            {
                //  And fire it
                bullet.reset(player1.x, player1.y + 8);
                game.physics.arcade.moveToObject(bullet,player2, 400);
                sound = game.sound.play('bulletFire');
                player1FireCounter = game.time.now + 400;
            }
        }

    }
    
    //Fires a bullet from player 2
    function fireBullet2() 
    {

        //  To avoid them being allowed to fire too fast we set a time limit
        if (game.time.now > player2FireCounter)
        {
            //  Grab the first bullet we can from the pool
            enemyBullet = enemyBullets.getFirstExists(false);

            if (enemyBullet)
            {
                //  And fire it
                enemyBullet.reset(player2.x, player2.y + 8);
                game.physics.arcade.moveToObject(enemyBullet,player1, 400);
                sound = game.sound.play('bulletFire');
                player2FireCounter = game.time.now + 400;
            }
        }

    }
    
    function restart()
    {
        start.visible = false;
        game.paused = false;
        score1 =0;
        score2 =0;
        scoreText1.text = scoreString1 + score1;
        scoreText2.text = scoreString2 + score2;
        winText.visible = false;
        
        player1.x=0;
        player1.y=560;
        player2.x=790;
        player2.y=560;
        music.paused= false;
    }
    
    function endGame()
    {
        music.paused= true;
        bullets.callAll('kill');
        enemyBullets.callAll('kill');
        if (score1 >=20)
            {
            var style = { font: "25px Verdana", fill: "#ffffff", align: "center" };
            winText = game.add.text(100, 200, "Player 1 Wins! Click to play again!", style);
            game.paused = true;
            game.input.onTap.addOnce(restart,this);
            }
        else if(score2 >=20)
            {
            var style = { font: "25px Verdana", fill: "#ffffff", align: "center" };
            winText = game.add.text(100, 200, "Player 2 Wins! Click to play again!", style);
            game.paused = true;
            game.input.onTap.addOnce(restart,this);
            }
    }
    
};
