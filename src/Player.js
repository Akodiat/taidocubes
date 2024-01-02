import RAPIER from 'https://cdn.skypack.dev/@dimforge/rapier3d-compat';
import * as THREE from 'three';

class Player {
    constructor(
        model, view,
        position = new THREE.Vector3(0, 5, 2),
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
        this.rigidBody.setLinearDamping(0.5);
        this.rigidBody.setAngularDamping(1.0);

        // Create a cuboid collider attached to the dynamic rigidBody.
        let colliderDesc = RAPIER.ColliderDesc.cuboid(
            size.x, size.y, size.z
        );
        this.collider = model.createCollider(colliderDesc, this.rigidBody);

        /////////////////////
        // Initialise view //
        /////////////////////

        // Draw a cube
        const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
        const cubeMaterial = new THREE.MeshStandardMaterial({
            color: 0xaaaaaa
        });
        this.mesh = new THREE.Mesh(cubeGeometry, cubeMaterial);
        view.scene.add(this.mesh);


        const crosshairGeometry = new THREE.SphereGeometry(0.1, 32, 16);
        const crosshairMaterial = new THREE.MeshBasicMaterial({
            color: 0xff0000
        });
        this.crosshairMesh = new THREE.Mesh(crosshairGeometry, crosshairMaterial);
        view.scene.add(this.crosshairMesh);

        ////////////////
        // Controller //
        ////////////////

        window.addEventListener("keydown", e => {
            switch (e.code) {
                case "Space":
                    this.jump()
                    break;

				case 'KeyW': this.moveForward = true; break;
				case 'KeyA': this.moveLeft = true; break;
				case 'KeyS': this.moveBackward = true; break;
				case 'KeyD': this.moveRight = true; break;

				case 'KeyQ': this.rotLeft = true; break;
				case 'KeyE': this.rotRight = true; break;
            
                default:
                    break;
            }
            e.preventDefault();
        });

        window.addEventListener("keyup", e => {
            switch (e.code) {
				case 'KeyW': this.moveForward = false; break;
				case 'KeyA': this.moveLeft = false; break;
				case 'KeyS': this.moveBackward = false; break;
				case 'KeyD': this.moveRight = false; break;

				case 'KeyQ': this.rotLeft = false; break;
				case 'KeyE': this.rotRight = false; break;
            
                default:
                    break;
            }
            e.preventDefault();
        });
    }

    updateModel() {
        const moveSpeed = 1;
        const rotTensionSpeed = 0;

        const crosshairPos = this.crosshairMesh.position;

        const heading = crosshairPos.clone().sub(this.rigidBody.translation())
        const r = heading.length();
        heading.normalize();

        const up = new THREE.Vector3(0, 1, 0);

        const impulse = new THREE.Vector3();

        if (this.moveForward) {
            impulse.add(heading, true);
        }
        if (this.moveBackward) {
            impulse.add(heading.clone().negate(), true);
        }

        if (this.moveLeft) {
            impulse.add(heading.clone().cross(up).normalize().negate(), true);
        }
        if (this.moveRight) {
            impulse.add(heading.clone().cross(up).normalize(), true);
        }

        this.rigidBody.applyImpulse(impulse.normalize().multiplyScalar(moveSpeed));
    }

    updateView() {
        // Set the visible mesh to the position of the rigid
        // body from the physics world
        this.mesh.position.copy(this.rigidBody.translation())
    }

    jump() {
        // Jump if on the ground
        if (this.rigidBody.translation().y < 2) {
            this.rigidBody.applyImpulse({x: 0.0, y: 30.0, z: 0.0}, true);
        }
    }
}

export {Player}