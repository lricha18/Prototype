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
    
    var game = new Phaser.Game( 800, 600, Phaser.AUTO, 'game', { preload: preload, create: create, update: update } );
    
    function preload() {
        // Load an image and call it 'logo'.
        game.load.image( 'logo', 'assets/phaser.png' );
        game.load.image( 'background','assets/background.jpg');
        game.load.image('player', 'assets/dude.png');
    }
    
    var bouncy;
    var bg;
    var player;
    var facing = 'left';
    var cursors;
    var jumpButton;
    
    function create() {
        //Change the background image and scale to fit screen
        bg=game.add.tileSprite(0,0,2880,1800, 'background');
        bg.scale.y=.35
        bg.scale.x=.3
        
        // Create a sprite at the center of the screen using the 'logo' image.
        //bouncy = game.add.sprite( game.world.centerX, game.world.centerY, 'logo' );
        
        // Create a sprite to be the player
        player = game.add.sprite(32,32, 'player');
        
        // Anchor the sprite at its center, as opposed to its top-left corner.
        // so it will be truly centered.
        player.anchor.setTo( 0.5, 0.5 );
        
        // Make the player affected by gravity
        game.physics.arcade.gravity.y = 400;
        
        // Turn on the arcade physics engine for this sprite.
        game.physics.enable( player, Phaser.Physics.ARCADE );
        
        // Player animations
        player.body.bounce.y = .1;
        player.body.collideWorldBounds = true;
        player.body.setSize(20,32,5,16);
        player.animations.add('left', [0,1,2,3], 10, true);
        player.animations.add('forward', [4], 20, true);
        player.animations.add('right', [5,6,7,8], 10, true);
        
        // Make it bounce off of the world bounds.
        //player.body.collideWorldBounds = true;
        
        cursors = game.input.keyboard.createCursorKeys();
        
        // Add some text using a CSS style.
        // Center it in X, and position its top 15 pixels from the top of the world.
        var style = { font: "25px Verdana", fill: "#9999ff", align: "center" };
        var text = game.add.text( game.world.centerX, 15, "CHANGED SOMETHING!", style );
        text.anchor.setTo( 0.5, 0.0 );
    }
    
    function update() {
        // Accelerate the 'logo' sprite towards the cursor,
        // accelerating at 500 pixels/second and moving no faster than 500 pixels/second
        // in X or Y.
        // This function returns the rotation angle that makes it visually match its
        // new trajectory.
        //bouncy.rotation = game.physics.arcade.accelerateToPointer( bouncy, this.game.input.activePointer, 500, 500, 500 );
        
        
        
        player.body.velocity.x = 0;
        
        
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
        player.body.velocity.y = -250;
    }
     
        
        
    }
};
