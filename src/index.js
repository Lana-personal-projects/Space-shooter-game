import { ExplosiveBall } from "./object/ball";
import {
    ammoGenerator,
    canvasClean,
    config,
    ctx,
    drawBackGround,
    drawImgInBall,
    explosiveGenerator,
    itemsGenerator,
    radRate,
    rainbow,
    rockGenerator
} from "./context";
import { Ship, Spawner } from "./object/ship";
import { Item } from "./object/items";

export class Game {
    constructor() {
        this.loops = [];
        this.level = 0;
        this.score = 0;
        this.items = [];
        this.ship = new Ship(200, 800);
        this.spawner = new Spawner();
        this.balls = [];
        this.ammos = [];
        this.spammos = [];
        this.explosive = [];
    }

    itemState() {
        for (const item of this.items) {
            item.toBall(this.items);
            item.toObj(this.spawner);
            item.toEdge();
            if (item.toObj(this.ship)) {
                if (item.imgId === "item4") {
                    this.score += config.items.item4.score;
                }
                item.doFunc(this.ship);
                item.remove(this.items);
            }
            item.makeAMove();
            drawImgInBall(item);
        }
    };

    specialAmmoState() {
        for (const ammo of this.spammos) {
            if (ammo.toObj(this.ship) && ammo.imgId === "ammo1") {
                this.ship.health -= ammo.damage;
            }
            if (ammo.imgId === "ammo3") {
                for (const ball of this.balls) {
                    ball.makeExplosive(this.explosive);
                }
                for (const ammo of this.ammos) {
                    this.explosive.push(new ExplosiveBall(ammo.x, ammo.y, ammo.radius / 2, "explosive5", 0.3));
                }
                this.balls = [];
                this.ammos = [];
                this.spammos = this.spammos.filter(x => x !== ammo);
            }
            if (ammo.imgId === "ammo2") {
                ammo.toEdge();
                ammo.toObj(this.spawner);
                if (ammo.toObj(this.ship)) {
                    this.ship.health += 3;
                }
            }
            ammo.makeAMove();
            drawImgInBall(ammo);
        }
    };

    ammoState() {
        for (const ammo of this.ammos) {
            ammo.toEdge();
            ammo.toObj(this.spawner);
            if (ammo.toObj(this.ship)) {
                this.ship.health -= ammo.damage;
            }
            if (ammo.toArrOfObj(this.balls) >= 0) {
                const exBall = this.balls[ammo.toArrOfObj(this.balls)];
                if (radRate(config.ammo.destroyAsteroidRate)) {
                    if (exBall.canExploreToSmaller()) {
                        exBall.explore(this.balls);
                        exBall.makeExplosive(this.explosive);
                        ammo.remove(this.ammos);
                        this.score += 5;
                        this.spawnItemFrom(exBall, config.game.itemDropMultiplierWhenExploreToChild);
                    } else {
                        this.spawnItemFrom(exBall);
                    }
                } else {
                    ammo.toBall(this.balls);
                }
            }
            ammo.makeAMove();
        }
    };

    ballState() {
        for (const ball of this.balls) {
            ball.toEdge();
            ball.toObj(this.spawner);
            if (ball.toObj(this.ship)) {
                ball.explore(this.balls);
                this.ship.health -= ball.damage;
                this.score -= 10;
                ball.makeExplosive(this.explosive);
            }
            if (ball.toArrOfObj(this.ammos) >= 0) {
                if (radRate(config.ammo.destroyAsteroidRate)) {
                    this.ammos[ball.toArrOfObj(this.ammos)].remove(this.ammos);
                    ball.makeExplosive(this.explosive);
                    if (ball.canExploreToSmaller()) {
                        ball.explore(this.balls);
                        this.score += 5;
                        this.spawnItemFrom(ball, config.game.itemDropMultiplierWhenExploreToChild);
                    } else {
                        this.spawnItemFrom(ball);
                    }
                } else {
                    ball.toBall(this.ammos);
                }
            }
            if (ball.toArrOfObj(this.spammos) >= 0) {
                if (radRate(config.ammo.destroyAsteroidRate)) {
                    ball.remove(this.balls);
                } else if (ball.canExploreToSmaller()) ball.explore(this.balls); else {
                    ball.remove(this.balls);
                }
                this.spawnItemFrom(ball, config.game.itemDropMultiplierUseSpecialAmmo);
                ball.makeExplosive(this.explosive);
                this.score += 5;
            }
            ball.toBall(this.balls);
            ball.makeAMove();
        }
    };

    spawnItemFrom(ball, rateMultiplier = 1) {
        ball.remove(this.balls);
        ball.makeExplosive(this.explosive, 0.3);
        this.score += 5;
        if (radRate(config.items.item0.rate * rateMultiplier)) {
            this.items.push(new Item(ball.x, ball.y, "item0"));
            if (!config.game.multiDrop) return;
        }
        if (radRate(config.items.item1.rate * rateMultiplier)) {
            this.items.push(new Item(ball.x, ball.y, "item1"));
            if (!config.game.multiDrop) return;
        }
        if (radRate(config.items.item2.rate * rateMultiplier)) {
            this.items.push(new Item(ball.x, ball.y, "item2"));
            if (!config.game.multiDrop) return;
        }
        if (radRate(config.items.item3.rate * rateMultiplier)) {
            this.items.push(new Item(ball.x, ball.y, "item3"));
            if (!config.game.multiDrop) return;
        }
        if (radRate(config.items.item4.rate * rateMultiplier)) {
            this.items.push(new Item(ball.x, ball.y, "item4"));
        }
    }

    drawBall() {
        for (const ball of this.balls) {
            drawImgInBall(ball);
        }
    };

    drawAmmo() {
        for (const ammo of this.ammos) {
            drawImgInBall(ammo, true);
        }
    };

    shipState() {
        if (this.ship.health <= 0) {
            const highScore = Number(localStorage.getItem("highScore") || "0");
            const highLevel = Number(localStorage.getItem("highLevel") || "0");
            if (highScore < this.score) {
                localStorage.setItem("highScore", this.score);
            }
            if (highLevel < this.level) {
                localStorage.setItem("highLevel", this.level);
            }
            stop();
            setTimeout(() => document.getElementById("overlay").classList.add("visible"), 300);
        }
        this.ship.toObj(this.spawner);
        this.ship.toEdge();
        this.ship.makeAMove();
    };

    displayScore(x, y) {
        ctx.font = "25px Verdana";
        ctx.fillStyle = "white";
        ctx.fillText("Stage   " + game.level, x, y - 30);
        ctx.fillText("Health  " + Math.floor(this.ship.health), x, y);
        ctx.fillText("Items   " + this.ship.totalAmmo.length, x, y + 30);
        ctx.fillText("Score   " + this.score, x, y + 110);

        const ammo = this.ship.totalAmmo.length ? this.ship.totalAmmo[this.ship.totalAmmo.length - 1].imgId : "";
        const text = config.items.ammos[ammo] || "None";
        ctx.fillText("Ammo  " + text, x, y + 60);
    };

    drawExplosion() {
        for (const e of this.explosive) {
            e.drawExplosive(this.explosive);
        }
    };

    combineState() {
        this.specialAmmoState();
        this.ammoState();
        this.ballState();
        this.shipState();
        this.itemState();
    }

    play() {
        const setupGamePlay = () => {
            canvasClean();
            drawBackGround();
            this.combineState();
            this.drawExplosion();
            this.drawAmmo();
            this.drawBall();
            drawImgInBall(this.spawner, true);
            drawImgInBall(this.ship, true);
            this.displayScore(15, 60);
            if (this.ship.health > 0) {
                this.loops.push(setTimeout(setupGamePlay, 20));
            } else {
                drawImgInBall(this.ship, false, "explosive1");
            }
        };

        const makeGameHarder = () => {
            this.level++;
            this.loops.push(setTimeout(makeGameHarder, config.game.timePerLevel));
        };

        const spawnBalls = () => {
            this.spawner.spawn(game.balls, game.level);
            this.spawner.color = rainbow(Math.random());
            this.loops.push(setTimeout(spawnBalls, config.game.timePerSpawn));
        };

        const setupScore = () => {
            this.score += game.level * config.game.survivalLevelBonus + Math.floor((game.balls.length + game.ammos.length) * config.game.survivalAsteroidBonus);
            this.loops.push(setTimeout(setupScore, config.game.timePerSurvivalScore));
        };

        rockGenerator(7);
        ammoGenerator(3);
        itemsGenerator(4);
        explosiveGenerator(5);
        setupScore();
        setupGamePlay();
        makeGameHarder();
        spawnBalls();
    }

    stop() {
        this.loops.forEach(clearTimeout);
    }
}

window.game = new Game();
game.play();

window.addEventListener("keydown", evt => {
    if (!window.game) {
        return;
    }
    const game = window.game;
    switch (evt.key) {
        case "ArrowRight":
            game.ship.moveRight();
            break;
        case "ArrowLeft":
            game.ship.moveLeft();
            break;
        case"ArrowUp":
            game.ship.moveUp();
            break;
        case "ArrowDown":
            game.ship.moveDown();
            break;
        case "a":
            if (game.ship.totalAmmo.length > 0) {
                const ammo = game.ship.totalAmmo.pop();
                game.ship.shoot(game.spammos, game.ship.angle, ammo.imgId, 10);
            }
            break;
        case "s":
            game.ship.shoot(game.ammos, game.ship.angle, "ammo0");
            break;
    }
});
