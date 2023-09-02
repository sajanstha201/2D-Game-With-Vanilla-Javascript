canvas=document.getElementById("canvas1");
canvas.width=1000;
canvas.height=500;
const context=canvas.getContext('2d');
class player{
    constructor(game){
        this.game=game;
        this.height=190;
        this.levelup=0;
        this.width=120;
        this.x=25;
        this.y=30;
        this.frameX=0;
        this.frameY=this.levelup;
        this.framemax=37;
        this.speed=5;
        this.bullets=[];
        this.collision=0;
        this.life=10;
        this.bulletrem=new bulletrem();
        this.image=document.getElementById("player");
        this.score=0;
        this.scoreToWin=10;
        this.enemyEscape=0;
        this.enemyEscapeMaxLimit=10;
    }
    draw(context){
        if(this.game.debug===true)context.strokeRect(this.x,this.y,this.width,this.height);
        this.bullets.forEach(bullet=>{
            bullet.draw(context);
        })
        this.bulletrem.draw(context);
        context.drawImage(this.image,this.frameX*this.width,this.frameY*this.height,this.width,this.height,
            this.x,this.y,this.width,this.height);
    }
    update(deltatime){
        if(this.game.keys===-1)
            if((this.y+this.height)<this.game.height)
                this.y+=this.speed;
        if(this.game.keys===1)
            if(this.y>30)
                this.y-=this.speed; 
                this.bulletrem.update(deltatime)
        if(this.frameX<this.framemax)
            this.frameX++;
        else
            this.frameX  =0;
        //this is for bullet update
        this.bullets.forEach(bullet=>{
            bullet.update();
        })
        this.playercollision();
    }
    playercollision(){
        this.game.enemy.enemies.forEach(enem=>{
            if(this.game.enemy.checkCollision(this,enem)){
                this.game.enemy.destroy(enem);
                if(enem.type="whale")this.collision+=2;
                else this.collision++;
            }
        })
    }
}
class bulletrem{
    constructor(game){
        this.game=game;
        this.x=30;
        this.y=10;
        this.width=5;
        this.height=20;
        this.bulletremaining= 25;
        this.timer=500;
        this.bulletmax=25;
        this.time=0;
        this.imgBullet=document.getElementById("bullet");
    }
    draw(context){
        var i=0;
        for(i=0;i<this.bulletremaining;i++){
           // if(this.game.debug===true)context.strokeRect(this.x+i*5,this.y,this.width,this.height);
            context.drawImage(this.imgBullet,this.x+i*5,this.y,this.width,this.height); 
        }

    }
    update(deltatime){
        this.time+=deltatime;
        if(this.time>this.timer){
            this.time=0; 
            if(this.bulletremaining<this.bulletmax)
                this.bulletremaining++;
        }
    }
}
class bullet{
    constructor(game){
        this.game=game;
        this.shot=0;
        this.height=20;
        this.width=40;
        this.speed=7;
        this.x=this.game.player.x+this.game.player.width-35;
        this.y=this.game.player.y+25;
        this.imgBullet=document.getElementById("bullet");
    }
    update(){         
        this.x+=this.speed;
        this.game.player.bullets.forEach(bullet=>{
            if(bullet.x>this.game.width)this.game.player.bullets.splice(this.game.player.bullets.indexOf(bullet),1);
        })
    }
    draw(context){
        if(this.game.debug===true)context.strokeRect(this.x,this.y,this.width,this.height);
        context.drawImage(this.imgBullet,this.x,this.y,this.width,this.height); 
    }
    destroy(){
        this.game.player.bullets.splice(this.game.player.bullets.indexOf(this),1);
    }
}
class particle{
    constructor(game,x,y,width,height){
        this.game=game;
        this.image=document.getElementById("gears");
        this.x=x+0.5*width;
        this.y=y+0.5*height;
        this.size=50;
        this.imagesize=Math.random()*30+20;
        this.framex=Math.floor(Math.random()*3);
        this.framey=Math.floor(Math.random()*3);
        this.speedx=Math.floor(Math.random()*10)-5;
        this.speedy=Math.floor(Math.random()*10)-8;
        this.gravity=0.5;
        this.antigravity=(this.game.height-height)*0.03;
        this.angle=0;
        this.dangle=this.speedx*0.01;
    }
    update(){
        this.x+=this.speedx;
        this.y=this.y+this.gravity+this.speedy;
        this.gravity+=0.4;
        this.bouncing();
        if(this.y>this.game.height-90){
            this.destroy();
        }
        this.angle+=this.dangle;
    }
    draw(context){
        context.save();
        context.translate(this.x,this.y)
        context.rotate(this.angle);
        if(this.game.debug===true)context.strokeRect(this.x,this.y,this.imagesize,this.imagesize);
        context.drawImage(this.image,this.framex*this.size,this.framey*this.size,this.size,this.size,
            -0.5*this.size,-0.5*this.size,this.imagesize,this.imagesize);
        context.restore();    
    }
    bouncing(){
        if(this.y>=this.game.height-100){
            this.gravity=-this.antigravity;
            this.speedy=Math.random()*3;
            this.antigravity-=3;
        }
    }
    destroy(){
        this.game.enemy.particles.splice(this.game.enemy.particles.indexOf(this),1);
    }
}
class enemy{
    constructor(game){
        this.game=game;
        this.enemies=[];
        this.x=this.game.width;
        this.y=0;
        this.time=0;
        this.timeInterval=3000;
        this.particles=[];
    }
    update(deltatime){
        this.time+=deltatime;
        if(this.time>this.timeInterval){
            this.time=0;
            this.addEnemy();
        }
        this.enemies.forEach(enemy=>{
            enemy.x-=enemy.speed;
            if(enemy.framex===enemy.framemax)
                enemy.framex=0
            else
                enemy.framex++;
            this.game.player.bullets.forEach(bullet=>{
                if(this.checkCollision(bullet,enemy)){
                    bullet.destroy();
                    this.particles.push(new particle(this.game,enemy.x,enemy.y,enemy.width,enemy.height));
                    enemy.collision++;
                }
            })
            if(enemy.collision>=enemy.collisionlimit){
                this.destroy(enemy);
                this.game.player.score++;
            }
            if(enemy.x<-enemy.width){
                this.destroy(enemy);
                this.game.player.enemyEscape++;
            }
        })

        
        this.particles.forEach(particle=>{
            particle.update();
        })
    }


    draw(context){
        this.enemies.forEach(enemy=>{
            if(this.game.debug===true)context.strokeRect(enemy.x,enemy.y,enemy.width,enemy.height);
            context.drawImage(enemy.image,enemy.framex*enemy.width,enemy.framey*enemy.height,
                enemy.width,enemy.height,enemy.x,enemy.y,enemy.width,enemy.height);
        })
        this.particles.forEach(particle=>{
            particle.draw(context);
        })
    }
    addEnemy(){
        var x=Math.random();
        if(x<0.2)
            this.enemies.push(new enemy1());
        else if(x<0.4)
            this.enemies.push(new enemy2());
        else if(x<0.6)
            this.enemies.push(new drone());
        else if(x<0.8)
            this.enemies.push(new whale());
    }
    destroy(enemy){
        for(var i=0;i<enemy.numberOfParticles;i++){
            this.particles.push(new particle(this.game,enemy.x,enemy.y,enemy.width,enemy.height));
        }
        this.enemies.splice(this.enemies.indexOf(enemy),1);
    }
    checkCollision(rect1,rect2){
        return(rect1.y<rect2.y+rect2.height&&rect1.y+rect1.height>rect2.y
            &&rect1.x<rect2.x+rect2.width&&rect1.x+rect1.width>rect2.x);
    }
}
class enemy1 extends enemy{
    constructor(){
        super(game);
        this.v=Math.random();
        if(this.v<0.5)this.y=this.v*this.game.height*0.7+20;
        else this.y=this.v*this.game.height*0.7-20;
        this.height=169;
        this.width=228;
        this.framex=0;
        this.framemax=37;
        this.framey=(this.v<0.3)?0:((this.v<0.6)?1:2);
        this.collision=0;
        this.collisionlimit=3;
        this.speed=3;
        this.image=document.getElementById("enemy1");
        this.numberOfParticles=3;
        this.type="enemy1";
    }
}
class enemy2 extends enemy{
    constructor(){
        super(game);
        this.v=Math.random();
        if(this.v<0.5)this.y=this.v*this.game.height*0.7+20;
        else this.y=this.v*this.game.height*0.7-20;
        this.width=213;
        this.height=165;
        this.framex=0;
        this.framemax=37;
        this.framey=(Math.random()>0.5)?0:1;
        this.collision=0;
        this.collisionlimit=3;
        this.speed=(this.framey==0)?2:3;
        this.image=document.getElementById("enemy2");
        this.numberOfParticles=3;
        this.type="enemy2";
    }
}
class drone extends enemy{
    constructor(){
        super(game);
        this.v=Math.random();
        if(this.v<0.5)this.y=this.v*this.game.height*0.7+20;
        else this.y=this.v*this.game.height*0.7-20;
        this.width=115;
        this.height=95;
        this.framex=0;
        this.framemax=37;
        this.framey=(Math.random()>0.5)?0:1;
        this.collision=0;
        this.collisionlimit=1;
        this.speed=(this.framey==0)?4:3;
        this.image=document.getElementById("drone");
        this.numberOfParticles=1;
        this.type="drone";
    }
}
class whale extends enemy{
    constructor(){
        super(game);
        this.v=Math.random();
        if(this.v<0.5)this.y=this.v*this.game.height*0.7+20;
        else this.y=this.v*this.game.height*0.7-20;
        this.width=400;
        this.height=227;
        this.framex=0;
        this.framemax=37;
        this.framey=0;
        this.collision=0;
        this.collisionlimit=10;
        this.speed=2;
        this.image=document.getElementById("whale");
        this.numberOfParticles=20;
        this.type="whale";
    }
}
class input{
    constructor(game){
        this.game=game;
        this.arrowUp=0;
        this.arrowDown=0;
        this.null=0;
        this.space=0;
        window.addEventListener('keydown',e=>{   
            if(e.key==="ArrowUp")
                this.game.keys=1;
            else if(e.key==="ArrowDown")
                this.game.keys=-1;
            if(e.key===" "){
                if(this.game.player.bulletrem.bulletremaining>0){
                    this.game.player.bullets.push(new bullet(this.game));
                    this.game.player.bulletrem.bulletremaining--;
                }
            }
            if(e.key==='d')
                this.game.debug=!this.game.debug;
        })
    }
}
class backGround{
    constructor(game){
        this.game=game;
        this.layers=[];
        this.layer1=document.getElementById("layer1");
        this.layer2=document.getElementById("layer2");
        this.layer3=document.getElementById("layer3");
        this.layer4=document.getElementById("layer4");
        this.layers.push(new layer(this.game,this.layer1,0.2));
        this.layers.push(new layer(this.game,this.layer2,0.5));
        this.layers.push(new layer(this.game,this.layer3,1));
        this.layer4=new layer(this.game,this.layer4,1.5);
    }
    update(){
        this.layers.forEach(layer=>{
            layer.update();
        })
    }
    draw(context){
        this.layers.forEach(layer=>{
            layer.draw(context);
        })
    }

}
class layer{
    constructor(game,image,speed){
        this.game=game;
        this.image=image;
        this.speed=speed;
        this.x=0;
        this.y=0;
        this.framex=0;
        this.framey=0
    }
    update(){
        if(this.x<=(-this.image.width)){
          this.x=0;
       }
        this.x-=this.speed;
    }
    draw(context){
        context.drawImage(this.image,this.x,this.y,this.image.width,this.image.height);
        context.drawImage(this.image,this.x+this.image.width,this.y,this.image.width,this.image.height);
    }
}
class UI{
    constructor(game){
    this.game=game;
    this.playerlost=false;
    }
    update(){
    }
    draw(context){
        context.font='50px Arial';
        context.fillStyle='white';
        context.textAlign='center';
        console.log(this.game.width);
        if(this.game.player.collision>=this.game.player.life
            ||this.game.player.enemyEscape>=this.game.player.enemyEscapeMaxLimit){
            context.fillText('YOU LOST',0.5*this.game.width,0.4*this.game.height);
            context.fillText("TRY NEXT TIME",0.5*this.game.width,0.55*this.game.height);
        }
        if(this.game.player.score>=this.game.player.scoreToWin){
            context.fillText("YOU WIN",0.5*this.game.width,0.4*this.game.height)
        }
    }
}
class game{
    constructor(canvas){
        this.height=canvas.height;
        this.width=canvas.width;
        this.player=new player(this);
        this.keys=0;
        this.input=new input(this);
        this.bullet=new bullet(this);
        this.debug=false;
        this.enemy=new enemy(this);
        this.background=new backGround(this);
        this.enteredEnemy=0;
        this.ui=new UI(this);
        //for debugging only
        //this.particle=new particle(this,200,200);
    }
    update(deltatime){
        this.background.update();
        this.player.update(deltatime);
        this.enemy.update(deltatime);
        this.background.layer4.update();
        this.ui.update();
        //for deubggin only
        //this.particle.update();
      
    }
    draw(context){
        this.background.draw(context);   
        this.player.draw(context);
        this.enemy.draw(context);  
        this.background.layer4.draw(context);
        this.ui.draw(context);
        //for debugging only
       // this.particle.draw(context);
    }
    render(context,deltatime){
        this.update(deltatime);
        this.draw(context)
    }
}
window.addEventListener('load',function(){
    game=new game(canvas);
    var lasttime=0
    function animate(timeStamp){
        var deltatime=timeStamp-lasttime;
        lasttime=timeStamp;
        context.clearRect(0,0,canvas.width,canvas.height);
        game.render(context,deltatime);
        requestAnimationFrame(animate)
    }
    animate(0);  
})