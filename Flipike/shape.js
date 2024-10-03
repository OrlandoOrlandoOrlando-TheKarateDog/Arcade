export const GRAVITY = { Δx: 0, Δy: 0.2 };

class CollisionShape {
    inBounds({ x, y }) {
        throw new Error("abstract: boolean");
    }

    collide(shape) {
        throw new Error("abstract: vector");
    }
}

export class CircleCollShape extends CollisionShape {
    constructor({ x, y }, radius) {
        super();
        this.center = { x, y };
        this.radius = radius;
    }

    inBounds({ x, y }) {
        return Math.sqrt(Math.pow(x - this.center.x, 2) + Math.pow(y - this.center.y, 2)) <= this.radius;
    }

    /* the shape must be a CircleCollShape */
    collide(shape) {
        const sumOfRadii = this.radius + shape.radius;
        const centerDistance = Math.sqrt(Math.pow(shape.center.x - this.center.x, 2) + Math.pow(shape.center.y - this.center.y, 2));
        const magnitude = sumOfRadii - centerDistance;
        if (magnitude >= 0) {
            const slopex = 3;
            const slopey = 4;
            return { Δx: 4, Δy: 3 };
        }
        return false;
    }
}

export class RectangleCollShape extends CollisionShape {
    /* the coordinate is not the centroid
     * instead it is the first vertex
     * assume the rotation is a number of degrees
     */
    constructor({ x, y }, width, height, rotation) {
        super();
        const radiansRot = rotation * Math.PI / 180;

        this.vertices = [];
        this.vertices[0] = { x, y };
        this.vertices[1] = {
            x: width * Math.cos(radiansRot) + x,
            y: width * Math.sin(radiansRot) + y
        };
        this.vertices[2] = {
            x: -height * Math.sign(radiansRot) + x,
            y: height * Math.cos(radiansRot) + y
        };
        this.vertices[3] = {
            x: this.vertices[1].x + this.vertices[2].x,
            y: this.vertices[1].y + this.vertices[2].y
        };
    }

    translate({ Δx, Δy }) {
        this.vertices.forEach(vertex => {
            vertex.x += Δx;
            vertex.x += Δy;
        });
    }

    inBounds({ x, y }) {
        this.vertices.forEach(vertice => {

        });
    }

    static normalize({ Δx, Δy }) {
        const magnitude = Math.sqrt(Math.pow(Δx, 2) + Math.pow(Δy, 2));
        return { Δx: Δx / magnitude, Δy: Δy / magnitude };
    }

    getNormals(shape) {
        return [
            RectangleCollShape.normalize({
                Δx: this.vertices[1].x - this.vertices[0].x,
                Δy: this.vertices[1].y - this.vertices[0].y
            }),
            RectangleCollShape.normalize({
                Δx: this.vertices[2].x - this.vertices[0].x,
                Δy: this.vertices[2].y - this.vertices[0].y
            }),
            RectangleCollShape.normalize({
                Δx: shape.vertices[1].x - shape.vertices[0].x,
                Δy: shape.vertices[1].y - shape.vertices[0].y
            }),
            RectangleCollShape.normalize({
                Δx: shape.vertices[2].x - shape.vertices[0].x,
                Δy: shape.vertices[2].y - shape.vertices[0].y
            })
        ];
    }

    static dotProduct({ Δx, Δy }, { x, y }) {
        return Δx * x + Δy * y
    }

    /* the shape must be a RectangleCollShape */
    collide(shape) {
        const translationVectors = [];

        this.getNormals(shape).forEach(normal => {
            const scalars1 = [];
            const scalars2 = [];

            for (let index = 0; index < 4; index++) {
                scalars1.push(dotProduct(normal, this.vertices[index]));
                scalars2.push(dotProduct(normal, shape.vertices[index]));
            }

            const maxS1 = Math.max(scalars1);
            const minS1 = Math.min(scalars1);
            const maxS2 = Math.max(scalars2);
            const minS2 = Math.min(scalars2);
            
            if (maxS1 >= minS2) {
                const overlap = maxS1 - minS2;
                translationVectors.push({ Δx: normal.Δx * overlap, Δy: normal.Δy * overlap });
            }
            else if (maxS2 >= minS1) {
                const overlap = maxS2 - minS1;
                translationVectors.push({ Δx: normal.Δx * overlap, Δy: normal.Δy * overlap });
            }
            else
                /* if there is no overlap on any normal then there is no collision */
                return false;
        });

        // readability low
        let minTranslVectMagnitude = Infinity;
        let minTranslVect = { Δx: 0, Δy: 0 };
        for (let index = 0; index < translationVectors.length; index++) {
            const magnitude = Math.sqrt(Math.pow(translationVectors[index].Δx, 2) + Math.pow(translationVectors[index].Δy, 2));
            if (magnitude < minTranslVectMagnitude)
                minTranslVect = translationVectors[index];
        }

        return minTranslVect;
    }
}

export class GameObject {
    totalForce = { Δx: 0, Δy: 0 };

    constructor({ x, y }, stamp, collisionShape) {
        this.x = x;
        this.y = y;
        if (stamp instanceof Image)
            this.draw = context => {
                context.drawImage(stamp, x, y);
            };
        else if (stamp == "testSquare")
            this.draw = context => {
                context.fillStyle = "magenta";
                context.fillRect(this.x, this.y, 10, 10);
            };
        
        this.collShape = collisionShape;
    }

    update(context, collisionMask, ...forces) {
        if (collisionMask !== undefined)
            collisionMask.forEach(collision => {
                forces.push(collision.collide(this));
            });

        if (forces !== undefined)
            forces.forEach(force => {
                this.totalForce.Δx += force.Δx;
                this.totalForce.Δy += force.Δy;
            });
        
        this.x += this.totalForce.Δx;
        this.y += this.totalForce.Δy;
        this.collShape.translate(this.totalForce);

        this.draw(context);
    }
}
