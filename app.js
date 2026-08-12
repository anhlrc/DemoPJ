/**
 * 3D Digital Museum Application Logic
 * Powered by Three.js (WebGL)
 */

// --- Remote Browser Logging Bridge ---
function sendLogToServer(type, args) {
    const message = Array.from(args).map(arg => {
        if (typeof arg === 'object') {
            try { return JSON.stringify(arg); } catch(e) { return String(arg); }
        }
        return String(arg);
    }).join(' ');
    
    fetch('/log', {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: `[${type}] ${message}`
    }).catch(() => {});
}

const originalLog = console.log;
console.log = function() {
    originalLog.apply(console, arguments);
    sendLogToServer('LOG', arguments);
};

const originalError = console.error;
console.error = function() {
    originalError.apply(console, arguments);
    sendLogToServer('ERR', arguments);
};

const originalWarn = console.warn;
console.warn = function() {
    originalWarn.apply(console, arguments);
    sendLogToServer('WARN', arguments);
};

window.onerror = function(message, source, lineno, colno, error) {
    sendLogToServer('CRITICAL_ERR', [`${message} at ${source}:${lineno}:${colno}`]);
    return false;
};

function logDebug(msg) {
    console.log(msg);
}

// --- Database for Artifact Metadata ---
const artifactsData = {
    Binhtong: {
        title: "Bình Tông Quân Nhu",
        category: "Kỷ Vật Lịch Sử",
        material: "Hợp kim nhôm / Vải",
        period: "Kháng chiến chống Mỹ (1960s)",
        filesize: "34.9 MB (Đã tối ưu)",
        poly: "Chi tiết cao (Hi-poly)",
        desc: `
            <p>Bình tông quân nhu (còn gọi là bình đựng nước dã chiến) là một vật dụng vô cùng quen thuộc và gắn bó mật thiết với cuộc đời người lính trong suốt thời kỳ chiến tranh cứu nước. Chiếc bình được chế tác từ hợp kim nhôm bền nhẹ, có bao vải bọc ngoài cách nhiệt và quai đeo tiện lợi, giúp bảo quản nước uống trong suốt các cuộc hành quân gian khổ băng rừng lội suối.</p>
            <p>Mỗi chiếc bình tông còn mang giá trị tinh thần lớn lao, lưu giữ những vết xước móp, những ký ức trận mạc và tình đồng chí chia ngọt sẻ bùi nơi chiến trường khốc liệt. Đây là minh chứng sống động cho những năm tháng gian lao mà anh dũng.</p>
        `,
        folder: "Binhtong",
        glbFile: "Binhtong.glb",
        scale: 1.0,
        defaultRotation: { x: Math.PI / 2, y: 0, z: 0 }
    },
    CAMGAP: {
        title: "Cặp Gắp Y Tế Cổ",
        category: "Công cụ y tế / Kỹ thuật",
        material: "Sắt tráng kẽm / Thép",
        period: "Giữa thế kỷ XX (1950s)",
        filesize: "9.4 MB (Đã tối ưu)",
        poly: "Độ phân giải trung bình",
        desc: `
            <p>Cặp gắp cơ học cổ điển (thường dùng trong y tế dã chiến hoặc kỹ thuật cơ khí cơ bản) được chế tác bằng thép phủ lớp bảo vệ chống gỉ sét. Đây là loại kẹp đa năng chuyên dụng dùng để gắp bông băng y tế, gắp các linh kiện cơ khí nóng hoặc thao tác trong các môi trường kỹ thuật hạn chế.</p>
            <p>Mẫu vật được phục dựng kỹ thuật số nguyên bản, thể hiện rõ những dấu vết oxy hóa của thời gian, cấu trúc cơ học bản lề đinh tán truyền thống và bề mặt kim loại thô ráp đặc trưng của công nghiệp chế tạo thế kỷ trước.</p>
        `,
        folder: "CAMGAP",
        glbFile: "CAMGAP.glb",
        scale: 1.0,
        defaultRotation: { x: Math.PI / 2, y: 0, z: 0 }
    },
    baoda: {
        title: "Bao Da Quân Sự Cổ",
        category: "Trang bị cá nhân",
        material: "Da thuộc tự nhiên / Đồng",
        period: "Những năm 1970 - 1980",
        filesize: "21.8 MB (Đã tối ưu)",
        poly: "Quét bề mặt độ phân giải cao",
        desc: `
            <p>Bao đựng bằng da thuộc dầy chuyên dụng quân sự, dùng để bảo quản bản đồ hành quân, tài liệu mật, hoặc các trang thiết bị đo đạc cá nhân tránh nước mưa và va đập. Bao da được chế tác tinh xảo bằng đường khâu thủ công chắc chắn và khóa cài chốt đồng thau.</p>
            <p>Công nghệ quét 3D laser tái hiện chân thực đến từng nếp nhăn tự nhiên của da, các vết xước sờn ở góc mép bao, và cả lớp oxit đồng xanh bám quanh khuy cài kim loại sau hàng chục năm lưu trữ.</p>
        `,
        folder: "baoda",
        glbFile: "baoda.glb",
        scale: 1.0,
        defaultRotation: { x: Math.PI / 2, y: 0, z: 0 }
    },
    camera: {
        title: "Máy Ảnh Cơ Cổ Điển",
        category: "Lưu niệm / Kỹ thuật",
        material: "Thép / Nhựa Bakelite / Kính",
        period: "Thập niên 1960 - 1970",
        filesize: "15.9 MB (Đã tối ưu)",
        poly: "Độ phân giải cao",
        desc: `
            <p>Máy ảnh cơ chụp phim thế hệ cũ sử dụng ống kính quang học xếp, một biểu tượng của ngành báo chí chiến trường và nhiếp ảnh tài liệu thế kỷ trước. Máy ảnh cơ học hoạt động hoàn toàn bằng dây cót và cơ khí, không sử dụng pin điện tử, giúp các phóng viên tác nghiệp bền bỉ trong mọi điều kiện weather khắc nghiệt nhất.</p>
            <p>Mô hình 3D lưu giữ hoàn hảo lớp vỏ nhựa nhám giả da chống trượt bao quanh thân máy, các núm vặn răng cưa chỉnh tiêu cự bằng kim loại mạ chrome, và cấu trúc cơ học của cụm ống kính xếp.</p>
        `,
        folder: "camera",
        glbFile: "camera.glb",
        scale: 1.0,
        defaultRotation: { x: Math.PI / 2, y: 0, z: 0 }
    }
};

// --- Application State Variables ---
let scene, camera, renderer, controls;
let activeModelGroup = null; // Container for the currently loaded 3D model
let activeModelId = 'Binhtong';
let currentMode = 'texture'; // 'texture', 'clay', 'wireframe'
let activePreset = 'museum';  // 'museum', 'studio', 'dramatic'
let autoRotate = false;
let autoRotateTimeout = null; // Timeout reference to resume auto-spin like Sketchfab
let modelOriginalZ = 0; // Default zoom level target
let rotX = 0, rotY = 0, rotZ = 0; // Custom object rotation variables

// --- Light nodes references ---
let ambientLight, mainDirLight, fillLight, pointLight;

// --- Custom Materials for Display Modes ---
const clayMaterial = new THREE.MeshStandardMaterial({
    color: 0x909090,
    roughness: 0.75,
    metalness: 0.15,
    flatShading: false
});

const wireframeMaterial = new THREE.MeshBasicMaterial({
    color: 0xc5a880,
    wireframe: true,
    transparent: true,
    opacity: 0.75
});

const transparentMaterial = new THREE.MeshBasicMaterial({
    transparent: true,
    opacity: 0.0,
    depthWrite: false
});

// --- Initialize App ---
function init() {
    const container = document.getElementById('viewer-container');
    if (!container) return;

    // Check for CORS restrictions under file:// protocol
    if (window.location.protocol === 'file:') {
        const warningDiv = document.createElement('div');
        warningDiv.className = 'cors-warning-overlay';
        warningDiv.innerHTML = `
            <div class="warning-box">
                <i class="fa-solid fa-triangle-exclamation warning-icon"></i>
                <h3>Hạn chế Bảo mật Trình duyệt (CORS)</h3>
                <p>Bạn đang chạy trang web trực tiếp từ tệp tin cục bộ (<code>file://</code>). Trình duyệt sẽ chặn tải các tài nguyên mô hình 3D vì lý do bảo mật.</p>
                <p>Vui lòng truy cập thông qua máy chủ cục bộ bằng liên kết dưới đây:</p>
                <a href="http://localhost:8080/index.html" class="btn btn-primary" style="margin-top: 15px;">
                    <i class="fa-solid fa-server"></i> Mở localhost:8080
                </a>
            </div>
        `;
        container.appendChild(warningDiv);
        
        // Hide loader overlay
        const loaderOverlay = document.getElementById('loader-overlay');
        if (loaderOverlay) loaderOverlay.style.display = 'none';
        
        setupUIEventListeners();
        return;
    }

    // 1. Create Scene
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0f1016, 0.005); // Soft fog for depth cues

    // 2. Create Camera
    const width = container.clientWidth;
    const height = container.clientHeight;
    logDebug(`Khởi tạo Canvas: Kích thước ban đầu = ${width}x${height}`);
    
    camera = new THREE.PerspectiveCamera(45, (width || 1) / (height || 1), 0.1, 10000);
    camera.position.set(15, 10, 20);

    // 3. Create WebGL Renderer (with high precision and transparent alpha channel)
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, precision: 'highp', powerPreference: 'high-performance' });
    renderer.setPixelRatio(window.devicePixelRatio); // Render at full native screen resolution for maximum sharpness
    renderer.setSize(width || 800, height || 450);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25; // Brighter exposure to make colors pop
    container.appendChild(renderer.domElement);

    // 4. Create Orbit Controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI; // Allow full vertical loop (360 degrees) like Sketchfab free rotation
    controls.minDistance = 2;
    controls.maxDistance = 100;

    // Sketchfab-like auto-rotate pause/resume behavior on interaction
    controls.addEventListener('start', () => {
        if (autoRotate) {
            controls.autoRotate = false;
            if (autoRotateTimeout) clearTimeout(autoRotateTimeout);
        }
    });
    controls.addEventListener('end', () => {
        if (autoRotate) {
            if (autoRotateTimeout) clearTimeout(autoRotateTimeout);
            autoRotateTimeout = setTimeout(() => {
                if (autoRotate) controls.autoRotate = true;
            }, 3000); // Resume auto-spin after 3 seconds of inactivity
        }
    });

    // 5. Initialize Lighting Rig
    setupLighting();

    // 6. Bind Event Listeners
    window.addEventListener('resize', onWindowResize);
    setupUIEventListeners();

    // 7. Load Default Model
    loadModel('Binhtong');

    // 8. Start Rendering Loop
    animate();

    // Force recalculate canvas size after CSS layout renders
    setTimeout(() => {
        onWindowResize();
        logDebug(`Đã cập nhật lại kích thước Canvas: ${container.clientWidth}x${container.clientHeight}`);
    }, 400);
}

// --- Setup Lighting Rig ---
function setupLighting() {
    ambientLight = new THREE.HemisphereLight(0xffffff, 0x12121c, 0.6);
    scene.add(ambientLight);

    mainDirLight = new THREE.DirectionalLight(0xfff5e6, 1.2);
    mainDirLight.position.set(10, 15, 8);
    mainDirLight.castShadow = true;
    mainDirLight.shadow.mapSize.width = 2048;
    mainDirLight.shadow.mapSize.height = 2048;
    mainDirLight.shadow.bias = -0.001;
    
    // Optimize shadow camera frustum for the normalized 10-unit model
    mainDirLight.shadow.camera.left = -8;
    mainDirLight.shadow.camera.right = 8;
    mainDirLight.shadow.camera.top = 8;
    mainDirLight.shadow.camera.bottom = -8;
    mainDirLight.shadow.camera.near = 0.5;
    mainDirLight.shadow.camera.far = 40;
    
    scene.add(mainDirLight);

    fillLight = new THREE.DirectionalLight(0xd9e5ff, 0.4);
    fillLight.position.set(-10, 5, -8);
    scene.add(fillLight);

    pointLight = new THREE.PointLight(0xffc580, 0.8, 30);
    pointLight.position.set(0, -5, 5);
    scene.add(pointLight);

    applyLightingPreset('museum');
}

// --- Apply Lighting Presets ---
function applyLightingPreset(preset) {
    activePreset = preset;
    
    document.querySelectorAll('[id^="btn-light-"]').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`btn-light-${preset}`).classList.add('active');

    const container = document.getElementById('viewer-container');

    switch (preset) {
        case 'museum':
            ambientLight.color.setHex(0xffffff);
            ambientLight.intensity = 0.8;
            mainDirLight.color.setHex(0xffecc2);
            mainDirLight.intensity = 1.8;
            mainDirLight.position.set(5, 12, 8);
            fillLight.color.setHex(0xa6bdf2);
            fillLight.intensity = 0.8;
            fillLight.position.set(-8, 3, -6);
            pointLight.color.setHex(0xffcc80);
            pointLight.intensity = 0.8;
            pointLight.position.set(3, -4, 5);
            if (container) {
                container.style.background = 'radial-gradient(circle at center, #3e414c 0%, #17181c 100%)';
            }
            if (scene.fog) scene.fog.color.setHex(0x17181c);
            break;

        case 'studio':
            ambientLight.color.setHex(0xffffff);
            ambientLight.intensity = 1.0;
            mainDirLight.color.setHex(0xffffff);
            mainDirLight.intensity = 1.6;
            mainDirLight.position.set(8, 15, 10);
            fillLight.color.setHex(0xffffff);
            fillLight.intensity = 1.2;
            fillLight.position.set(-10, 8, -10);
            pointLight.color.setHex(0xffffff);
            pointLight.intensity = 0.5;
            pointLight.position.set(0, 10, 0);
            if (container) {
                container.style.background = 'radial-gradient(circle at center, #555866 0%, #22232a 100%)';
            }
            if (scene.fog) scene.fog.color.setHex(0x22232a);
            break;

        case 'dramatic':
            ambientLight.color.setHex(0x3a4b6e);
            ambientLight.intensity = 0.4;
            mainDirLight.color.setHex(0xffa666);
            mainDirLight.intensity = 2.5;
            mainDirLight.position.set(12, 6, 4);
            fillLight.color.setHex(0x7cb3ff);
            fillLight.intensity = 1.5;
            fillLight.position.set(-12, -2, -6);
            pointLight.color.setHex(0xff0055);
            pointLight.intensity = 1.2;
            pointLight.position.set(-4, 5, 6);
            if (container) {
                container.style.background = 'radial-gradient(circle at center, #231930 0%, #05060b 100%)';
            }
            if (scene.fog) scene.fog.color.setHex(0x05060b);
            break;
    }
}

// --- Load 3D Model ---
function loadModel(modelId) {
    if (!artifactsData[modelId]) return;
    logDebug(`Bắt đầu tải mô hình: <b>${modelId}</b>...`);
    activeModelId = modelId;
    const data = artifactsData[modelId];

    // 1. Update text metadata panels
    document.getElementById('active-item-name').innerText = data.title;
    document.getElementById('artifact-category').innerText = data.category;
    document.getElementById('artifact-title-display').innerText = data.title;
    document.getElementById('spec-material').innerText = data.material;
    document.getElementById('spec-period').innerText = data.period;
    document.getElementById('spec-filesize').innerText = data.filesize;
    document.getElementById('spec-poly').innerText = data.poly;
    document.getElementById('artifact-desc-content').innerHTML = data.desc;

    // Update catalog cards active states
    document.querySelectorAll('.catalog-card').forEach(card => {
        if (card.getAttribute('data-model-id') === modelId) {
            card.classList.add('active');
        } else {
            card.classList.remove('active');
        }
    });

    // Reset custom sliders and rotation variables back to 0
    rotX = 0; rotY = 0; rotZ = 0;
    const slideX = document.getElementById('slide-rot-x');
    const slideY = document.getElementById('slide-rot-y');
    const slideZ = document.getElementById('slide-rot-z');
    if (slideX) {
        slideX.value = 0;
        document.getElementById('val-rot-x').innerText = '0°';
    }
    if (slideY) {
        slideY.value = 0;
        document.getElementById('val-rot-y').innerText = '0°';
    }
    if (slideZ) {
        slideZ.value = 0;
        document.getElementById('val-rot-z').innerText = '0°';
    }

    // 2. Clear previous active model
    clearActiveModel();

    // 3. Show Loading Screen
    const loaderOverlay = document.getElementById('loader-overlay');
    const progressBar = document.getElementById('progress-bar');
    const progressPercent = document.getElementById('progress-percent');
    
    loaderOverlay.style.opacity = '1';
    loaderOverlay.style.pointerEvents = 'all';
    progressBar.style.width = '0%';
    progressPercent.innerText = '0%';

    const modelPath = `assets/models/${data.folder}/`;
    
    // 4. Create new Group to contain the active model mesh
    activeModelGroup = new THREE.Group();
    scene.add(activeModelGroup);

    // 5. Load GLTF/GLB file
    const gltfLoader = new THREE.GLTFLoader();
    
    gltfLoader.load(modelPath + data.glbFile, function (gltf) {
        const object = gltf.scene;
        
        // Apply default rotation to align model upright (Y-up)
        if (data.defaultRotation) {
            object.rotation.set(data.defaultRotation.x, data.defaultRotation.y, data.defaultRotation.z);
        }
        
        // Adjust materials & cast shadows
        object.traverse(function (child) {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                
                // Backup original material for switching display modes
                child.userData.originalMaterial = child.material;

                // Create points representation for Point Cloud mode (scanning look)
                if (child.geometry) {
                    const pointsGeom = child.geometry.clone();
                    const pointsMat = new THREE.PointsMaterial({
                        color: 0xc5a880, // Gold points to match the theme
                        size: 0.04,
                        sizeAttenuation: true
                    });
                    const pointCloud = new THREE.Points(pointsGeom, pointsMat);
                    pointCloud.name = "pointCloudHelper";
                    pointCloud.visible = false;
                    child.add(pointCloud); // Add as child of the mesh so it mirrors any rotation/scale
                }
                
                // Fix standard material parameters to prevent transparent/black rendering bugs
                const adjustMat = function (mat) {
                    if (!mat) return;
                    mat.transparent = false;
                    mat.opacity = 1.0;
                    mat.roughness = 0.6;
                    if (mat.metalness !== undefined) mat.metalness = 0.1;
                    if (mat.color) {
                        // Force black colors to white so diffuse textures render correctly
                        if (mat.color.r === 0 && mat.color.g === 0 && mat.color.b === 0) {
                            mat.color.setHex(0xffffff);
                        }
                    }
                    if (mat.map) {
                        mat.map.anisotropy = renderer.capabilities.getMaxAnisotropy();
                    }
                };
                
                if (child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach(adjustMat);
                    } else {
                        adjustMat(child.material);
                    }
                }
            }
        });

        // Count child meshes
        let meshCount = 0;
        object.traverse(c => { if (c.isMesh) meshCount++; });
        logDebug(`Tải thành công GLB. Số lượng meshes: ${meshCount}`);

        // Add object to scene graph FIRST so world matrices can be resolved
        activeModelGroup.add(object);

        // Center object bounding box to (0,0,0) and auto-scale view
        centerAndScaleObject(object, data.scale);

        // Apply the currently active display mode settings
        applyDisplayMode(currentMode);

        // Hide Loading Screen
        setTimeout(() => {
            loaderOverlay.style.opacity = '0';
            loaderOverlay.style.pointerEvents = 'none';
            loaderOverlay.style.display = 'none';
        }, 400);

    }, function (xhr) {
        // Loading Progress
        if (xhr.lengthComputable) {
            const percentComplete = Math.round((xhr.loaded / xhr.total) * 100);
            progressBar.style.width = percentComplete + '%';
            progressPercent.innerText = percentComplete + '%';
        }
    }, function (error) {
        console.error("Lỗi chi tiết khi tải file GLB:", error);
        const errTip = (window.location.protocol === 'file:')
            ? "Bạn đang mở file trực tiếp (file://). Vui lòng chạy máy chủ server.py và mở http://localhost:8080/index.html"
            : "Kiểm tra kết nối mạng hoặc đường dẫn file mô hình .glb trên máy chủ.";
        document.getElementById('loader-title').innerText = "Không thể tải mô hình 3D!";
        progressPercent.innerText = "Lỗi tải file";
        const tipEl = document.querySelector('.loader-tip');
        if (tipEl) {
            tipEl.innerHTML = `<span style="color: #ff6b6b;"><i class="fa-solid fa-triangle-exclamation"></i> ${errTip}</span>`;
        }
    });
}

// --- Center & Scale Helper ---
function centerAndScaleObject(object, customScale = 1.0) {
    const box = new THREE.Box3().setFromObject(object);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    logDebug(`Cục bộ ban đầu - Kích thước Box3: x=${size.x.toFixed(2)}, y=${size.y.toFixed(2)}, z=${size.z.toFixed(2)}`);
    logDebug(`Cục bộ ban đầu - Tâm Box3: x=${center.x.toFixed(2)}, y=${center.y.toFixed(2)}, z=${center.z.toFixed(2)}`);

    // Translate coordinates so model center is at (0,0,0) in parent space (activeModelGroup)
    object.position.copy(center).negate();

    // Normalize scale so maximum dimension is 10 units (compensate for mm/cm discrepancies in scan scales)
    const maxDimension = Math.max(size.x, size.y, size.z);
    const targetSize = 10.0;
    const normalizationScale = maxDimension > 0 ? (targetSize / maxDimension) : 1.0;
    const finalScale = normalizationScale * customScale;
    
    // Scale the parent activeModelGroup so that the origin (0,0,0) remains the scale anchor in world space!
    activeModelGroup.scale.set(finalScale, finalScale, finalScale);

    // Compute dimensions after scaling
    const scaledMaxDimension = maxDimension * finalScale;
    logDebug(`Sau khi chuẩn hóa - Kích thước max: ${scaledMaxDimension.toFixed(2)} (Scale factor: ${finalScale.toFixed(5)})`);

    // Compute ideal camera position based on normalized dimensions
    const fovRad = camera.fov * (Math.PI / 180);
    let cameraDistance = Math.abs(scaledMaxDimension / 2 / Math.tan(fovRad / 2));
    cameraDistance *= 1.6; // Add margin for padding
    if (cameraDistance === 0 || isNaN(cameraDistance)) {
        cameraDistance = 15;
        logDebug("Cảnh báo: Khoảng cách camera bằng 0 hoặc NaN. Đặt mặc định = 15");
    }
    
    modelOriginalZ = cameraDistance;
    logDebug(`Khoảng cách camera tính toán: ${cameraDistance.toFixed(2)}`);

    // Move camera to ideal coordinates looking at center
    camera.position.set(cameraDistance * 0.8, cameraDistance * 0.6, cameraDistance * 1.1);
    camera.lookAt(0, 0, 0);

    // Update orbit controls
    controls.target.set(0, 0, 0);
    controls.minDistance = (scaledMaxDimension * 0.4) || 1.0;
    controls.maxDistance = (cameraDistance * 4.0) || 100.0;
    controls.update();

    // Ground shadow plane and grid helper removed per user request to allow clear 360-degree floating look
}


// --- Clear Active Model from memory ---
function clearActiveModel() {
    // Remove floor shadow plane & grid helper
    const oldFloor = scene.getObjectByName("floorShadowPlane");
    if (oldFloor) {
        if (oldFloor.geometry) oldFloor.geometry.dispose();
        if (oldFloor.material) oldFloor.material.dispose();
        scene.remove(oldFloor);
    }
    const oldGrid = scene.getObjectByName("floorGridHelper");
    if (oldGrid) {
        if (oldGrid.geometry) oldGrid.geometry.dispose();
        if (oldGrid.material) oldGrid.material.dispose();
        scene.remove(oldGrid);
    }

    if (!activeModelGroup) return;

    activeModelGroup.traverse(function (child) {
        if (child.isMesh) {
            if (child.geometry) child.geometry.dispose();
            
            if (child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach(mat => disposeMaterial(mat));
                } else {
                    disposeMaterial(child.material);
                }
            }

            if (child.userData.originalMaterial) {
                if (Array.isArray(child.userData.originalMaterial)) {
                    child.userData.originalMaterial.forEach(mat => disposeMaterial(mat));
                } else {
                    disposeMaterial(child.userData.originalMaterial);
                }
            }

            if (child.userData.shadelessMaterial) {
                if (Array.isArray(child.userData.shadelessMaterial)) {
                    child.userData.shadelessMaterial.forEach(mat => mat.dispose());
                } else {
                    child.userData.shadelessMaterial.dispose();
                }
            }
        }
    });

    scene.remove(activeModelGroup);
    activeModelGroup = null;
}

function disposeMaterial(material) {
    if (material.map) material.map.dispose();
    if (material.lightMap) material.lightMap.dispose();
    if (material.bumpMap) material.bumpMap.dispose();
    if (material.normalMap) material.normalMap.dispose();
    if (material.specularMap) material.specularMap.dispose();
    if (material.envMap) material.envMap.dispose();
    material.dispose();
}

// --- Apply Display Render Modes ---
function applyDisplayMode(mode) {
    currentMode = mode;

    document.querySelectorAll('[id^="btn-mode-"]').forEach(btn => btn.classList.remove('active'));
    if (mode === 'texture') document.getElementById('btn-mode-texture').classList.add('active');
    if (mode === 'clay') document.getElementById('btn-mode-clay').classList.add('active');
    if (mode === 'points') document.getElementById('btn-mode-points').classList.add('active');
    if (mode === 'wireframe') document.getElementById('btn-mode-wireframe').classList.add('active');

    // Maintain high-end ACES Filmic Tone Mapping for all modes to render glow and specular reflections beautifully
    if (renderer) {
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
    }

    if (!activeModelGroup) return;

    activeModelGroup.traverse(function (child) {
        if (child.isMesh) {
            // Find points representation if available
            const pointCloud = child.getObjectByName("pointCloudHelper");

            switch (mode) {
                case 'texture':
                    // Restore original MeshStandardMaterial and apply self-illumination (emissive mapping) at 1.0 intensity for maximum brightness on all sides like vr3D.vn
                    child.material = child.userData.originalMaterial;
                    
                    const applyVr3dStyle = (mat) => {
                        if (!mat) return;
                        mat.wireframe = false;
                        
                        // Set self-illumination using the diffuse texture map
                        if (mat.map) {
                            mat.emissiveMap = mat.map;
                            mat.emissive = new THREE.Color(0xffffff);
                            mat.emissiveIntensity = 1.0; // Maximize emissive brightness so even unlit sides are 100% bright
                        }
                        
                        // Optimize metalness and roughness for premium reflections
                        mat.roughness = 0.35;
                        if (mat.metalness !== undefined) mat.metalness = 0.1;
                        
                        mat.needsUpdate = true;
                    };
                    
                    if (child.material) {
                        if (Array.isArray(child.material)) {
                            child.material.forEach(applyVr3dStyle);
                        } else {
                            applyVr3dStyle(child.material);
                        }
                    }
                    if (pointCloud) pointCloud.visible = false;
                    break;
                case 'clay':
                    child.material = clayMaterial;
                    if (pointCloud) pointCloud.visible = false;
                    break;
                case 'points':
                    child.material = transparentMaterial;
                    if (pointCloud) pointCloud.visible = true;
                    break;
                case 'wireframe':
                    child.material = wireframeMaterial;
                    if (pointCloud) pointCloud.visible = false;
                    break;
            }
        }
    });
}

// --- Animation Render Loop ---
function animate() {
    requestAnimationFrame(animate);

    if (controls) controls.update();

    if (renderer && scene && camera) {
        renderer.render(scene, camera);
    }
}

// --- Responsive Canvas Size Adjustment ---
function onWindowResize() {
    const container = document.getElementById('viewer-container');
    if (!container || !camera || !renderer) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
}

// --- Setup UI DOM Controls ---
function setupUIEventListeners() {
    document.getElementById('btn-mode-texture').addEventListener('click', () => applyDisplayMode('texture'));
    document.getElementById('btn-mode-clay').addEventListener('click', () => applyDisplayMode('clay'));
    document.getElementById('btn-mode-points').addEventListener('click', () => applyDisplayMode('points'));
    document.getElementById('btn-mode-wireframe').addEventListener('click', () => applyDisplayMode('wireframe'));

    document.getElementById('btn-light-museum').addEventListener('click', () => applyLightingPreset('museum'));
    document.getElementById('btn-light-studio').addEventListener('click', () => applyLightingPreset('studio'));
    document.getElementById('btn-light-dramatic').addEventListener('click', () => applyLightingPreset('dramatic'));

    const btnAutoRotate = document.getElementById('btn-auto-rotate');
    btnAutoRotate.addEventListener('click', () => {
        autoRotate = !autoRotate;
        if (controls) {
            controls.autoRotate = autoRotate;
            controls.autoRotateSpeed = 1.2; // Slow, premium speed like Sketchfab
        }
        if (autoRotate) {
            btnAutoRotate.classList.add('active');
        } else {
            btnAutoRotate.classList.remove('active');
            if (autoRotateTimeout) clearTimeout(autoRotateTimeout);
        }
    });

    document.getElementById('btn-reset-cam').addEventListener('click', () => {
        if (!activeModelGroup) return;
        activeModelGroup.rotation.set(0, 0, 0);
        
        // Reset local object rotation
        if (activeModelGroup.children[0]) {
            activeModelGroup.children[0].rotation.set(0, 0, 0);
        }

        // Reset custom rotation variables & slider UI elements
        rotX = 0; rotY = 0; rotZ = 0;
        const slideX = document.getElementById('slide-rot-x');
        const slideY = document.getElementById('slide-rot-y');
        const slideZ = document.getElementById('slide-rot-z');
        if (slideX) {
            slideX.value = 0;
            document.getElementById('val-rot-x').innerText = '0°';
        }
        if (slideY) {
            slideY.value = 0;
            document.getElementById('val-rot-y').innerText = '0°';
        }
        if (slideZ) {
            slideZ.value = 0;
            document.getElementById('val-rot-z').innerText = '0°';
        }

        controls.target.set(0, 0, 0);
        camera.position.set(modelOriginalZ * 0.8, modelOriginalZ * 0.6, modelOriginalZ * 1.1);
        controls.update();
    });

    // Slider custom rotation logic
    const updateModelRotation = () => {
        if (activeModelGroup && activeModelGroup.children[0]) {
            activeModelGroup.children[0].rotation.set(rotX, rotY, rotZ);
        }
    };

    const slideX = document.getElementById('slide-rot-x');
    const slideY = document.getElementById('slide-rot-y');
    const slideZ = document.getElementById('slide-rot-z');

    if (slideX) {
        slideX.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            rotX = val * Math.PI / 180;
            document.getElementById('val-rot-x').innerText = val + '°';
            updateModelRotation();
        });
    }
    if (slideY) {
        slideY.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            rotY = val * Math.PI / 180;
            document.getElementById('val-rot-y').innerText = val + '°';
            updateModelRotation();
        });
    }
    if (slideZ) {
        slideZ.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            rotZ = val * Math.PI / 180;
            document.getElementById('val-rot-z').innerText = val + '°';
            updateModelRotation();
        });
    }

    const btnFullscreen = document.getElementById('btn-fullscreen');
    const container = document.getElementById('viewer-container');
    btnFullscreen.addEventListener('click', () => {
        if (!document.fullscreenElement) {
            if (container.requestFullscreen) {
                container.requestFullscreen();
            } else if (container.webkitRequestFullscreen) {
                container.webkitRequestFullscreen();
            } else if (container.msRequestFullscreen) {
                container.msRequestFullscreen();
            }
            btnFullscreen.querySelector('i').className = 'fa-solid fa-compress';
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
            btnFullscreen.querySelector('i').className = 'fa-solid fa-expand';
        }
    });

    document.addEventListener('fullscreenchange', () => {
        if (!document.fullscreenElement) {
            btnFullscreen.querySelector('i').className = 'fa-solid fa-expand';
        }
        setTimeout(onWindowResize, 100);
    });

    // Camera View Shortcuts
    const setCameraView = (xFactor, yFactor, zFactor) => {
        if (!activeModelGroup) return;
        const d = modelOriginalZ || 15;
        controls.target.set(0, 0, 0);
        camera.position.set(d * xFactor, d * yFactor, d * zFactor);
        camera.lookAt(0, 0, 0);
        controls.update();
    };

    const btnViewFront = document.getElementById('btn-view-front');
    if (btnViewFront) btnViewFront.addEventListener('click', () => setCameraView(0, 0, 1.2));
    const btnViewBack = document.getElementById('btn-view-back');
    if (btnViewBack) btnViewBack.addEventListener('click', () => setCameraView(0, 0, -1.2));
    const btnViewLeft = document.getElementById('btn-view-left');
    if (btnViewLeft) btnViewLeft.addEventListener('click', () => setCameraView(-1.2, 0, 0));
    const btnViewRight = document.getElementById('btn-view-right');
    if (btnViewRight) btnViewRight.addEventListener('click', () => setCameraView(1.2, 0, 0));
    const btnViewTop = document.getElementById('btn-view-top');
    if (btnViewTop) btnViewTop.addEventListener('click', () => setCameraView(0.0001, 1.2, 0));
    const btnViewBottom = document.getElementById('btn-view-bottom');
    if (btnViewBottom) btnViewBottom.addEventListener('click', () => setCameraView(0.0001, -1.2, 0));

    document.querySelectorAll('.catalog-card').forEach(card => {
        card.addEventListener('click', () => {
            const modelId = card.getAttribute('data-model-id');
            if (modelId && modelId !== activeModelId) {
                loadModel(modelId);
                document.getElementById('exhibition').scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

// --- Launch Application ---
window.onload = init;
window.THREE_SCENE = scene;
window.THREE_CAMERA = camera;
window.THREE_RENDERER = renderer;
window.THREE_CONTROLS = controls;
