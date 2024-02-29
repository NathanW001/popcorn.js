// module aliases
var Engine = Matter.Engine,
    Render = Matter.Render,
    Runner = Matter.Runner,
    Bodies = Matter.Bodies,
    Composite = Matter.Composite;

// create an engine
var engine = Engine.create();
engine.gravity.scale = 0.0003

//Colors
const background_color = ['#494C49', '#595B59', '#616461']
const ball_colors = ['#436E6A', '#5B8375', '#BBDEBF', '#FEF3C6']

// create a renderer
var render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        width: window.innerWidth,
        height: window.innerHeight,
        background: Matter.Common.choose(background_color)
        // showAngleIndicator: true
    }
});

// Turn on and off to see colors
render.options.wireframes = false


// create two boxes and a ground
//var stack = Matter.Composites.stack(20, 20, (window.innerWidth-20)/100, (window.innerHeight-20)/100, window.innerWidth/((window.innerWidth-20)/100), window.innerHeight/((window.innerHeight-20)/100), function(x, y) {
//    return Bodies.circle(x, y, Matter.Common.random(20, 40), { friction: 0.00001, restitution: 0.5, density: 0.001 });
//});

var ground = Bodies.rectangle(window.innerWidth/2, window.innerHeight+50, window.innerWidth, 100, { isStatic: true });
var wall1 = Bodies.rectangle(-50, innerHeight/2, 100, window.innerHeight, { isStatic: true })
var wall2 = Bodies.rectangle(window.innerWidth+50, innerHeight/2, 100, window.innerHeight, { isStatic: true })
var roof = Bodies.rectangle(window.innerWidth/2, -50, window.innerWidth, 100, { isStatic: true });

// add all of the bodies to the world
//Composite.add(engine.world, stack);
Composite.add(engine.world, [ground, wall1, wall2, roof])

Composite.allBodies(engine.world).forEach((body) => {
    body.render.fillStyle = Matter.Common.choose(ball_colors)
})

// add mouse input
var mouse = Matter.Mouse.create(render.canvas),
    mouse_constraint = Matter.MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: {
            stiffness: 0.2,
            render: {
                visible: false
            }
        }
    });

Composite.add(engine.world, mouse_constraint);

// run the renderer
Render.run(render);

var to_launch = []

// add colision event
Matter.Events.on(engine, 'collisionStart', (event) => {
    var pairs = event.pairs;    
    for (var i = 0; i < pairs.length; i++) {
        var pair = pairs[i];
	console.log(pair.bodyA, pair.bodyB)
        if (pair.bodyA === ground) {
            // Matter.Body.applyForce(pair.bodyB, pair.bodyB.position, (0, -10))
            console.log("A")
            to_launch.push(pair.bodyB)
        }
        else if (pair.bodyB === ground) {
            // Matter.Body.applyForce(pair.bodyA, pair.bodyA.position, {x:0, y:100})
            console.log("B", pair)
            // pair.bodyA.render.fillStyle = '#333'
            to_launch.push(pair.bodyA)
        }
        else if (pair.bodyA !== ground && pair.bodyA !== wall1 && pair.bodyA !== wall2 && pair.bodyB !== ground && pair.bodyB !== wall1 && pair.bodyB !== wall2 && pair.bodyA !== roof && pair.bodyB !== roof) {
            // pair.bodyA.render.fillStyle = pair.bodyB.render.fillStyle
            // var new_color = Math.floor((parseInt(pair.bodyA.render.fillStyle.substring(1), 16) + parseInt(pair.bodyB.render.fillStyle.substring(1), 16))/2)
	    var red_avg = Math.floor((parseInt(pair.bodyA.render.fillStyle.substring(1, 3), 16) + parseInt(pair.bodyB.render.fillStyle.substring(1, 3), 16))/2)
	    var green_avg = Math.floor((parseInt(pair.bodyA.render.fillStyle.substring(3, 5), 16) + parseInt(pair.bodyB.render.fillStyle.substring(3, 5), 16))/2)
	    var blue_avg = Math.floor((parseInt(pair.bodyA.render.fillStyle.substring(5), 16) + parseInt(pair.bodyB.render.fillStyle.substring(5), 16))/2)
	    pair.bodyA.render.fillStyle = '#' + red_avg.toString(16) + green_avg.toString(16) + blue_avg.toString(16)
            pair.bodyB.render.fillStyle = '#' + red_avg.toString(16) + green_avg.toString(16) + blue_avg.toString(16)
        }
        
    }
})

Matter.Events.on(engine, 'beforeUpdate', (event) => {
    to_launch.forEach((body) => {
        Matter.Body.applyForce(body, body.position, {x:Matter.Common.random(-0.02, 0.02), y:-0.05*body.mass})
        // body.render.fillStyle = Matter.Common.choose(ball_colors)
    })
    to_launch = []
});

var spawn_ball = true;

Matter.Events.on(mouse_constraint, 'startdrag', (event) => {
    spawn_ball = false;
    console.log("drag");
});

Matter.Events.on(mouse_constraint, 'mouseup', (event) => {
    console.log(spawn_ball);
    if (spawn_ball === true) {
    	var new_circle = Bodies.circle(event.mouse.position.x, event.mouse.position.y, Matter.Common.random(20, 40), { friction: 0.00001, restitution: 0.5, density: 0.001 })
    	new_circle.render.fillStyle = Matter.Common.choose(ball_colors)
    	Composite.add(engine.world, new_circle)
    }
    spawn_ball = true
});

// create runner
var runner = Runner.create();

// run the engine
Runner.run(runner, engine);
