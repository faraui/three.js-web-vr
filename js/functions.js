/**
 * @license
 * Copyright (c) 2024 Ruslan Abbas Al Faraui
 * SPDX-License-Identifier: MIT
 */

function toRad( angle ) {
    return angle * (Math.PI / 180);
}

function toDeg( angle ) {
    return angle / (Math.PI / 180);
}

let move_fb = 0, move_lr = 0, move_ud = 0;
document.onkeydown = (e) => {
    switch ((e || window.event).key) {
      case 'w':
          move_fb = 0.1;
          break;
      case 's':
          move_fb = -0.1;
          break;
      case 'a':
          move_lr = -0.1;
          break;
      case 'd':
          move_lr = 0.1;
          break;
      case 'z':
          move_ud = -0.1;
          break;
      case 'x':
          move_ud = 0.1;
          break;
    }
};
document.onkeyup = (e) => {
    let key = (e || window.event).key
         if (key == 'w' || key == 's') move_fb = 0;
    else if (key == 'a' || key == 'd') move_lr = 0;
    else if (key == 'z' || key == 'x') move_ud = 0;
}
function movement_tick() {
    let rot_x = camera.rotation.x;
    let rot_y = camera.rotation.y;
    camera.rotation.x = 0;
    camera.rotation.y = 0;
    camera.translateY( move_fb );
    camera.translateX( move_lr );
    camera.position.z += move_ud;
    camera.rotation.x = rot_x;
    camera.rotation.y = rot_y;
}

document.onclick = (e) => {document.getElementsByTagName('canvas')[0].requestPointerLock();}
document.onmousemove = (e) => {
    camera.rotation.x -= e.movementY/100;
    camera.rotation.z -= e.movementX/100;
}


let USE_FILTER = false;
let azimuth_correction_delta = 0;

var estats = new Stats();
estats.domElement.style.left = '10%';
estats.showPanel( 0 );
document.body.appendChild( estats.dom );
if (USE_FILTER) {
    azimuth_f = 0;
    pitch_f = 0;
    roll_f = 0;
}

function sensor_handler(e) {
    estats.begin();

    let data = e.data.split(':');
    let values = data[1].split(',');
    if (data[0] == 'r') {
        let azimuth, pitch, roll;
        if (USE_FILTER) {
            let t_val;
            t_val = parseFloat(values[0]) - azimuth_f;
            azimuth_f += (Math.abs(t_val) > toRad(5)) ? (t_val * 0.9) : (t_val * 0);
            t_val = parseFloat(values[1]) - pitch_f;
            pitch_f   += (Math.abs(t_val) > toRad(1) ) ? (t_val * 0.9) : (t_val * 0);
            t_val = parseFloat(values[2]) - roll_f;
            roll_f    += (Math.abs(t_val) > toRad(1) ) ? (t_val * 0.9) : (t_val * 0);

            azimuth = normalize_angle( azimuth_f + azimuth_correction_delta );
            pitch   = normalize_angle( pitch_f );
            roll    = normalize_angle( roll_f );
        } else {
            azimuth = normalize_angle( parseFloat(values[0]) + azimuth_correction_delta );
            pitch   = normalize_angle( parseFloat(values[1]) );
            roll    = normalize_angle( parseFloat(values[2]) );
        }

        document.getElementById('x').innerHTML = 'azimuth: ' + Math.round( toDeg(azimuth)         );
        document.getElementById('y').innerHTML = 'pitch: '   + Math.round( toDeg(pitch)           );
        document.getElementById('z').innerHTML = 'roll: '    + Math.round( toDeg(roll)            );

        camera.rotation.set(pitch, roll, Math.PI*2 - azimuth);

    }

    estats.end();
}

function normalize_angle(angle) {
    if (angle < 0) return Math.PI*2+angle;
    return angle;
}

function reset_azimuth() {
    if (camera.rotation.z > Math.PI) azimuth_correction_delta += camera.rotation.z - Math.PI*2;
    else azimuth_correction_delta += camera.rotation.z;
}


// Object3D.rotateOnAxis( new THREE.Vector3(1,0,0), angleX );
// Object3D.rotateOnWorldAxis( new THREE.Vector3(0,0,1), angleZ );
//
// let roll  = Math.atan2(ax, Math.sqrt(ay*ay + az*az));
// let pitch = Math.atan2(ay, Math.sqrt(ax*ax + az*az));
//
// cube.rotation.y = normalize_angle(az, roll);
// cube.rotation.x = normalize_angle(az, -pitch);
//
// function normalize_angle(az, ang) {
//   if (az > 0) {
//     if (ang > 0) return Math.PI*2 - ang;
//     else return -ang;
//   }
//   else return Math.PI + ang;
// }
