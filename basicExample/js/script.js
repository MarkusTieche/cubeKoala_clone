var game;

function init()
{
    game = new Phaser.Game(640, 960, Phaser.AUTO, '', { preload: preload, create: create,preRender:preRender, update: update });
}

function preload() 
{
    //SET UP STAGE
    game.stage.backgroundColor ="#333";
    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    game.scale.setMinMax(640, 960, 640, 960);
    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVertically = true;
    this.scale.forceOrientation(true, false);
    game.forceSingleUpdate = true;
    
    
    //LOAD TILE MAP 
    game.load.tilemap('level_1', 'assets/level_1.json', null, Phaser.Tilemap.TILED_JSON);
    //LOAD TILESET
    game.load.image('tiles', 'assets/TileSet.png');
}

function create() 
{
    //INIT PHYSICS
    game.physics.startSystem(Phaser.Physics.P2JS);
    game.physics.p2.gravity.y = 200;
    game.physics.p2.restitution = .2;
    game.physics.p2.friction = .01;
    game.physics.p2.useElapsedTime = true;
    
    //CENTER WORLD
    game.world.setBounds(-game.width/2,-game.height/2,game.width,game.height);
    
    //GET TILEMAP 
    var map = game.add.tilemap("level_1");
    
    //LOAD TILE IMAGES
    var tileSet = map.addTilesetImage('TileSet', 'tiles');
    
    //SET COLLISIN TILES
    map.setCollision([1,2,3,6,8,11,12,13])
    
    //CREATE A DYNAMIC TEXTURE
    var texture = game.add.bitmapData(map.widthInPixels,map.heightInPixels);
    
    //CREATE A SPRITE WITH TEXTURE
    var tileLayer = game.add.sprite(-map.widthInPixels/2, -map.heightInPixels/2, texture);
    
    //LEVEL GROUP
    this.level = game.add.group();
    this.level.add(tileLayer);
    //ADD MAIN PHYSICS BODY
    this.body = game.physics.p2.createBody(0, 0, 0, false);
    
    //LOOP TROUGH TILE ARRAY
    for (var y = 0; y < map.layer.data.length; y++) { 
        
        for (var x = 0; x < map.layer.data[y].length; x++) 
        { 
            //CHECK IF CURRENT TILE IS THE PLAYER
            if(map.layer.data[y][x].index == 15)
            {
                    //DRAW AN OTHER TEXTURE INSTEAD THE PLAYER TEXTURE
                    tileSet.draw(texture.context,map.layer.data[y][x].worldX,map.layer.data[y][x].worldY,7);
                
                //CREATE A SPRITE FORM PLAYER TEXTURE
                var playerTexture = game.add.bitmapData(tileSet.tileWidth,tileSet.tileHeight);
                    tileSet.draw(playerTexture.context,0,0,map.layer.data[y][x].index);
                
                //CENTER PLAYER
                this.player = game.add.sprite(0,0, playerTexture);
                game.physics.p2.enable(this.player);
                
                //OFFSET LEVEL ACCORDINGLY
                this.level.x = tileLayer.width/2 - map.layer.data[y][x].worldX-(tileSet.tileWidth/2);
                this.level.y = tileLayer.height/2 - map.layer.data[y][x].worldY-(tileSet.tileHeight/2);
                
            }
            else
            {
                //DRAW THE TILE
                tileSet.draw(texture.context,map.layer.data[y][x].worldX,map.layer.data[y][x].worldY,map.layer.data[y][x].index);
                    
                //ADD COLLISION
                for (var i = 0; i < map.collideIndexes.length; i++)
                { 
                    if(map.layer.data[y][x].index == map.collideIndexes[i])
                    {
                        var shape = this.body.addRectangle(32,32,(map.layer.data[y][x].worldX)+(tileSet.tileWidth/2),map.layer.data[y][x].worldY+(tileSet.tileHeight/2));
                    };
                };
            };
        };
    };
    
    //MOVE LEVEL BODY TO RIGHT POSITION
    this.body.x = tileLayer.x+this.level.x;
    this.body.y = tileLayer.y+this.level.y;
    
    //ADD BODY TO P2 WORLD
    game.physics.p2.addBody(this.body);
    
    //ADD INPUTS
    this.cursors = game.input.keyboard.createCursorKeys();
}

function preRender() 
{
    if(this.body)
    {
        //APPLY GRAVITY FORCE OF PLAYER.BODY TO LEVEL.BODY
        this.body.y -= this.player.position.y 
        this.player.body.velocity.y = 0;
        this.player.position.y = 0;
    
        this.body.x -= this.player.position.x 
        this.player.body.velocity.x = 0;
        this.player.position.x = 0;
        
        
        //MOVE LEVEL ACCORDINGLY
        this.level.x = this.body.x-this.level.children[0].x
        this.level.y = this.body.y-this.level.children[0].y
    };
}
                

function update() 
{
    if(this.cursors.left.justDown)
    {
        //ROTATE LEVEL
        game.world.angle +=45;
        //ALTER GRAVITY
        game.physics.p2.gravity.y = Math.cos(game.world.rotation) * 100;
        game.physics.p2.gravity.x = Math.sin(game.world.rotation) * 100;
    };
    
    if(this.cursors.right.justDown)
    {
        //ROTATE LEVEL
        game.world.angle -=45;
        //ALTER GRAVITY
        game.physics.p2.gravity.y = Math.cos(game.world.rotation) * 100;
        game.physics.p2.gravity.x = Math.sin(game.world.rotation) * 100;
    };
}
