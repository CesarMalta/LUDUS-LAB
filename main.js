import * as config from "./config.js"
import * as canvas from "./canvas.js"
import * as perguntas from "./perguntas.js"

import {SpriteRepetido} from "./sprite-repetido.js"
import {Veiculo} from "./veiculo.js"
import {Bot} from "./bot.js"

const pistas = []
const veiculos = []
const bots = []

// Enum para estado de jogo
const ESTADO_DE_JOGO = Object.freeze({
	JOGO_RODANDO:  0,
	PLAYER_GANHOU: 1,
	PLAYER_PERDEU: 2
})
var jogo_estado = ESTADO_DE_JOGO.JOGO_RODANDO

// Criar pistas e veículos
for (var i = 0; i < 4; i++){
	const pista = new SpriteRepetido({
		posicao: {
			x: 0,
			y: config.PISTA_OFFSET + i * config.PISTA_ALTURA,
		},
		imagem: "./pista.png",
	})
	const veiculo = new Veiculo({
		posicao: {
			x: canvas.width/2 - 40,
			y: config.PISTA_OFFSET + config.VEICULO_OFFSET + i * config.VEICULO_ESPACAMENTO,
		},
		imagem: "./carro.png",
	})
	if (i != 3){ // Não é o player, player é o último
		veiculo.cor_random()
	}
	pistas.push(pista)
	veiculos.push(veiculo)
}

// Criar bots
for (var i = 0; i < 3; i++){
	const bot = new Bot({
		veiculo: veiculos[i],
		multiplicador_vel: 0.75,
		chance_de_acerto: 0.85,
		tempo_de_resposta: 2,
		variacao_tempo: 0.5,
	})
	bots.push(bot)
}

// Player é o último veículo
const veiculo_player = veiculos[3];

// Background
const background = new SpriteRepetido({
	posicao: {
		x: 0,
		y: -100,
	},
	imagem: "./background.png",
})

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

// Atualiza todos os bots
function rodar_bots()
{
	bots.forEach((bot, i) => {
		bot.atualizar()
	})
}

// Apertou no botão de resposta correto
document.addEventListener("RespostaCorreta", function(){
	if (jogo_estado != 0){
		// Jogo já acabou
		return
	}

	veiculo_player.velocidade += config.VELOCIDADE_GANHA_POR_ACERTO
	console.log(veiculo_player.velocidade)
	perguntas.gerar_pergunta()
})

// Apertou no botão de resposta errado
document.addEventListener("RespostaErrada", function(){
	if (jogo_estado != 0){
		// Jogo já acabou
		return
	}

	veiculo_player.velocidade -= config.VELOCIDADE_PERDIDA_POR_ERRO
	console.log(veiculo_player.velocidade)
	perguntas.gerar_pergunta()
})


// Game loop
var ultimo_tempo
function animar(tempo)
{
	window.requestAnimationFrame(animar)

	canvas.limpar_canvas()

	if (!ultimo_tempo){
		ultimo_tempo = tempo
	}

	var delta_time = tempo - ultimo_tempo

	background.desenhar()

	pistas.forEach((pista, i) => {
		pista.desenhar()
	});

	bots.forEach((bot, i) => {
		bot.atualizar()
	});

	veiculo_player.atualizar()

	checar_fim()
	switch (jogo_estado){
		case ESTADO_DE_JOGO.PLAYER_GANHOU:
			canvas.desenhar_texto("vc ganhou", canvas.width/2, canvas.height/2)
			break
		case ESTADO_DE_JOGO.PLAYER_PERDEU:
			canvas.desenhar_texto("vc perdeu", canvas.width/2, canvas.height/2)
			break
		default:
			perguntas.rodar_timer(delta_time)
			break
	}

	var dist = Math.min(Math.max(veiculo_player.posicao.x, 0), config.TAMANHO_DA_PISTA - canvas.canvas.width/2)
	canvas.centralizar_em(dist)

	ultimo_tempo = tempo
}

setTimeout(() => {
	perguntas.gerar_pergunta()
	window.requestAnimationFrame(animar)
}, 100);
