/**
 * @license
 * Copyright (c) 2024 Ruslan Abbas Al Faraui
 * SPDX-License-Identifier: MIT
 */

let ENABLE_VR = true;

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.rotation.order = 'ZXY';
camera.position.y = -2;
camera.position.z =  2;
camera.lookAt( 0, 0, 0 );
if (ENABLE_VR) {
  stereo = new THREE.StereoCamera();
  stereo.aspect = 0.5;
  stereo.eyeSep = 0.1;
}


let geometry, material;

geometry = new THREE.PlaneGeometry( 3, 3 );
material = new THREE.MeshBasicMaterial( {color: 0x666600, side: THREE.DoubleSide} );
let plane = new THREE.Mesh( geometry, material );
scene.add( plane );

geometry = new THREE.BoxGeometry( 0.5, 1, 0.1 );
material = new THREE.MeshBasicMaterial( { color: 0x11cc00, wireframe: true } );
let cube = new THREE.Mesh( geometry, material );
cube.position.z = 0.2;
cube.rotation.order = 'ZXY';
cube.rotation.z = toRad(90);
scene.add( cube );

var stats = new Stats();
stats.showPanel( 0 );
document.body.appendChild( stats.dom );

ws = new WebSocket('ws://192.168.1.63:9001/');
ws.onconnect = e => {
  setTimeout(()=>{
    reset_azimuth();
  }, 1000);
}
ws.onmessage = sensor_handler;


function animate() {
  stats.begin();

  movement_tick();

  if (ENABLE_VR) {
      // if ( scene.matrixWorldAutoUpdate ) scene.updateMatrixWorld();
      if ( camera.matrixWorldAutoUpdate ) camera.updateMatrixWorld();
      stereo.update( camera );
      const _size = new THREE.Vector2();
      renderer.getSize( _size );
      renderer.setScissorTest( true );

      renderer.setScissor( 0, 0, _size.width / 2, _size.height );
      renderer.setViewport( 0, 0, _size.width / 2, _size.height );
      renderer.render( scene, stereo.cameraL );

      renderer.setScissor( _size.width / 2, 0, _size.width / 2, _size.height );
      renderer.setViewport( _size.width / 2, 0, _size.width / 2, _size.height );
      renderer.render( scene, stereo.cameraR );

      renderer.setScissorTest( false );
  } else {
      renderer.render( scene, camera );
  }
  stats.end();
  requestAnimationFrame( animate );
}
requestAnimationFrame( animate );
