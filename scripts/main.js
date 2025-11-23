import * as config from "./config.js"
import * as canvas from "./canvas.js"
import * as perguntas from "./perguntas.js"
import * as audio from "./audio.js"
import * as utils from "./utils.js"

import {Sprite} from "./classes/sprite.js"
import {SpriteRepetido} from "./classes/sprite-repetido.js"
import {Veiculo} from "./classes/veiculo.js"
import {Bot} from "./classes/bot.js"
import {Sinaleira} from "./classes/sinaleira.js"

const pistas = []
const veiculos = []
const bots = []

const pontuacao = document.getElementById("pontuacao")

// Enum para estado de jogo
const ESTADO_DE_JOGO = Object.freeze({
	JOGO_COMECANDO: 0,
	JOGO_RODANDO:   1,
	PLAYER_GANHOU:  2,
	PLAYER_PERDEU:  3
})
var jogo_estado = ESTADO_DE_JOGO.JOGO_COMECANDO

const cenario = document.getElementById("script-main").dataset.cenario

// Criar pistas, veiculos e bots
utils.carregar_cenario(cenario)
utils.criar_pistas(pistas)
utils.criar_veiculos(veiculos)
utils.criar_bots(bots, veiculos)

// Criar bandeira de fim
const bandeira = new Sprite({
	posicao: {
		x: config.TAMANHO_DA_PISTA,
		y: 0,
	},
	imagem: "assets/elementos/bandeira.png",
})


// Player é o último veículo
const veiculo_player = veiculos[3];
var player_score = 0

// Seta que indica a pista do player
const seta_player = new Sprite({
	posicao: {
		x: -10,
		y: veiculo_player.posicao.y
	},
	imagem: "assets/seta.png",
})

// --- IMAGENS FINAIS (Carregadas sem posição fixa) ---
const img_ganhou = new Sprite({
	posicao: { x: 0, y: 0 },
	imagem: "assets/elementos/ganhou.png"
})

const img_perdeu = new Sprite({
	posicao: { x: 0, y: 0 },
	imagem: "assets/elementos/perdeu.png"
})
// ---------------------------------------------------

// Muda a variavel jogo_estado
function checar_fim()
{
	if (jogo_estado != ESTADO_DE_JOGO.JOGO_RODANDO){
		return
	}

	// Checar player
	if (veiculo_player.posicao.x >= config.TAMANHO_DA_PISTA){
		jogo_estado = ESTADO_DE_JOGO.PLAYER_GANHOU
	}

	// Checar resto
	for (var i = 0; i < 3; i++){
		if (veiculos[i].posicao.x >= config.TAMANHO_DA_PISTA){
			jogo_estado = ESTADO_DE_JOGO.PLAYER_PERDEU
		}

	}
}

// Centraliza camera no player
function centralizar_no_player()
{
	var dist = Math.min(Math.max(veiculo_player.posicao.x, 0), config.TAMANHO_DA_PISTA - canvas.canvas.width/2) + veiculo_player.sprite.imagem.naturalWidth / 2
	canvas.centralizar_em(dist)
}

// Atualiza o texto de pontuação
function atualizar_pontuacao()
{
	pontuacao.textContent = String(player_score).padStart(7, "0")
}

// Apertou no botão de resposta correto
document.addEventListener("RespostaCorreta", function(evt){
	if (jogo_estado != ESTADO_DE_JOGO.JOGO_RODANDO){
		// Jogo já acabou / não começou
		return
	}

	audio.tocar(audio.SONS.ACERTO)

	player_score += Math.ceil(evt.detail.segundos_restantes) * Math.pow(1.25, veiculo_player.velocidade)
	player_score *= config.MULTIPLICADOR_SCORE
	player_score = Math.ceil(player_score)
	atualizar_pontuacao()

	veiculo_player.velocidade += config.VELOCIDADE_GANHA_POR_ACERTO
	perguntas.gerar_pergunta()
})

// Apertou no botão de resposta errado
document.addEventListener("RespostaErrada", function(){
	if (jogo_estado != ESTADO_DE_JOGO.JOGO_RODANDO){
		// Jogo já acabou / não começou
		return
	}

	audio.tocar(audio.SONS.ERRO)

	veiculo_player.velocidade -= config.VELOCIDADE_PERDIDA_POR_ERRO
	perguntas.gerar_pergunta()
})

// Sinaleira (contagem inicial)
const sinaleira = new Sinaleira({
	posicao: {
		x: canvas.width/2 - 35,
		y: canvas.height/2 - 35,
	},
	imagem_off: "assets/elementos/led_off.png",
	imagem_on: "assets/elementos/led_on.png",
})

// Atualizar tamanho da sinaleira e camera no redimensionamento da tela
window.addEventListener("resize", function(){
	centralizar_no_player()
	sinaleira.posicao = {
		x: canvas.width/2 - 35,
		y: canvas.height/2 - 35
	}
})

// Sinal verde, iniciar jogo
document.addEventListener("SinaleiraTerminado", function(){
	audio.tocar(audio.SONS.SEMAFORO_GO)

	setTimeout(() => {
		jogo_estado = ESTADO_DE_JOGO.JOGO_RODANDO
		perguntas.gerar_pergunta()
	}, config.SINALEIRA_FIM_DELAY);
})

// Led ativado
document.addEventListener("SinaleiraClick", function(){
	audio.tocar(audio.SONS.SEMAFORO_CLICK)
})


// Game loop
var ultimo_tempo
function animar(tempo)
{
	window.requestAnimationFrame(animar)

	canvas.limpar_canvas()

	pistas.forEach((pista, i) => {
		pista.desenhar()
	});

	bandeira.desenhar()

	seta_player.posicao = {x: canvas.pos_x - 10, y: seta_player.posicao.y}
	seta_player.desenhar()

	if (jogo_estado == ESTADO_DE_JOGO.JOGO_COMECANDO){
		// Jogo ainda está começando, não rodar lógica
		veiculos.forEach((veic, i) => {
			veic.atualizar()
		});

		// Fundo
		canvas.desenhar_rect(
			{r: 100, g: 100, b: 100, a: 1},
			canvas.width / 2 - 125,
			canvas.height / 2 - 50,
			250, 100
		)
		sinaleira.atualizar()
		return
	}

	// Rodar lógica normal
	if (!ultimo_tempo){
		ultimo_tempo = tempo
	}
	var delta_time = tempo - ultimo_tempo

	bots.forEach((bot, i) => {
		bot.atualizar()
	});

	veiculo_player.atualizar()
	checar_fim()

	// === LÓGICA DE FINAL DE JOGO (SEM DISTORÇÃO) ===
	if (jogo_estado == ESTADO_DE_JOGO.PLAYER_GANHOU || jogo_estado == ESTADO_DE_JOGO.PLAYER_PERDEU) {
		
		const centroX = canvas.pos_x + (canvas.width / 2);
		const centroY = canvas.height / 2;

		// 1. Seleciona a imagem correta
		let img_resultado = (jogo_estado == ESTADO_DE_JOGO.PLAYER_GANHOU) ? img_ganhou : img_perdeu;

		// 2. Calcula a PROPORÇÃO ORIGINAL (Ratio)
		// Evita divisão por zero se a imagem ainda não carregou
		let ratio = 1;
		if (img_resultado.imagem.naturalWidth > 0) {
			ratio = img_resultado.imagem.naturalHeight / img_resultado.imagem.naturalWidth;
		}

		// 3. Define Largura (50% da tela ou máx 600px)
		let larguraImg = Math.min(canvas.width * 0.3, 400); 
		
		// 4. Define Altura baseada na proporção (Assim não distorce!)
		let alturaImg = larguraImg * ratio;

		img_resultado.largura = larguraImg;
		img_resultado.altura = alturaImg;

		// 5. Centraliza
		img_resultado.posicao.x = centroX - (larguraImg / 2);
		img_resultado.posicao.y = centroY - (alturaImg / 2);
		
		img_resultado.desenhar();

	} else {
		// Jogo rodando: Timer de perguntas
		perguntas.rodar_timer(delta_time)
	}
	// ===============================================

	centralizar_no_player()
	ultimo_tempo = tempo
}

setTimeout(() => {
	perguntas.carregar_perguntas("json/perguntas.json")
	audio.tocar(audio.SONS.SEMAFORO_CLICK)
	sinaleira.iniciar_contagem()
	centralizar_no_player()
	atualizar_pontuacao()
	window.requestAnimationFrame(animar)
}, 1000);