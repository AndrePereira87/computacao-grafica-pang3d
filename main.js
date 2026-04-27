import * as THREE from 'three';

// =========================================================
// 1. CONFIGURAÇÃO BASE (Cena, Câmara e Renderizador)
// =========================================================
const cena = new THREE.Scene();

// Câmara de Perspetiva
const camara = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camara.position.set(0, 10, 20);

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
// 3. CARREGADOR DE TEXTURAS
// =========================================================
const carregadorTexturas = new THREE.TextureLoader();

// =========================================================
// 4. CONSTRUÇÃO DA ARENA (Chão e Paredes com Cores)
// =========================================================
// Cores sólidas em vez de texturas (para evitar problemas se os ficheiros não existem)
const materialParede = new THREE.MeshStandardMaterial({ color: 0x334455 });
const materialChao = new THREE.MeshStandardMaterial({ color: 0x223322 });

// --- Função para calcular os limites da arena adaptáveis ao ecrã ---
function calcularLimitesArena() {
    // Câmara está elevada e afastada
    const vFOV = (camara.fov * Math.PI) / 180; // FOV em radianos
    const distAltura = camara.position.z;
    const alturaVisivel = 2 * Math.tan(vFOV / 2) * distAltura;
    const larguraVisivel = alturaVisivel * camara.aspect;
    
    // Retorna limite assumindo que a câmara vê da zona -limite a +limite
    return larguraVisivel / 2 - 0.5; // -0.5 para margem
}

let limiteArena = calcularLimitesArena();
const alturaParedesArena = 20;
const profundidadeArena = 2;

const geometriaParede = new THREE.BoxGeometry(1, alturaParedesArena, profundidadeArena);

// Parede Esquerda
const paredeEsq = new THREE.Mesh(geometriaParede, materialParede);
paredeEsq.receiveShadow = true;
cena.add(paredeEsq);

// Parede Direita
const paredeDir = new THREE.Mesh(geometriaParede, materialParede);
paredeDir.receiveShadow = true;
cena.add(paredeDir);

// Chão
const chao = new THREE.Mesh(
    new THREE.BoxGeometry(limiteArena * 2, 1, profundidadeArena),
    materialChao
);
chao.position.set(0, 0, 0);
chao.receiveShadow = true; // O CHÃO RECEBE AS SOMBRAS
cena.add(chao);

// --- Função para atualizar a posição das paredes ---
function atualizarPosicaoParedes() {
    paredeEsq.position.set(-limiteArena, alturaParedesArena / 2, 0);
    paredeDir.position.set(limiteArena, alturaParedesArena / 2, 0);
}

// Atualiza as posições das paredes inicialmente
atualizarPosicaoParedes();

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
// 5.5. FUNDO 3D — CIDADE NOTURNA DETALHADA
// =========================================================

// Grupo que contém todos os objetos do fundo
const grupoCidade = new THREE.Group();

// --- Céu estrelado ---
const geometriaEstrelas = new THREE.BufferGeometry();
const verticesEstrelas = [];
for (let i = 0; i < 800; i++) {
    verticesEstrelas.push(
        (Math.random() - 0.5) * 200,   // X (estendido)
        8 + Math.random() * 25,        // Y (acima da arena)
        -25 + Math.random() * 10       // Z (atrás da arena)
    );
}
geometriaEstrelas.setAttribute('position', new THREE.Float32BufferAttribute(verticesEstrelas, 3));
const materialEstrelas = new THREE.PointsMaterial({ color: 0xffffff, size: 0.15 });
const estrelas = new THREE.Points(geometriaEstrelas, materialEstrelas);
grupoCidade.add(estrelas);

// --- Lua ---
const geometriaLua = new THREE.SphereGeometry(1.5, 32, 32);
const materialLua = new THREE.MeshBasicMaterial({ color: 0xfff5cc });
const lua = new THREE.Mesh(geometriaLua, materialLua);
lua.position.set(20, 22, -25);
grupoCidade.add(lua);

// Halo da lua
const geoHaloLua = new THREE.SphereGeometry(2.2, 32, 32);
const matHaloLua = new THREE.MeshBasicMaterial({ 
    color: 0xfff5cc, 
    transparent: true, 
    opacity: 0.15 
});
const haloLua = new THREE.Mesh(geoHaloLua, matHaloLua);
haloLua.position.copy(lua.position);
grupoCidade.add(haloLua);

// Luz direcional da lua (luz fria e suave)
const luzLua = new THREE.DirectionalLight(0x4466ff, 0.6);
luzLua.position.set(20, 22, -5);
cena.add(luzLua);

// --- ESTRADA COM TRÂNSITO ---
// Estrada (asfalto)
const geoEstrada = new THREE.PlaneGeometry(200, 8);
const matEstrada = new THREE.MeshStandardMaterial({ 
    color: 0x222222,
    roughness: 0.8,
    metalness: 0.1
});
const estrada = new THREE.Mesh(geoEstrada, matEstrada);
estrada.rotation.x = -Math.PI / 2;
estrada.position.set(0, 0.05, -6);
grupoCidade.add(estrada);

// Linhas brancas da estrada (faixa central)
const geoLinha = new THREE.PlaneGeometry(200, 0.4);
const matLinha = new THREE.MeshBasicMaterial({ color: 0xffff99 });
const linhaEstrada = new THREE.Mesh(geoLinha, matLinha);
linhaEstrada.rotation.x = -Math.PI / 2;
linhaEstrada.position.set(0, 0.06, -6);
grupoCidade.add(linhaEstrada);

// Array de carros
const carros = [];

// Função para criar um carro
function criarCarro(posX, velX, corCarro) {
    const grupo = new THREE.Group();

    // Corpo principal do carro
    const geoCarro = new THREE.BoxGeometry(2.2, 1.2, 0.8);
    const matCarro = new THREE.MeshStandardMaterial({ 
        color: corCarro,
        roughness: 0.5,
        metalness: 0.4
    });
    const corpo = new THREE.Mesh(geoCarro, matCarro);
    corpo.position.y = 0.4;
    corpo.castShadow = true;
    corpo.receiveShadow = true;
    grupo.add(corpo);

    // Teto/cabine do carro (mais pequeno)
    const geoTeto = new THREE.BoxGeometry(1.5, 0.8, 0.7);
    const teto = new THREE.Mesh(geoTeto, matCarro);
    teto.position.set(0, 1.3, 0);
    teto.castShadow = true;
    grupo.add(teto);

    // Janelas (vidro azul)
    const geoJanelaCarro = new THREE.PlaneGeometry(0.6, 0.5);
    const matJanelaCarro = new THREE.MeshBasicMaterial({ color: 0x4488ff, opacity: 0.5, transparent: true });
    
    // Janela frontal esquerda
    const janelaFS = new THREE.Mesh(geoJanelaCarro, matJanelaCarro);
    janelaFS.position.set(-0.5, 1.2, 0.35);
    grupo.add(janelaFS);
    
    // Janela frontal direita
    const janelaFD = new THREE.Mesh(geoJanelaCarro, matJanelaCarro);
    janelaFD.position.set(0.5, 1.2, 0.35);
    grupo.add(janelaFD);

    // 4 Rodas (cilindros pretos)
    const geoRoda = new THREE.CylinderGeometry(0.35, 0.35, 0.25, 16);
    const matRoda = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.8 });
    
    const posRodas = [
        { x: -0.7, z: 0.35 },  // Frente esquerda
        { x: 0.7, z: 0.35 },   // Frente direita
        { x: -0.7, z: -0.35 }, // Trás esquerda
        { x: 0.7, z: -0.35 }   // Trás direita
    ];

    posRodas.forEach(pos => {
        const roda = new THREE.Mesh(geoRoda, matRoda);
        roda.rotation.z = Math.PI / 2;
        roda.position.set(pos.x, 0.35, pos.z);
        roda.castShadow = true;
        grupo.add(roda);
    });

    // Faris (luzes dianteiras)
    const geoFar = new THREE.SphereGeometry(0.15, 8, 8);
    const matFar = new THREE.MeshBasicMaterial({ color: 0xffffaa });
    const farES = new THREE.Mesh(geoFar, matFar);
    farES.position.set(-0.5, 0.4, 0.42);
    grupo.add(farES);
    
    const farED = new THREE.Mesh(geoFar, matFar);
    farED.position.set(0.5, 0.4, 0.42);
    grupo.add(farED);

    // Luzes traseiras (vermelhas)
    const matLuzTraseira = new THREE.MeshBasicMaterial({ color: 0xff1111 });
    const luzTS = new THREE.Mesh(geoFar, matLuzTraseira);
    luzTS.position.set(-0.5, 0.4, -0.42);
    grupo.add(luzTS);
    
    const luzTD = new THREE.Mesh(geoFar, matLuzTraseira);
    luzTD.position.set(0.5, 0.4, -0.42);
    grupo.add(luzTD);

    grupo.position.set(posX, 0.5, -6);
    grupoCidade.add(grupo);

    carros.push({
        mesh: grupo,
        posX: posX,
        velX: velX,
        raio: 1.2
    });
}

// Criar carros iniciais com cores diferentes
criarCarro(-80, 0.15, 0xff3333);  // Carro vermelho
criarCarro(-50, 0.12, 0x3333ff);  // Carro azul
criarCarro(-20, 0.10, 0x33ff33);  // Carro verde
criarCarro(30, 0.14, 0xffff33);   // Carro amarelo
criarCarro(70, 0.11, 0xff33ff);   // Carro magenta

// --- Geração procedural dos prédios com mais detalhes ---
function criarPredio(posX, posZ, largura, altura, profundidade) {
    const grupo = new THREE.Group();

    // Corpo do prédio
    const geo = new THREE.BoxGeometry(largura, altura, profundidade);
    const mat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(
            0.05 + Math.random() * 0.08,   // R muito escuro
            0.10 + Math.random() * 0.08,   // G ligeiramente maior
            0.18 + Math.random() * 0.10    // B — tom azulado noturno
        ),
        roughness: 0.85,
        metalness: 0.1
    });
    const corpo = new THREE.Mesh(geo, mat);
    corpo.castShadow = true;
    corpo.receiveShadow = true;
    grupo.add(corpo);

    // Janelas iluminadas com mais densidade
    const colunas = Math.floor(largura / 0.5);
    const andares = Math.floor(altura / 0.8);

    for (let col = 0; col < colunas; col++) {
        for (let and = 0; and < andares; and++) {
            if (Math.random() > 0.25) { // 75% de janelas acesas
                const geoJanela = new THREE.PlaneGeometry(0.22, 0.28);

                // Cores variadas com mais tons
                const coresJanela = [0xffee88, 0xffd766, 0xaaccff, 0xffffff, 0xff9944, 0xffccaa, 0x88ddff];
                const corAleatoria = coresJanela[Math.floor(Math.random() * coresJanela.length)];

                const matJanela = new THREE.MeshBasicMaterial({ color: corAleatoria });
                const janela = new THREE.Mesh(geoJanela, matJanela);

                const offsetX = -largura / 2 + 0.35 + col * 0.5;
                const offsetY = -altura / 2 + 0.4 + and * 0.8;
                janela.position.set(offsetX, offsetY, profundidade / 2 + 0.02);
                grupo.add(janela);
            }
        }
    }

    // Antenas no topo
    if (Math.random() > 0.3) {
        // Antena principal
        const geoAntena = new THREE.CylinderGeometry(0.04, 0.04, altura * 0.4, 8);
        const matAntena = new THREE.MeshStandardMaterial({ color: 0x666666, metalness: 0.6 });
        const antena = new THREE.Mesh(geoAntena, matAntena);
        antena.position.set(0, altura / 2 + altura * 0.2, 0);
        grupo.add(antena);

        // Luz vermelha piscante no topo
        const geoLuzAntena = new THREE.SphereGeometry(0.1, 12, 12);
        const matLuzAntena = new THREE.MeshBasicMaterial({ color: 0xff2200 });
        const luzAntena = new THREE.Mesh(geoLuzAntena, matLuzAntena);
        luzAntena.position.set(0, altura / 2 + altura * 0.42, 0);
        luzAntena.userData.ehLuzAntena = true;
        grupo.add(luzAntena);

        // Possível antena secundária (diagonalizada)
        if (Math.random() > 0.6) {
            const geoAntena2 = new THREE.CylinderGeometry(0.02, 0.02, altura * 0.3, 6);
            const antena2 = new THREE.Mesh(geoAntena2, matAntena);
            antena2.position.set(largura * 0.3, altura / 2 + altura * 0.15, 0);
            antena2.rotation.z = Math.PI / 6;
            grupo.add(antena2);
        }
    }

    // Varandas/Sacadas em alguns prédios
    if (Math.random() > 0.6) {
        const numVarandas = Math.floor(Math.random() * 4) + 2;
        for (let v = 0; v < numVarandas; v++) {
            const geoVaranda = new THREE.BoxGeometry(largura * 0.15, 0.15, profundidade * 0.4);
            const matVaranda = new THREE.MeshStandardMaterial({ color: 0x333344 });
            const varanda = new THREE.Mesh(geoVaranda, matVaranda);
            varanda.position.set(
                (Math.random() - 0.5) * largura,
                Math.random() * altura - altura / 2,
                profundidade / 2 + 0.08
            );
            grupo.add(varanda);
        }
    }

    // Pequenas luzes decorativas ao redor
    if (Math.random() > 0.5) {
        for (let d = 0; d < 3; d++) {
            const geoLuzDecor = new THREE.SphereGeometry(0.06, 8, 8);
            const corLuz = Math.random() > 0.5 ? 0xffbb44 : 0xaaffff;
            const matLuzDecor = new THREE.MeshBasicMaterial({ color: corLuz });
            const luzDecor = new THREE.Mesh(geoLuzDecor, matLuzDecor);
            luzDecor.position.set(
                -largura / 2 - 0.15,
                Math.random() * altura - altura / 2,
                Math.random() * profundidade
            );
            grupo.add(luzDecor);
        }
    }

    grupo.position.set(posX, altura / 2, posZ);
    return grupo;
}

// --- Função para gerar cidade adaptável ao tamanho do ecrã ---
function gerarCidade() {
    // Limpar prédios antigos, mantendo céu, lua, estrada e carros
    grupoCidade.children = grupoCidade.children.filter(obj => 
        obj !== estrelas && 
        obj !== lua && 
        obj !== haloLua && 
        obj !== estrada && 
        obj !== linhaEstrada &&
        !carros.some(c => c.mesh === obj)
    );

    // Calcular número de prédios baseado no limiteArena
    const espacoEntrePredi = 2.5;
    const numPrediosLado = Math.ceil((limiteArena * 2) / espacoEntrePredi) + 3;

    // Gerar 3 camadas de prédios (profundidade)
    const camadasProfundidade = [
        { z: -22, escala: 0.7, altura: (min, max) => min + Math.random() * (max - min) * 0.6 },
        { z: -16, escala: 0.85, altura: (min, max) => min + Math.random() * (max - min) * 0.8 },
        { z: -10, escala: 1.0, altura: (min, max) => min + Math.random() * (max - min) }
    ];

    camadasProfundidade.forEach(camada => {
        for (let i = -numPrediosLado; i <= numPrediosLado; i++) {
            // Pular alguns prédios para variedade
            if (Math.random() > 0.3) {
                const largura = (1.2 + Math.random() * 0.8) * camada.escala;
                const altura = camada.altura(5, 14);
                const profund = (1.2 + Math.random() * 0.8) * camada.escala;
                const posX = i * espacoEntrePredi + (Math.random() - 0.5) * 0.6;
                const posZ = camada.z + (Math.random() - 0.5) * 2;
                
                const predio = criarPredio(posX, posZ, largura, altura, profund);
                grupoCidade.add(predio);
            }
        }
    });
}

// Gerar cidade inicial
gerarCidade();
cena.add(grupoCidade);

// =========================================================
// 6. SISTEMA DE BOLAS E FÍSICA (Semana 3)
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
// 7. LÓGICA DE INTERAÇÃO (Teclado)
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
// 8. VARIÁVEIS PARA ANIMAÇÃO DO FUNDO
// =========================================================
let tempoCidade = 0;

// Função para animar o fundo (luzes piscantes e paralaxe)
function animarCidade() {
    tempoCidade += 0.02;

    // Piscar das luzes de antena
    grupoCidade.traverse((objeto) => {
        if (objeto.userData.ehLuzAntena) {
            const visivel = Math.sin(tempoCidade * 3 + objeto.position.x) > 0;
            objeto.material.color.set(visivel ? 0xff2200 : 0x330000);
        }
    });

    // Animar carros na estrada
    carros.forEach(carro => {
        carro.posX += carro.velX;

        // Reciclar carro quando sai do ecrã
        if (carro.posX > 100) {
            carro.posX = -100;
        }
        if (carro.posX < -100) {
            carro.posX = 100;
        }

        carro.mesh.position.x = carro.posX;
    });

    // Paralaxe suave — a cidade move-se ligeiramente com o jogador
    grupoCidade.position.x = jogador.position.x * -0.03;
}

// =========================================================
// 9. LOOP DE ANIMAÇÃO PRINCIPAL
// =========================================================
const velocidadeJogador = 0.2;
const topoChao = 0.5; 

function animar() {
    requestAnimationFrame(animar);

    // Animar o fundo (luzes da cidade e paralaxe)
    animarCidade();

    // Movimento do jogador
    if (estadoTeclas.esquerda && jogador.position.x > -limiteArena + 1) {
        jogador.position.x -= velocidadeJogador;
    }
    if (estadoTeclas.direita && jogador.position.x < limiteArena - 1) {
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
        const limiteBolaX = limiteArena - bola.raio;
        
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
// 10. AJUSTAR O ECRÃ (Responsividade)
// =========================================================
window.addEventListener('resize', () => {
    camara.aspect = window.innerWidth / window.innerHeight;
    camara.updateProjectionMatrix();
    renderizador.setSize(window.innerWidth, window.innerHeight);

    // Recalcular limites da arena adaptáveis ao novo tamanho do ecrã
    limiteArena = calcularLimitesArena();
    
    // Atualizar geometria do chão
    cena.remove(chao);
    chao.geometry.dispose();
    chao.geometry = new THREE.BoxGeometry(limiteArena * 2, 1, profundidadeArena);
    cena.add(chao);
    
    // Reposicionar as paredes
    atualizarPosicaoParedes();

    // Regenerar cidade com novo tamanho
    gerarCidade();
});

