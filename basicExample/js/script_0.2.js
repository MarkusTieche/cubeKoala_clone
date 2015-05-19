var game;

function init()
{
    var w = window.innerWidth;
    var h = window.innerHeight;
    
    game = new Phaser.Game(640, 960, Phaser.AUTO, '', { preload: preload, create: create,preRender:preRender, update: update });
    
    addStats();
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
    this.game.world.setBounds(-(this.game.width/2),(-this.game.height/2),this.game.width,this.game.height);
    
    //GET TILEMAP 
    var map = game.add.tilemap("level_1");
    //LOAD TILE IMAGES
    var tileSet = map.addTilesetImage('TileSet', 'tiles');
    //SET COLLISIN TILES
    map.setCollision([1,2,3,6,8,11,12,13])
    
    //CREATE A DYNAMIC TEXTURE
    var texture = game.add.bitmapData(map.widthInPixels,map.widthInPixels);
    
    //CREATE A SPRITE WITH TEXTURE
    var tileLayer = game.add.sprite(-map.widthInPixels/2, -map.heightInPixels/2, texture);
    
    //LEVEL GROUP
    this.level = game.add.group();
    this.level.add(tileLayer);
    
    //ADD MAIN PHYSICS BODY
    this.body = game.physics.p2.createBody(0, 0, 0, false);
    
    for (var y = 0; y < map.layer.data.length; y++) { 
        
        for (var x = 0; x < map.layer.data[y].length; x++) 
        { 
            //CHECK IF CURRENT TILE IS THE PLAYER
            if(map.layer.data[y][x].index == 15)
            {
                tileSet.draw(texture.context,map.layer.data[y][x].worldX,map.layer.data[y][x].worldY,7);
                var playerTexture = game.add.bitmapData(32,32);
                    tileSet.draw(playerTexture.context,0,0,map.layer.data[y][x].index);
                
                //CENTER PLAYER
                this.player = game.add.sprite(0,0, playerTexture);
                game.physics.p2.enable(this.player,true);
                
                //OFFSET LEVEL ACCORDINGLY
                tileLayer.x += (map.layer.data[y][x].worldX/2)+16;
                tileLayer.y -= (map.layer.data[y][x].worldY/2)-16;
            }
            else
            {
                tileSet.draw(texture.context,map.layer.data[y][x].worldX,map.layer.data[y][x].worldY,map.layer.data[y][x].index);
                
                //CHECK FOR THE EXIT TILE
                if(map.layer.data[y][x].index == 9)
                {
                    this.target = map.layer.data[y][x];
                }
                    
                //ADD COLLISION
                for (var i = 0; i < map.collideIndexes.length; i++)
                { 
                    if(map.layer.data[y][x].index == map.collideIndexes[i])
                    {
                        var shape = this.body.addRectangle(32,32,(map.layer.data[y][x].worldX)+16,map.layer.data[y][x].worldY+16);
                    };
                };
            };
        };
    };
    
    this.body.x +=  tileLayer.x;
    this.body.y +=  tileLayer.y;
    
//    this.world.scale.setTo(2)
    
    game.physics.p2.addBody(this.body);
    this.body.debug = true;
    
    console.log(this.player)
    
    //ADD INPUTS
    this.cursors = game.input.keyboard.createCursorKeys();
}

function preRender() 
{
    if(this.body)
    {
        this.body.y -= this.player.position.y 
        this.player.body.velocity.y = 0;
        this.player.position.y = 0;
    
        this.body.x -= this.player.position.x 
        this.player.body.velocity.x = 0;
        this.player.position.x = 0;
        
        this.body.debugBody.updateSpriteTransform()
//        this.body.debug = false;
//        this.body.debug = true;
        this.level.position.x = this.body.x-this.level.children[0].x
        this.level.position.y = this.body.y-this.level.children[0].y
//        this.level.position.y = this.body.y
    }
    
}
                

function update() 
{
    
    var distance = Phaser.Math.distance(this.player.x, this.player.y, this.target.worldX+16+this.body.x,  this.target.worldY+16+this.body.y);
    if(distance <= 16)
    {
        var angle = Phaser.Math.angleBetween(this.player.x, this.player.y, this.target.worldX+16+this.body.x,  this.target.worldY+16+this.body.y)
//        this.level.alpha = 0.5;
        this.player.body.velocity.x = Math.cos(angle) * distance;
        this.player.body.velocity.y = Math.sin(angle) * distance;
    }
    
//    console.log(distance)
    
    if(this.cursors.left.justDown)
    {
        game.world.angle +=45;
         this.body.debugBody.updateSpriteTransform()
        game.physics.p2.gravity.y = Math.cos(game.world.rotation) * 100;
        game.physics.p2.gravity.x = Math.sin(game.world.rotation) * 100;
    }
    
    if(this.cursors.right.justDown)
    {
         game.world.angle -=45;
         this.body.debugBody.updateSpriteTransform()
         game.physics.p2.gravity.y = Math.cos(game.world.rotation) * 100;
        game.physics.p2.gravity.x = Math.sin(game.world.rotation) * 100;
    }
    
    stats.update();
}


function addStats()
{
    // STATS
	stats = new Stats();
	stats.domElement.style.position = "absolute";
	document.body.appendChild( stats.domElement );
}
                