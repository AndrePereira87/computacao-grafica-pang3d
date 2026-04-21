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
document.body.appendChild(renderizador.domElement);

// =========================================================
// 2. ILUMINAÇÃO BÁSICA
// =========================================================
const luzAmbiente = new THREE.AmbientLight(0xffffff, 0.6);
cena.add(luzAmbiente);

const luzDirecional = new THREE.DirectionalLight(0xffffff, 0.8);
luzDirecional.position.set(5, 10, 5);
cena.add(luzDirecional);

// =========================================================
// 3. SISTEMA DE FUNDOS DINÂMICOS (BACKGROUNDS)
// =========================================================
const carregadorTexturas = new THREE.TextureLoader();

// Atualizado para a tua pasta "background" e as 5 imagens que mostraste na print
const ficheirosFundos = [
    'background/bg1.jpg', 
    'background/bg2.jpg', 
    'background/bg3.jpg', 
    'background/bg4.jpg',
    'background/bg5.jpg'
];

const texturasFundos = [];

// Carregar todas as texturas
ficheirosFundos.forEach(ficheiro => {
    texturasFundos.push(carregadorTexturas.load(ficheiro));
});

// Criar o ecrã gigante atrás da arena
const geometriaFundo = new THREE.PlaneGeometry(60, 40);
const materialFundo = new THREE.MeshBasicMaterial({ 
    map: texturasFundos[0], // Começa com bg1.jpg
    depthWrite: false 
});

const planoFundo = new THREE.Mesh(geometriaFundo, materialFundo);
planoFundo.position.set(0, 10, -15);
cena.add(planoFundo);

// Função para mudar o fundo (podes testar na consola do browser)
window.mudarFundoAleatorio = function() {
    const indiceAleatorio = Math.floor(Math.random() * texturasFundos.length);
    materialFundo.map = texturasFundos[indiceAleatorio];
    materialFundo.needsUpdate = true;
    console.log("Fundo alterado para o ficheiro:", ficheirosFundos[indiceAleatorio]);
};

// =========================================================
// 4. CONSTRUÇÃO DA ARENA (Chão e Paredes com Texturas)
// =========================================================

// Carregar as imagens para as paredes e chão
const texturaParede = carregadorTexturas.load('background/parede.jpg');
const texturaChao = carregadorTexturas.load('background/chao.jpg');

// TRUQUE: Dizer ao Three.js para repetir as imagens em vez de as esticar!
texturaParede.wrapS = THREE.RepeatWrapping;
texturaParede.wrapT = THREE.RepeatWrapping;
texturaParede.repeat.set(1, 10); // Repete a imagem 10 vezes na vertical

texturaChao.wrapS = THREE.RepeatWrapping;
texturaChao.wrapT = THREE.RepeatWrapping;
texturaChao.repeat.set(12, 1); // Repete a imagem 12 vezes na horizontal

// Criar os materiais usando as texturas carregadas (em vez de cores)
const materialParede = new THREE.MeshStandardMaterial({ map: texturaParede });
const materialChao = new THREE.MeshStandardMaterial({ map: texturaChao });

// Geometria igual à de antes
const geometriaParede = new THREE.BoxGeometry(1, 20, 1);

// Parede Esquerda
const paredeEsq = new THREE.Mesh(geometriaParede, materialParede);
paredeEsq.position.set(-12, 10, 0);
cena.add(paredeEsq);

// Parede Direita
const paredeDir = new THREE.Mesh(geometriaParede, materialParede);
paredeDir.position.set(12, 10, 0);
cena.add(paredeDir);

// Chão
const geometriaChao = new THREE.BoxGeometry(25, 1, 2);
const chao = new THREE.Mesh(geometriaChao, materialChao);
chao.position.set(0, 0, 0);
cena.add(chao);

// =========================================================
// 5. CONSTRUÇÃO DO JOGADOR
// =========================================================
const jogador = new THREE.Group();

// Corpo do boneco
const materialCorpo = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
const corpo = new THREE.Mesh(new THREE.BoxGeometry(1, 1.5, 1), materialCorpo);
corpo.position.y = 1.25; 
jogador.add(corpo);

// Cabeça do boneco
const materialCabeca = new THREE.MeshStandardMaterial({ color: 0xffccaa });
const cabeca = new THREE.Mesh(new THREE.SphereGeometry(0.4, 16, 16), materialCabeca);
cabeca.position.y = 2.2; 
jogador.add(cabeca);

cena.add(jogador);

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
const limiteArena = 10.5;

function animar() {
    requestAnimationFrame(animar);

    // Movimento do jogador
    if (estadoTeclas.esquerda && jogador.position.x > -limiteArena) {
        jogador.position.x -= velocidadeJogador;
    }
    if (estadoTeclas.direita && jogador.position.x < limiteArena) {
        jogador.position.x += velocidadeJogador;
    }

    renderizador.render(cena, camara);
}

// Iniciar o jogo
animar();

// =========================================================
// 8. AJUSTAR O ECRÃ (Responsividade)
// =========================================================
window.addEventListener('resize', () => {
    camara.aspect = window.innerWidth / window.innerHeight;
    camara.updateProjectionMatrix();
    renderizador.setSize(window.innerWidth, window.innerHeight);
});