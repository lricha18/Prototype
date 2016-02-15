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
        game.load.audio('finish','assets/pickup.wav');
        game.load.audio('jump','assets/jump.wav');
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
    
    
    function create() {
        //Change the background image and scale to fit screen
        game.world.setBounds(0,0, 36000,600);
        bg=game.add.tileSprite(0,0,36000,600, 'background');
        //game.world.setBounds(0,0, 2880,600);
        
        //Checks bounds collisions with all sides except the sky
        game.physics.arcade.checkCollision.up = false;
        
        
        //Creates star to be collected
        stars = game.add.physicsGroup();
        var star;
        stars.physocsBodyType = Phaser.Physics.ARCADE;
        star = stars.create(730,120,'star');
        star.body.allowGravity=true;
        star.body.bounce.set(.5);
        star.body.gravity.y=100;
        
        //Creates ledges group
        ledges = game.add.physicsGroup();
        ledges.enableBody = true;
        ledges.physicsBodyType = Phaser.Physics.ARCADE;
        var ledge;
        
        // Creates the ledges the player can jump on
        for(var i = 1; i< 15;i++)
            {
                ledge = ledges.create(i*52,600-(i*30)-20,'ledge')
                ledge.body.bounce.set(0);
                ledge.body.immovable = true;
            }
        
        // Create a sprite to be the player
        player = game.add.sprite(100,game.height-200, 'girl');
        
        
        // Turn on the arcade physics engine for this sprite.
        game.physics.enable( player, Phaser.Physics.ARCADE );
        
        
        // Make the player affected by gravity
        player.body.gravity.y = 600;
        
        // Player animations
        player.body.bounce.y = .1;
        player.body.collideWorldBounds = true;
        player.body.setSize(20,32,5,16);
        player.animations.add('left', [8,9,10,11,13,14,15], 10, true);
        player.animations.add('forward', [6], 20, true);
        player.animations.add('right', [16,17,18,19,20,21,22,23], 10, true);
        //game.camera.follow(player);
        
        // Make it bounce off of the world bounds.
        player.body.collideWorldBounds = true;
        
        cursors = game.input.keyboard.createCursorKeys();
        
        // Add some text using a CSS style.
        // Center it in X, and position its top 15 pixels from the top of the world.
        var style = { font: "25px Verdana", fill: "#ffffff", align: "center" };
         text = game.add.text( 400, 10, "What is this world?", style );
        text.anchor.setTo( 0.5, 0.0 );
    }
    
    function update() {
        // Accelerate the 'logo' sprite towards the cursor,
        // accelerating at 500 pixels/second and moving no faster than 500 pixels/second
        // in X or Y.
        // This function returns the rotation angle that makes it visually match its
        // new trajectory.
        //bouncy.rotation = game.physics.arcade.accelerateToPointer( bouncy, this.game.input.activePointer, 500, 500, 500 );
        


        
        game.physics.arcade.collide(player,ledges);
        game.physics.arcade.collide(stars,ledges);
        player.body.velocity.x = 0;
        
        
        
        
        
        if(player.inCamera==false)
            {
                player.kill();
                //text = game.add.text( 400, 50, "You died!", style );
                //text.anchor.setTo( 0.5, 0.0 );
            }
        else{
            game.camera.x += 1;

        }
        

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
        player.body.velocity.y = -250;
        jumpSound = game.sound.play('jump');
    }
    else{
        game.physics.arcade.collide(player,stars,hitStar,null,this);
    }
     

        
    }
    
    //Action occurs when the player hits the star
    function hitStar(player,star)
    {
        star.kill();
        sound = game.sound.play('finish');
                var style = { font: "25px Verdana", fill: "#ffffff", align: "center" };
         text = game.add.text( game.world.centerX, 50, "You WIN!", style );
        text.anchor.setTo( 0.5, 0.0 );
        
    }
    
    function render() {

    game.debug.cameraInfo(game.camera, 32, 32);

}
};
