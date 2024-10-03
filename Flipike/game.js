import { RectangleCollShape, GameObject, GRAVITY } from "./shape.js";

const FRAME_RATE = 30;
const CABINET = "./cabinet/stage0.json";
const BACK_BOX = document.getElementById("back-box");
const PLAY_FIELD = document.getElementById("play-field");

function nextFrame(context, gameObjects) {
    /* clear canvas */
    context.fillStyle = "white";
    context.fillRect(0, 0, PLAY_FIELD.width, PLAY_FIELD.height);
    gameObjects.forEach(gameObject => gameObject.update(context, undefined, GRAVITY));
    setTimeout(() => requestAnimationFrame(() => nextFrame(context, gameObjects), FRAME_RATE));
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
    } catch (error) {
        console.error(error);
    }

    const gameObjects = [
        new GameObject({ x: 10, y: 10 }, "testSquare", new RectangleCollShape({ x: 10, y: 10 }, 10, 10, 0))
    ];

    const context = PLAY_FIELD.getContext("2d");

    /* start animation loop */
    nextFrame(context, gameObjects);

})();
