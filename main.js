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
// 5.5. SISTEMA DE BOLAS E FÍSICA (Semana 3)
// =========================================================

// Configurações Globais da Física
const gravidade = 0.012; // Quão rápido a bola cai
const forcaSalto = 0.35; // A força com que a bola é atirada para cima ao bater no chão
const bolas = []; // Lista vazia que vai guardar todas as bolas em jogo

// Função mágica para criar uma bola com física e luzes!
function criarBola(raio, corHex, posX, posY, velX) {
    // 1. Criar a geometria e material (Requisito 1)
    const geometriaBola = new THREE.SphereGeometry(raio, 32, 32);
    
    // Usamos um material que reage à luz para ficar brilhante
    const materialBola = new THREE.MeshStandardMaterial({ 
        color: corHex,
        roughness: 0.2, // Deixa a bola mais lisa/reflexiva
        metalness: 0.5
    });
    
    const meshBola = new THREE.Mesh(geometriaBola, materialBola);
    meshBola.position.set(posX, posY, 0); // Posição inicial

    // 2. Adicionar a luz pontual à própria bola (Requisito 3)
    // A luz vai ter a mesma cor que a bola e vai andar sempre com ela!
    const luzBola = new THREE.PointLight(corHex, 1.5, 15);
    meshBola.add(luzBola); // Anexamos a luz à malha da bola

    cena.add(meshBola);

    // 3. Guardar os dados de física desta bola específica na nossa lista
    bolas.push({
        mesh: meshBola,
        raio: raio,
        velocidadeX: velX,
        velocidadeY: 0 // Começa a cair do zero
    });
}

// Vamos criar a primeira bola gigante vermelha para testar!
// Parâmetros: Raio, Cor, Posição X, Posição Y, Velocidade X
criarBola(1.5, 0xff0000, 0, 10, 0.08);

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
const limiteArenaLateral = 11; // Distância até bater na parede esquerda/direita
const topoChao = 0.5; // O nosso chão tem altura 1, portanto o topo está em Y=0.5

function animar() {
    requestAnimationFrame(animar);

    // Movimento do jogador
    if (estadoTeclas.esquerda && jogador.position.x > -limiteArenaLateral + 1) {
        jogador.position.x -= velocidadeJogador;
    }
    if (estadoTeclas.direita && jogador.position.x < limiteArenaLateral - 1) {
        jogador.position.x += velocidadeJogador;
    }

    // ==========================================
    // FÍSICA DAS BOLAS (NOVIDADE)
    // ==========================================
    for (let i = 0; i < bolas.length; i++) {
        let bola = bolas[i];

        // 1. Aplicar gravidade (Puxar a velocidade Y para baixo)
        bola.velocidadeY -= gravidade;

        // 2. Mover a malha 3D de acordo com as velocidades
        bola.mesh.position.x += bola.velocidadeX;
        bola.mesh.position.y += bola.velocidadeY;

        // 3. Colisão com o Chão (Ressalto)
        // Se a posição Y da bola menos o seu raio tocar no topo do chão...
        if (bola.mesh.position.y - bola.raio <= topoChao) {
            // Corrigimos a posição para ela não "afundar" no chão
            bola.mesh.position.y = topoChao + bola.raio;
            // E forçamos um salto perfeito!
            bola.velocidadeY = forcaSalto; 
        }

        // 4. Colisão com as Paredes (Ressalto Lateral)
        const limiteBolaX = limiteArenaLateral - bola.raio;
        
        if (bola.mesh.position.x >= limiteBolaX) { // Bateu na direita
            bola.mesh.position.x = limiteBolaX;
            bola.velocidadeX *= -1; // Inverte a direção horizontal
        } 
        else if (bola.mesh.position.x <= -limiteBolaX) { // Bateu na esquerda
            bola.mesh.position.x = -limiteBolaX;
            bola.velocidadeX *= -1; // Inverte a direção horizontal
        }
    }

    // Desenhar a cena
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