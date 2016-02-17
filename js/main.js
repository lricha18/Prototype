window.onload = function() {
    // You might want to start with a template that uses GameStates:
    //     https://github.com/photonstorm/phaser/tree/master/resources/Project%20Templates/Basic
    
    // You can copy-and-paste the code from any of the examples at http://examples.phaser.io here.
    // You will need to change the fourth parameter to "new Phaser.Game()" from
    // 'phaser-example' to 'game', which is the id of the HTML element where we
    // want the game to go.
    // The assets (and code) can be found at: https://github.com/photonstorm/phaser/tree/master/examples/assets
    // You will need to change the paths you pass to "game.load.image()" or any other
    // loading functions to reflect where you are putting the assets.
    // All loading functions will typically all be found inside "preload()".
    
    "use strict";
    
    var game = new Phaser.Game( 800, 600, Phaser.CANVAS, 'game', { preload: preload, create: create, update: update, render: render } );
    
    
    
    function preload() {
        // Load an image and call it 'logo'.
        game.load.image( 'logo', 'assets/phaser.png' );
        game.load.image( 'background','assets/sea.png');
        game.load.spritesheet('player', 'assets/dude.png',32,48);
        game.load.image('ledge', 'assets/brick2.png');
        game.load.image('star', 'assets/star2.png');
        game.load.spritesheet('girl', 'assets/girl.png',60,60); 
        game.load.audio('finish','assets/cheering.wav');
        game.load.audio('jump','assets/jump.wav');
        game.load.audio('music', 'assets/fiati.wav');
    }
    
    
    var bouncy;
    var bg;
    var player;
    var facing = 'left';
    var cursors;
    var jumpButton;
    var ledges;
    var stars;
    var text;
    var sound;
    var jumpSound;
    var score = 0;
    var scoreString;
    var scoreText;
    var cameraSpeed = 2;
    var playerSpeedR = 200;
    var playerSpeedL = -150;
    var starGravity = 100;
    var music;
    
    
    function create() {
        //Change the background image and scale to fit screen
        game.world.setBounds(0,0, 1000000,600);
        bg=game.add.tileSprite(0,0,1000000,600, 'background');
        //game.world.setBounds(0,0, 2880,600);
        
        //Checks bounds collisions with all sides except the sky
        game.physics.arcade.checkCollision.up = false;
        

        //Creates the star group to be collected
        stars = game.add.physicsGroup();
        var star;
        stars.physicsBodyType = Phaser.Physics.ARCADE;
        
        //Creates the initial star with world out of bounds detection
        star = stars.create(730,120,'star');
        star.body.allowGravity=true;
        star.body.gravity.y= starGravity;
        star.checkWorldBounds = true;
        star.events.onOutOfBounds.add(starMissed, this );
        game.physics.enable(stars, Phaser.Physics.ARCADE);
        
        //Creates the background Music
        music = game.add.audio('music');
        music.play();
        music.loop = true;
        
        
        //  The score String is made and displayed here
        scoreString = 'Score : ';
        scoreText = game.add.text(10, 10, scoreString + score, { font: '34px Arial', fill: '#fff' });
        scoreText.fixedToCamera = true;
        
        
        // Create a sprite to be the player
        player = game.add.sprite(400,game.height-200, 'girl');
        
        
        // Turn on the arcade physics engine for this sprite.
        game.physics.enable( player, Phaser.Physics.ARCADE );
        
        
        // Make the player affected by gravity
        player.body.gravity.y = 600;
        
        // Player animations
        player.body.bounce.y = .1;
        player.body.collideWorldBounds = true;
        player.body.setSize(32,32,5,16);
        player.animations.add('left', [8,9,10,11,13,14,15], 10, true);
        player.animations.add('forward', [6], 20, true);
        player.animations.add('right', [16,17,18,19,20,21,22,23], 10, true);
        //game.camera.follow(player);
        
        // Make it bounce off of the world bounds.
        player.body.collideWorldBounds = true;
        
        //Makes the controls the arrow keys on the keyboard
        cursors = game.input.keyboard.createCursorKeys();
        
        // Add some text using a CSS style.
        // Center it in X, and position its top 15 pixels from the top of the world.
        var style = { font: "25px Verdana", fill: "#ffffff", align: "center" };
        text = game.add.text( 400, 10, "Catch the stars!", style );
        text.anchor.setTo( 0.5, 0.0 );
        text.fixedToCamera=true;
    }
    
    function update() {
        
        //If player makes it to the end of the world
        if (game.camera.x >=999000)
            {
                var style = { font: "25px Verdana", fill: "#ffffff", align: "center" };
                text = game.add.text( game.camera.x + 400, 50, "You made it to the end with a Great Score!", style );
                text.anchor.setTo( 0.5, 0.0 );
                game.paused=true;
            }
        
        //game.physics.arcade.collide(player,ledges);
        //game.physics.arcade.collide(stars,ledges);
        player.body.velocity.x = 0;
       
        //Checks if the player has hit a star
        game.physics.arcade.collide(player,stars,hitStar,null,this);
        
        
        //Checks if player has left the screen
        //Kills player if they have otherwise move the camera
        if(player.inCamera==false)
            {
                endGame();
            }
        else{
            game.camera.x += cameraSpeed;

        }
        
        //Loops the Background Music
        loopMusic();
        
        //Input detection
        detectInput();

        
    }
    
    
    //Detects if the player has given input
    function detectInput()
    {
        if (cursors.left.isDown)
            {
                player.body.velocity.x = playerSpeedL;

                if (facing != 'left')
                {
                    player.animations.play('left');
                    facing = 'left';
                }
             }
        else if (cursors.right.isDown)
        {
            player.body.velocity.x = playerSpeedR;
            if (facing != 'right')
            {
                player.animations.play('right');
                facing = 'right';
            }
        }
        else
        {
            if (facing != 'forward')
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

                facing = 'forward';
            }
        }
 
        if (cursors.up.isDown && (player.body.onFloor()||player.body.touching.down==true))
        {
            player.body.velocity.y = -450;
            jumpSound = game.sound.play('jump');
        }

    
    }
    
    //Action occurs when the player hits the star
    function hitStar(player,star)
    {
        
        //Destroys old star and creats new one to be collected.
        //Updates Score for collected star.
        star.destroy();
        sound = game.sound.play('finish');
        var random =game.rnd.integerInRange(game.camera.x+200,game.camera.x+800);
        star = stars.create(random,120,'star');
        star.body.allowGravity = true;
        star.body.gravity.y = starGravity;
        star.checkWorldBounds = true;
        star.events.onOutOfBounds.add(starMissed, this );
        score += 10;
        scoreText.text = scoreString + score
        
        //This increases the difficulty by increasing the speed
        increaseDifficulty();
        

    }
    
    function render() {

    //game.debug.cameraInfo(game.camera, 32, 32);

}
    
    
    //Event when a star is missed 
    //Kills the current star and makes a new one fall within the camera window
    function starMissed(star)
    {
        star.kill();
        var random =game.rnd.integerInRange(game.camera.x+200,game.camera.x+800);
        star = stars.create(random,120,'star');
        star.body.allowGravity=true;
        star.body.gravity.y=starGravity;
        star.checkWorldBounds = true;
        star.events.onOutOfBounds.add(starMissed, this );
        //score-=5;
        //scoreText.text = scoreString + score
    }
    
    
    
    //Loops the Background Music
    function loopMusic()
    {            
        if (music.isPlaying == false)
            {
                music.restart();
            }
    }
    
    
    
    
    //Increases the difficulty
    function increaseDifficulty()
    {
    
        if(score==10)
        {                
            var style = { font: "25px Verdana", fill: "#ffffff", align: "center" };
            text = game.add.text( game.camera.x + 800, 50, "Press UP to jump!", style );
            text.anchor.setTo( 0.5, 0.0 );
        }
        
        if(score==30)
        {
            cameraSpeed+=1;
            playerSpeedL-=20;
            playerSpeedR+=80;
            starGravity += 50;
                
            var style = { font: "25px Verdana", fill: "#ffffff", align: "center" };
            text = game.add.text( game.camera.x + 800, 50, "SPEEDING UP!", style );
            text.anchor.setTo( 0.5, 0.0 );
        }
        else if(score==60)
        {
            cameraSpeed+=1;
            playerSpeedL-=20;
            playerSpeedR+=80;
            starGravity += 100;
            
            var style = { font: "25px Verdana", fill: "#ffffff", align: "center" };
            text = game.add.text( game.camera.x + 800, 50, "SPEEDING UP AGAIN!", style );
            text.anchor.setTo( 0.5, 0.0 );
        }
        else if(score==80)
        {
            cameraSpeed+=1;
            playerSpeedL-=20;
            playerSpeedR+=80;
            starGravity += 200;
            
            var style = { font: "25px Verdana", fill: "#ffffff", align: "center" };
            text = game.add.text( game.camera.x + 800, 50, "THIS IS FAST!", style );
            text.anchor.setTo( 0.5, 0.0 );
        }
        else if(score==100)
        {
            cameraSpeed+=1;
            playerSpeedL-=20;
            playerSpeedR+=80;
            starGravity += 200;
                
            var style = { font: "25px Verdana", fill: "#ffffff", align: "center" };
            text = game.add.text( game.camera.x + 800, 50, "RUN FASTER!", style );
            text.anchor.setTo( 0.5, 0.0 );
        }
        else if(score==120)
        {
            cameraSpeed+=1;
            playerSpeedL-=20;
            playerSpeedR+=80;
            starGravity += 200;
                
            var style = { font: "25px Verdana", fill: "#ffffff", align: "center" };
            text = game.add.text( game.camera.x + 800, 50, "ALMOST THERE!", style );
            text.anchor.setTo( 0.5, 0.0 );
        }
        else if(score>=130)
        {
            cameraSpeed+=1;
            playerSpeedL-=20;
            playerSpeedR+=80;
            starGravity += 200;
                
            var style = { font: "25px Verdana", fill: "#ffffff", align: "center" };
            text = game.add.text( game.camera.x + 800, 50, "FASTER!", style );
            text.anchor.setTo( 0.5, 0.0 );
        }
     
    }
    
    
    function endGame()
    {
        
        player.kill();
        //Put Player Losing Screen Here 
        
         var style = { font: "25px Verdana", fill: "#000000", align: "center" };
        text = game.add.text( game.camera.x + 400, 200, "You died! Refresh to play again", style );
        text.anchor.setTo( 0.5, 0.0 );
        game.paused=true;
	
    }
    
    
    
};
