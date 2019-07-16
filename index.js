var c, cc;

var KEYS = {
    SPACE: "SPACE",
    LEFT: "LEFT",
    UP: "UP",
    RIGHT: "RIGHT",
    DOWN: "DOWN"
};

// var target;

const index = (i, j, rows) => i + (j * rows);

const clamp = (num, min, max) => {
    return Math.max(min, Math.min(num, max))
}

const heuristic = (a, b) => {
    const dx = b.position.x - a.position.x;
    const dy = b.position.y - a.position.y;
    return Math.sqrt(dx * dx + dy * dy);
    // return Math.abs(dx) + Math.abs(dy);
};

const map = (num, x1, y1, x2, y2) => {
    return (num - x1) * (y2 - x2) / (y1 - x1) + x2;
}

class Vector {
    constructor(x, y) {
        this.x = x || 0;
        this.y = y || 0;
    }

    // return the angle of the vector in radians
    getDirection() {
        return Math.atan2(this.y, this.x);
    };

    // set the direction of the vector in radians
    setDirection(direction) {
        var magnitude = this.getMagnitude();
        this.x = Math.cos(direction) * magnitude;
        this.y = Math.sin(direction) * magnitude;
        return this;
    };

    // get the magnitude of the vector
    getMagnitude() {
        // use pythagoras theorem to work out the magnitude of the vector
        return Math.sqrt(this.x * this.x + this.y * this.y);
    };

    // set the magnitude of the vector
    setMagnitude(magnitude) {
        var direction = this.getDirection();
        this.x = Math.cos(direction) * magnitude;
        this.y = Math.sin(direction) * magnitude;
        return this;
    };

    static add(v1, v2) {
        return new Vector(v1.x + v2.x, v1.y + v2.y);
        // this.x += vector.x;
        // this.y += vector.y;
    }

    static sub(v1, v2) {
        return new Vector(v1.x - v2.x, v1.y - v2.y);
        // this.x -= vector.x;
        // this.y -= vectory.y;
    }

    static mult(v, scalar) {
        return new Vector(v.x * scalar, v.y * scalar);
        // this.x *= scalar;
        // this.y *= scalar;
    }

    static div(v, scalar) {
        return new Vector(v.x / scalar, v.y / scalar);
        // this.x /= scalar;
        // this.y /= scalar;
    }

    add(vector) {
        // return new Vector(this.x + vector.x, this.y + vector.y);
        // debugger
        this.x += vector.x;
        this.y += vector.y;
        return this;
    }

    subtract(vector) {
        // return new Vector(this.x - vector.x, this.y - vector.y);
        this.x = vector.x - this.x;
        this.y = vector.y - this.y;
        return this;
    }

    multiply(scalar) {
        // return new Vector(this.x * scalar, this.y * scalar);
        this.x *= scalar;
        this.y *= scalar;
        return this;
    }

    divide(scalar) {
        // return new Vector(this.x / scalar, this.y / scalar);
        this.x /= scalar;
        this.y /= scalar;
        return this;
    }

    dot(vector) {
        // debugger
        return (this.x * vector.x) + (this.y * vector.y);
    }

    angleBetween(vector, degrees) {
        const step = this.dot(vector) / (this.getMagnitude() * vector.getMagnitude());
        const theta = Math.acos(step);
        if (degrees) return theta * 180 / Math.PI;
        else return theta;
    }

    normalize() {
        const dist = this.getMagnitude();
        return new Vector(this.x / dist, this.y / dist);
    }

    project(vector) {
        const normal = vector.normalize();
        return normal.multiply(this.dot(normal));
    }

    limit(scalar) {
        const limited = this.normalize().multiply(Math.min(this.getMagnitude(), scalar));
        this.x = limited.x;
        this.y = limited.y;
        return this;
    }

    dist(vector) {
        const dx = vector.x - this.x;
        const dy = vector.y - this.y;
        return Math.sqrt((dx * dx) + (dy * dy));
    }

    copy() {
        return new Vector(this.x, this.y);
    }

    static getNormalPoint(p, a, b) {
        const ap = Vector.sub(p, a);
        const ab = Vector.sub(b, a);

        const abNorm = ab.normalize();
        abNorm.multiply(ap.dot(abNorm));

        return Vector.add(a, abNorm);
    }
}

class ResourceManager {
    constructor() {
        this.resourceCache = {};
        this.loading = [];
        this.callbacks = [];
    }

    load(resource) {
        if (resource instanceof Array) {
            resource.forEach(res => this._load(res));
        } else this._load(resource);
    }

    _load(url) {
        if (this.resourceCache[url]) return this.resourceCache[url];
        else {
            this.loading.push(url);

            const img = new Image();
            img.onload = () => {
                this.resourceCache[url] = img;
                if (this.isReady()) this.callbacks.forEach(cb => cb());
            }
            img.src = url;
            this.resourceCache[url] = img;
        }
    }

    get(url) {
        return this.resourceCache[url];
    }

    isReady() {
        let ready = true;
        for (let k in this.resourceCache) {
            if (this.resourceCache.hasOwnProperty(k) && !(this.resourceCache[k]))
                ready = false;
        };
        return ready;
    }

    onReady(func) {
        this.callbacks.push(func);
    }
}

class InputManager {
    constructor() {
        this.pressedKeys = {};

        document.addEventListener('keydown', e => this.setKey(e, true));
        document.addEventListener('keyup', e => this.setKey(e, false));
    }

    setKey(e, status) {
        e.preventDefault();
        let key;
        switch (e.keyCode) {
            case 32:
                key = KEYS.SPACE;
                break;
            case 65:
                key = KEYS.LEFT;
                break;
            case 87:
                key = KEYS.UP;
                break;
            case 68:
                key = KEYS.RIGHT;
                break;
            case 83:
                key = KEYS.DOWN;
                break;
            case 37:
                key = KEYS.LEFT;
                break;
            case 38:
                key = KEYS.UP;
                break;
            case 39:
                key = KEYS.RIGHT;
                break;
            case 40:
                key = KEYS.DOWN;
                break;
            default:
                // Convert ASCII codes to letters
                key = String.fromCharCode(e.keyCode);

        }

        this.pressedKeys[key] = status;
    }

    isPressed(key) {
        return this.pressedKeys[key];
    }
}

const assets = [
    'assets/baseball_bat.png',
    'assets/blue_foot.png',
    'assets/blue_shoulder.png',
    'assets/bottom_wall.png',
    'assets/bullet.png',
    'assets/end_flag.png',
    'assets/green_foot.png',
    'assets/green_shoulder.png',
    'assets/helmet.png',
    'assets/left_wall.png',
    'assets/limb.png',
    'assets/machine_gun.png',
    'assets/metal_bat.png',
    'assets/pistol_reload.png',
    'assets/pistol.png',
    'assets/player_gun.png',
    'assets/player_hold.png',
    'assets/player_machine_gun_reload.png',
    'assets/player_machine_gun.png',
    'assets/player_standing.png',
    'assets/right_wall.png',
    'assets/start_flag.png',
    'assets/zombie.png',
    'assets/zombie_hit.png',
];

const rm = new ResourceManager();

document.addEventListener("DOMContentLoaded", () => {
    c = document.getElementById('canvas');
    cc = c.getContext('2d');

    const AgentsDemo = new Game(50);

    const startDemo = () => {
        let time = Date.now();
        let dt = (AgentsDemo.initialTime - time) / 1000.0;

        AgentsDemo.update(dt);
        AgentsDemo.render();

        AgentsDemo.initialTime = time;
        requestAnimationFrame(startDemo);
    }

    // c.addEventListener('mousemove', e => {
    //     const rect = c.getBoundingClientRect();
    //     target = new Vector(e.clientX - rect.left, e.clientY - rect.top);
    // });

    // startDemo();
    rm.load(assets);
    rm.onReady(startDemo);
});

class Game {
    constructor(cellCount) {
        this.initialTime = Date.now();

        // this.boid = new Boid(20, c.width * 3 / 4);
        // const pathPoints = [
        // new Vector(0, c.height / 4),
        // new Vector(c.width / 12, c.height / 12),
        // new Vector(c.width / 12, c.height / 6),
        // new Vector(c.width * 3 / 12, c.height / 3),
        // new Vector(c.width * 4 / 8, c.height - c.height / 6),
        // new Vector(c.width, c.height - c.height / 3)
        // ];

        // const a = new Vector(10, 2);
        // const b = new Vector(4, -3);
        // console.log(a.getMagnitude());
        // console.log(b.getMagnitude());
        // console.log(a.angleBetween(b, true));
        // console.log(a.dot(b));

        const pathPoints = [
            new Vector(0, c.height / 2),
            new Vector(c.width / 6, c.height / 2),
            new Vector(c.width / 6, c.height / 6 * 2),
            new Vector(c.width / 6 * 2, c.height / 6 * 2),
            new Vector(c.width / 6 * 2, c.height / 2),
            new Vector(c.width / 2, c.height / 2),
            new Vector(c.width / 2, c.height / 6),
            new Vector(c.width / 6 * 4, c.height / 6),
            new Vector(c.width / 6 * 4, c.height / 6 * 4),
            new Vector(c.width / 6 * 5, c.height / 6 * 4),
            new Vector(c.width / 6 * 5, c.height / 2),
            new Vector(c.width, c.height / 2)
        ];
        this.path = new Path(2, pathPoints);
        // this.boid.follow(this.path.points, this.path.radius);

        this.cellSize = 25; // for camera
        this.width = cellCount * this.cellSize;
        this.height = cellCount * this.cellSize;

        this.boid = new Boid(Math.random() * c.width, Math.random() * c.height);
        this.enemy = new Enemy(Math.random() * c.width, Math.random() * c.height, this.cellSize);

        // this.camera = new Camera(vpWidth, vpHeight, this.width, this.height, cellCount);
        // this.map = new Map(cellCount, this.cellSize);

        this.inputHandler = new InputManager();
        // this.viewport = new Viewport(this.cellSize, cellCount);
        this.player = new Player(this.cellSize, this.inputHandler, this.cellSize, cellCount);
        // this.camera.follow(this.player);

        this.initialTime = Date.now();
    }

    update(dt) {
        // this.boid.seek(target);
        // this.boid.arrive(target);
        this.boid.follow(this.path, this.path.points, this.path.radius);
        this.boid.update(dt);
        this.enemy.follow(this.path, this.path.points, this.path.radius);
        this.enemy.update(dt);
        this.player.update(dt);
    }

    render() {
        // cc.clearRect(0, 0, c.width, c.height);
        cc.fillStyle = "#000";
        cc.fillRect(0, 0, c.width, c.height);

        // if (target) {
        //     cc.fillStyle = "#0ff";
        //     cc.fillRect(target.x - 30, target.y - 30, 60, 60);
        // }
        this.path.render();
        this.enemy.render();
        this.boid.render();
        this.player.render();
    }
}

class Entity {
    constructor(x, y) {
        this.position = new Vector(x, y);
        // this.maxSpeed = 1000; // using dt in calculations...
        // this.maxForce = 10000; // using dt in calculations...
        this.maxSpeed = 0.25;
        this.maxForce = 0.01;
        this.velocity = new Vector(this.maxSpeed, 0);
        this.acceleration = new Vector(0, 0);
        this.forces = {};
    }

    applyForce(force) {
        this.acceleration.add(force);
    }
}

class Boid extends Entity {
    constructor(x, y) {
        super(x, y);
        // this.maxForce = 1;
        this.radius = 10;
        this.perceptionRadius = this.radius * 2;
    }

    // applyForce(force) {
    //     this.position.add(force);
    // }

    seek(target) {
        if (!target) return;
        let desired = Vector.sub(target, this.position);
        if (desired.getMagnitude() < 0.05) return;
        desired = desired.normalize().multiply(this.maxSpeed);
        const steering = Vector.sub(desired, this.velocity);
        steering.limit(this.maxForce);
        this.applyForce(steering);
    }

    arrive(target) {
        if (!target) return;
        const desired = Vector.sub(target, this.position);
        const d = desired.getMagnitude();

        if (d < this.perceptionRadius) {
            desired.setMagnitude(map(d, 0, this.perceptionRadius, 0, this.maxSpeed));
        } else desired.setMagnitude(this.maxSpeed);
        const steering = Vector.sub(desired, this.velocity).setMagnitude(this.maxForce);
        this.applyForce(steering);
    }

    follow(path) {
        const projection = this.velocity.normalize().multiply(this.perceptionRadius);
        this.predictedPos = Vector.add(this.position, projection);

        // let target = null;
        let winner = Infinity;

        for (let i = 0; i < path.points.length - 1; i++) {
            let a = path.points[i];
            let b = path.points[i + 1];


            let normalPoint = Vector.getNormalPoint(this.predictedPos, a, b);



            if (normalPoint.x < Math.min(a.x, b.x) || normalPoint.x > Math.max(a.x, b.x)) normalPoint = b.copy();
            else if (normalPoint.y < Math.min(a.y, b.y) || normalPoint.y > Math.max(a.y, b.y)) normalPoint = b.copy();

            const dist = this.predictedPos.dist(normalPoint);
            if (dist < winner) {
                winner = dist;
                this.normal = normalPoint.copy();
                const dir = Vector.sub(b, a).normalize();
                dir.multiply(this.perceptionRadius);
                this.target = Vector.add(this.normal, dir);
            }

        }
        this.seek(this.target);
    }

    checkBounds() {
        if (this.position.x - this.radius > c.width) this.position.x = -this.radius;
        if (this.position.x + this.radius < 0) this.position.x = c.width + this.radius;
        // if (this.position.x < 0) this.position.x = c.width;

        // if (this.position.y > c.height) this.position.y = 0;
        // if (this.position.y < 0) this.position.y = c.height;
    }

    handleRotation() { }

    update(dt) {
        this.handleRotation();

        this.velocity.add(this.acceleration);
        // debugger
        // console.log(this.velocity);
        // console.log(this.acceleration);
        this.velocity.limit(this.maxSpeed);
        this.position.add(this.velocity);

        // this.velocity.add(this.acceleration.multiply(dt));
        // this.position.add(this.velocity.multiply(dt));
        this.acceleration.multiply(0);

        this.checkBounds();
    }

    render() {
        // predicted position
        cc.fillStyle = "#f00";
        cc.beginPath();
        cc.arc(this.predictedPos.x, this.predictedPos.y, this.radius / 3, 0, 2 * Math.PI);
        cc.closePath();
        cc.fill();

        // boid
        cc.fillStyle = "#f0f";
        cc.beginPath();
        cc.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI);
        cc.closePath();
        cc.fill();

        // normal point on path relative to predicted pos
        cc.fillStyle = "#0ff";
        cc.beginPath();
        cc.arc(this.normal.x, this.normal.y, this.radius / 3, 0, 2 * Math.PI);
        cc.closePath();
        cc.fill();

        // target point on path boid aims to seek
        cc.fillStyle = "#fff";
        cc.beginPath();
        cc.arc(this.target.x, this.target.y, this.radius / 3, 0, 2 * Math.PI);
        cc.closePath();
        cc.fill();
    }
}

class Enemy extends Boid {
    constructor(x, y, size) {
        super(x, y);
        rm.onReady(this.init.bind(this));
        this.radius = size / 3;
        this.perceptionRadius = 2 * this.radius;
    }

    init() {
        this.sprite = rm.get("assets/zombie.png");
    }

    handleRotation() {
        // console.log('rotate');
        const diff = Vector.sub(this.target, this.position);
        this.angle = diff.getDirection();
    }

    render(offsetX, offsetY) {
        cc.save();
        cc.translate(this.position.x, this.position.y)
        cc.rotate(this.angle);
        cc.drawImage(this.sprite, -this.sprite.width / 2, -this.sprite.height / 2);
        cc.restore();

    }
}

class Bullet {
    constructor(sprite, pos) {
        // this.id = uuid();

        this.sprite = sprite;

        this.position = {
            x: pos.x,
            y: pos.y
        };

        this.velocity = {
            x: 0,
            y: 0
        };

        this.radius = 4;

        this.speed = 1000;

        this.collided = false;

        this.prevCollisionLength = 0;
    }

    updateVelocity(x, y) {
        this.velocity.x = x * this.speed;
        this.velocity.y = y * this.speed;
    }

    checkCollision() {

    }

    update(dt) {
        this.position.x += this.velocity.x * dt;
        this.position.y += this.velocity.y * dt;
    }

    render(ctx, offset) {
        cc.drawImage(this.sprite, this.position.x, this.position.y);
    }

    static update(bullets, collisionDetector, dt) {
        Object.keys(bullets).forEach(id => {
            bullets[id].update(dt);
            // const collided = collisionDetector.detectCollision(bullets[id]);
            // if (collided.length > 0) bullets[id].collided = true;
            // if (bullets[id].collided) delete bullets[id];
        });
    }

    static render(bullets, ...renderArgs) {
        Object.values(bullets).forEach(bullet => bullet.render(...renderArgs));
    }
}

class Player {
    constructor(size, inputHandler, cellSize, cellCount) {
        this.size = size / 3; //c.width / (size * 2);
        // this.screenX = 0;
        // this.screenY = 0;
        // this.sprite = rm.get('assets/player_standing.png');
        // console.log(this.sprite);
        // this.width = this.sprite.width;
        // this.height = this.sprite.height;
        // console.log(this.width, this.height);
        this.angle = 0;
        window.addEventListener('mousemove', this.handleRotation.bind(this));
        c.addEventListener('click', this.shoot.bind(this));
        rm.onReady(this.init.bind(this));
        this.position = {
            x: this.size,
            y: this.size
        };

        this.velocity = {
            x: 0,
            y: 0
        };

        this.speed = this.size * 20;


        this.ih = inputHandler;

        this.cellSize = cellSize;
        this.cellCount = cellCount;
        this.bullets = [];
    }

    getMousePosition(e) {
        const rect = c.getBoundingClientRect();
        const mousePos = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };

        const dy = mousePos.y - c.height / 2;
        const dx = mousePos.x - c.width / 2;

        return { x: dx, y: dy };
    }

    shoot(e) {
        e.preventDefault();
        const mouse = this.getMousePosition(e);

        const bullet = new Bullet(this.bulletSprite, this.position);
        let x, y;
        if (navigator.getGamepads()[0]) {
            x = this.delta.x;
            y = this.delta.y;
        } else {
            x = mouse.x;
            y = mouse.y;
        }
        const magnitude = -Math.sqrt(x * x + y * y);

        x /= magnitude;
        y /= magnitude;

        bullet.updateVelocity(x, y);
        this.bullets.push(bullet);
    }

    handleRotation(e) {
        // this.updatePivot();

        // this.angle = Math.atan2(e.clientY - this.regY, e.clientX - this.regX);
        this.angle = Math.atan2(e.clientY - this.position.y - this.height / 2, e.clientX - this.position.x - this.width / 2);
        // console.log(e.clientX, e.clientY);
        // console.log(this.angle);

        // this.angle = this.angle * (180 / Math.PI);

        // if (this.angle < 0) {

        //     this.angle = 360 - (-this.angle);

        // }
    }

    init() {
        window.sprite = this.sprite = rm.get('assets/player_standing.png');
        this.width = this.sprite.width;
        this.height = this.sprite.height;
        this.bulletSprite = rm.get('assets/bullet.png');
    }

    updatePivot() {
        this.regX = this.position.x + this.width / 2;
        this.regY = this.position.y + this.height / 2;
    }

    handleInput() {
        if (this.ih.isPressed(KEYS.UP)) {
            this.velocity.y = this.speed;
        } else if (this.ih.isPressed(KEYS.DOWN)) {
            this.velocity.y = -this.speed;
        } else {
            this.velocity.y = 0;
        }

        if (this.ih.isPressed(KEYS.RIGHT)) {
            this.velocity.x = -this.speed;
        } else if (this.ih.isPressed(KEYS.LEFT)) {
            this.velocity.x = this.speed;
        } else {
            this.velocity.x = 0;
        }
    }

    update(dt) {
        this.handleInput();
        this.position.x += this.velocity.x * dt;
        this.position.y += this.velocity.y * dt;

        Bullet.update(this.bullets, true, dt);
    }

    render(offsetX, offsetY) {
        cc.save();
        cc.translate(this.position.x, this.position.y)
        cc.rotate(this.angle);
        cc.drawImage(this.sprite, -this.width / 2, -this.height / 2);
        cc.restore();

        Bullet.render(this.bullets, cc);

    }
}

class Path {
    constructor(radius, points) {
        this.points = points || [];
        this.radius = 20;
    }

    addPoint(point) {
        this.points.push(point);
    }

    getStart() {
        return this.points[0];
    }

    getEnd() {
        return this.points[this.points.length - 1];
    }

    render() {
        for (let i = 0; i < this.points.length - 1; i++) {
            cc.strokeStyle = "#0f0";
            cc.strokeWidth = 2;
            cc.beginPath();
            let current = this.points[i];
            let next = this.points[i + 1];
            cc.moveTo(current.x, current.y);
            cc.lineTo(next.x, next.y);
            cc.closePath();
            cc.stroke();

            // path radius
            // cc.strokeStyle = "#fff";
            // cc.strokeWidth = 1;
            // cc.beginPath();
            // cc.moveTo(current.x, current.y - this.radius);
            // cc.lineTo(next.x, next.y - this.radius);
            // cc.closePath();
            // cc.stroke();
            // cc.strokeStyle = "#fff";
            // cc.strokeWidth = 1;
            // cc.beginPath();
            // cc.moveTo(current.x, current.y + this.radius);
            // cc.lineTo(next.x, next.y + this.radius);
            // cc.closePath();
            // cc.stroke();
        }
    }
}