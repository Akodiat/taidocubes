import RAPIER from 'https://cdn.skypack.dev/@dimforge/rapier3d-compat';
import * as THREE from 'three';

class Player {
    constructor(
        model, view,
        position = new THREE.Vector3(0, 5, 0),
        size = new THREE.Vector3(1, 1, 1)
    ) {
        //////////////////////
        // Initialise model //
        //////////////////////

        // Create a dynamic rigid-body.
        let rigidBodyDesc = RAPIER.RigidBodyDesc.dynamic().setTranslation(
            position.x, position.y, position.z
        );
        this.rigidBody = model.createRigidBody(rigidBodyDesc);

        // Create a cuboid collider attached to the dynamic rigidBody.
        let colliderDesc = RAPIER.ColliderDesc.cuboid(
            size.x, size.y, size.z
        );
        this.collider = model.createCollider(colliderDesc, this.rigidBody);

        /////////////////////
        // Initialise view //
        /////////////////////

        // Draw a cube
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshStandardMaterial({
            color: 0xaaaaaa
        });
        this.mesh = new THREE.Mesh(geometry, material);
        view.scene.add(this.mesh);
    }

    updateView() {
        // Set the visible mesh to the position of the rigid
        // body from the physics world
        this.mesh.position.copy(this.rigidBody.translation())
    }
}

export {Player}