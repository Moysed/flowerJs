class Game{
    constructor(){

        this.canvas = document.getElementById("game");
        this.context =this.canvas.getContext("2d");
        this.sprites = [];
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

        this.correctSfx = new SFX({
            context : this.audioContext,
            src:{mp3:"gliss.mp3", webm:"gliss.webm"},
            loop:false,
            volume:0.3
        });

        this.wrongSFX = new SFX({
            context : this.audioContext,
            src:{mp3:"boing.mp3",webm:"boing.webm"},
            loop:false,
            volume: 0.3
        })
        this.spriteImage  = new Image();
        this.spriteImage.src = "flower.png"

        const game = this;
        this.loadJSON("flowers", function(data,game){
            game.spriteData = JSON.parse(data);
            game.spriteImage = new Image();
            game.spriteImage.src = game.spriteData.meta.image;
            game.spriteImage.onload = function(){
                game.init();
            }
        })
    }

    loadJSON(json,callback){
        var xobj = new XMLHttpRequest();
            xobj.overrideMimeType("application/json");
            xobj.open('GET', json + '.json', true);
        const game = this;
        xobj.onreadystatechange = function (){
            if(xobj.readyState == 4 && xobj.status == "200"){
                callback(xobj.responseText,game);
            }
        };

        xobj.send(null);
    }
    init(){
        this.score = 0;
        this.lastRefreshTime = Date.now();
        this.spawn();
        this.refresh();

        const game =this;

        function tap(evt){
            game.tap(evt);
        }

        if('ontouchstart' in window){
            this.canvas.addEventListener("touchstart",tap, supportPassive ? { passive:true} : false);
        }else{
            this.canvas.addEventListener("mousedown",tap);
        }
    }


    tap(evt){
        const mousePos = this.getMousePos(evt);

        for(let sprite of this.sprites){
                if(sprite.hitTest(mousePos)){
                    sprite.live--;
                    if(sprite.index == 0){
                        this.correctSfx.play();
                            this.score += 1;
                    }
                    if(sprite.index == 1){
                        this.correctSfx.play();
                        this.score += 3;
                    }
                    if(sprite.index == 2){
                        this.correctSfx.play();  
                            this.score += 4;
                    }
                if(sprite.index == 3){
                    this.correctSfx.play();
                        this.score += 2;
                }
                if(sprite.index ==4){
                    this.wrongSFX.play();
                }
                
            }
    }
}

    getMousePos(evt){
        const rect =this.canvas.getBoundingClientRect();
        const clientX = evt.targetTouches ? evt.targetTouches[0].pageX : evt.clientX;
        const clientY = evt.targetTouches ? evt.targetTouches[0].pageY : evt.clientY;

        const canvasScale = this.canvas.width / this.canvas.offsetWidth;
        const loc = {};

        loc.x = (clientX - rect.left) * canvasScale;
        loc.y = (clientY - rect.top) * canvasScale;
        console.log(loc)
        return loc;
    }

    game(){

    }

    refresh(){
        const now = Date.now();
        const dt = (now - this.lastRefreshTime)/1000.0;

        this.update(dt);
        this.render();

        this.lastRefreshTime = now;

        const game = this;
        requestAnimationFrame(function() {game.refresh();});
    }

    spawn(){
        const index = Math.floor(Math.random() * 5);
        const frame = this.spriteData.frames[index].frame;
        const sprite = new Sprite({
            context: this.context,
            x: Math.random() * this.canvas.width,
            y: Math.random() * this.canvas.height,
            index : index,
            frame: frame,
            anchor: {x:0.5, y:0.5},
            image : this.spriteImage,
            live: (index==4) ? 5.0 : null,
            states:[{ mode:"spawn" , duration: 0.5} , { mode : "static", duration:1.5} , {mode :"die",duration:0.8}]
        });
        this.sprites.push(sprite);
        this.sinceLastSpawn = 0;
    }

    render(){
        this.context.clearRect(0,0,this.canvas.width , this.canvas.height);

        for(let sprite of this.sprites){
            sprite.render();
        }

        this.context.fillText("Score: " + this.score, 150, 30);
    }

    update(dt){
        this.sinceLastSpawn += dt;
        if(this.sinceLastSpawn > 1) this.spawn();

        let removed;
        do{
            removed = false;
            for(let sprite of this.sprites){
                if(sprite.kill){
                    const index = this.sprites.indexOf(sprite);
                    this.sprites.splice(index,1);
                    removed = true;
                    break;
                }
            }
        }while(removed);

        for(let sprite of this.sprites){
            if(sprite.index == 4 && sprite.opacity ==0 ){
                this.wrongSFX.play();
                this.score--;
            }
            if(sprite ==null) continue;
            sprite.update(dt);
        }
    }
}