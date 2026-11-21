import { useEffect, useRef } from 'react';
import * as THREE from 'three';

// ============================================================================
// 1. PROCEDURAL 16x16 MINECRAFT PIXEL TEXTURE GENERATORS (NearestFilter)
// ============================================================================

function createPixelTexture(drawFn) {
  const canvas = document.createElement('canvas');
  canvas.width = 16;
  canvas.height = 16;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  drawFn(ctx);

  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestMipmapNearestFilter;
  texture.generateMipmaps = true;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Grass Top: Natural plains green (natural shader palette, zero neon saturation)
const createGrassTopTexture = () => createPixelTexture((ctx) => {
  const greens = ['#467a33', '#4e8338', '#3e6c2d', '#548c3d', '#386227', '#497c34', '#59903e', '#3f6e2b'];
  for (let x = 0; x < 16; x++) {
    for (let y = 0; y < 16; y++) {
      const n = Math.sin(x * 1.3) * Math.cos(y * 1.5) + (x * 7 + y * 13) % 5;
      const idx = Math.abs(Math.floor(n)) % greens.length;
      ctx.fillStyle = greens[idx];
      ctx.fillRect(x, y, 1, 1);
    }
  }
});

// Grass Side: Dirt base with hanging 1-4px grass fringe
const createGrassSideTexture = () => createPixelTexture((ctx) => {
  const dirts = ['#866043', '#795438', '#6d4c32', '#91694a', '#5f412b', '#735035', '#4d341f'];
  const greens = ['#467a33', '#4e8338', '#3e6c2d', '#548c3d', '#386227'];

  for (let x = 0; x < 16; x++) {
    for (let y = 0; y < 16; y++) {
      const idx = Math.abs(Math.floor(Math.sin(x * 2.1) + Math.cos(y * 1.7) + (x * 11 + y * 7) % 7)) % dirts.length;
      ctx.fillStyle = dirts[idx];
      ctx.fillRect(x, y, 1, 1);
    }
  }

  const fringeDepths = [3, 2, 4, 2, 3, 4, 2, 3, 2, 4, 3, 2, 3, 4, 2, 3];
  for (let x = 0; x < 16; x++) {
    const depth = fringeDepths[x];
    for (let y = 0; y <= depth; y++) {
      const gIdx = (x + y * 3) % greens.length;
      ctx.fillStyle = greens[gIdx];
      ctx.fillRect(x, y, 1, 1);
    }
  }
});

// Pure Dirt Block
const createDirtTexture = () => createPixelTexture((ctx) => {
  const dirts = ['#866043', '#795438', '#6d4c32', '#91694a', '#5f412b', '#735035', '#4d341f'];
  for (let x = 0; x < 16; x++) {
    for (let y = 0; y < 16; y++) {
      const idx = Math.abs(Math.floor(Math.sin(x * 1.7) + Math.cos(y * 1.9) + (x * 9 + y * 13) % 7)) % dirts.length;
      ctx.fillStyle = dirts[idx];
      ctx.fillRect(x, y, 1, 1);
    }
  }
});

// Stone / Cobblestone
const createStoneTexture = () => createPixelTexture((ctx) => {
  const grays = ['#757575', '#6b6b6b', '#808080', '#595959', '#8a8a8a', '#525252', '#949494'];
  for (let x = 0; x < 16; x++) {
    for (let y = 0; y < 16; y++) {
      const idx = Math.abs(Math.floor(Math.sin(x * 2.3) * Math.cos(y * 2.1) + (x * 7 + y * 11) % 5)) % grays.length;
      ctx.fillStyle = grays[idx];
      ctx.fillRect(x, y, 1, 1);
    }
  }
});

// Authentic Minecraft Snow Block (Clean white with subtle soft pixel shading)
const createSnowTexture = () => createPixelTexture((ctx) => {
  const snows = ['#ffffff', '#f8fafc', '#f1f5f9', '#e2e8f0', '#ffffff', '#eaf0f8'];
  for (let x = 0; x < 16; x++) {
    for (let y = 0; y < 16; y++) {
      const idx = Math.abs((x * 7 + y * 13 + (x ^ y)) % snows.length);
      ctx.fillStyle = snows[idx];
      ctx.fillRect(x, y, 1, 1);
    }
  }
});

// Spruce Leaves (Dark dense evergreen pine needles)
const createSpruceLeavesTexture = () => createPixelTexture((ctx) => {
  ctx.clearRect(0, 0, 16, 16);
  const pineGreens = ['#1e3a1e', '#162e16', '#264826', '#112311', '#2f552f', '#193319'];
  for (let x = 0; x < 16; x++) {
    for (let y = 0; y < 16; y++) {
      if ((x * 11 + y * 7 + (x ^ y)) % 6 === 0) continue;
      const idx = (x * 3 + y * 5) % pineGreens.length;
      ctx.fillStyle = pineGreens[idx];
      ctx.fillRect(x, y, 1, 1);
    }
  }
});

// Sand: Warm shoreline grains
const createSandTexture = () => createPixelTexture((ctx) => {
  const sands = ['#ded59d', '#d5cb90', '#e3daa7', '#cebf86', '#bfae76', '#e8dfae'];
  for (let x = 0; x < 16; x++) {
    for (let y = 0; y < 16; y++) {
      const idx = Math.abs((x * 13 + y * 7 + (x ^ y)) % sands.length);
      ctx.fillStyle = sands[idx];
      ctx.fillRect(x, y, 1, 1);
    }
  }
});

// Oak Bark: Vertical striated wood grain
const createBarkTexture = () => createPixelTexture((ctx) => {
  const barks = ['#664f33', '#574128', '#4b371f', '#775e3e', '#3b2915'];
  for (let x = 0; x < 16; x++) {
    const colBase = x % 4 === 0 ? 4 : x % 2 === 0 ? 1 : 0;
    for (let y = 0; y < 16; y++) {
      const idx = Math.min(barks.length - 1, Math.max(0, colBase + ((y % 5 === 0) ? 1 : 0) + ((x + y) % 3 === 0 ? -1 : 0)));
      ctx.fillStyle = barks[idx];
      ctx.fillRect(x, y, 1, 1);
    }
  }
});

// Oak Log Rings: Top & Bottom concentric annual rings
const createLogTopTexture = () => createPixelTexture((ctx) => {
  const bark = '#574128';
  const sapwood = '#ba9c66';
  const ringMid = '#9e814f';
  const ringDark = '#856a3e';
  const heartwood = '#6e542f';

  for (let x = 0; x < 16; x++) {
    for (let y = 0; y < 16; y++) {
      if (x === 0 || x === 15 || y === 0 || y === 15) {
        ctx.fillStyle = bark;
      } else {
        const dx = x - 7.5;
        const dy = y - 7.5;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist <= 2.2) ctx.fillStyle = heartwood;
        else if (dist <= 4.0) ctx.fillStyle = ringDark;
        else if (dist <= 5.8) ctx.fillStyle = ringMid;
        else ctx.fillStyle = sapwood;
      }
      ctx.fillRect(x, y, 1, 1);
    }
  }
});

// Oak Leaves: Cutout foliage with transparent voids
const createLeavesTexture = () => createPixelTexture((ctx) => {
  ctx.clearRect(0, 0, 16, 16);
  const foliage = ['#38761d', '#275313', '#479425', '#1e400f', '#51a82a'];
  for (let x = 0; x < 16; x++) {
    for (let y = 0; y < 16; y++) {
      if ((x * 7 + y * 13 + (x ^ y)) % 7 === 0 || (x === y && x % 3 === 0)) continue;
      const idx = (x * 3 + y * 5) % foliage.length;
      ctx.fillStyle = foliage[idx];
      ctx.fillRect(x, y, 1, 1);
    }
  }
});

// Waterfall Flow Texture (Vertical animated streams with white foam streaks)
const createWaterfallTexture = () => createPixelTexture((ctx) => {
  const blues = ['#2980b9', '#3498db', '#5dade2', '#7fb3d5', '#2471a3'];
  for (let x = 0; x < 16; x++) {
    for (let y = 0; y < 16; y++) {
      const idx = (x + y * 3) % blues.length;
      ctx.fillStyle = blues[idx];
      ctx.fillRect(x, y, 1, 1);
    }
  }
  // White vertical foam streams
  ctx.fillStyle = '#ffffff';
  for (let y = 0; y < 16; y++) {
    if ((y * 3) % 4 === 0) ctx.fillRect(3, y, 1, 1);
    if ((y * 5) % 3 === 0) ctx.fillRect(8, y, 1, 1);
    if ((y * 2) % 5 === 0) ctx.fillRect(13, y, 1, 1);
  }
});

// Cutout Wildflower Texture (Red Poppy & Yellow Dandelion)
const createFlowerTexture = (isRed) => createPixelTexture((ctx) => {
  ctx.clearRect(0, 0, 16, 16);
  // Stem
  ctx.fillStyle = '#2d6a1e';
  for (let y = 6; y < 16; y++) {
    ctx.fillRect(7 + (y % 2 === 0 ? 1 : 0), y, 1, 1);
  }
  // Flower Head
  const petalCol = isRed ? '#e74c3c' : '#f1c40f';
  const centerCol = isRed ? '#111111' : '#f39c12';
  for (let dx = -2; dx <= 2; dx++) {
    for (let dy = -2; dy <= 2; dy++) {
      if (Math.abs(dx) === 2 && Math.abs(dy) === 2) continue;
      ctx.fillStyle = petalCol;
      ctx.fillRect(7 + dx, 5 + dy, 1, 1);
    }
  }
  ctx.fillStyle = centerCol;
  ctx.fillRect(7, 5, 1, 1);
});

// Cutout Grass Blade Tuft Texture
const createGrassTuftTexture = () => createPixelTexture((ctx) => {
  ctx.clearRect(0, 0, 16, 16);
  const bladeCols = ['#4e8432', '#568f37', '#65a442'];
  for (let x = 2; x < 14; x += 2) {
    const height = 4 + (x % 3) * 3;
    for (let y = 16 - height; y < 16; y++) {
      ctx.fillStyle = bladeCols[(x + y) % bladeCols.length];
      ctx.fillRect(x, y, 1, 1);
    }
  }
});

// Steve Pixelated Arm Skin & Tunic Sleeve
const createSteveArmTexture = () => createPixelTexture((ctx) => {
  const tunic = ['#008b8b', '#007a7a', '#009e9e', '#006c6c', '#008383'];
  for (let x = 0; x < 16; x++) {
    for (let y = 0; y < 7; y++) {
      const idx = (x + y * 2) % tunic.length;
      ctx.fillStyle = tunic[idx];
      ctx.fillRect(x, y, 1, 1);
    }
    ctx.fillStyle = '#004c4c';
    ctx.fillRect(x, 6, 1, 1);
  }
  const skin = ['#c68b59', '#b97a48', '#d49b6a', '#a86e3f', '#dcab7e', '#9b643a'];
  for (let x = 0; x < 16; x++) {
    for (let y = 7; y < 16; y++) {
      const isKnuckle = y === 12 && (x === 3 || x === 7 || x === 11);
      const isWristShadow = y === 7;
      if (isKnuckle) ctx.fillStyle = '#9b643a';
      else if (isWristShadow) ctx.fillStyle = '#a86e3f';
      else {
        const sIdx = (x * 3 + y * 7) % skin.length;
        ctx.fillStyle = skin[sIdx];
      }
      ctx.fillRect(x, y, 1, 1);
    }
  }
});

// Biometric Scanner Vitals Screen Texture
const createScannerScreenTexture = () => createPixelTexture((ctx) => {
  ctx.fillStyle = '#050c18';
  ctx.fillRect(0, 0, 16, 16);
  ctx.strokeStyle = 'rgba(0, 240, 255, 0.2)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let i = 4; i < 16; i += 4) {
    ctx.moveTo(i, 0); ctx.lineTo(i, 16);
    ctx.moveTo(0, i); ctx.lineTo(16, i);
  }
  ctx.stroke();
  ctx.fillStyle = '#00f0ff';
  const ecg = [8, 8, 8, 7, 9, 3, 14, 6, 8, 8, 8, 8, 8, 8, 8, 8];
  for (let x = 0; x < 16; x++) {
    ctx.fillRect(x, ecg[x], 1, 1);
  }
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(5, 3, 1, 1);
});

// ============================================================================
// 2. 3D HELD ITEM VOXEL FACTORY (Viewmodel Layer)
// ============================================================================

function createHeldItemMesh(item) {
  const group = new THREE.Group();
  const itemId = item?.id || 'empty';

  if (itemId === 'nether_burger' || itemId === 'burger') {
    const bunMat = new THREE.MeshStandardMaterial({ color: 0xd68d45, roughness: 0.85 });
    const sesameMat = new THREE.MeshBasicMaterial({ color: 0xfff6db });
    const pattyMat = new THREE.MeshStandardMaterial({ color: 0x3d1717, roughness: 0.95 });
    const cheeseMat = new THREE.MeshStandardMaterial({ color: 0xffa600, roughness: 0.5 });
    const garnishMat = new THREE.MeshStandardMaterial({ color: 0xd12a2a, roughness: 0.6 });

    const bottomBun = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.04, 0.18), bunMat);
    bottomBun.position.y = -0.06;
    group.add(bottomBun);

    const patty = new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.05, 0.19), pattyMat);
    patty.position.y = -0.02;
    group.add(patty);

    const cheese = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.02, 0.20), cheeseMat);
    cheese.position.y = 0.01;
    cheese.rotation.y = 0.35;
    group.add(cheese);

    const garnish = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.02, 0.17), garnishMat);
    garnish.position.y = 0.03;
    group.add(garnish);

    const topBun = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.06, 0.18), bunMat);
    topBun.position.y = 0.07;
    group.add(topBun);

    [[-0.05, 0.10, -0.04], [0.05, 0.10, 0.03], [0, 0.105, 0]].forEach(([sx, sy, sz]) => {
      const seed = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.01, 0.02), sesameMat);
      seed.position.set(sx, sy, sz);
      group.add(seed);
    });

  } else if (itemId === 'gapple' || itemId.includes('apple')) {
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xffcc00,
      metalness: 0.8,
      roughness: 0.25,
      emissive: 0x553300
    });
    const stemMat = new THREE.MeshStandardMaterial({ color: 0x4a2a12, roughness: 0.9 });
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x38b000, roughness: 0.7 });

    const appleBody = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.17, 0.16), goldMat);
    group.add(appleBody);

    const stem = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.06, 0.025), stemMat);
    stem.position.set(0, 0.10, 0);
    group.add(stem);

    const leaf = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.015, 0.03), leafMat);
    leaf.position.set(0.03, 0.10, 0);
    leaf.rotation.z = -0.3;
    group.add(leaf);

  } else if (itemId === 'redstone_energy' || itemId === 'pufferfish_venom' || itemId === 'sculk_extract' || itemId === 'void_essence' || item?.actionType === 'drink') {
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0xdbeafe,
      transparent: true,
      opacity: 0.65,
      roughness: 0.15,
      metalness: 0.1
    });
    const corkMat = new THREE.MeshStandardMaterial({ color: 0x8a5a2b, roughness: 0.9 });
    const liquidColor = itemId === 'redstone_energy' ? 0xff2222
      : itemId === 'sculk_extract' ? 0x00f0ff
      : itemId === 'void_essence' ? 0xa855f7
      : 0x10b981;
    const liquidMat = new THREE.MeshBasicMaterial({ color: liquidColor });

    const bottleBody = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.16, 0.14), glassMat);
    group.add(bottleBody);

    const liquidCore = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.12, 0.11), liquidMat);
    liquidCore.position.y = -0.01;
    group.add(liquidCore);

    const neck = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.05, 0.06), glassMat);
    neck.position.y = 0.10;
    group.add(neck);

    const cork = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.04, 0.05), corkMat);
    cork.position.y = 0.135;
    group.add(cork);

  } else if (itemId === 'milk_bucket') {
    const ironMat = new THREE.MeshStandardMaterial({ color: 0xb0b8c4, metalness: 0.85, roughness: 0.25 });
    const milkMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    const bucket = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.18, 0.16), ironMat);
    group.add(bucket);

    const milkSurface = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.02, 0.14), milkMat);
    milkSurface.position.y = 0.085;
    group.add(milkSurface);

  } else if (itemId === 'biometric_scanner' || item?.isScanner) {
    const chassisMat = new THREE.MeshStandardMaterial({ color: 0x18202c, metalness: 0.5, roughness: 0.4 });
    const gripMat = new THREE.MeshStandardMaterial({ color: 0x0f141d, roughness: 0.85 });
    const emitterMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });

    const screenTex = createScannerScreenTexture();
    const screenMat = new THREE.MeshBasicMaterial({ map: screenTex });

    const chassis = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.23, 0.05), chassisMat);
    group.add(chassis);

    const leftGrip = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.19, 0.06), gripMat);
    leftGrip.position.x = -0.085;
    group.add(leftGrip);

    const rightGrip = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.19, 0.06), gripMat);
    rightGrip.position.x = 0.085;
    group.add(rightGrip);

    const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.13), screenMat);
    screen.position.set(0, 0.025, 0.028);
    group.add(screen);

    const emitter = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.03, 0.04), emitterMat);
    emitter.position.set(0, 0.125, 0);
    group.add(emitter);

  } else if (itemId === 'ender_pizza') {
    const crustMat = new THREE.MeshStandardMaterial({ color: 0x241233, roughness: 0.9 });
    const cheeseMat = new THREE.MeshStandardMaterial({ color: 0x9333ea, roughness: 0.5 });
    const flakeMat = new THREE.MeshBasicMaterial({ color: 0x00ffcc });

    const slice = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.035, 0.18), crustMat);
    group.add(slice);

    const cheese = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.015, 0.16), cheeseMat);
    cheese.position.y = 0.02;
    group.add(cheese);

    const flake = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.01, 0.04), flakeMat);
    flake.position.set(0.02, 0.03, 0.02);
    group.add(flake);

  } else if (itemId === 'omega_salmon' || itemId.includes('salmon') || itemId.includes('fish')) {
    // Vibrant Blue Fish (matches hotbar slot 8 blue 🐟 icon)
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.45 });
    const bellyMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.40 });
    const finMat = new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.50 });
    const eyeWhiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const pupilMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });

    const body = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.09, 0.06), bodyMat);
    group.add(body);

    const belly = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.03, 0.062), bellyMat);
    belly.position.y = -0.032;
    group.add(belly);

    const dorsalFin = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.05, 0.015), finMat);
    dorsalFin.position.set(-0.02, 0.06, 0);
    group.add(dorsalFin);

    const tailFin = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.08, 0.015), finMat);
    tailFin.position.set(-0.13, 0, 0);
    group.add(tailFin);

    const pecFin = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.025, 0.02), finMat);
    pecFin.position.set(0.03, -0.01, 0.035);
    pecFin.rotation.y = 0.3;
    group.add(pecFin);

    const eyeL = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.02, 0.01), eyeWhiteMat);
    eyeL.position.set(0.07, 0.02, 0.031);
    group.add(eyeL);
    const pupilL = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.01, 0.012), pupilMat);
    pupilL.position.set(0.075, 0.02, 0.032);
    group.add(pupilL);

  } else if (itemId === 'blaze_chicken' || itemId.includes('chicken')) {
    const meatMat = new THREE.MeshStandardMaterial({ color: 0xc86428, roughness: 0.75 });
    const crispMat = new THREE.MeshStandardMaterial({ color: 0x9b3a12, roughness: 0.85 });
    const boneMat = new THREE.MeshStandardMaterial({ color: 0xf5f0e1, roughness: 0.9 });

    const drumstick = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.18, 0.12), meatMat);
    group.add(drumstick);

    const crispEdge = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.08, 0.13), crispMat);
    crispEdge.position.y = 0.02;
    group.add(crispEdge);

    const bone = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.09, 0.04), boneMat);
    bone.position.y = -0.12;
    group.add(bone);

  } else if (itemId === 'glazed_donut' || itemId === 'golden_cookie' || itemId.includes('donut') || itemId.includes('cookie')) {
    const doughMat = new THREE.MeshStandardMaterial({ color: 0xd99b59, roughness: 0.85 });
    const glazeMat = new THREE.MeshStandardMaterial({ color: 0xec4899, roughness: 0.35 });
    const sprinkleMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    const donut = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.05, 0.18), doughMat);
    group.add(donut);

    const glaze = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.02, 0.17), glazeMat);
    glaze.position.y = 0.03;
    group.add(glaze);

    const sprinkle = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.015, 0.03), sprinkleMat);
    sprinkle.position.set(0.03, 0.045, 0.03);
    group.add(sprinkle);

  } else if (itemId.includes('berr')) {
    const berryMat = new THREE.MeshStandardMaterial({ color: 0xcc2222, roughness: 0.4 });
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x38b000, roughness: 0.7 });

    const b1 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.08), berryMat);
    b1.position.set(-0.03, 0.01, 0);
    group.add(b1);
    const b2 = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.07, 0.07), berryMat);
    b2.position.set(0.03, 0.03, 0.01);
    group.add(b2);
    const b3 = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.07, 0.07), berryMat);
    b3.position.set(0, -0.02, 0.02);
    group.add(b3);

    const leaf = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.02, 0.05), leafMat);
    leaf.position.set(0, 0.07, 0);
    group.add(leaf);

  } else if (itemId !== 'empty' && item) {
    // Clean fallback voxel item for any unexpected modded item
    const fallbackMat = new THREE.MeshStandardMaterial({ color: 0x00f0ff, roughness: 0.5 });
    const fallbackMesh = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 0.14), fallbackMat);
    group.add(fallbackMesh);
  }

  // Ensure frustumCulled is false and depth settings are clean for all meshes
  group.traverse((node) => {
    if (node.isMesh) {
      node.frustumCulled = false;
      if (node.material) {
        node.material.depthTest = true;
        node.material.depthWrite = true;
      }
    }
  });

  // Normalize geometry around consistent first-person size (~0.22 units)
  const bbox = new THREE.Box3().setFromObject(group);
  const size = new THREE.Vector3();
  bbox.getSize(size);
  const maxDim = Math.max(size.x, size.y, size.z);

  const container = new THREE.Group();
  container.name = 'NormalizedHeldItem';
  if (maxDim > 0.001) {
    const center = new THREE.Vector3();
    bbox.getCenter(center);
    group.position.set(-center.x, -center.y, -center.z);

    const normScale = 0.22 / maxDim;
    container.scale.set(normScale, normScale, normScale);
  }
  container.add(group);
  return container;
}

// ============================================================================
// 2A. MINECRAFT FIRST-PERSON HELD ITEM GRIP PROFILES (Relative to HandAnchor)
// ============================================================================

// Base grip category presets for normalized items (maxDim ~ 0.22)
const GRIP_PRESETS = {
  foodFlat: {
    position: [-0.02, 0.07, 0.06],
    rotation: [0.65, -0.20, -0.20],
    scale: 0.40
  },
  foodRound: {
    position: [-0.015, 0.06, 0.05],
    rotation: [0.30, 0.20, -0.10],
    scale: 0.38
  },
  bottle: {
    position: [-0.015, 0.08, 0.05],
    rotation: [0.40, 0.00, -0.30],
    scale: 0.40
  },
  longItem: {
    position: [-0.02, 0.07, 0.05],
    rotation: [0.35, 0.25, -0.20],
    scale: 0.42
  },
  device: {
    position: [-0.02, 0.09, 0.06],
    rotation: [0.45, -0.15, -0.15],
    scale: 0.46
  }
};

const ITEM_GRIPS = {
  burger: {
    preset: 'foodFlat',
    ...GRIP_PRESETS.foodFlat,
    scale: 0.40
  },
  pizza: {
    preset: 'foodFlat',
    ...GRIP_PRESETS.foodFlat,
    rotation: [0.70, -0.22, -0.15],
    scale: 0.42
  },
  apple: {
    preset: 'foodRound',
    ...GRIP_PRESETS.foodRound,
    scale: 0.38
  },
  berries: {
    preset: 'foodRound',
    ...GRIP_PRESETS.foodRound,
    position: [-0.015, 0.05, 0.05],
    scale: 0.30
  },
  donut: {
    preset: 'foodRound',
    ...GRIP_PRESETS.foodRound,
    rotation: [0.60, -0.20, -0.15],
    scale: 0.38
  },
  chicken: {
    preset: 'foodRound',
    ...GRIP_PRESETS.foodRound,
    position: [-0.015, 0.07, 0.05],
    scale: 0.40
  },
  potion: {
    preset: 'bottle',
    ...GRIP_PRESETS.bottle,
    scale: 0.40
  },
  milk: {
    preset: 'bottle',
    ...GRIP_PRESETS.bottle,
    scale: 0.40
  },
  fish: {
    preset: 'longItem',
    ...GRIP_PRESETS.longItem,
    scale: 0.42
  },
  scanner: {
    preset: 'device',
    ...GRIP_PRESETS.device,
    scale: 0.46
  },
  default: {
    preset: 'foodRound',
    ...GRIP_PRESETS.foodRound,
    scale: 0.40
  }
};

function getGripCategory(item) {
  if (!item || !item.id || item.id === 'empty') return 'empty';
  const id = item.id.toLowerCase();
  if (id.includes('burger')) return 'burger';
  if (id.includes('pizza')) return 'pizza';
  if (id.includes('apple') || id === 'gapple') return 'apple';
  if (id.includes('milk') || id.includes('bucket')) return 'milk';
  if (
    id.includes('energy') ||
    id.includes('venom') ||
    id.includes('extract') ||
    id.includes('potion') ||
    id.includes('essence') ||
    id.includes('soda') ||
    id.includes('boba') ||
    item.actionType === 'drink'
  ) {
    return 'potion';
  }
  if (id.includes('salmon') || id.includes('fish')) return 'fish';
  if (id.includes('scanner') || item.isScanner) return 'scanner';
  if (id.includes('chicken') || id.includes('blaze')) return 'chicken';
  if (id.includes('donut') || id.includes('cookie')) return 'donut';
  if (id.includes('berr')) return 'berries';
  return 'default';
}

// Reusable HeldItemRenderer System
class HeldItemRenderer {
  constructor(handAnchor, heldItemPivot) {
    this.handAnchor = handAnchor;
    this.heldItemPivot = heldItemPivot;
    this.currentItemId = null;
  }

  update(item) {
    const pivot = this.heldItemPivot;
    if (!pivot) return;

    while (pivot.children.length > 0) {
      const child = pivot.children[0];
      if (child.name !== 'DEBUG_MARKER') {
        child.traverse((node) => {
          if (node.isMesh) {
            if (node.geometry) node.geometry.dispose();
            if (node.material) {
              if (Array.isArray(node.material)) node.material.forEach((m) => m.dispose());
              else node.material.dispose();
            }
          }
        });
      }
      pivot.remove(child);
    }

    if (!item || !item.id || item.id === 'empty') {
      this.currentItemId = null;
      pivot.position.set(0, 0, 0);
      pivot.rotation.set(0, 0, 0);
      pivot.scale.set(1, 1, 1);
      return;
    }

    this.currentItemId = item.id;
    const category = getGripCategory(item);
    const grip = ITEM_GRIPS[category] || ITEM_GRIPS.default;

    pivot.position.set(grip.position[0], grip.position[1], grip.position[2]);
    pivot.rotation.set(grip.rotation[0], grip.rotation[1], grip.rotation[2]);
    pivot.scale.set(grip.scale, grip.scale, grip.scale);

    const itemMesh = createHeldItemMesh(item);
    if (itemMesh) {
      pivot.add(itemMesh);
    }

    console.log(`[ViewModel] slot item: ${item.id}, name: "${item.name}", category: ${category}`);
  }
}

// ============================================================================
// 2B. PROCEDURAL MINECRAFT SHADER WATER MATERIAL (Fresnel & Wave Specular)
// ============================================================================

function createMinecraftWaterMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uSunDir: { value: new THREE.Vector3(-0.55, 0.67, -0.47).normalize() },
      uSkyColor: { value: new THREE.Color(0x82a9db) },
      uDeepColor: { value: new THREE.Color(0x0c3b5e) },
      uShallowColor: { value: new THREE.Color(0x1fa2ba) },
      uMountainReflectionColor: { value: new THREE.Color(0x4a5d6e) },
      uSnowReflectionColor: { value: new THREE.Color(0xdce7f2) },
      uSunColor: { value: new THREE.Color(0xfffae0) }
    },
    vertexShader: `
      uniform float uTime;
      varying vec3 vWorldPosition;
      varying vec3 vNormal;
      varying vec2 vUv;

      void main() {
        vUv = uv;
        vec3 pos = position;

        // Animated gentle wave displacement
        float w1 = sin(pos.x * 0.18 + uTime * 2.0 + pos.y * 0.14) * 0.05;
        float w2 = cos(pos.x * 0.10 - uTime * 1.5 + pos.y * 0.22) * 0.04;
        float w3 = sin((pos.x + pos.y) * 0.35 + uTime * 2.8) * 0.02;
        pos.z += w1 + w2 + w3;

        // Approximate normal from wave partial derivatives
        float ddx = 0.18 * cos(pos.x * 0.18 + uTime * 2.0 + pos.y * 0.14) * 0.05
                  - 0.10 * sin(pos.x * 0.10 - uTime * 1.5 + pos.y * 0.22) * 0.04;
        float ddy = 0.14 * cos(pos.x * 0.18 + uTime * 2.0 + pos.y * 0.14) * 0.05
                  + 0.22 * -sin(pos.x * 0.10 - uTime * 1.5 + pos.y * 0.22) * 0.04;

        vec3 localNormal = normalize(vec3(-ddx, -ddy, 1.0));

        vec4 worldPos = modelMatrix * vec4(pos, 1.0);
        vWorldPosition = worldPos.xyz;
        vNormal = normalize((modelMatrix * vec4(localNormal, 0.0)).xyz);

        gl_Position = projectionMatrix * viewMatrix * worldPos;
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec3 uSunDir;
      uniform vec3 uSkyColor;
      uniform vec3 uDeepColor;
      uniform vec3 uShallowColor;
      uniform vec3 uMountainReflectionColor;
      uniform vec3 uSnowReflectionColor;
      uniform vec3 uSunColor;

      varying vec3 vWorldPosition;
      varying vec3 vNormal;
      varying vec2 vUv;

      void main() {
        vec3 V = normalize(cameraPosition - vWorldPosition);
        vec3 N = normalize(vNormal);

        // Distort normal with animated micro-ripples
        float ripple1 = sin(vWorldPosition.x * 1.6 + uTime * 3.2 + vWorldPosition.z * 1.2);
        float ripple2 = cos(vWorldPosition.x * 1.1 - uTime * 2.4 - vWorldPosition.z * 1.8);
        vec3 waveN = normalize(N + vec3(ripple1 * 0.06, 0.0, ripple2 * 0.06));

        float NdotV = max(dot(waveN, V), 0.0);
        // Fresnel reflection factor
        float fresnel = clamp(pow(1.0 - NdotV, 3.2), 0.12, 0.94);

        // Depth/distance factor: near shore vs open deep water
        float distToCam = length(vWorldPosition.xz - cameraPosition.xz);
        float depthFactor = clamp((distToCam - 12.0) / 45.0, 0.0, 1.0);

        // Base water color: shallow crystal turquoise -> deep sapphire blue
        vec3 waterBase = mix(uShallowColor, uDeepColor, depthFactor);

        // Micro caustic shimmer
        float caustic = sin(vWorldPosition.x * 0.8 + uTime * 1.4) * sin(vWorldPosition.z * 0.8 - uTime * 1.1);
        waterBase += vec3(0.03, 0.07, 0.05) * max(caustic, 0.0);

        // Environment reflection: Sky + Mountain + Forest
        vec3 reflectionCol = uSkyColor;

        // Mountain reflection projection along horizon
        if (vWorldPosition.z < -20.0) {
          float reflZ = -vWorldPosition.z;
          float mtnFactor = smoothstep(20.0, 140.0, reflZ);
          vec3 mtnRefl = mix(uMountainReflectionColor * 0.85, uSnowReflectionColor, smoothstep(0.4, 0.8, waveN.y));
          reflectionCol = mix(reflectionCol, mtnRefl, mtnFactor * 0.65);
        }

        // Sun specular glint (BSL / Complementary shader style)
        vec3 H = normalize(uSunDir + V);
        float NdotH = max(dot(waveN, H), 0.0);
        float spec = pow(NdotH, 96.0) * 1.85;
        float broadSpec = pow(NdotH, 16.0) * 0.25;
        vec3 sunReflection = uSunColor * (spec + broadSpec);

        // Final color blending
        vec3 finalColor = mix(waterBase, reflectionCol, fresnel) + sunReflection;

        // Shore transparency: transparent near shore to see submerged sand
        float alpha = mix(0.68, 0.94, clamp(fresnel + depthFactor * 0.4, 0.0, 1.0));

        gl_FragColor = vec4(finalColor, alpha);
      }
    `,
    transparent: true,
    side: THREE.DoubleSide
  });
}

// ============================================================================
// 3. CONTINUOUS SOLID VOXEL MOUNTAIN GENERATOR (Authentic Minecraft Shaders)
// ============================================================================

function generateSolidVoxelMountainRange(scene, textures) {
  const { snowTex, stoneTex, dirtTex, grassTopTex, logBlockMaterials, spruceLeavesTex, boxGeom } = textures;

  // Horizontal range encompassing the full horizon
  const minX = -320, maxX = 320, stepX = 4;
  const minZ = -500, maxZ = -136, stepZ = 4;
  const nx = Math.floor((maxX - minX) / stepX) + 1;
  const nz = Math.floor((maxZ - minZ) / stepZ) + 1;

  const heights = new Float32Array(nx * nz);
  const getIndex = (i, j) => i * nz + j;

  // Mountain Peaks Profile:
  // Jagged mountain range with dominant summit, razor ridges, secondary horns, saddles and foothill ridges
  const mountainPeaks = [
    { x: -38, z: -340, h: 195, r: 140 }, // Dominant massive snowy summit
    { x: 62,  z: -375, h: 176, r: 125 }, // Sharp eastern horn
    { x: -140, z: -355, h: 158, r: 110 }, // Western shoulder massif
    { x: 165, z: -335, h: 148, r: 105 }, // Far eastern ridge
    { x: -230, z: -365, h: 138, r: 95 },  // Far western horn
    { x: 245, z: -355, h: 132, r: 90 },  // Distant eastern crest
    { x: -80, z: -230, h: 84,  r: 80 },  // Midground foothill ridge
    { x: 82,  z: -225, h: 78,  r: 75 }   // Midground foothill ridge
  ];

  for (let i = 0; i < nx; i++) {
    const x = minX + i * stepX;
    for (let j = 0; j < nz; j++) {
      const z = minZ + j * stepZ;
      let peakH = 0;
      for (let p = 0; p < mountainPeaks.length; p++) {
        const pk = mountainPeaks[p];
        const dist = Math.hypot(x - pk.x, z - pk.z);
        if (dist < pk.r) {
          const factor = Math.max(0, 1 - dist / pk.r);
          const elev = Math.pow(factor, 1.8) * pk.h;
          if (elev > peakH) peakH = elev;
        }
      }

      // Continuous continental base
      const continental = Math.sin(x * 0.012) * 12 + Math.cos(z * 0.014) * 10;

      // Ridge Noise (sharp razorback ridges along the east-west spine)
      const distFromSpine = Math.abs(z - (-345));
      const spineFactor = Math.max(0, 1.0 - distFromSpine / 155);
      const ridgeN = 1.0 - Math.abs(Math.sin(x * 0.022 + z * 0.012) * 0.7 + Math.cos(x * 0.011 - z * 0.024) * 0.5);
      const ridgeElev = Math.pow(Math.max(0, ridgeN), 2.0) * 44 * spineFactor;

      // Small-scale detail
      const detailN = (Math.sin(x * 0.065) * Math.cos(z * 0.058) + Math.sin((x + z) * 0.09)) * 6;

      const rawH = peakH + continental + ridgeElev + detailN;
      // Quantize to integer Minecraft block terrace steps (multiples of 2 blocks)
      const totalH = rawH > 6 ? Math.floor(rawH / 2) * 2 : 0;
      heights[getIndex(i, j)] = Math.max(0, totalH);
    }
  }

  // Multi-material vertex buffers
  const snowPos = [], snowNorm = [], snowUv = [];
  const stonePos = [], stoneNorm = [], stoneUv = [];
  const grassPos = [], grassNorm = [], grassUv = [];
  const dirtPos = [], dirtNorm = [], dirtUv = [];

  const pushQuad = (targetP, targetN, targetU, p0, p1, p2, p3, n, uv0, uv1, uv2, uv3) => {
    // Tri 1: p0, p1, p2 (CCW)
    targetP.push(p0[0], p0[1], p0[2], p1[0], p1[1], p1[2], p2[0], p2[1], p2[2]);
    // Tri 2: p0, p2, p3 (CCW)
    targetP.push(p0[0], p0[1], p0[2], p2[0], p2[1], p2[2], p3[0], p3[1], p3[2]);
    for (let k = 0; k < 6; k++) {
      targetN.push(n[0], n[1], n[2]);
    }
    targetU.push(uv0[0], uv0[1], uv1[0], uv1[1], uv2[0], uv2[1]);
    targetU.push(uv0[0], uv0[1], uv2[0], uv2[1], uv3[0], uv3[1]);
  };

  // Build solid voxel volume - exposed faces only
  for (let i = 0; i < nx - 1; i++) {
    const x = minX + i * stepX;
    for (let j = 0; j < nz - 1; j++) {
      const z = minZ + j * stepZ;
      const h = heights[getIndex(i, j)];
      if (h <= 4) continue;

      // Natural jagged snowline elevation (104 to 122 blocks)
      const snowLine = 104 + Math.sin(x * 0.06) * 10 + Math.cos(z * 0.045) * 8;
      const isSnow = h >= snowLine;
      const isStone = h >= 36 && !isSnow;

      const topP = isSnow ? snowPos : isStone ? stonePos : grassPos;
      const topN = isSnow ? snowNorm : isStone ? stoneNorm : grassNorm;
      const topU = isSnow ? snowUv : isStone ? stoneUv : grassUv;

      // 1. TOP HORIZONTAL VOXEL FACE (y = h, Normal: 0, 1, 0)
      const u0 = x * 0.25, u1 = (x + stepX) * 0.25;
      const v0 = z * 0.25, v1 = (z + stepZ) * 0.25;
      pushQuad(
        topP, topN, topU,
        [x, h, z],
        [x, h, z + stepZ],
        [x + stepX, h, z + stepZ],
        [x + stepX, h, z],
        [0, 1, 0],
        [u0, v0], [u0, v1], [u1, v1], [u1, v0]
      );

      // 2. SOUTH VERTICAL FACE (z + stepZ, Normal: 0, 0, 1)
      const hs = heights[getIndex(i, j + 1)];
      if (h > hs) {
        const wallIsSnow = hs >= snowLine - 4;
        const wallIsStone = hs >= 20 && !wallIsSnow;
        const wp = wallIsSnow ? snowPos : wallIsStone ? stonePos : dirtPos;
        const wn = wallIsSnow ? snowNorm : wallIsStone ? stoneNorm : dirtNorm;
        const wu = wallIsSnow ? snowUv : wallIsStone ? stoneUv : dirtUv;
        const vu0 = hs * 0.25, vu1 = h * 0.25;
        pushQuad(
          wp, wn, wu,
          [x, hs, z + stepZ],
          [x + stepX, hs, z + stepZ],
          [x + stepX, h, z + stepZ],
          [x, h, z + stepZ],
          [0, 0, 1],
          [u0, vu0], [u1, vu0], [u1, vu1], [u0, vu1]
        );
      }

      // 3. NORTH VERTICAL FACE (z, Normal: 0, 0, -1)
      const hn = j > 0 ? heights[getIndex(i, j - 1)] : 0;
      if (h > hn) {
        const wallIsSnow = hn >= snowLine - 4;
        const wallIsStone = hn >= 20 && !wallIsSnow;
        const wp = wallIsSnow ? snowPos : wallIsStone ? stonePos : dirtPos;
        const wn = wallIsSnow ? snowNorm : wallIsStone ? stoneNorm : dirtNorm;
        const wu = wallIsSnow ? snowUv : wallIsStone ? stoneUv : dirtUv;
        const vu0 = hn * 0.25, vu1 = h * 0.25;
        pushQuad(
          wp, wn, wu,
          [x + stepX, hn, z],
          [x, hn, z],
          [x, h, z],
          [x + stepX, h, z],
          [0, 0, -1],
          [u1, vu0], [u0, vu0], [u0, vu1], [u1, vu1]
        );
      }

      // 4. EAST VERTICAL FACE (x + stepX, Normal: 1, 0, 0)
      const he = heights[getIndex(i + 1, j)];
      if (h > he) {
        const wallIsSnow = he >= snowLine - 4;
        const wallIsStone = he >= 20 && !wallIsSnow;
        const wp = wallIsSnow ? snowPos : wallIsStone ? stonePos : dirtPos;
        const wn = wallIsSnow ? snowNorm : wallIsStone ? stoneNorm : dirtNorm;
        const wu = wallIsSnow ? snowUv : wallIsStone ? stoneUv : dirtUv;
        const vu0 = he * 0.25, vu1 = h * 0.25;
        pushQuad(
          wp, wn, wu,
          [x + stepX, he, z + stepZ],
          [x + stepX, he, z],
          [x + stepX, h, z],
          [x + stepX, h, z + stepZ],
          [1, 0, 0],
          [v1, vu0], [v0, vu0], [v0, vu1], [v1, vu1]
        );
      }

      // 5. WEST VERTICAL FACE (x, Normal: -1, 0, 0)
      const hw = i > 0 ? heights[getIndex(i - 1, j)] : 0;
      if (h > hw) {
        const wallIsSnow = hw >= snowLine - 4;
        const wallIsStone = hw >= 20 && !wallIsSnow;
        const wp = wallIsSnow ? snowPos : wallIsStone ? stonePos : dirtPos;
        const wn = wallIsSnow ? snowNorm : wallIsStone ? stoneNorm : dirtNorm;
        const wu = wallIsSnow ? snowUv : wallIsStone ? stoneUv : dirtUv;
        const vu0 = hw * 0.25, vu1 = h * 0.25;
        pushQuad(
          wp, wn, wu,
          [x, hw, z],
          [x, hw, z + stepZ],
          [x, h, z + stepZ],
          [x, h, z],
          [-1, 0, 0],
          [v0, vu0], [v1, vu0], [v1, vu1], [v0, vu1]
        );
      }
    }
  }

  // Create textured BufferGeometry meshes
  const makeMesh = (positions, normals, uvs, material) => {
    if (positions.length === 0) return null;
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
    geom.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(normals), 3));
    geom.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uvs), 2));
    const mesh = new THREE.Mesh(geom, material);
    mesh.receiveShadow = true;
    mesh.castShadow = true;
    scene.add(mesh);
    return mesh;
  };

  const snowMat = new THREE.MeshStandardMaterial({
    map: snowTex,
    roughness: 0.88,
    metalness: 0.05
  });
  const stoneMat = new THREE.MeshStandardMaterial({
    map: stoneTex,
    roughness: 0.92,
    metalness: 0.05
  });
  const grassMat = new THREE.MeshStandardMaterial({
    map: grassTopTex,
    roughness: 0.90
  });
  const dirtMat = new THREE.MeshStandardMaterial({
    map: dirtTex,
    roughness: 0.95
  });

  makeMesh(snowPos, snowNorm, snowUv, snowMat);
  makeMesh(stonePos, stoneNorm, stoneUv, stoneMat);
  makeMesh(grassPos, grassNorm, grassUv, grassMat);
  makeMesh(dirtPos, dirtNorm, dirtUv, dirtMat);

  // Distant Spruce Trees on Foothills (Authentic Minecraft Blocky Spruce Trees - NO Cones!)
  const spruceLeavesMat = new THREE.MeshStandardMaterial({
    map: spruceLeavesTex,
    roughness: 0.70,
    transparent: true,
    alphaTest: 0.35,
    side: THREE.DoubleSide
  });

  const trunkMatrices = [];
  const leavesMatrices = [];
  const dummy = new THREE.Object3D();

  for (let i = 0; i < nx - 1; i += 2) {
    const x = minX + i * stepX;
    for (let j = 0; j < nz - 1; j += 2) {
      const z = minZ + j * stepZ;
      const h = heights[getIndex(i, j)];
      // Foothills between elevation 14 and 72
      if (h >= 14 && h <= 72 && (i * 11 + j * 17) % 5 === 0) {
        const treeH = 5 + ((i + j) % 3);
        // Trunk blocks
        for (let ty = 0; ty < treeH; ty++) {
          dummy.position.set(x + 2, h + ty + 0.5, z + 2);
          dummy.scale.set(1, 1, 1);
          dummy.updateMatrix();
          trunkMatrices.push(dummy.matrix.clone());
        }
        // Blocky tiered spruce foliage
        const topY = h + treeH;
        // Tip (1 block)
        dummy.position.set(x + 2, topY + 0.5, z + 2);
        dummy.updateMatrix();
        leavesMatrices.push(dummy.matrix.clone());

        // Tier 1 (3x3 cross)
        [[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(([dx, dz]) => {
          dummy.position.set(x + 2 + dx, topY - 0.5, z + 2 + dz);
          dummy.updateMatrix();
          leavesMatrices.push(dummy.matrix.clone());
        });

        // Tier 2 (5x5 cross)
        for (let dx = -2; dx <= 2; dx++) {
          for (let dz = -2; dz <= 2; dz++) {
            if (Math.abs(dx) === 2 && Math.abs(dz) === 2) continue;
            dummy.position.set(x + 2 + dx, topY - 2.5, z + 2 + dz);
            dummy.updateMatrix();
            leavesMatrices.push(dummy.matrix.clone());
          }
        }
      }
    }
  }

  if (trunkMatrices.length > 0) {
    const trunkMesh = new THREE.InstancedMesh(boxGeom, logBlockMaterials, trunkMatrices.length);
    trunkMesh.castShadow = true;
    trunkMesh.receiveShadow = true;
    trunkMatrices.forEach((m, idx) => trunkMesh.setMatrixAt(idx, m));
    trunkMesh.instanceMatrix.needsUpdate = true;
    scene.add(trunkMesh);
  }

  if (leavesMatrices.length > 0) {
    const leavesMesh = new THREE.InstancedMesh(boxGeom, spruceLeavesMat, leavesMatrices.length);
    leavesMesh.castShadow = true;
    leavesMesh.receiveShadow = true;
    leavesMatrices.forEach((m, idx) => leavesMesh.setMatrixAt(idx, m));
    leavesMesh.instanceMatrix.needsUpdate = true;
    scene.add(leavesMesh);
  }
}

// ============================================================================
// 4. MAIN MINECRAFT SHADER WORLD COMPONENT
// ============================================================================

export default function MinecraftVoxelWorld({
  darknessActive = false,
  nauseaActive = false,
  heartStatus = 'normal',
  timeOfDay = 'day',
  weather = 'clear',
  activeItem = null,
  isConsuming = false
}) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const fogRef = useRef(null);
  const hemiLightRef = useRef(null);
  const dirLightRef = useRef(null);
  const sunMeshRef = useRef(null);
  const moonMeshRef = useRef(null);
  const cloudsGroupRef = useRef(null);
  const rainSystemRef = useRef(null);
  const starsRef = useRef(null);
  const blockOutlineRef = useRef(null);
  const interactiveMeshesRef = useRef([]);
  const torchEmbersRef = useRef([]);
  const waterfallTextureRef = useRef(null);
  const waterfallSplashRef = useRef(null);
  const lakeMatRef = useRef(null);

  // Viewmodel Layer Refs
  const viewmodelArmContainerRef = useRef(null);
  const armPivotRef = useRef(null);
  const handAnchorRef = useRef(null);
  const heldItemPivotRef = useRef(null);
  const heldItemGroupRef = useRef(null);
  const heldItemRendererRef = useRef(null);
  const itemSwappedRef = useRef(false);

  const activeItemRef = useRef(activeItem);
  activeItemRef.current = activeItem;

  const isConsumingRef = useRef(isConsuming);
  isConsumingRef.current = isConsuming;

  const nauseaActiveRef = useRef(nauseaActive);
  nauseaActiveRef.current = nauseaActive;

  const prevItemIdRef = useRef(activeItem?.id);
  const switchProgressRef = useRef(1.0);

  useEffect(() => {
    if (activeItem?.id !== prevItemIdRef.current) {
      prevItemIdRef.current = activeItem?.id;
      switchProgressRef.current = 0.0;
      itemSwappedRef.current = false;
    }
  }, [activeItem]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // ------------------------------------------------------------------------
    // A. World Scene & Perspective Camera (FOV: 72)
    // ------------------------------------------------------------------------
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Spawn camera position: open lake view with tree on left, cliff on right, mountains ahead!
    const camera = new THREE.PerspectiveCamera(72, window.innerWidth / window.innerHeight, 0.1, 1500);
    camera.position.set(-6, 5.2, 12);
    cameraRef.current = camera;

    // Atmospheric Horizon Fog (gentle distance haze, keeps mountains clearly visible with 75-90% clarity)
    const defaultFogColor = new THREE.Color(0x82a9db);
    const fog = new THREE.Fog(defaultFogColor, 120, 950);
    scene.fog = fog;
    fogRef.current = fog;
    scene.background = defaultFogColor;

    // ------------------------------------------------------------------------
    // B. Dedicated Viewmodel Scene & Camera (FOV: 56, Depth Isolated)
    // ------------------------------------------------------------------------
    const viewmodelScene = new THREE.Scene();
    const viewmodelCamera = new THREE.PerspectiveCamera(56, window.innerWidth / window.innerHeight, 0.01, 10);
    viewmodelCamera.position.set(0, 0, 0);

    const vmHemi = new THREE.HemisphereLight(0xb4d4ff, 0x5a7048, 1.25);
    viewmodelScene.add(vmHemi);
    const vmDir = new THREE.DirectionalLight(0xfff5e0, 1.35);
    vmDir.position.set(-1.8, 2.8, 1.8);
    viewmodelScene.add(vmDir);

    // ------------------------------------------------------------------------
    // C. WebGL Renderer with ACES Filmic Tone Mapping & PCF Soft Shadows
    // ------------------------------------------------------------------------
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.10;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.autoClear = false;
    container.appendChild(renderer.domElement);

    // ------------------------------------------------------------------------
    // D. World Lighting: High Skylight Bounce (Zero Pitch-Black Shadows!)
    // ------------------------------------------------------------------------
    // Boosted hemisphere light ensures dark sides of blocks retain rich texture detail
    const hemiLight = new THREE.HemisphereLight(0x94beff, 0x5a7348, 1.35);
    scene.add(hemiLight);
    hemiLightRef.current = hemiLight;

    // Diagonal morning sunlight from upper-left (Sun: [-70, 85, -60])
    const sunLight = new THREE.DirectionalLight(0xfff3db, 1.95);
    sunLight.position.set(-70, 85, -60);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 320;
    sunLight.shadow.camera.left = -65;
    sunLight.shadow.camera.right = 65;
    sunLight.shadow.camera.top = 65;
    sunLight.shadow.camera.bottom = -65;
    sunLight.shadow.bias = -0.0004;
    scene.add(sunLight);
    dirLightRef.current = sunLight;

    // Square Sun with golden halo in upper-left
    const sunGeom = new THREE.PlaneGeometry(24, 24);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xfffaea, fog: false, side: THREE.DoubleSide });
    const sunMesh = new THREE.Mesh(sunGeom, sunMat);
    sunMesh.position.set(-150, 180, -130);
    sunMesh.lookAt(camera.position);
    scene.add(sunMesh);
    sunMeshRef.current = sunMesh;

    // Square Moon
    const moonGeom = new THREE.PlaneGeometry(18, 18);
    const moonMat = new THREE.MeshBasicMaterial({ color: 0xd8e6ff, fog: false, side: THREE.DoubleSide });
    const moonMesh = new THREE.Mesh(moonGeom, moonMat);
    moonMesh.position.set(130, 120, 90);
    moonMesh.lookAt(camera.position);
    moonMesh.visible = false;
    scene.add(moonMesh);
    moonMeshRef.current = moonMesh;

    // Starfield for night
    const starCount = 350;
    const starGeom = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    for (let s = 0; s < starCount * 3; s += 3) {
      starPos[s] = (Math.random() - 0.5) * 500;
      starPos[s + 1] = Math.random() * 200 + 40;
      starPos[s + 2] = (Math.random() - 0.5) * 500;
    }
    starGeom.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.9, transparent: true, opacity: 0.0, fog: false });
    const stars = new THREE.Points(starGeom, starMat);
    scene.add(stars);
    starsRef.current = stars;

    // ------------------------------------------------------------------------
    // E. Minecraft Block Materials & Textures
    // ------------------------------------------------------------------------
    const grassTopTex = createGrassTopTexture();
    const grassSideTex = createGrassSideTexture();
    const dirtTex = createDirtTexture();
    const stoneTex = createStoneTexture();
    const snowTex = createSnowTexture();
    const spruceLeavesTex = createSpruceLeavesTexture();
    const sandTex = createSandTexture();
    const barkTex = createBarkTexture();
    const logTopTex = createLogTopTexture();
    const leavesTex = createLeavesTexture();

    // Enable repeating on block textures
    [grassTopTex, grassSideTex, dirtTex, stoneTex, snowTex, sandTex, barkTex, logTopTex].forEach((tex) => {
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
    });

    const grassTopMat = new THREE.MeshStandardMaterial({ map: grassTopTex, roughness: 0.90 });
    const grassSideMat = new THREE.MeshStandardMaterial({ map: grassSideTex, roughness: 0.90 });
    const dirtMat = new THREE.MeshStandardMaterial({ map: dirtTex, roughness: 0.95 });
    const stoneMat = new THREE.MeshStandardMaterial({ map: stoneTex, roughness: 0.92, metalness: 0.05 });
    const sandMat = new THREE.MeshStandardMaterial({ map: sandTex, roughness: 0.92 });
    const barkMat = new THREE.MeshStandardMaterial({ map: barkTex, roughness: 0.85 });
    const logTopMat = new THREE.MeshStandardMaterial({ map: logTopTex, roughness: 0.85 });
    const leavesMat = new THREE.MeshStandardMaterial({
      map: leavesTex,
      roughness: 0.65,
      transparent: true,
      alphaTest: 0.35,
      side: THREE.DoubleSide
    });

    const grassBlockMaterials = [grassSideMat, grassSideMat, grassTopMat, dirtMat, grassSideMat, grassSideMat];
    const logBlockMaterials = [barkMat, barkMat, logTopMat, logTopMat, barkMat, barkMat];

    const boxGeom = new THREE.BoxGeometry(1, 1, 1);
    const dummy = new THREE.Object3D();

    // ------------------------------------------------------------------------
    // F. ZONE A: FOREGROUND SHORELINE & OPEN LAKE ENTRANCE
    // ------------------------------------------------------------------------
    // Carve open terrain in front of the player (X: -6 to 6, Z: 4 to 12) so the lake is fully visible!
    const grassPositions = [];
    const sandPositions = [];
    const stonePositions = [];

    for (let x = -28; x <= 0; x++) {
      for (let z = -12; z <= 22; z++) {
        const distToWater = x - (-4 + Math.sin(z * 0.18) * 1.8);
        if (distToWater > 1.2) {
          sandPositions.push({ x, y: 1, z }); // submerged
        } else if (distToWater > 0.0) {
          sandPositions.push({ x, y: 2, z }); // shoreline sand
        } else {
          const hill = Math.floor(Math.sin(x * 0.22) * 1.2 + Math.cos(z * 0.16) * 1.0);
          const height = Math.max(3, 4 + hill);
          grassPositions.push({ x, y: height, z });
          stonePositions.push({ x, y: height - 1, z });
        }
      }
    }

    const grassMesh = new THREE.InstancedMesh(boxGeom, grassBlockMaterials, grassPositions.length);
    grassMesh.receiveShadow = true;
    grassMesh.castShadow = true;
    grassPositions.forEach((b, i) => {
      dummy.position.set(b.x, b.y, b.z);
      dummy.updateMatrix();
      grassMesh.setMatrixAt(i, dummy.matrix);
    });
    grassMesh.instanceMatrix.needsUpdate = true;
    scene.add(grassMesh);

    const sandMesh = new THREE.InstancedMesh(boxGeom, sandMat, sandPositions.length);
    sandMesh.receiveShadow = true;
    sandMesh.castShadow = true;
    sandPositions.forEach((b, i) => {
      dummy.position.set(b.x, b.y, b.z);
      dummy.updateMatrix();
      sandMesh.setMatrixAt(i, dummy.matrix);
    });
    sandMesh.instanceMatrix.needsUpdate = true;
    scene.add(sandMesh);

    interactiveMeshesRef.current = [grassMesh, sandMesh];

    // ------------------------------------------------------------------------
    // G. FOREGROUND VEGETATION: FLOWERS & GRASS BLADES
    // ------------------------------------------------------------------------
    const plantGeom = new THREE.PlaneGeometry(0.8, 0.8);
    const poppyTex = createFlowerTexture(true);
    const dandelionTex = createFlowerTexture(false);
    const tuftTex = createGrassTuftTexture();

    const poppyMat = new THREE.MeshStandardMaterial({ map: poppyTex, transparent: true, alphaTest: 0.35, side: THREE.DoubleSide });
    const dandelionMat = new THREE.MeshStandardMaterial({ map: dandelionTex, transparent: true, alphaTest: 0.35, side: THREE.DoubleSide });
    const tuftMat = new THREE.MeshStandardMaterial({ map: tuftTex, transparent: true, alphaTest: 0.35, side: THREE.DoubleSide });

    const spawnVeg = (texMat, count, seedMod) => {
      const inst = new THREE.InstancedMesh(plantGeom, texMat, count);
      let s = 0;
      for (let i = 0; i < grassPositions.length && s < count; i++) {
        const gp = grassPositions[i];
        if ((gp.x * 11 + gp.z * 17 + seedMod) % 7 === 0) {
          dummy.position.set(gp.x + 0.5, gp.y + 0.85, gp.z + 0.5);
          dummy.rotation.y = (s * 1.2);
          dummy.updateMatrix();
          inst.setMatrixAt(s++, dummy.matrix);
        }
      }
      inst.instanceMatrix.needsUpdate = true;
      scene.add(inst);
    };

    spawnVeg(poppyMat, 18, 2);
    spawnVeg(dandelionMat, 18, 5);
    spawnVeg(tuftMat, 35, 1);

    // ------------------------------------------------------------------------
    // H. ZONE B: RIGHT FORESTED CLIFF & CASCADING WATERFALL
    // ------------------------------------------------------------------------
    const cliffStonePositions = [];
    const cliffGrassPositions = [];

    for (let x = 14; x <= 36; x++) {
      for (let z = -70; z <= 12; z++) {
        const edgeDist = x - 14;
        const cliffHeight = Math.floor(3 + edgeDist * 1.15 + Math.sin(z * 0.15) * 2.5);
        for (let y = 2; y <= cliffHeight; y++) {
          if (y === cliffHeight) {
            cliffGrassPositions.push({ x, y, z });
          } else if (y >= 2) {
            cliffStonePositions.push({ x, y, z });
          }
        }
      }
    }

    const cliffStoneMesh = new THREE.InstancedMesh(boxGeom, stoneMat, cliffStonePositions.length);
    cliffStoneMesh.receiveShadow = true;
    cliffStoneMesh.castShadow = true;
    cliffStonePositions.forEach((b, i) => {
      dummy.position.set(b.x, b.y, b.z);
      dummy.updateMatrix();
      cliffStoneMesh.setMatrixAt(i, dummy.matrix);
    });
    cliffStoneMesh.instanceMatrix.needsUpdate = true;
    scene.add(cliffStoneMesh);

    const cliffGrassMesh = new THREE.InstancedMesh(boxGeom, grassBlockMaterials, cliffGrassPositions.length);
    cliffGrassMesh.receiveShadow = true;
    cliffGrassMesh.castShadow = true;
    cliffGrassPositions.forEach((b, i) => {
      dummy.position.set(b.x, b.y, b.z);
      dummy.updateMatrix();
      cliffGrassMesh.setMatrixAt(i, dummy.matrix);
    });
    cliffGrassMesh.instanceMatrix.needsUpdate = true;
    scene.add(cliffGrassMesh);

    // ------------------------------------------------------------------------
    // H2. STEPPED MINECRAFT WATERFALL (Cliff Blocks Cascade)
    // ------------------------------------------------------------------------
    const waterfallTex = createWaterfallTexture();
    waterfallTex.wrapS = THREE.RepeatWrapping;
    waterfallTex.wrapT = THREE.RepeatWrapping;
    waterfallTex.repeat.set(1, 3);
    waterfallTextureRef.current = waterfallTex;

    // Use MeshStandardMaterial - reacts naturally to scene lighting, zero glowing cyan!
    const waterfallMat = new THREE.MeshStandardMaterial({
      map: waterfallTex,
      roughness: 0.15,
      metalness: 0.05,
      transparent: true,
      opacity: 0.82,
      side: THREE.DoubleSide
    });

    const waterfallGroup = new THREE.Group();

    // Source pool ledge at Y = 19 on cliff
    const poolGeom = new THREE.PlaneGeometry(1.8, 2.0);
    const poolMesh = new THREE.Mesh(poolGeom, waterfallMat);
    poolMesh.rotation.x = -Math.PI / 2;
    poolMesh.position.set(19.0, 19.05, -24.0);
    waterfallGroup.add(poolMesh);

    // Step 1: Upper Vertical Cascade (Drop from Y = 19 to Y = 13.5)
    const drop1Geom = new THREE.PlaneGeometry(1.8, 5.5);
    const drop1Mesh = new THREE.Mesh(drop1Geom, waterfallMat);
    drop1Mesh.rotation.y = -Math.PI / 2;
    drop1Mesh.position.set(18.05, 16.25, -24.0);
    waterfallGroup.add(drop1Mesh);

    // Shelf 1: Middle Basin Ledge (Horizontal flow at Y = 13.5)
    const shelf1Geom = new THREE.PlaneGeometry(1.8, 2.0);
    const shelf1Mesh = new THREE.Mesh(shelf1Geom, waterfallMat);
    shelf1Mesh.rotation.x = -Math.PI / 2;
    shelf1Mesh.position.set(17.1, 13.55, -24.0);
    waterfallGroup.add(shelf1Mesh);

    // Step 2: Middle Vertical Cascade (Drop from Y = 13.5 to Y = 7.5)
    const drop2Geom = new THREE.PlaneGeometry(1.8, 6.0);
    const drop2Mesh = new THREE.Mesh(drop2Geom, waterfallMat);
    drop2Mesh.rotation.y = -Math.PI / 2;
    drop2Mesh.position.set(16.15, 10.5, -24.0);
    waterfallGroup.add(drop2Mesh);

    // Shelf 2: Lower Basin Shelf (Horizontal flow at Y = 7.5)
    const shelf2Geom = new THREE.PlaneGeometry(1.8, 1.6);
    const shelf2Mesh = new THREE.Mesh(shelf2Geom, waterfallMat);
    shelf2Mesh.rotation.x = -Math.PI / 2;
    shelf2Mesh.position.set(15.35, 7.55, -24.0);
    waterfallGroup.add(shelf2Mesh);

    // Step 3: Lower Vertical Cascade into Lake (Drop from Y = 7.5 to Y = 2.4)
    const drop3Geom = new THREE.PlaneGeometry(1.8, 5.1);
    const drop3Mesh = new THREE.Mesh(drop3Geom, waterfallMat);
    drop3Mesh.rotation.y = -Math.PI / 2;
    drop3Mesh.position.set(14.55, 4.95, -24.0);
    waterfallGroup.add(drop3Mesh);

    scene.add(waterfallGroup);

    // Waterfall Splash Basin Mist (Soft non-emissive spray at lake impact)
    const splashCount = 35;
    const splashGeom = new THREE.BufferGeometry();
    const splashPos = new Float32Array(splashCount * 3);
    for (let sp = 0; sp < splashCount * 3; sp += 3) {
      splashPos[sp] = 14.55 + (Math.random() - 0.5) * 1.8;
      splashPos[sp + 1] = 2.4 + Math.random() * 1.4;
      splashPos[sp + 2] = -24.0 + (Math.random() - 0.5) * 1.8;
    }
    splashGeom.setAttribute('position', new THREE.BufferAttribute(splashPos, 3));
    const splashMat = new THREE.PointsMaterial({
      color: 0xe0f2fe,
      size: 0.35,
      transparent: true,
      opacity: 0.60
    });
    const splashSystem = new THREE.Points(splashGeom, splashMat);
    scene.add(splashSystem);
    waterfallSplashRef.current = splashSystem;

    // Cozy cave glow on cliff
    const caveLight = new THREE.PointLight(0xffaa33, 2.2, 14);
    caveLight.position.set(24, 14, -34);
    scene.add(caveLight);

    // ------------------------------------------------------------------------
    // I. FOREGROUND OAK TREE & CLIFF SPRUCE FORESTS
    // ------------------------------------------------------------------------
    const trunkMatrices = [];
    const leafMatrices = [];

    const makeOakTree = (baseX, baseY, baseZ, trunkHeight, leafRadius) => {
      for (let ty = 0; ty < trunkHeight; ty++) {
        dummy.position.set(baseX, baseY + ty, baseZ);
        dummy.updateMatrix();
        trunkMatrices.push(dummy.matrix.clone());
      }
      const leafCenterY = baseY + trunkHeight;
      for (let ly = -2; ly <= 2; ly++) {
        const rad = ly === 2 ? 1 : ly === -2 ? leafRadius - 1 : leafRadius;
        for (let lx = -rad; lx <= rad; lx++) {
          for (let lz = -rad; lz <= rad; lz++) {
            if (rad >= 2 && Math.abs(lx) === rad && Math.abs(lz) === rad) continue;
            dummy.position.set(baseX + lx, leafCenterY + ly, baseZ + lz);
            dummy.updateMatrix();
            leafMatrices.push(dummy.matrix.clone());
          }
        }
      }
    };

    // Large Left Foreground Tree (Sunlight flaring through leaves!)
    makeOakTree(-14, 5, 4, 8, 3);
    makeOakTree(-20, 5, -6, 6, 2);
    makeOakTree(-12, 4, -14, 5, 2);
    makeOakTree(-17, 6, 14, 6, 2);

    // Right Cliff Spruce Trees
    const makeSpruceTree = (baseX, baseY, baseZ, height) => {
      for (let ty = 0; ty < height; ty++) {
        dummy.position.set(baseX, baseY + ty, baseZ);
        dummy.updateMatrix();
        trunkMatrices.push(dummy.matrix.clone());
      }
      const topY = baseY + height;
      for (let ly = -4; ly <= 1; ly++) {
        const rad = ly === 1 ? 0 : ly >= -1 ? 1 : 2;
        for (let lx = -rad; lx <= rad; lx++) {
          for (let lz = -rad; lz <= rad; lz++) {
            dummy.position.set(baseX + lx, topY + ly, baseZ + lz);
            dummy.updateMatrix();
            leafMatrices.push(dummy.matrix.clone());
          }
        }
      }
    };

    makeSpruceTree(18, 12, -10, 6);
    makeSpruceTree(23, 17, -26, 7);
    makeSpruceTree(20, 14, -42, 6);
    makeSpruceTree(26, 20, -55, 8);
    makeSpruceTree(17, 9, 2, 5);

    const trunkMesh = new THREE.InstancedMesh(boxGeom, logBlockMaterials, trunkMatrices.length);
    trunkMesh.castShadow = true;
    trunkMesh.receiveShadow = true;
    trunkMatrices.forEach((m, idx) => trunkMesh.setMatrixAt(idx, m));
    trunkMesh.instanceMatrix.needsUpdate = true;
    scene.add(trunkMesh);

    const leavesMesh = new THREE.InstancedMesh(boxGeom, leavesMat, leafMatrices.length);
    leavesMesh.castShadow = true;
    leavesMesh.receiveShadow = true;
    leafMatrices.forEach((m, idx) => leavesMesh.setMatrixAt(idx, m));
    leavesMesh.instanceMatrix.needsUpdate = true;
    scene.add(leavesMesh);

    // ------------------------------------------------------------------------
    // J. ZONE C: CONTINUOUS SOLID VOXEL MOUNTAIN RANGE (Authentic Minecraft Shaders)
    // ------------------------------------------------------------------------
    generateSolidVoxelMountainRange(scene, {
      snowTex,
      stoneTex,
      dirtTex,
      grassTopTex,
      grassSideTex,
      logBlockMaterials,
      spruceLeavesTex,
      boxGeom
    });

    // ------------------------------------------------------------------------
    // L. WIDE REFLECTIVE LAKE (Fresnel Shaded Procedural Water)
    // ------------------------------------------------------------------------
    const lakeGeom = new THREE.PlaneGeometry(280, 240, 64, 64);
    const lakeMat = createMinecraftWaterMaterial();
    lakeMatRef.current = lakeMat;
    const lakeMesh = new THREE.Mesh(lakeGeom, lakeMat);
    lakeMesh.rotation.x = -Math.PI / 2;
    lakeMesh.position.set(0, 2.38, -45);
    scene.add(lakeMesh);

    // ------------------------------------------------------------------------
    // L2. OPPOSITE SHORELINE & DENSE SPRUCE FOREST (Midground Layer)
    // ------------------------------------------------------------------------
    const oppSandPos = [];
    const oppGrassPos = [];
    const oppTrunkMatrices = [];
    const oppLeavesMatrices = [];

    // Opposite shore bank from z = -86 to -136, spanning x: -140 to 140
    for (let x = -140; x <= 140; x += 4) {
      for (let z = -86; z >= -136; z -= 4) {
        const shoreDist = Math.abs(z - (-86));
        const bankNoise = Math.sin(x * 0.08) * 1.5 + Math.cos(z * 0.1) * 1.2;
        const bankH = Math.floor(2.0 + (shoreDist / 50.0) * 16.0 + bankNoise);

        if (shoreDist < 8) {
          oppSandPos.push({ x, y: 2, z });
        } else {
          oppGrassPos.push({ x, y: bankH, z });
        }
      }
    }

    const oppSandMesh = new THREE.InstancedMesh(boxGeom, sandMat, oppSandPos.length);
    oppSandMesh.receiveShadow = true;
    oppSandMesh.castShadow = true;
    oppSandPos.forEach((b, i) => {
      dummy.position.set(b.x, b.y, b.z);
      dummy.scale.set(4, 1, 4);
      dummy.updateMatrix();
      oppSandMesh.setMatrixAt(i, dummy.matrix);
    });
    oppSandMesh.instanceMatrix.needsUpdate = true;
    scene.add(oppSandMesh);

    const oppGrassMesh = new THREE.InstancedMesh(boxGeom, grassBlockMaterials, oppGrassPos.length);
    oppGrassMesh.receiveShadow = true;
    oppGrassMesh.castShadow = true;
    oppGrassPos.forEach((b, i) => {
      dummy.position.set(b.x, b.y, b.z);
      dummy.scale.set(4, 1, 4);
      dummy.updateMatrix();
      oppGrassMesh.setMatrixAt(i, dummy.matrix);
    });
    oppGrassMesh.instanceMatrix.needsUpdate = true;
    scene.add(oppGrassMesh);

    // Dense Blocky Spruce Trees across Opposite Bank
    const oppSpruceLeavesMat = new THREE.MeshStandardMaterial({
      map: spruceLeavesTex,
      roughness: 0.70,
      transparent: true,
      alphaTest: 0.35,
      side: THREE.DoubleSide
    });

    for (let i = 0; i < oppGrassPos.length; i += 2) {
      const gp = oppGrassPos[i];
      if ((gp.x * 7 + gp.z * 13) % 3 === 0) {
        const treeH = 6 + (Math.abs(gp.x + gp.z) % 6);
        // Trunk
        for (let ty = 0; ty < treeH; ty++) {
          dummy.position.set(gp.x, gp.y + ty + 0.5, gp.z);
          dummy.scale.set(1, 1, 1);
          dummy.updateMatrix();
          oppTrunkMatrices.push(dummy.matrix.clone());
        }
        // Stepped block foliage
        const topY = gp.y + treeH;
        dummy.position.set(gp.x, topY + 0.5, gp.z);
        dummy.updateMatrix();
        oppLeavesMatrices.push(dummy.matrix.clone());

        [[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(([dx, dz]) => {
          dummy.position.set(gp.x + dx, topY - 0.5, gp.z + dz);
          dummy.updateMatrix();
          oppLeavesMatrices.push(dummy.matrix.clone());
        });

        for (let dx = -2; dx <= 2; dx++) {
          for (let dz = -2; dz <= 2; dz++) {
            if (Math.abs(dx) === 2 && Math.abs(dz) === 2) continue;
            dummy.position.set(gp.x + dx, topY - 2.5, gp.z + dz);
            dummy.updateMatrix();
            oppLeavesMatrices.push(dummy.matrix.clone());
          }
        }
      }
    }

    if (oppTrunkMatrices.length > 0) {
      const oppTrunkMesh = new THREE.InstancedMesh(boxGeom, logBlockMaterials, oppTrunkMatrices.length);
      oppTrunkMesh.castShadow = true;
      oppTrunkMesh.receiveShadow = true;
      oppTrunkMatrices.forEach((m, idx) => oppTrunkMesh.setMatrixAt(idx, m));
      oppTrunkMesh.instanceMatrix.needsUpdate = true;
      scene.add(oppTrunkMesh);
    }

    if (oppLeavesMatrices.length > 0) {
      const oppLeavesMesh = new THREE.InstancedMesh(boxGeom, oppSpruceLeavesMat, oppLeavesMatrices.length);
      oppLeavesMesh.castShadow = true;
      oppLeavesMesh.receiveShadow = true;
      oppLeavesMatrices.forEach((m, idx) => oppLeavesMesh.setMatrixAt(idx, m));
      oppLeavesMesh.instanceMatrix.needsUpdate = true;
      scene.add(oppLeavesMesh);
    }

    // ------------------------------------------------------------------------
    // M. 3D TORCHES ON FOREGROUND SHORELINE
    // ------------------------------------------------------------------------
    const torchWoodMat = new THREE.MeshStandardMaterial({ map: barkTex, roughness: 0.9 });
    const torchFlameMat = new THREE.MeshBasicMaterial({ color: 0xffaa00 });
    const torchLocations = [
      { x: -9, y: 5.2, z: 2 },
      { x: -6, y: 4.8, z: 9 },
      { x: -4, y: 4.2, z: -4 }
    ];
    const torchLights = [];

    torchLocations.forEach((t) => {
      const torch = new THREE.Group();
      const stick = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.65, 0.12), torchWoodMat);
      stick.position.y = 0.32;
      torch.add(stick);

      const flame = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.16, 0.16), torchFlameMat);
      flame.position.y = 0.68;
      torch.add(flame);

      torch.position.set(t.x, t.y, t.z);
      scene.add(torch);

      const tLight = new THREE.PointLight(0xff9426, 1.9, 14);
      tLight.position.set(t.x, t.y + 0.85, t.z);
      scene.add(tLight);
      torchLights.push(tLight);
    });

    // Rising Torch Embers
    const emberCount = 30;
    const emberGeom = new THREE.BufferGeometry();
    const emberPos = new Float32Array(emberCount * 3);
    for (let ep = 0; ep < emberCount * 3; ep += 3) {
      const tl = torchLocations[Math.floor(Math.random() * torchLocations.length)];
      emberPos[ep] = tl.x + (Math.random() - 0.5) * 0.2;
      emberPos[ep + 1] = tl.y + 0.7 + Math.random() * 1.2;
      emberPos[ep + 2] = tl.z + (Math.random() - 0.5) * 0.2;
    }
    emberGeom.setAttribute('position', new THREE.BufferAttribute(emberPos, 3));
    const emberMat = new THREE.PointsMaterial({ color: 0xff8800, size: 0.12, transparent: true, opacity: 0.85 });
    const emberSystem = new THREE.Points(emberGeom, emberMat);
    scene.add(emberSystem);
    torchEmbersRef.current = emberSystem;

    // ------------------------------------------------------------------------
    // N. BLOCKY MINECRAFT CLOUDS
    // ------------------------------------------------------------------------
    const cloudGeom = new THREE.BoxGeometry(16, 2.4, 18);
    const cloudMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.42, fog: false });
    const cloudsGroup = new THREE.Group();
    for (let c = 0; c < 24; c++) {
      const cloud = new THREE.Mesh(cloudGeom, cloudMat);
      cloud.position.set((Math.random() - 0.5) * 260, 56 + Math.random() * 6, (Math.random() - 0.5) * 260);
      cloud.scale.set(1 + Math.random() * 1.5, 1, 1 + Math.random() * 1.5);
      cloudsGroup.add(cloud);
    }
    scene.add(cloudsGroup);
    cloudsGroupRef.current = cloudsGroup;

    // Rain particles
    const rainCount = 550;
    const rainGeom = new THREE.BufferGeometry();
    const rainPositions = new Float32Array(rainCount * 3);
    for (let r = 0; r < rainCount * 3; r += 3) {
      rainPositions[r] = (Math.random() - 0.5) * 60;
      rainPositions[r + 1] = Math.random() * 26 + 2;
      rainPositions[r + 2] = (Math.random() - 0.5) * 60;
    }
    rainGeom.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));
    const rainMat = new THREE.PointsMaterial({ color: 0x9bc2e6, size: 0.18, transparent: true, opacity: 0.0 });
    const rainSystem = new THREE.Points(rainGeom, rainMat);
    scene.add(rainSystem);
    rainSystemRef.current = rainSystem;

    // Crosshair Block Selection Outline
    const wireframeGeom = new THREE.EdgesGeometry(new THREE.BoxGeometry(1.004, 1.004, 1.004));
    const wireframeMat = new THREE.LineBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.45 });
    const blockOutline = new THREE.LineSegments(wireframeGeom, wireframeMat);
    blockOutline.visible = false;
    scene.add(blockOutline);
    blockOutlineRef.current = blockOutline;

    // ------------------------------------------------------------------------
    // O. DEDICATED VIEWMODEL HIERARCHY:
    // FirstPersonViewModel -> ArmPivot -> PlayerArm -> HandAnchor -> HeldItemPivot -> HeldItem
    // ------------------------------------------------------------------------
    const steveArmTex = createSteveArmTexture();
    const armMat = new THREE.MeshStandardMaterial({ map: steveArmTex, roughness: 0.90 });

    // 1. Root FirstPersonViewModel
    const firstPersonViewModel = new THREE.Group();
    firstPersonViewModel.name = 'FirstPersonViewModel';
    viewmodelScene.add(firstPersonViewModel);

    // 2. ArmPivot: Base transform, walk bob, sway, idle breathing, switch offset, eating animation
    const armPivot = new THREE.Group();
    armPivot.name = 'ArmPivot';
    armPivot.scale.set(0.72, 0.72, 0.72);
    armPivot.position.set(0.38, -0.37, -0.52);
    armPivot.rotation.set(-0.40, -0.26, 0.22);
    firstPersonViewModel.add(armPivot);
    armPivotRef.current = armPivot;
    viewmodelArmContainerRef.current = armPivot;
    const armGroup = armPivot; // For animation loop reference

    // 3. PlayerArm: Holds Steve arm geometry meshes
    const playerArm = new THREE.Group();
    playerArm.name = 'PlayerArm';
    armPivot.add(playerArm);

    // Sleeve: Y in [0, 0.28], center at 0.14
    const sleeveGeom = new THREE.BoxGeometry(0.12, 0.28, 0.12);
    const sleeveMesh = new THREE.Mesh(sleeveGeom, armMat);
    sleeveMesh.position.set(0, 0.14, 0);
    playerArm.add(sleeveMesh);

    // Hand: Y in [-0.27, +0.03], center at -0.12
    const handGeom = new THREE.BoxGeometry(0.11, 0.30, 0.11);
    const handMesh = new THREE.Mesh(handGeom, armMat);
    handMesh.position.set(0, -0.12, 0);
    playerArm.add(handMesh);

    // Thumb: on inner side (-0.065), slightly forward (0.02)
    const thumbGeom = new THREE.BoxGeometry(0.04, 0.09, 0.04);
    const thumbMesh = new THREE.Mesh(thumbGeom, armMat);
    thumbMesh.position.set(-0.065, -0.10, 0.02);
    playerArm.add(thumbMesh);

    // 4. HandAnchor: Sibling of PlayerArm under ArmPivot at the visible distal hand
    // Positioned at local y = 0.26, x = -0.01, z = 0.04 (in front-upper hand region)
    const handAnchor = new THREE.Group();
    handAnchor.name = 'HandAnchor';
    handAnchor.position.set(-0.01, 0.26, 0.04);
    armPivot.add(handAnchor);
    handAnchorRef.current = handAnchor;

    // 5. HeldItemPivot: Dedicated pivot for first-person item grip transforms
    const heldItemPivot = new THREE.Group();
    heldItemPivot.name = 'HeldItemPivot';
    handAnchor.add(heldItemPivot);
    heldItemPivotRef.current = heldItemPivot;
    heldItemGroupRef.current = heldItemPivot; // Backward compatibility

    // 6. Developer Debug Visualization (Sections 4 & 5: green=HandAnchor, magenta=HeldItemPivot)
    const DEBUG_HELD_ITEM = false;
    if (DEBUG_HELD_ITEM) {
      const anchorMarker = new THREE.Mesh(
        new THREE.BoxGeometry(0.04, 0.04, 0.04),
        new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: false })
      );
      anchorMarker.name = 'DEBUG_MARKER';
      handAnchor.add(anchorMarker);

      const pivotMarker = new THREE.Mesh(
        new THREE.BoxGeometry(0.04, 0.04, 0.04),
        new THREE.MeshBasicMaterial({ color: 0xff00ff, wireframe: false })
      );
      pivotMarker.name = 'DEBUG_MARKER';
      heldItemPivot.add(pivotMarker);
    }

    // 7. Dedicated HeldItemRenderer
    const heldItemRenderer = new HeldItemRenderer(handAnchor, heldItemPivot);
    heldItemRendererRef.current = heldItemRenderer;

    // Initial item setup
    heldItemRenderer.update(activeItemRef.current);

    // ------------------------------------------------------------------------
    // P. Mouse Look & Movement Parallax
    // ------------------------------------------------------------------------
    let targetCameraX = -6;
    let targetCameraY = 5.2;
    let targetRotationY = 0;
    let targetRotationX = 0;
    let isSprinting = false;

    const handleMouseMove = (e) => {
      const normX = (e.clientX / window.innerWidth) * 2 - 1;
      const normY = -(e.clientY / window.innerHeight) * 2 + 1;
      targetRotationY = -normX * 0.38;
      targetRotationX = normY * 0.20;
      targetCameraX = -6 + normX * 1.5;
      targetCameraY = 5.2 + normY * 0.6;
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Shift') isSprinting = true;
    };
    const handleKeyUp = (e) => {
      if (e.key === 'Shift') isSprinting = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const raycaster = new THREE.Raycaster();
    const screenCenter = new THREE.Vector2(0, 0);

    // ------------------------------------------------------------------------
    // Q. 60 FPS Multi-Layer Render Loop (World -> ClearDepth -> Viewmodel)
    // ------------------------------------------------------------------------
    const startTime = performance.now();
    let animationFrameId;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = (performance.now() - startTime) * 0.001;

      // 1. Camera Look & Dynamic Sprint FOV
      camera.position.x += (targetCameraX - camera.position.x) * 0.08;
      camera.position.y += (targetCameraY - camera.position.y) * 0.08;
      camera.rotation.y += (targetRotationY - camera.rotation.y) * 0.08;
      camera.rotation.x += (targetRotationX - camera.rotation.x) * 0.08;

      const targetFOV = isSprinting ? 78 : 72;
      if (Math.abs(camera.fov - targetFOV) > 0.1) {
        camera.fov += (targetFOV - camera.fov) * 0.08;
        camera.updateProjectionMatrix();
      }

      // 2. Camera Head-Bob & Nausea Tilt
      const walkBob = Math.sin(elapsedTime * (isSprinting ? 6.5 : 4.0)) * 0.035;
      const lateralSway = Math.cos(elapsedTime * (isSprinting ? 3.25 : 2.0)) * 0.02;
      const nauseaRoll = nauseaActiveRef.current ? Math.sin(elapsedTime * 2.2) * 0.045 : 0;
      camera.position.y += walkBob * 0.12;
      camera.rotation.z = lateralSway * 0.01 + nauseaRoll;

      // 3. Viewmodel Item Switch (Smooth Lower & Raise: ~200ms)
      if (switchProgressRef.current < 1.0) {
        switchProgressRef.current = Math.min(1.0, switchProgressRef.current + 0.08);
        if (switchProgressRef.current >= 0.5 && !itemSwappedRef.current) {
          itemSwappedRef.current = true;
          heldItemRendererRef.current?.update(activeItemRef.current);
        }
      }
      if (switchProgressRef.current >= 1.0 && heldItemRendererRef.current && heldItemRendererRef.current.currentItemId !== activeItemRef.current?.id) {
        heldItemRendererRef.current.update(activeItemRef.current);
      }
      const switchOffset = Math.sin(switchProgressRef.current * Math.PI) * -0.22;

      // 4. Viewmodel Arm Animations
      const idleBreathing = Math.sin(elapsedTime * 1.5) * 0.006;
      const armWalkBob = Math.sin(elapsedTime * (isSprinting ? 6.5 : 4.0)) * 0.012;
      const armWalkSway = Math.cos(elapsedTime * (isSprinting ? 3.25 : 2.0)) * 0.010;

      let eatingBob = 0;
      let eatingTilt = 0;
      if (isConsumingRef.current) {
        eatingBob = Math.sin(elapsedTime * 24.0) * 0.035;
        eatingTilt = 0.16;
      }

      armGroup.position.set(
        0.38 + armWalkSway,
        -0.37 + idleBreathing + armWalkBob + switchOffset + eatingBob,
        -0.52 + (isConsumingRef.current ? 0.08 : 0)
      );
      armGroup.rotation.set(
        -0.40 + (isConsumingRef.current ? -eatingTilt : 0),
        -0.26 + armWalkSway * 0.5,
        0.22 + Math.cos(elapsedTime * 1.5) * 0.006
      );

      // 5. Lake Shader Wave Time
      if (lakeMatRef.current) {
        lakeMatRef.current.uniforms.uTime.value = elapsedTime;
      }

      // 6. Waterfall Animated Flow (Downward UV scrolling)
      if (waterfallTextureRef.current) {
        waterfallTextureRef.current.offset.y -= 0.035;
      }

      // Waterfall Splash Mist
      if (waterfallSplashRef.current) {
        const spArr = splashGeom.attributes.position.array;
        for (let sp = 1; sp < splashCount * 3; sp += 3) {
          spArr[sp] += 0.015;
          if (spArr[sp] > 4.2) spArr[sp] = 2.4 + Math.random() * 0.4;
        }
        splashGeom.attributes.position.needsUpdate = true;
      }

      // 7. Tree Leaves Wind Sway
      leavesMesh.rotation.y = Math.sin(elapsedTime * 0.8) * 0.008;
      leavesMesh.rotation.z = Math.cos(elapsedTime * 0.6) * 0.005;

      // 8. Drifting Clouds
      if (cloudsGroupRef.current) {
        cloudsGroupRef.current.children.forEach((cloud) => {
          cloud.position.x += 0.04;
          if (cloud.position.x > 140) cloud.position.x = -140;
        });
      }

      // 9. Torch Flickers & Embers
      torchLights.forEach((tl, i) => {
        const flicker = Math.sin(elapsedTime * 9.5 + i * 2.3) * 0.12 + Math.cos(elapsedTime * 14.0 + i) * 0.06;
        tl.intensity = 1.9 + flicker;
      });

      if (torchEmbersRef.current) {
        const ePos = emberGeom.attributes.position.array;
        for (let i = 1; i < emberCount * 3; i += 3) {
          ePos[i] += 0.016;
          if (ePos[i] > 8.0) ePos[i] = 4.8 + Math.random() * 0.4;
        }
        emberGeom.attributes.position.needsUpdate = true;
      }

      // 10. Rain Particles
      if (rainSystemRef.current && rainSystemRef.current.material.opacity > 0) {
        const rPos = rainGeom.attributes.position.array;
        for (let i = 1; i < rainCount * 3; i += 3) {
          rPos[i] -= 0.72;
          if (rPos[i] < 2) rPos[i] = 26;
        }
        rainGeom.attributes.position.needsUpdate = true;
      }

      // 11. Crosshair Block Raycast
      raycaster.setFromCamera(screenCenter, camera);
      const intersects = raycaster.intersectObjects(interactiveMeshesRef.current);
      if (intersects.length > 0 && intersects[0].distance < 7.5) {
        const hit = intersects[0];
        const blockPos = new THREE.Vector3()
          .copy(hit.point)
          .sub(hit.face.normal.clone().multiplyScalar(0.4))
          .round();
        blockOutline.position.copy(blockPos);
        blockOutline.visible = true;
      } else {
        blockOutline.visible = false;
      }

      // MULTI-LAYER RENDER:
      renderer.clear();
      renderer.render(scene, camera);
      renderer.clearDepth();
      renderer.render(viewmodelScene, viewmodelCamera);
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();

      viewmodelCamera.aspect = window.innerWidth / window.innerHeight;
      viewmodelCamera.updateProjectionMatrix();

      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('resize', handleResize);

      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // --------------------------------------------------------------------------
  // 5. DYNAMIC DAY/NIGHT & WEATHER CONTROLS
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (!fogRef.current || !hemiLightRef.current || !dirLightRef.current) return;

    const isRain = weather === 'rain';
    if (rainSystemRef.current) {
      rainSystemRef.current.material.opacity = isRain ? 0.8 : 0.0;
    }

    if (darknessActive) {
      const darkCol = 0x020308;
      fogRef.current.color.setHex(darkCol);
      fogRef.current.near = 2;
      fogRef.current.far = 28;
      hemiLightRef.current.intensity = 0.25;
      dirLightRef.current.intensity = 0.35;
      if (starsRef.current) starsRef.current.material.opacity = 0.0;
      if (sceneRef.current) sceneRef.current.background = new THREE.Color(darkCol);

    } else if (heartStatus === 'wither') {
      const witherCol = 0x180c26;
      fogRef.current.color.setHex(witherCol);
      fogRef.current.near = 10;
      fogRef.current.far = 90;
      hemiLightRef.current.intensity = 0.45;
      dirLightRef.current.intensity = 0.95;
      if (starsRef.current) starsRef.current.material.opacity = 0.2;
      if (sceneRef.current) sceneRef.current.background = new THREE.Color(witherCol);

    } else if (timeOfDay === 'sunset') {
      const sunsetCol = isRain ? 0x1b1f2b : 0x3e2b4f;
      fogRef.current.color.setHex(sunsetCol);
      fogRef.current.near = isRain ? 60 : 100;
      fogRef.current.far = isRain ? 450 : 850;

      hemiLightRef.current.color.setHex(0x7a6592);
      hemiLightRef.current.groundColor.setHex(0x5a4230);
      hemiLightRef.current.intensity = isRain ? 0.65 : 1.15;

      dirLightRef.current.color.setHex(0xff9f40);
      dirLightRef.current.intensity = isRain ? 0.8 : 1.9;
      dirLightRef.current.position.set(-70, 32, -60);

      if (sunMeshRef.current) {
        sunMeshRef.current.position.set(-150, 65, -130);
        sunMeshRef.current.visible = !isRain;
      }
      if (moonMeshRef.current) moonMeshRef.current.visible = false;
      if (starsRef.current) starsRef.current.material.opacity = 0.25;
      if (sceneRef.current) sceneRef.current.background = new THREE.Color(sunsetCol);
      if (lakeMatRef.current) {
        lakeMatRef.current.uniforms.uSkyColor.value.setHex(sunsetCol);
        lakeMatRef.current.uniforms.uSunColor.value.setHex(0xff9f40);
      }

    } else if (timeOfDay === 'night') {
      const nightCol = isRain ? 0x03060c : 0x091428;
      fogRef.current.color.setHex(nightCol);
      fogRef.current.near = isRain ? 50 : 80;
      fogRef.current.far = isRain ? 400 : 750;

      hemiLightRef.current.color.setHex(0x283b5e);
      hemiLightRef.current.groundColor.setHex(0x121a2c);
      hemiLightRef.current.intensity = 0.65;

      dirLightRef.current.color.setHex(0x89adfa);
      dirLightRef.current.intensity = 0.45;
      dirLightRef.current.position.set(45, 55, 30);

      if (sunMeshRef.current) sunMeshRef.current.visible = false;
      if (moonMeshRef.current) {
        moonMeshRef.current.position.set(130, 120, 90);
        moonMeshRef.current.visible = !isRain;
      }
      if (starsRef.current) starsRef.current.material.opacity = isRain ? 0.1 : 0.85;
      if (sceneRef.current) sceneRef.current.background = new THREE.Color(nightCol);
      if (lakeMatRef.current) {
        lakeMatRef.current.uniforms.uSkyColor.value.setHex(nightCol);
        lakeMatRef.current.uniforms.uDeepColor.value.setHex(0x03060c);
        lakeMatRef.current.uniforms.uSunColor.value.setHex(0x89adfa);
      }

    } else {
      // Default: Sunny Shader Day (BSL / Complementary palette matching reference image)
      const skyCol = isRain ? 0x2e3c50 : 0x82a9db;
      fogRef.current.color.setHex(skyCol);
      fogRef.current.near = isRain ? 60 : 120;
      fogRef.current.far = isRain ? 450 : 950;

      hemiLightRef.current.color.setHex(0x94beff);
      hemiLightRef.current.groundColor.setHex(0x5a7348);
      hemiLightRef.current.intensity = isRain ? 0.75 : 1.35;

      dirLightRef.current.color.setHex(0xfff3db);
      dirLightRef.current.intensity = isRain ? 0.9 : 1.95;
      dirLightRef.current.position.set(-70, 85, -60);

      if (sunMeshRef.current) {
        sunMeshRef.current.position.set(-150, 180, -130);
        sunMeshRef.current.visible = !isRain;
      }
      if (moonMeshRef.current) moonMeshRef.current.visible = false;
      if (starsRef.current) starsRef.current.material.opacity = 0.0;
      if (sceneRef.current) sceneRef.current.background = new THREE.Color(skyCol);
      if (lakeMatRef.current) {
        lakeMatRef.current.uniforms.uSkyColor.value.setHex(skyCol);
        lakeMatRef.current.uniforms.uDeepColor.value.setHex(isRain ? 0x14202c : 0x0c3b5e);
        lakeMatRef.current.uniforms.uSunColor.value.setHex(0xfffae0);
      }
    }
  }, [darknessActive, heartStatus, timeOfDay, weather]);

  return (
    <div
      ref={mountRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden'
      }}
      aria-hidden="true"
    />
  );
}
