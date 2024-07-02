class Sprite{

    constructor(option){
        this.context = option.context;
        this.width = option.width;
        this.height = option.height;
        this.image = option.image;
        this.x = option.x;
        this.y = option.y;
        this.states = option.states;
        this.state = 0;
        this.scale = (option.scale == null)? 1.0 : option.scale;
        this.opacity = (option.opacity == null)? 1.0 : option.opacity;
        this.currentTime =0;
        this.kill =false;
    }

    render(){
        const alpha = this.context.globalAlpha;

        this.context.globalAlpha = this.opacity;

        this.context.drawImage(
            this.image,
            0,
            0,
            this.width,
            this.height,
            this.x,
            this.y,
            this.width * this.scale,
            this.height * this.scale);

            this.context.globalAlpha = alpha;
    
    }

    set state(index){
        this.stateIndex = index;
        this.stateTime = 0;
    }

    get state(){
        let result;

        if(this.stateIndex<this.states.length){
            result = this.states[this.stateIndex];
        } 

        return result;
    }

    update(dt){
        this.stateTime += dt;
        const state = this.state;
        if(state ==null){
            this.kill = true;
            return;
        }
        const delta = this.stateTime/state.duration;
        if(delta > 1) this.state = this.stateIndex +1;

        switch(state.mode){
            case"spawn":
                this.scale = delta;
                this.opacity = delta;
                break;

            case "static" :
                this.scale = 1.0
                this.opacity = 1.0
                break;
            case "die":
                this.scale = 1.0 + delta;
                this.opacity = 1.0 - delta;
                if(this.opacity < 0) this.opacity=0;
                break;
        }
    }
}
