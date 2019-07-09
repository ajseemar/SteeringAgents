var c, cc;

var KEYS = {
    SPACE: "SPACE",
    LEFT: "LEFT",
    UP: "UP",
    RIGHT: "RIGHT",
    DOWN: "DOWN"
};

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
    };

    add(vector) {
        // return new Vector(this.x + vector.x, this.y + vector.y);
        this.x += vector.x;
        this.y += vector.y;
    }

    subtract(vector) {
        // return new Vector(this.x - vector.x, this.y - vector.y);
        this.x -= vector.x;
        this.y -= vectory.y;
    }

    multiply(scalar) {
        // return new Vector(this.x * scalar, this.y * scalar);
        this.x *= scalar;
        this.y *= scalar;
    }

    divide(scalar) {
        // return new Vector(this.x / scalar, this.y / scalar);
        this.x /= scalar;
        this.y /= scalar;
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
}


class Game {
    constructor() {
        this.initialTime = Date.now();

        const a = new Vector(0, 5);
        const b = new Vector(5, 0);
        console.log(a.angleBetween(b));
    }

    update(dt) {

    }

    render() {

    }
}