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

const map = (num, x1, y1, x2, y2) => {
    return (num - x1) * (y2 - x2) / (y1 - x1) + x2;
}

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

    dist(vector) {
        const dx = vector.x - this.x;
        const dy = vector.y - this.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
}


class Game {
    constructor() {
        this.initialTime = Date.now();

        this.boid = new Boid(5, 5);
        const pathPoints = [
            new Vector(0, c.height / 2),
            new Vector(c.width / 5, c.height / 2),
            new Vector(c.width * 2 / 5, c.height / 4),
            new Vector(c.width * 3 / 5, c.height - c.height / 4),
            new Vector(c.width * 4 / 5, c.height / 6),
            new Vector(c.width, c.height / 2),
        ];
        this.path = new Path(2, pathPoints);
    }

    update(dt) {
        this.boid.seek(target);
        this.boid.arrive(target);
        this.boid.update(dt);
    }

    render() {
        cc.clearRect(0, 0, c.width, c.height);

        // if (target) {
        //     cc.fillStyle = "#0ff";
        //     cc.fillRect(target.x - 30, target.y - 30, 60, 60);
        // }
        this.path.render();
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

    addForce(force) {
        // this.forces[name] = force;
        this.acceleration.add(force);
    }

    applyForce() {
        const netForce = new Vector();
        Object.values(this.forces).forEach(force => netForce.add(force));
        this.acceleration = netForce;
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
        const desired = Vector.sub(target, this.position);
        desired.setMagnitude(this.maxSpeed);
        const steering = Vector.sub(desired, this.velocity);
        steering.setMagnitude(this.maxForce);
        this.addForce(steering);
    }

    arrive(target) {
        if (!target) return;
        const desired = Vector.sub(target, this.position);
        const d = desired.getMagnitude();

        if (d < this.perceptionRadius) {
            desired.setMagnitude(map(d, 0, this.perceptionRadius, 0, this.maxSpeed));
        } else desired.setMagnitude(this.maxSpeed);
        const steer = Vector.sub(desired, this.velocity).setMagnitude(this.maxForce);
        this.addForce(steer);
        // desired.setMagnitude(this.maxSpeed);
        // const steering = Vector.sub(desired, this.velocity);
        // steering.setMagnitude(this.maxForce);
        // this.addForce('steer', steering);
    }

    checkBounds() {
        if (this.position.x > c.width) this.position.x = 0;
        if (this.position.x < 0) this.position.x = c.width;

        if (this.position.y > c.height) this.position.y = 0;
        if (this.position.y < 0) this.position.y = c.height;
    }

    update(dt) {
        this.velocity.add(this.acceleration);
        // console.log(this.velocity);
        // console.log(this.acceleration);
        this.position.add(this.velocity);

        // this.velocity.add(this.acceleration.multiply(dt));
        // this.position.add(this.velocity.multiply(dt));
        // this.checkBounds();
        this.acceleration.multiply(0);
    }

    render() {
        cc.fillStyle = "#0f0";
        cc.beginPath();
        cc.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI);
        cc.closePath();
        cc.fill();
    }
}

class Path {
    constructor(radius, points) {
        this.points = points || [];
        this.radius = radius;
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
            cc.strokeStyle = "#f00";
            cc.strokeWidth = 2;
            cc.beginPath();
            let current = this.points[i];
            let next = this.points[i + 1];
            cc.moveTo(current.x, current.y);
            cc.lineTo(next.x, next.y);
            cc.closePath();
            cc.stroke();
        }
    }
}