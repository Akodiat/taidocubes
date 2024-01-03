import RAPIER from 'https://cdn.skypack.dev/@dimforge/rapier3d-compat';
import * as THREE from 'three';
import {getSignedAngle} from './utils.js';

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
        const cubeGeometry = new THREE.BoxGeometry(size.x * 2, size.y * 2, size.z * 2);
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
        this.crosshairMesh.position.y = 0.2
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
        const moveSpeed = 2;

        const crosshairPos = this.crosshairMesh.position;

        const heading = crosshairPos.clone().sub(this.rigidBody.translation())
        const r = heading.length();
        heading.normalize();

        const up = this.mesh.up;

        const currHeading = new THREE.Vector3(0,0,-1).applyQuaternion(this.rigidBody.rotation());
        const angle = getSignedAngle(
            new THREE.Vector3(currHeading.x, 0, currHeading.z).normalize(),
            new THREE.Vector3(heading.x, 0, heading.z).normalize(), 
            up
        );
        this.rigidBody.applyTorqueImpulse(up.clone().multiplyScalar(angle * 10), true);
        const impulse = new THREE.Vector3();

        if (this.moveForward) {
            impulse.add(heading);
        }
        if (this.moveBackward) {
            impulse.add(heading.clone().negate());
        }

        if (this.moveLeft) {
            const sideF = heading.clone().cross(up).normalize().negate();
            const inwardF = heading.clone().setLength(sideF.lengthSq()/r);
            impulse.add(sideF.add(inwardF));

            //this.rigidBody.applyTorqueImpulse({ x: 0.0, y: -0.5, z: 0.0 }, true);
        }
        if (this.moveRight) {
            const sideF = heading.clone().cross(up).normalize();
            const inwardF = heading.clone().setLength(sideF.lengthSq()/r);
            impulse.add(sideF.add(inwardF));

            //this.rigidBody.applyTorqueImpulse({ x: 0.0, y: 0.5, z: 0.0 }, true);
        }

        this.rigidBody.applyImpulse(impulse.normalize().multiplyScalar(moveSpeed), true);
    }

    updateView() {
        // Set the visible mesh to the position of the rigid
        // body from the physics world
        this.mesh.position.copy(this.rigidBody.translation())
        this.mesh.quaternion.copy(this.rigidBody.rotation())
    }

    jump() {
        // Jump if on the ground
        if (this.rigidBody.translation().y < 2) {
            this.rigidBody.applyImpulse({x: 0.0, y: 30.0, z: 0.0}, true);
        }
    }
}

export {Player}