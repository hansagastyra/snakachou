$(document).ready(function(){
    var CANVAS_WIDTH = $(window).width();
    var CANVAS_HEIGHT = $(window).height();
    var CANVAS_CENTER_X = CANVAS_WIDTH/2;
    var CANVAS_CENTER_Y = CANVAS_HEIGHT/2;
    var FPS = 30; //FPS for this game
    var SECOND = 1000; //a second in miliseconds
    var TIME_LIMIT = 8; //in seconds
    var SNAKE_INITIAL_LENGTH = 5;
    var SNAKE_INITIAL_DIRECTION = "right";
    var SNAKE_COLOR = "#000000";
    var FOOD_COLOR = "#000000";
    var UI_COLOR = "#FF8080";
    var FONT_SIZE = 80;
    var BLOCK = 10; //each block is 10x10 pixels
    var WIDTH = Math.floor(CANVAS_WIDTH/BLOCK) - 1; //width in block
    var HEIGHT = Math.floor(CANVAS_HEIGHT/BLOCK) - 1; //height in block
    var canvas = document.getElementById("game-container");
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    
    var context;
    if(canvas.getContext){
        context = canvas.getContext("2d");
    }
    
    /* GAME CONSTANTS */
    var MAX_FOOD = 10; //Maximum generated food
    
    /* THE GAME STATE */
    var game = {
        die: false,
        score: 0,
        time: 0,
        dying: function(){
            this.die = true;
        },
        scored: function(){
            this.score++;
        },
        reset: function(){
            this.die = false;
            this.score = 0;
            this.time = TIME_LIMIT;
        },
        countdown: function(){
            this.time--;
            if(this.time === 0){
                this.die = true;
            }
        },
        countreset: function(){
            this.time = TIME_LIMIT;
        }
    };
    
    /* THE SNAKE */
    var snake = {
        array: [],
        direction: "",
        length: 0,
        hasMoved: false,
        init: function(){
            this.array.length = 0; //reset array
            this.direction = SNAKE_INITIAL_DIRECTION;
            this.length = SNAKE_INITIAL_LENGTH;
            for(var i = 0; i < this.length; i++){
                this.insert(i,0);
            }
        },
        insert: function(pX, pY){
            this.array.unshift({x: pX, y: pY});
        },
        pop: function(){
            return this.array.pop();
        },
        head: function(){
            return this.array[0];
        },
        get: function(i){
            return this.array[i];
        },
        incrementLength: function(){
            this.length++;
        },
        moved: function(){
            this.hasMoved = true;
        },
        unmoved: function(){
            this.hasMoved = false;
        }
    };
    
    /* The Food */
    var food = {
        array: [],
        count: 0,
        generate: function(){
            var foodNumber = Math.floor((Math.random() * MAX_FOOD) + 1);
            this.count = foodNumber;
            for(var i = 0; i < this.count; i++){
                this.array.unshift({x: Math.floor(Math.random()*WIDTH), y: Math.floor(Math.random()*HEIGHT)});
            }
        },
        get: function(i){
            return this.array[i];
        },
        remove: function(i){
            this.array.splice(i,1);
            this.count--;
        }
    };
    
    /* USER INPUT */
    $(document).keydown(function(event){
        switch(event.keyCode){
            case 13:
                /* ENTER */
                if(game.die){
                    initGame();
                }
                break;
            case 37:
                /* LEFT ARROW */
                if(isUpDown() && !snake.hasMoved){
                    snake.direction = "left";
                }
                break;
            case 38:
                /* UP ARROW */
                if(isLeftRight() && !snake.hasMoved){
                    snake.direction = "up";
                }
                break;
            case 39:
                /* RIGHT ARROW */
                if(isUpDown() && !snake.hasMoved){
                    snake.direction = "right";
                }
                break;
            case 40:
                /* DOWN ARROW */
                if(isLeftRight() && !snake.hasMoved){
                    snake.direction = "down";
                }
                break;
        }
        snake.moved();
    });
    
    function isUpDown(){
        return (snake.direction === "up" || snake.direction === "down");
    }
    
    function isLeftRight(){
        return (snake.direction === "left" || snake.direction === "right");
    }
    
    function initGame(){
        snake.init(); //Initialize the snake
        food.generate(); //Initialize the food
        game.reset();
    }
    
    /* INIT THE GAME */
    initGame();
    
    /* THE TIMER */
    setInterval(function(){
        if(!game.die){
            game.countdown();
        }
    }, SECOND);
    
    /* THE GAME LOOP */
    setInterval(function(){
        update();
        render();
    }, SECOND/FPS);
    
    function update(){
        if(!game.die){
            snakeUpdate();
            if(isCollide()){
                game.dying();
            }
        }
    }
    
    function snakeUpdate(){
        var headX = snake.head().x;
        var headY = snake.head().y;
        switch(snake.direction){
            case "up":
                headY--;
                break;
            case "down":
                headY++;
                break;
            case "left":
                headX--;
                break;
            case "right":
                headX++;
                break;
        }
        //if it's not eat food, then pop the tail, add the head
        if(isFood()){
            if(food.count === 0){
                food.generate(); //generate new food
            }
            snake.incrementLength();
            game.scored();
            game.countreset();
        } else{
            snake.pop();
        }
        snake.insert(headX, headY); //insert new head
        snake.unmoved(); //reset hasMoved
    }
    
    function isCollide(){
        var collide = false;
        // check if the head is collide with the body
        for(var i = 1; i < snake.length-1; i++){
            if(snake.head().x === snake.get(i).x && snake.head().y === snake.get(i).y){
                return true;
            }
        }
        // check if the snake hit the border
        if(snake.head().x < 0 || snake.head().x > WIDTH || snake.head().y < 0 || snake.head().y > HEIGHT){
            return true;
        }
        
        return collide;
    }
    
    function isFood(){
        var eat = false;
        // check if the head is on food location
        for(var i = 0; i < food.count; i++){
            if(snake.head().x === food.get(i).x && snake.head().y === food.get(i).y){
                eat = true;
                food.remove(i);
                break;
            }
        }
        return eat;
    }
    
    function render(){
        renderInit();
        renderUI();
        renderSnake();
        renderFood();
    }
    
    function renderInit(){
        context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }
    
    function renderSnake(){
        context.fillStyle = SNAKE_COLOR;
        for(var i = 0; i < snake.length; i++){
            renderBlock(snake.get(i).x, snake.get(i).y);
        }
    }
    
    function renderBlock(pX, pY){
        context.fillRect(pX*BLOCK, pY*BLOCK, BLOCK, BLOCK);
    }
    
    function renderFood(){
        context.fillStyle = FOOD_COLOR;
        for(var i = 0; i < food.count; i++){
            context.fillRect(food.get(i).x * BLOCK, food.get(i).y * BLOCK, BLOCK, BLOCK);
        }
    }
    
    function renderUI(){
        context.fillStyle = UI_COLOR;
        context.font = "bold " + FONT_SIZE + "px Helvetica";
        context.textAlign = "center";
        context.fillText(game.score, CANVAS_CENTER_X, CANVAS_CENTER_Y - FONT_SIZE)
        context.font = "bold " + FONT_SIZE * 0.75 + "px Helvetica";;
        context.fillText("Time : " + game.time, CANVAS_CENTER_X, CANVAS_CENTER_Y);
        if(game.die){
            context.font = "bold " + FONT_SIZE * 0.5 + "px Helvetica";
            context.fillText("Game Over :(", CANVAS_CENTER_X, CANVAS_CENTER_Y + FONT_SIZE);
            context.fillText("Press ENTER to reset", CANVAS_CENTER_X, CANVAS_CENTER_Y + (2 * FONT_SIZE));
        }
    }
});
