
let cols=30;
let rows=30;

function Spot(x,y,z){
    this.i=x;
    this.j=y;
    this.z=z;
    this.x=150-(x*10)
    this.y=250-(y*10)
    this.f=0;
    this.g=0;
    this.h=0;
    this.neighbors=[];
    this.previous=undefined;
    this.wall=false;
    this.color='yellow'
    
    this.changeColor=(color)=>{
        this.color=color
    }
    this.getPos=()=>{
        return [this.x,this.y,this.z];
    }

    if(Math.random(1)<0.3){
        this.wall=true
    }
    this.show=(color)=>{
        // ctx.beginPath();         
        // ctx.rect(this.i*w,this.j*h,w,h);
        // ctx.fillStyle=color;
        // if(this.wall){
        //     ctx.fillStyle='black'
        // }
        // ctx.fillRect(this.i*w+1,this.j*h+1,w-2,h-2)
        // ctx.stroke();
    }
    this.addNeighbors=(grid)=>{
        var i = this.i;
        var j = this.j;

        if(i<cols-1){
            this.neighbors.push(grid[i+1][j]);
        }
        if(i>0){
            this.neighbors.push(grid[i-1][j]);
        }
        if(j<rows-1){
            this.neighbors.push(grid[i][j+1]);
        }
        if(j>0){
            this.neighbors.push(grid[i][j-1]);
        }
        if(j>0){
            this.neighbors.push(grid[i][j-1]);
        }
        if(i>0&&j>0){
            this.neighbors.push(grid[i-1][j-1])
        }
        if(i<cols-1&&j>0){
            this.neighbors.push(grid[i+1][j-1])
        }
        if(i>0&&j<rows-1){
            this.neighbors.push(grid[i-1][j+1])
        }
        if(i<cols-1&&j<rows-1){
            this.neighbors.push(grid[i+1][j+1])
        }
    }
}

export default Spot