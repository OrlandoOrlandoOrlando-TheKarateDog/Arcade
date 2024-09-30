const FRAME_RATE = 1000 / 34; /* about 30fps */
const CABINET = "./cabinet/stage0.json";
const BACK_BOX = document.getElementById("back-box");
const PLAY_FIELD = document.getElementById("play-field");

class PinBall  {
    static radius = 10;

    constructor(x, y, dx, dy) {
        this.x = x;
        this.y = y;
        this.dx = dx === undefined ? 0 : dx;
        this.dy = dy === undefined ? 0 : dy;
    }

    update(context) {
        /* apply floor collision */
        if (this.y + PinBall.radius >= PLAY_FIELD.height) {
            this.dy = -1 * this.dy;
        } else if (this.y + PinBall.radius < PLAY_FIELD.height) {
            this.dy += 1;
        }

        /* apply wall collision */
        if (this.x + PinBall.radius >= PLAY_FIELD.width || this.x - PinBall.radius <= 0) {
            this.dx = (-1 * this.dx) + (this.dx / 10);
        } 

        /* move this */
        this.x += this.dx;
        this.y += this.dy;

        context.beginPath();
        context.fillStyle = "black";
        context.arc(this.x, this.y, PinBall.radius, 0, Math.PI * 2);
        context.fill();
    }
}

/* gameObjects and context might be best as properties
 * unfortunatley, I don't have much experience with giving functions properties
 * so I don't know if this would be a good idea
 */
function nextFrame(gameObjects, context, clearContextCallback) {
    /* Idk, I'm too lazy to think of a more elegant solution */
    clearContextCallback();

    gameObjects.forEach(gameObject => gameObject.update(context));
    setTimeout(() => requestAnimationFrame(() => nextFrame(gameObjects, context, clearContextCallback)), FRAME_RATE)
}

(async () => {
    try {
        const response = await fetch(CABINET);

        if (!response.ok) {
            throw new Error("Cabinet fetch failed.");
        }

        const cabinet = await response.json();

        BACK_BOX.width = cabinet.backBox.width;
        BACK_BOX.height = cabinet.backBox.height;
        BACK_BOX.style = `width: ${cabinet.backBox.width}px; height: ${cabinet.backBox.height}px`;
        PLAY_FIELD.width = cabinet.playField.width;
        PLAY_FIELD.height = cabinet.playField.height;
        PLAY_FIELD.style = `width: ${cabinet.playField.width}px; height: ${cabinet.playField.height}px`;

        const SLOPE = cabinet.playField.slope;

    } catch (error) {
        console.error(error);
    }

    /* a game object must have a update function */
    const gameObjects = [
        new PinBall(40, 10, 20)
    ];

    const context = PLAY_FIELD.getContext("2d");

    const clearContextCallback = () => {
        context.fillStyle = "white";
        context.fillRect(0, 0, PLAY_FIELD.width, PLAY_FIELD.height);
    };

    /* start animation loop */
    nextFrame(gameObjects, context, clearContextCallback);

})();
