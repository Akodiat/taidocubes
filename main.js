import RAPIER from 'https://cdn.skypack.dev/@dimforge/rapier3d-compat';
import * as THREE from 'three';
import {OrbitControls} from './libs/OrbitControls.js';
import {Player} from './src/Player.js';

class Game {
    constructor() {
        RAPIER.init().then(() => {
            // Setup physics world simulation.
            let gravity = {x: 0.0, y: -9.81, z: 0.0};
            this.model = new RAPIER.World(gravity);

            // Create the ground
            let groundColliderDesc = RAPIER.ColliderDesc.cuboid(
                10.0, 0.1, 10.0
            );
            this.model.createCollider(groundColliderDesc);

            this.view = new View();

            this.player = new Player(this.model, this.view);

            this.render = () => {
                this.player.updateModel();
                // Step the simulation forward.
                this.model.step();
                this.player.updateView();

                // Update camera
                const camdir = this.player.crosshairMesh.position.clone().sub(this.player.mesh.position).normalize()
                this.view.camera.position.lerp(this.player.mesh.position.clone().sub(camdir.multiplyScalar(10)).add(new THREE.Vector3(0, 10, 0)), 0.1)
                this.view.camera.lookAt(this.player.crosshairMesh.position);


                this.view.renderer.render(this.view.scene, this.view.camera);
                requestAnimationFrame(this.render);
            }
            this.render();
        });

    }
}

class View {
    camera;
    scene;
    renderer;
    controls;

    constructor() {
        // Setup renderer
        this.renderer = new THREE.WebGLRenderer({
            alpha: true
        });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        //renderer.toneMapping = THREE.ACESFilmicToneMapping;
        const container = document.getElementById('container');
        container.appendChild(this.renderer.domElement);

        // Setup scene and camera
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 6, 10);
        this.camera.lookAt(new THREE.Vector3());

        // Draw the ground
        const groundGeometry = new THREE.BoxGeometry(20.0, 0.2, 20.0);
        const groundMaterial = new THREE.MeshStandardMaterial({
            color: 0xaaaaaa
        });
        this.groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
        this.scene.add(this.groundMesh);

        // Setup lights
        const pointLight = new THREE.PointLight();
        pointLight.position.set(5, 10, 0)
        this.scene.add(pointLight);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        ambientLight.position.set(5, 5, 5);
        this.scene.add(ambientLight);

        // Add x-y-z axis indicator
        const axesHelper = new THREE.AxesHelper(30);
        this.scene.add(axesHelper);

        // And camera controls
        //this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        //controls.addEventListener('change', render);

        // Update camera aspect ratio on window resize
        //window.addEventListener('resize', () => {
        //    this.camera.aspect = window.innerWidth / window.innerHeight;
        //    this.camera.updateProjectionMatrix();
        //    this.renderer.setSize(window.innerWidth, window.innerHeight);
        //    render();
        //});

    }
}

const game = new Game();