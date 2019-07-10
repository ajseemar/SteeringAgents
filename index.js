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

    // c.addEventListener('mousemove', e => {
    //     const rect = c.getBoundingClientRect();
    //     target = new Vector(e.clientX - rect.left, e.clientY - rect.top);
    // });

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


class Game {
    constructor() {
        this.initialTime = Date.now();

        // this.boid = new Boid(20, c.width * 3 / 4);
        this.boid = new Boid(Math.random() * c.width, Math.random() * c.height);
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
    }

    update(dt) {
        // this.boid.seek(target);
        // this.boid.arrive(target);
        this.boid.follow(this.path, this.path.points, this.path.radius);
        this.boid.update(dt);
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
        this.boid.render();
    }
}

class Entity {
    constructor(x, y) {
        this.position = new Vector(x, y);
        this.maxSpeed = 1000; // using dt in calculations...
        this.maxForce = 10000; // using dt in calculations...
        this.maxSpeed = 2;
        this.maxForce = 0.2;
        this.velocity = new Vector(this.maxSpeed, 0);
        this.acceleration = new Vector(0, 0);
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
        // debugger
        if (!target) return;
        let desired = Vector.sub(target, this.position);
        if (desired.getMagnitude() < 0.05) return;
        // desired.setMagnitude(this.maxSpeed);
        desired = desired.normalize().multiply(this.maxSpeed);
        const steering = Vector.sub(desired, this.velocity);
        steering.limit(this.maxForce);
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

    isValid(a, b, point) {
        // const EPSILON = 0.001;
        // const m = (b.y - a.y) / (b.x - a.x);
        // const line = a.y - m * a.x;
        // debugger
        // if (Math.abs(point.y - (m * point.x + line) < EPSILON)) return true;
        // return false;
        const dy = b.y - a.y;
        const dx = b.x - a.x;

        if (dy === 0) {
            if (point.x < a.x || point.x > b.x) return true;
        } else if (dx === 0) {
            if (point.y < a.y || point.y > b.y) return false;
        }
        return true;
    }

    follow(path, pointsArr, radius) {
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
        // straight path implementation
        // const a = Vector.sub(this.predictedPos, path.getStart());
        // const b = Vector.sub(path.getEnd(), path.getStart());

        // const theta = a.angleBetween(b);
        // const bNorm = b.normalize();
        // // bNorm.multiply(a.getMagnitude() * Math.cos(theta));
        // bNorm.multiply(a.dot(bNorm));
        // this.normal = Vector.add(path.getStart(), bNorm);

        // const dir = Vector.sub(b, a).normalize();
        // dir.multiply(this.perceptionRadius * 2);
        // const target = Vector.add(this.normal, dir);


        // const dist = this.predictedPos.dist(this.normal);

        // if (dist > path.radius) {
        //     this.seek(target);
        // }
    }

    // follow(path, radius) {
    //     // let guess = this.velocity.copy();
    //     // console.log(guess);
    //     let guess = this.velocity.normalize().multiply(this.maxSpeed / 2);
    //     // console.log(guess);
    //     const predictedPos = Vector.add(this.position, guess);
    //     let target, distance;
    //     let winner = Infinity;
    //     this.normal = null;

    //     // debugger

    //     for (let i = 0; i < path.length - 1; i++) {

    //         const a = path[i];
    //         const b = path[i + 1];

    //         const ap = Vector.sub(predictedPos, a);
    //         const ab = Vector.sub(b, a);
    //         const abN = ab.normalize();
    //         abN.multiply(ap.dot(abN));
    //         let normalPoint = Vector.add(a, abN);
    //         // let normalPoint = ap.project(ab);
    //         // debugger
    //         if (normalPoint.x < a.x || normalPoint.x > b.x ||
    //             normalPoint.y < a.y || normalPoint.y > b.y) {
    //             // console.log(normalPoint);
    //             // debugger
    //             normalPoint = b.copy();
    //             // debugger
    //         }

    //         distance = predictedPos.dist(normalPoint);
    //         if (distance < winner) {
    //             winner = distance;
    //             this.normal = normalPoint;
    //             const dir = Vector.sub(b, a).normalize().multiply(15);
    //             // debugger
    //             target = Vector.add(normalPoint, dir);
    //         }
    //         // const dir = Vector.sub(b, a).normalize().multiply(15);
    //         // debugger
    //         // target = Vector.add(normalPoint, dir);
    //     }
    //     if (distance > radius + 10) this.seek(target);
    //     // console.log(distance, radius);

    // }

    checkBounds() {
        if (this.position.x - this.radius > c.width) this.position.x = -this.radius;
        if (this.position.x + this.radius < 0) this.position.x = c.width + this.radius;
        // if (this.position.x < 0) this.position.x = c.width;

        // if (this.position.y > c.height) this.position.y = 0;
        // if (this.position.y < 0) this.position.y = c.height;
    }

    update(dt) {
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
        cc.fillStyle = "#0f0";
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
        // cc.fillStyle = "#fff";
        // cc.beginPath();
        // cc.arc(this.target.x, this.target.y, this.radius / 3, 0, 2 * Math.PI);
        // cc.closePath();
        // cc.fill();
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
            cc.strokeStyle = "#f00";
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