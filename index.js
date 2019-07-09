var c, cc;

var KEYS = {
    SPACE: "SPACE",
    LEFT: "LEFT",
    UP: "UP",
    RIGHT: "RIGHT",
    DOWN: "DOWN"
};

var target;

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

document.addEventListener("DOMContentLoaded", () => {
    c = document.getElementById('canvas');
    cc = c.getContext('2d');

    const AgentsDemo = new Game(c.width, c.height, 50);

    const startDemo = () => {
        let time = Date.now();
        let dt = (AgentsDemo.initialTime - time) / 1000.0;

        AgentsDemo.update(dt);
        AgentsDemo.render();

        AgentsDemo.initialTime = time;
        requestAnimationFrame(startDemo);
    }

    c.addEventListener('mousemove', e => {
        const rect = c.getBoundingClientRect();
        target = new Vector(e.clientX - rect.left, e.clientY - rect.top);
    });

    startDemo();
});

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
        return this.x * vector.x + this.y * vector.y;
    }

    angleBetween(vector, degrees) {
        const step = this.dot(vector) / this.getMagnitude() * vector.getMagnitude();
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
        return normal.multiply(this.dot(vector));
    }

    limit(scalar) {
        const limited = this.normalize().multiply(Math.min(this.getMagnitude(), scalar));
        this.x = limited.x;
        this.y = limited.y;
        return this;
    }
}


class Game {
    constructor() {
        this.initialTime = Date.now();

        this.boid = new Boid(5, 5);
    }

    update(dt) {
        this.boid.seek(target);
        this.boid.update(dt);
    }

    render() {
        cc.clearRect(0, 0, c.width, c.height);

        if (target) {
            cc.fillStyle = "#0ff";
            cc.fillRect(target.x - 10, target.y - 10, 20, 20);
        }

        this.boid.render();
    }
}

class Entity {
    constructor(x, y) {
        this.position = new Vector(x, y);
        this.velocity = new Vector(5, 0);
        this.acceleration = new Vector(0, 0);
        this.maxSpeed = 1000; // using dt in calculations...
        this.maxForce = 10000; // using dt in calculations...
        this.maxSpeed = 10;
        this.maxForce = 0.5;
        this.forces = {};
    }

    addForce(name, force) {
        this.forces[name] = force;
    }

    applyForce() {
        const totalForce = new Vector();
        Object.values(this.forces).forEach(force => totalForce.add(force));
        this.acceleration = totalForce;
    }
}

class Boid extends Entity {
    constructor(x, y) {
        super(x, y);
        // this.maxForce = 1;
        this.radius = 4;
    }

    // applyForce(force) {
    //     this.position.add(force);
    // }

    seek(target) {
        if (!target) return;
        const desired = Vector.sub(target, this.position);
        desired.setMagnitude(this.maxSpeed);
        const steering = Vector.sub(desired, this.velocity);
        steering.setMagnitude(this.maxForce);
        this.addForce('steer', steering);
    }

    checkBounds() {
        if (this.position.x > c.width) this.position.x = 0;
        if (this.position.x < 0) this.position.x = c.width;

        if (this.position.y > c.height) this.position.y = 0;
        if (this.position.y < 0) this.position.y = c.height;
    }

    update(dt) {
        this.applyForce();

        this.velocity.add(this.acceleration);
        this.position.add(this.velocity);

        // this.velocity.add(this.acceleration.multiply(dt));
        // this.position.add(this.velocity.multiply(dt));
        // this.checkBounds();
    }

    render() {
        cc.fillStyle = "#0f0";
        cc.beginPath();
        cc.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI);
        cc.closePath();
        cc.fill();
    }
}