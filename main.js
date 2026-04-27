import * as THREE from 'three';

// =========================================================
// 1. CONFIGURAÇÃO BASE (Cena, Câmara e Renderizador)
// =========================================================
const cena = new THREE.Scene();

// Câmara de Perspetiva
const camara = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camara.position.set(0, 5, 15);

const renderizador = new THREE.WebGLRenderer({ antialias: true });
renderizador.setSize(window.innerWidth, window.innerHeight);
renderizador.shadowMap.enabled = true; // LIGA AS SOMBRAS NO MOTOR DO JOGO
document.body.appendChild(renderizador.domElement);

// =========================================================
// 2. ILUMINAÇÃO BÁSICA
// =========================================================
const luzAmbiente = new THREE.AmbientLight(0xffffff, 0.6);
cena.add(luzAmbiente);

const luzDirecional = new THREE.DirectionalLight(0xffffff, 0.8);
luzDirecional.position.set(5, 15, 5);
luzDirecional.castShadow = true; // ESTA LUZ VAI PROJETAR SOMBRAS
cena.add(luzDirecional);

// =========================================================
// 3. SISTEMA DE FUNDOS DINÂMICOS (BACKGROUNDS)
// =========================================================
const carregadorTexturas = new THREE.TextureLoader();

const ficheirosFundos = [
    'background/bg1.jpg', 
    'background/bg2.jpg', 
    'background/bg3.jpg', 
    'background/bg4.jpg',
    'background/bg5.jpg'
];

const texturasFundos = [];

ficheirosFundos.forEach(ficheiro => {
    texturasFundos.push(carregadorTexturas.load(ficheiro));
});

const geometriaFundo = new THREE.PlaneGeometry(60, 40);
const materialFundo = new THREE.MeshBasicMaterial({ 
    map: texturasFundos[0],
    depthWrite: false 
});

const planoFundo = new THREE.Mesh(geometriaFundo, materialFundo);
planoFundo.position.set(0, 10, -15);
cena.add(planoFundo);

window.mudarFundoAleatorio = function() {
    const indiceAleatorio = Math.floor(Math.random() * texturasFundos.length);
    materialFundo.map = texturasFundos[indiceAleatorio];
    materialFundo.needsUpdate = true;
};

// =========================================================
// 4. CONSTRUÇÃO DA ARENA (Chão e Paredes com Texturas)
// =========================================================
const texturaParede = carregadorTexturas.load('background/parede.jpg');
const texturaChao = carregadorTexturas.load('background/chao.jpg');

texturaParede.wrapS = THREE.RepeatWrapping;
texturaParede.wrapT = THREE.RepeatWrapping;
texturaParede.repeat.set(1, 10); 

texturaChao.wrapS = THREE.RepeatWrapping;
texturaChao.wrapT = THREE.RepeatWrapping;
texturaChao.repeat.set(12, 1); 

const materialParede = new THREE.MeshStandardMaterial({ map: texturaParede });
const materialChao = new THREE.MeshStandardMaterial({ map: texturaChao });

const geometriaParede = new THREE.BoxGeometry(1, 20, 1);

// Parede Esquerda
const paredeEsq = new THREE.Mesh(geometriaParede, materialParede);
paredeEsq.position.set(-12, 10, 0);
paredeEsq.receiveShadow = true;
cena.add(paredeEsq);

// Parede Direita
const paredeDir = new THREE.Mesh(geometriaParede, materialParede);
paredeDir.position.set(12, 10, 0);
paredeDir.receiveShadow = true;
cena.add(paredeDir);

// Chão
const geometriaChao = new THREE.BoxGeometry(25, 1, 2);
const chao = new THREE.Mesh(geometriaChao, materialChao);
chao.position.set(0, 0, 0);
chao.receiveShadow = true; // O CHÃO RECEBE AS SOMBRAS
cena.add(chao);

// =========================================================
// 5. CONSTRUÇÃO DO JOGADOR
// =========================================================
const jogador = new THREE.Group();

const materialCorpo = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
const corpo = new THREE.Mesh(new THREE.BoxGeometry(1, 1.5, 1), materialCorpo);
corpo.position.y = 1.25; 
corpo.castShadow = true; // BONECO TAMBÉM FAZ SOMBRA
jogador.add(corpo);

const materialCabeca = new THREE.MeshStandardMaterial({ color: 0xffccaa });
const cabeca = new THREE.Mesh(new THREE.SphereGeometry(0.4, 16, 16), materialCabeca);
cabeca.position.y = 2.2; 
cabeca.castShadow = true;
jogador.add(cabeca);

cena.add(jogador);

// =========================================================
// 5.5. SISTEMA DE BOLAS E FÍSICA (Semana 3)
// =========================================================
const gravidade = 0.012; 
const forcaSalto = 0.55; 
const bolas = []; 

function criarBola(raio, corHex, posX, posY, velX) {
    const geometriaBola = new THREE.SphereGeometry(raio, 32, 32);
    const materialBola = new THREE.MeshStandardMaterial({ 
        color: corHex,
        roughness: 0.2, 
        metalness: 0.5
    });
    
    const meshBola = new THREE.Mesh(geometriaBola, materialBola);
    meshBola.position.set(posX, posY, 0); 
    meshBola.castShadow = true; // A BOLA FAZ SOMBRA

    const luzBola = new THREE.PointLight(corHex, 1.5, 15);
    meshBola.add(luzBola); 

    cena.add(meshBola);

    bolas.push({
        mesh: meshBola,
        raio: raio,
        velocidadeX: velX,
        velocidadeY: 0 
    });
}

// Criar as 3 bolas iniciais
criarBola(1.5, 0xff0000, 0, 10, 0.08);   // Vermelha grande
criarBola(1.0, 0x0088ff, 5, 8, -0.05);   // Azul média
criarBola(0.6, 0x00ff00, -6, 12, 0.1);   // Verde pequena

// =========================================================
// 6. LÓGICA DE INTERAÇÃO (Teclado)
// =========================================================
const estadoTeclas = { esquerda: false, direita: false };

window.addEventListener('keydown', (evento) => {
    if (evento.key === 'ArrowLeft') estadoTeclas.esquerda = true;
    if (evento.key === 'ArrowRight') estadoTeclas.direita = true;
});

window.addEventListener('keyup', (evento) => {
    if (evento.key === 'ArrowLeft') estadoTeclas.esquerda = false;
    if (evento.key === 'ArrowRight') estadoTeclas.direita = false;
});

// =========================================================
// 7. LOOP DE ANIMAÇÃO PRINCIPAL
// =========================================================
const velocidadeJogador = 0.2;
const limiteArenaLateral = 11; 
const topoChao = 0.5; 

function animar() {
    requestAnimationFrame(animar);

    // Movimento do jogador
    if (estadoTeclas.esquerda && jogador.position.x > -limiteArenaLateral + 1) {
        jogador.position.x -= velocidadeJogador;
    }
    if (estadoTeclas.direita && jogador.position.x < limiteArenaLateral - 1) {
        jogador.position.x += velocidadeJogador;
    }

    // Física das bolas
    for (let i = 0; i < bolas.length; i++) {
        let bola = bolas[i];

        bola.velocidadeY -= gravidade;

        bola.mesh.position.x += bola.velocidadeX;
        bola.mesh.position.y += bola.velocidadeY;

        // Bater no chão
        if (bola.mesh.position.y - bola.raio <= topoChao) {
            bola.mesh.position.y = topoChao + bola.raio;
            bola.velocidadeY = forcaSalto; 
        }

        // Bater nas paredes
        const limiteBolaX = limiteArenaLateral - bola.raio;
        
        if (bola.mesh.position.x >= limiteBolaX) { 
            bola.mesh.position.x = limiteBolaX;
            bola.velocidadeX *= -1; 
        } 
        else if (bola.mesh.position.x <= -limiteBolaX) { 
            bola.mesh.position.x = -limiteBolaX;
            bola.velocidadeX *= -1; 
        }
    }

    renderizador.render(cena, camara);
}

animar();

// =========================================================
// 8. AJUSTAR O ECRÃ (Responsividade)
// =========================================================
window.addEventListener('resize', () => {
    camara.aspect = window.innerWidth / window.innerHeight;
    camara.updateProjectionMatrix();
    renderizador.setSize(window.innerWidth, window.innerHeight);
});