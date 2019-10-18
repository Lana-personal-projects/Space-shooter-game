class Ball {
    constructor(x, y, radius, color, xSpeed, ySpeed, imgId) {
        this.imgId = imgId || rockRadId(7);
        this.isSpin = true;
        this.isExist = true;
        this.x = x || canvas.width / 2;
        this.y = y || canvas.height / 2;
        this.color = color || rainbow(Math.random());
        this.radius = radius || radNum(60, 60);
        this.xSpeed = xSpeed || radNum(5, 0);
        this.ySpeed = ySpeed || radNum(5, 0);
        this.angle = 0;
        this.damage = this.radius / 4;
    }

    increaseAngle(n) {
        if (this.isSpin) {
            this.angle = this.angle + n;
            if (this.angle >= 360) {
                this.angle = 0;
            }
        }
    };

    makeAMove() {
        this.x += this.xSpeed;
        this.y += this.ySpeed;
        this.increaseAngle(sqrtOf2Sqr(this.xSpeed, this.ySpeed) / 3);
    };

    relocate(x, y, distance) {
        let maxDistance = this.radius + distance;
        let realDistance = sqrtOf2Sqr(this.x - x, this.y - y);
        if (maxDistance > realDistance) {
            this.x = (this.x - x) * (maxDistance / realDistance) + x;
            this.y = (this.y - y) * (maxDistance / realDistance) + y;
        }
    };

    toEdge() {
        if (this.x <= this.radius) {
            this.x = this.radius;
            this.xSpeed *= -1;

        } else if (this.x >= (canvas.width - this.radius)) {
            this.x = canvas.width - this.radius;
            this.xSpeed *= -1;

        } else if (this.y <= this.radius) {
            this.y = this.radius;
            this.ySpeed *= -1;
        } else if (this.y >= (canvas.height - this.radius)) {
            this.y = canvas.height - this.radius;
            this.ySpeed *= -1;
        }
    };

    toBall(otherBall) {
        for (let ball of otherBall) {
            let ballMaxDistance = ball.radius + this.radius;
            let ballRealDistance = sqrtOf2Sqr(ball.x - this.x, ball.y - this.y);
            if (ballRealDistance !== 0) {
                if (ballMaxDistance > ballRealDistance) {
                    this.relocate(ball.x, ball.y, ball.radius);
                }
                if (ballMaxDistance >= ballRealDistance) {
                    let thisXSpeedAfter =
                        ((this.radius - ball.radius) * this.xSpeed
                            + 2 * ball.radius * ball.xSpeed) / ballMaxDistance;
                    let thisYSpeedAfter =
                        ((this.radius - ball.radius) * this.ySpeed
                            + 2 * ball.radius * ball.ySpeed) / ballMaxDistance;
                    let ballXSpeedAfter =
                        ((ball.radius - this.radius) * ball.xSpeed
                            + 2 * this.radius * this.xSpeed) / ballMaxDistance;
                    let ballYSpeedAfter =
                        ((ball.radius - this.radius) * ball.ySpeed
                            + 2 * this.radius * this.ySpeed) / ballMaxDistance;
                    this.xSpeed = thisXSpeedAfter;
                    this.ySpeed = thisYSpeedAfter;
                    ball.xSpeed = ballXSpeedAfter;
                    ball.ySpeed = ballYSpeedAfter;

                }

            }
        }
    };

    toObj(obj) {

        let ballMaxDistance = this.radius + obj.radius;
        let ballRealDistance = sqrtOf2Sqr(this.x - obj.x, this.y - obj.y);
        if (ballRealDistance !== 0) {
            if (ballRealDistance < ballMaxDistance) {
                this.relocate(obj.x, obj.y, obj.radius);
            }
            if (ballRealDistance <= ballMaxDistance) {
                this.xSpeed *= -1;
                this.ySpeed *= -1;
                return true;
            }
        }

    };

    toArrOfObj(otherBall) {
        for (let i = 0; i < otherBall.length; i++) {
            let ballMaxDistance = otherBall[i].radius + this.radius;
            let ballRealDistance = sqrtOf2Sqr(otherBall[i].x - this.x, otherBall[i].y - this.y);
            if (ballMaxDistance >= ballRealDistance) {
                return i;
            }
        }
        return -1;
    }

    remove(balls) {
        this.isExist = false;
        for (let i = 0; i < balls.length; i++) {
            if (!balls[i].isExist) {
                balls.splice(i, 1);
            }
        }
    };

    explore(balls, n = 1) {
        this.remove(balls);
        if (this.radius / 2 > 10) {
            for (let j = 0; j < n; j++) {
                balls.push(new Ball(this.x, this.y, this.radius / 1.5, this.color, undefined, undefined, this.imgId));
            }

        }
    };

    spawn(balls, n = 1) {
        for (let i = 0; i < n; i++) {
            balls.push(new Ball(this.x, this.y, undefined, this.color))
        }
    };

    makeExplosive(containerArr, time) {
        if (radNum(1, 0)) {
            containerArr.push(new ExplosiveBall(this.x, this.y, this.radius * 2, "explosive0", time));
            containerArr.push(new ExplosiveBall(this.x, this.y, this.radius * 1.2, undefined, time));
        } else if (radNum(1, 0)) {
            containerArr.push(new ExplosiveBall(this.x, this.y, this.radius * 2, undefined, time));
        } else {
            containerArr.push(new ExplosiveBall(this.x, this.y, this.radius * 3.5, "explosive4", time));
            containerArr.push(new ExplosiveBall(this.x, this.y, this.radius * 1, undefined, time));
        }
    };

}

class ExplosiveBall extends Ball {
    constructor(x, y, radius, imgId, time) {
        super(x, y, radius, "yellow", 0.2, 0.2);
        this.imgId = imgId || explosiveRadId(4);
        this.count = time * 50 || 50;

    }

    drawExplosive(containerArr) {
        if (this.count > 0) {
            drawImgInBall(this, false);
            this.count -= 1;
        } else {
            this.remove(containerArr);
        }
    }
}
