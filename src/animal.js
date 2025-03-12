import * as THREE from "three";

function createCube(width, height, depth, color) {
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const material = new THREE.MeshStandardMaterial({ color });
    return new THREE.Mesh(geometry, material);
}

class Animal extends THREE.Group {
    /**
     * @param {THREE.Vector3 | number[]} position - starting position.
     * @param {THREE.Vector3 | number[]} direction - normalized direction vector.
     * @param {string} variant - animal variant (e.g., "redpanda", "wolf").
     */
    constructor(position, direction, variant = "default") {
        super();

        // Convert position/direction to THREE.Vector3 if needed.
        this.position.copy(
            position instanceof THREE.Vector3 ? position : new THREE.Vector3(...position)
        );
        const dir = direction instanceof THREE.Vector3 ? direction.clone() : new THREE.Vector3(...direction);
        dir.normalize();

        // Calculate yaw from direction (in radians)
        this.yaw = Math.atan2(dir.z, dir.x);
        // Apply yaw rotation around the Y axis.
        this.rotation.y = this.yaw;

        this.variant = variant;

        // Animation parameters
        this.limbAngle = 0;
        this.headAngle = 0;

        // Build animal geometry based on variant.
        this.buildAnimal();
    }

    buildAnimal() {
        if (this.variant === "default") {
            this.buildRedPanda();
        } else {
            this.buildDifferentAnimal();
        }
    }

    buildRedPanda() {
        // Create a main body group.
        const bodyGroup = new THREE.Group();

        // --- Body ---
        // Body bottom: a thin black rectangle.
        const bodyBottom = createCube(0.5, 0.025, 0.25, 0x000000);
        // Center the bottom at (0, 0.0125, 0)
        bodyBottom.position.y = 0.0125;
        bodyGroup.add(bodyBottom);

        // Body top: brown color (approx. 0xcc6633), sits atop the bottom.
        const bodyTop = createCube(0.5, 0.175, 0.25, 0xcc6633);
        // Position so its bottom touches the top of bodyBottom.
        bodyTop.position.y = 0.025 + 0.175 / 2;
        bodyGroup.add(bodyTop);

        // --- Head ---
        // Create a head group. The original transformation is a bit involved,
        // so here we choose an approximate offset relative to the body.
        const headGroup = new THREE.Group();
        // Position head relative to the body top. (Adjust as needed.)
        headGroup.position.set(-0.38, 0.175, 0);

        // Main head cube (brown)
        const head = createCube(0.29, 0.24, 0.29, 0xcc6633);
        headGroup.add(head);

        // Secondary head part (white patch)
        const head2 = createCube(0.07, 0.11, 0.11, 0xffffff);
        head2.position.set(-0.17, -0.05, 0);
        headGroup.add(head2);

        // Nose (black)
        const nose = createCube(0.02, 0.045, 0.05, 0x000000);
        nose.position.set(-0.2, -0.025, -0.001);
        headGroup.add(nose);

        // --- Ears ---
        // Left ear
        const leftEar = createCube(0.12, 0.12, 0.065, 0xffffff);
        leftEar.position.set(0.08, 0.16, -0.16);
        leftEar.rotation.y = -Math.PI / 2;
        headGroup.add(leftEar);
        // Right ear
        const rightEar = createCube(0.12, 0.12, 0.065, 0xffffff);
        rightEar.position.set(0.08, 0.16, 0.16);
        rightEar.rotation.y = -Math.PI / 2;
        headGroup.add(rightEar);

        // --- Eyes ---
        // Right eye
        const rightEye = createCube(0.04, 0.04, 0.04, 0x000000);
        rightEye.position.set(-0.131, 0.05, 0.08);
        headGroup.add(rightEye);
        // Left eye
        const leftEye = createCube(0.04, 0.04, 0.04, 0x000000);
        leftEye.position.set(-0.131, 0.05, -0.07);
        headGroup.add(leftEye);

        // Add the head group to the body.
        bodyGroup.add(headGroup);

        // --- Limbs ---
        // Create a simple limb using a helper; here we create four identical limbs.
        this.limbs = [];
        const rightArm = this.createLimb();
        rightArm.position.set(-0.175, 0.04, 0.002 - .076);
        bodyGroup.add(rightArm);
        this.limbs.push(rightArm);

        const rightLeg = this.createLimb();
        rightLeg.position.set(0.198, 0.04, 0.002 - .076);
        bodyGroup.add(rightLeg);
        this.limbs.push(rightLeg);

        const leftArm = this.createLimb();
        leftArm.position.set(-0.175, 0.04, 0.148 - .076);
        bodyGroup.add(leftArm);
        this.limbs.push(leftArm);

        const leftLeg = this.createLimb();
        leftLeg.position.set(0.198, 0.04, 0.148 - .076);
        bodyGroup.add(leftLeg);
        this.limbs.push(leftLeg);

        // --- Tail ---
        // Create a tail as a chain of segments.
        const tailGroup = new THREE.Group();
        // Position tail at the rear of the body (approximate offset).
        tailGroup.position.set(0.18, 0.12, 0);
        const numSegments = 7;
        const tailSegmentLength = 0.07;
        const tailSegmentDepth = 0.15;
        let currentTailParent = tailGroup;
        for (let i = 0; i < numSegments; i++) {
            // Use a cylinder to represent a tail segment.
            const tailGeom = new THREE.CylinderGeometry(
                tailSegmentDepth / 2,
                tailSegmentDepth / 2,
                tailSegmentLength,
                8
            );
            // Alternate colors between brown and black.
            const tailColor = i % 2 === 0 ? 0xcc6633 : 0x000000;
            const tailMat = new THREE.MeshStandardMaterial({ color: tailColor });
            const tailSegment = new THREE.Mesh(tailGeom, tailMat);
            // Rotate so the cylinder lies horizontally.
            tailSegment.rotation.z = Math.PI / 2;
            // Offset the segment so its left edge is at the group’s origin.
            tailSegment.position.x = tailSegmentLength / 2;

            // Wrap the segment in its own group for individual rotation.
            const segmentGroup = new THREE.Group();
            segmentGroup.add(tailSegment);
            // Add this segment group to the current parent.
            currentTailParent.add(segmentGroup);
            // Set the pivot for the next segment at the end of the current one.
            segmentGroup.position.x = tailSegmentLength;
            // Next segment will be added to this segment group.
            currentTailParent = segmentGroup;
        }

        // Add body and tail to the Animal (this group).
        this.add(bodyGroup);
        this.add(tailGroup);

        // Save references for use in animation.
        this.bodyGroup = bodyGroup;
        this.headGroup = headGroup;
        this.tailGroup = tailGroup;
    }

    /**
     * Create a simple limb group.
     * Here we create a single box representing the limb.
     * (You can extend this method to create multiple segments if desired.)
     */
    createLimb() {
        const limbGroup = new THREE.Group();
        // Create a simple limb as a black box.
        const limbMesh = createCube(0.1, 0.15, 0.1, 0x000000);
        // Adjust the mesh so its top is at the group origin.
        limbMesh.position.y = -0.1;
        limbGroup.add(limbMesh);
        return limbGroup;
    }

    /**
     * Fallback method for drawing a different animal variant.
     * For now, it reuses the red panda geometry.
     */
    buildDifferentAnimal() {
        this.buildRedPanda();
    }

    /**
     * Update the animal’s animation.
     * @param {number} dt - Delta time in seconds.
     * @param {*} world - World information (if needed for bounds, etc.)
     */
    update(dt, world) {
        // For simplicity we update animations based on the current time.
        // (You may want to use dt and internal state to smooth animation.)
        const time = Date.now() * 0.001;
        // Oscillate limb rotation.
        this.limbs[0].rotation.z = Math.sin(time * 3) * 0.5;
        this.limbs[1].rotation.z = Math.sin(time * 3 + Math.PI) * 0.5;
        this.limbs[2].rotation.z = Math.sin(time * 3 + Math.PI) * 0.5;
        this.limbs[3].rotation.z = Math.sin(time * 3) * 0.5;
        // Wag the tail.
        this.tailGroup.rotation.y = Math.sin(time * 4) * 0.3;
        // Slight head bob.
        this.headGroup.rotation.x = Math.sin(time * 2) * 0.2;
    }
}

export { Animal };