import * as THREE from 'three';
import { World } from './world.js';
import { Animal } from './animal.js';
// import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
// import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
// import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import Stats from "https://cdnjs.cloudflare.com/ajax/libs/stats.js/r17/Stats.min.js";

function main() {
    const canvas = document.querySelector('#c');
    const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;

    const fov = 75;
    const aspect = window.innerWidth / window.innerHeight;
    const near = 0.1;
    const far = 100;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(4, 5, 11);
    camera.lookAt(0, 0, 0);

    const scene = new THREE.Scene();
    const world = new World(scene);

    const redPanda = new Animal(
        new THREE.Vector3(2, 0.7, 0),
        new THREE.Vector3(1, 0, 0),
        "default"
    );
    scene.add(redPanda);

    // const objLoader = new OBJLoader();
    // const mtlLoader = new MTLLoader();
    // const fbxLoader = new FBXLoader();
    const gltfLoader = new GLTFLoader().setPath('texture/millennium_falcon/');

    /* mtlLoader.load('male02.mtl', (materials) => {
        console.log("MTL loaded:", materials);
        materials.preload();
        objLoader.setMaterials(materials);

        objLoader.load('male02.obj', (object) => {
            console.log("OBJ Loaded:", object);
            object.position.set(0, 5, 0); // Adjust position
            console.log("Object position:", object.position);
            // object.scale.set(10, 10, 10); // Adjust size if needed
            scene.add(object);
        });
    });

    fbxLoader.load('chess.fbx', (fbx) => {
        fbx.position.set(0, 2, 0);  // Adjust position
        fbx.scale.set(5, 5, 5);  // Adjust size if needed
        scene.add(fbx);
        console.log("FBX model loaded:", fbx);
    },
        (xhr) => {
            console.log(`FBX Load Progress: ${(xhr.loaded / xhr.total) * 100}%`);
        },
        (error) => {
            console.error("Error loading FBX model:", error);
        }); */


    gltfLoader.load('scene.gltf', (gltf) => {
        const mesh = gltf.scene;
        mesh.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        mesh.position.set(0, 1.6, -1);
        scene.add(mesh);
    });

    const gltfLoader2 = new GLTFLoader().setPath('texture/mclaren_mp4-12c_ultimate/');
    gltfLoader2.load('scene.gltf', (gltf) => {
        const mesh = gltf.scene;
        mesh.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        mesh.position.set(12, 1.6, -1);
        scene.add(mesh);
    });

    const gltfLoader3 = new GLTFLoader().setPath('texture/2017_mclaren_720s/');
    gltfLoader3.load('scene.gltf', (gltf) => {
        const mesh = gltf.scene;
        mesh.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        mesh.position.set(0, 1.6, 12);
        scene.add(mesh);
    });

    const gltfLoader4 = new GLTFLoader().setPath('texture/dog__gltf/');
    gltfLoader4.load('scene.gltf', (gltf) => {
        const mesh = gltf.scene;
        mesh.position.set(0, 1.6, -5);
        scene.add(mesh);
    });




    console.log("Camera position:", camera.position);

    const stats = new Stats();
    stats.dom.style.position = "fixed";
    stats.dom.style.top = "0";
    stats.dom.style.right = "0";
    stats.showPanel(0); // 0: FPS, 1: MS (frame time), 2: MB (memory)
    document.body.appendChild(stats.dom);

    // Directional Light
    {
        const color = 0xFFFFFF;  //8A4BC5
        const intensity = 3;
        const light = new THREE.DirectionalLight(color, intensity);
        light.position.set(-1, 2, 4);
        light.castShadow = true;
        light.shadow.bias = -0.0001;
        scene.add(light);

        const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.1);
        scene.add(ambientLight);
    }

    const spotLight = new THREE.SpotLight(0xffffff, 3, 100, 0.2, 0.5);
    spotLight.position.set(0, 25, 0);
    spotLight.castShadow = true;
    spotLight.shadow.bias = -0.0001;
    scene.add(spotLight);

    const flashlight = new THREE.SpotLight(0xffffff, 5, 10, Math.PI / 8, 0.3, 1);
    flashlight.position.set(0, 1, 0);
    flashlight.target.position.set(0, 0, -1);
    flashlight.castShadow = true;
    flashlight.shadow.bias = -0.0001;
    scene.add(flashlight);
    scene.add(flashlight.target);

    let flashlightOn = true;

    // Create cubes (collision objects)
    const obstacles = [];
    const geometry = new THREE.TorusKnotGeometry(.22, .1, 50, 16);
    const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const ringGeometry = new THREE.TorusGeometry(0.5, 0.2, 16, 100);
    function makeObstacle(color, x, z, geometry) {
        const material = new THREE.MeshPhongMaterial({ color });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        scene.add(mesh);
        mesh.position.set(x, 4, z);
        obstacles.push(mesh);  // Add to obstacle list
        return mesh;
    }

    makeObstacle(0x44aa88, 0, 0, geometry);
    makeObstacle(0x8844aa, -2, -2, sphereGeometry);
    makeObstacle(0xaa8844, 2, 2, ringGeometry);

    // Movement and mouse look variables
    let moveSpeed = 0.1;
    let isRunning = false;
    const keys = { w: false, a: false, s: false, d: false };
    let yaw = 0
    let pitch = 0;

    // Pointer Lock API (Locks mouse for FPS control)
    canvas.addEventListener("click", () => {
        canvas.requestPointerLock();
    });

    // Improved Mouse Look using Quaternions
    function onMouseMove(event) {
        const sensitivity = 0.002;
        yaw -= event.movementX * sensitivity;
        pitch -= event.movementY * sensitivity;

        // Prevent flipping by clamping pitch
        pitch = Math.max(-Math.PI / 2 + 0.01, Math.min(Math.PI / 2 - 0.01, pitch));

        // Use quaternions to avoid gimbal lock
        const quaternion = new THREE.Quaternion();
        quaternion.setFromEuler(new THREE.Euler(pitch, yaw, 0, "YXZ"));
        camera.quaternion.copy(quaternion);
    }

    document.addEventListener("pointerlockchange", () => {
        if (document.pointerLockElement === canvas) {
            document.addEventListener("mousemove", onMouseMove);
        } else {
            document.removeEventListener("mousemove", onMouseMove);
        }
    });

    // Handle Keyboard Input
    document.addEventListener("keydown", (event) => {
        if (event.key === "w" || event.key === "W") keys.w = true;
        if (event.key === "a" || event.key === "A") keys.a = true;
        if (event.key === "s" || event.key === "S") keys.s = true;
        if (event.key === "d" || event.key === "D") keys.d = true;
        if (event.key === "Shift") isRunning = true;
    });

    document.addEventListener("keyup", (event) => {
        if (event.key === "w" || event.key === "W") keys.w = false;
        if (event.key === "a" || event.key === "A") keys.a = false;
        if (event.key === "s" || event.key === "S") keys.s = false;
        if (event.key === "d" || event.key === "D") keys.d = false;
        if (event.key.toLowerCase() === "f") {
            flashlightOn = !flashlightOn;
            flashlight.visible = flashlightOn;
        }
        if (event.key === "Shift") isRunning = false;
    });

    window.addEventListener("mousedown", (event) => {
        const raycaster = new THREE.Raycaster();
        /*         const mouse = new THREE.Vector2();
        
                mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
                mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
                raycaster.setFromCamera(mouse, camera); */

        const center = new THREE.Vector2(0, 0);
        raycaster.setFromCamera(center, camera);
        const intersects = raycaster.intersectObjects(scene.children);

        if (intersects.length > 0) {
            const clickedBlock = intersects[0].object;
            const position = clickedBlock.position.clone();
            const normal = intersects[0].face.normal;

            if (event.button === 0) { // Left-click: Remove block
                world.removeBlock([position.x, position.y, position.z]);
            } else if (event.button === 2) { // Right-click: Place block
                position.add(normal);
                world.addBlock("GRASS", [position.x, position.y, position.z]);
            }
        }
    });

    // Handle Window Resizing
    window.addEventListener("resize", () => {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    });

    // Raycaster for collision detection
    const raycaster = new THREE.Raycaster();
    const collisionDistance = 0.6;

    function checkCollision(direction) {
        raycaster.set(camera.position, direction);
        const collidableObjects = [...obstacles, ...world.collisionObjects]; // Include grass blocks
        const intersects = raycaster.intersectObjects(collidableObjects, false);
        return intersects.length > 0 && intersects[0].distance < collisionDistance;
    }

    function updateMovement() {
        let speed = isRunning ? moveSpeed * 2 : moveSpeed;

        const direction = new THREE.Vector3();
        camera.getWorldDirection(direction);

        if (keys.w && !checkCollision(direction.clone().multiplyScalar(speed))) {
            camera.position.addScaledVector(direction, speed);
        }
        if (keys.s && !checkCollision(direction.clone().multiplyScalar(-speed))) {
            camera.position.addScaledVector(direction, -speed);
        }

        const strafeDirection = new THREE.Vector3();
        strafeDirection.crossVectors(direction, camera.up).normalize();

        if (keys.a && !checkCollision(strafeDirection.clone().multiplyScalar(-speed))) {
            camera.position.addScaledVector(strafeDirection, -speed);
        }
        if (keys.d && !checkCollision(strafeDirection.clone().multiplyScalar(speed))) {
            camera.position.addScaledVector(strafeDirection, speed);
        }
    }

    function updateFlashlight() {
        flashlight.position.copy(camera.position);
        const direction = new THREE.Vector3();
        camera.getWorldDirection(direction);
        flashlight.target.position.copy(camera.position.clone().add(direction));
        flashlight.target.updateMatrixWorld();
        flashlight.shadow.needsUpdate = true;
    }

    let lastTime = performance.now();

    function animate(time) {
        stats.begin();
        // time *= 0.001;
        const dt = (time - lastTime) / 1000;
        lastTime = time;
        updateMovement();
        updateFlashlight();
        redPanda.update(dt, world);
        renderer.render(scene, camera);
        stats.end();
        requestAnimationFrame(animate);
    }

    animate(performance.now());
}

main();
