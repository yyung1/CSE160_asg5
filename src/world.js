import * as THREE from 'three';
import { Block } from './blocks.js';

class World {
    constructor(scene, chunkSize = 16) {
        this.scene = scene;
        this.chunkSize = chunkSize;
        this.chunks = new Map(); // Stores chunks
        this.blocks = new Map(); // Stores all blocks by position
        this.collisionObjects = []; // Stores blocks for collision detection

        this.generateFloor(32, 1, 32); // Generate the world floor
        this.generateLeafWall(32, 32, 3);
        this.setBackground();
    }

    generateFloor(width, height, depth) {
        for (let x = -width / 2; x < width / 2; x++) {
            for (let z = -depth / 2; z < depth / 2; z++) {
                this.addBlock("GRASS", [x, 0, z]);
            }
        }
    }

    generateLeafWall(width, depth, wallHeight = 3) {
        // Calculate half dimensions to determine the floor edges.
        const halfWidth = width / 2;
        const halfDepth = depth / 2;

        // Loop over each level of the wall.
        for (let y = 1; y <= wallHeight; y++) {
            // Front and back walls:
            for (let x = -halfWidth; x < halfWidth; x++) {
                // Front edge at z = -halfDepth.
                this.addBlock("LEAVES", [x, y, -halfDepth]);
                // Back edge at z = halfDepth - 1 (since floor goes from -halfDepth to halfDepth - 1).
                this.addBlock("LEAVES", [x, y, halfDepth - 1]);
            }
            // Left and right walls:
            for (let z = -halfDepth; z < halfDepth; z++) {
                // Left edge at x = -halfWidth.
                this.addBlock("LEAVES", [-halfWidth, y, z]);
                // Right edge at x = halfWidth - 1.
                this.addBlock("LEAVES", [halfWidth - 1, y, z]);
            }
        }
    }

    setBackground() {
        const loader = new THREE.TextureLoader();
        const texture = loader.load(
            'rogland_clear_night_4k.png',
            // 'sky.jpeg',
            () => {
                texture.mapping = THREE.EquirectangularReflectionMapping;
                texture.colorSpace = THREE.SRGBColorSpace;
                this.scene.background = texture;
            }
        );
    }

    addBlock(type, position) {
        const key = `${position[0]},${position[1]},${position[2]}`;
        if (!this.blocks.has(key)) {
            const block = new Block(type, position, this.scene);
            this.blocks.set(key, block);
            this.addToChunk(position, block);
            this.collisionObjects.push(block.mesh); // Add block to collision detection
        }
    }

    removeBlock(position) {
        const key = `${position[0]},${position[1]},${position[2]}`;
        if (this.blocks.has(key)) {
            const block = this.blocks.get(key);
            this.scene.remove(block.mesh);
            this.blocks.delete(key);
            this.removeFromChunk(position);
            this.collisionObjects = this.collisionObjects.filter(obj => obj !== block.mesh); // Remove from collision detection
        }
    }

    replaceBlock(position, newType) {
        this.removeBlock(position);
        this.addBlock(newType, position);
    }

    addToChunk(position, block) {
        const chunkKey = this.getChunkKey(position);
        if (!this.chunks.has(chunkKey)) {
            this.chunks.set(chunkKey, new Set());
        }
        this.chunks.get(chunkKey).add(block);
    }

    removeFromChunk(position) {
        const chunkKey = this.getChunkKey(position);
        if (this.chunks.has(chunkKey)) {
            this.chunks.get(chunkKey).delete(position);
        }
    }

    getChunkKey(position) {
        const chunkX = Math.floor(position[0] / this.chunkSize);
        const chunkZ = Math.floor(position[2] / this.chunkSize);
        return `${chunkX},${chunkZ}`;
    }
}

export { World };