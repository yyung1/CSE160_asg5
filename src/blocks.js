import * as THREE from 'three';

const textureLoader = new THREE.TextureLoader();

const textures = {
    GRASS: textureLoader.load('grass.png'),
    DIRT: textureLoader.load('dirt.png'),
    LOG: textureLoader.load('log.jpg'),
    LEAVES: textureLoader.load('leaves.png')
};

class Block {
    constructor(type, position, scene) {
        this.type = type;
        this.position = position;
        this.scene = scene;
        this.grassDecay = null;
        this.grassGrowth = null;

        this.createBlock();
    }

    createBlock() {
        // Define geometry and material
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const materialGen = {
            map: textures[this.type],
            side: THREE.FrontSide,
        };

        if (this.type === "LEAVES") {
            materialGen.transparent = true;
            materialGen.alphaTest = 0.5;
        }

        const material = new THREE.MeshStandardMaterial(materialGen);

        // Create the mesh
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(...this.position);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        this.scene.add(this.mesh);
    }

    checkGrassDecay(world) {
        let aboveKey = `${this.position[0]},${this.position[1] + 1},${this.position[2]}`;
        if (world.blocks.has(aboveKey)) {
            if (!this.grassDecay) {
                this.grassDecay = setTimeout(() => {
                    if (world.blocks.has(aboveKey)) {
                        this.turnToDirt(world);
                    } else {
                        this.grassDecay = null;
                    }
                }, 2345);
            }
        } else {
            if (this.grassDecay) {
                clearTimeout(this.grassDecay);
                this.grassDecay = null;
            }
        }
    }

    checkDirtGrowth(world) {
        let aboveKey = `${this.position[0]},${this.position[1] + 1},${this.position[2]}`;
        if (!world.blocks.has(aboveKey)) {
            if (!this.grassGrowth) {
                this.grassGrowth = setTimeout(() => {
                    if (!world.blocks.has(aboveKey)) {
                        this.turnToGrass(world);
                    } else {
                        this.grassGrowth = null;
                    }
                }, 3000);
            }
        } else {
            if (this.grassGrowth) {
                clearTimeout(this.grassGrowth);
                this.grassGrowth = null;
            }
        }
    }

    turnToDirt(world) {
        world.replaceBlock(this.position, "DIRT");
    }

    turnToGrass(world) {
        world.replaceBlock(this.position, "GRASS");
    }

    remove() {
        this.scene.remove(this.mesh);
    }
}

export { Block };
