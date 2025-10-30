import * as config from "./config.js"
import * as canvas from "./canvas.js"
import * as perguntas from "./perguntas.js"

import {Sprite} from "./sprite.js"
import {SpriteRepetido} from "./sprite-repetido.js"
import {Veiculo} from "./veiculo.js"
import {Bot} from "./bot.js"
import {Sinaleira} from "./sinaleira.js"

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
			x: 0,
			y: config.PISTA_OFFSET + config.VEICULO_OFFSET + i * config.VEICULO_ESPACAMENTO,
		},
		imagem: "./carro.png",
	})
	veiculo.cor_random()

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
var player_score = 0

// Seta que indica o carro do player
const seta_player = new Sprite({
	posicao: {
		x: veiculo_player.posicao.x + 100,
		y: veiculo_player.posicao.y
	},
	imagem: "./seta.png",
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

	veiculo_player.velocidade -= config.VELOCIDADE_PERDIDA_POR_ERRO
	perguntas.gerar_pergunta()
})

// Sinaleira (contagem inicial)
const sinaleira = new Sinaleira({
	posicao: {
		x: canvas.width/2 - 50,
		y: canvas.height/2 - 120
	},
	imagem_vermelho: "./sinaleira_vermelho.png",
	imagem_amarelo: "./sinaleira_amarelo.png",
	imagem_verde: "./sinaleira_verde.png",
})

// Atualizar tamanho da sinaleira e camera no redimensionamento da tela
window.addEventListener("resize", function(){
	console.log(canvas.pos_x)
	centralizar_no_player()
	sinaleira.posicao = {
		x: canvas.width/2 - 50 + canvas.pos_x,
		y: canvas.height/2 - 180
	}
})

// Sinal verde, iniciar jogo
document.addEventListener("SinaleiraVerde", function(){
	setTimeout(() => {
		jogo_estado = ESTADO_DE_JOGO.JOGO_RODANDO
		perguntas.gerar_pergunta()
	}, config.SINALEIRA_FIM_DELAY);
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

	if (jogo_estado == ESTADO_DE_JOGO.JOGO_COMECANDO){
		// Jogo ainda está começando, não rodar lógica
		veiculos.forEach((veic, i) => {
			veic.atualizar()
		});

		seta_player.desenhar()

		sinaleira.atualizar()
		return
	}

	// Rodar lógica
	if (!ultimo_tempo){
		ultimo_tempo = tempo
	}

	var delta_time = tempo - ultimo_tempo


	bots.forEach((bot, i) => {
		bot.atualizar()
	});


	veiculo_player.atualizar()

	checar_fim()
	switch (jogo_estado){
		case ESTADO_DE_JOGO.PLAYER_GANHOU:
			canvas.desenhar_texto("vc ganhou", 50, canvas.width/2, canvas.height/2)
			break
		case ESTADO_DE_JOGO.PLAYER_PERDEU:
			canvas.desenhar_texto("vc perdeu", 50, canvas.width/2, canvas.height/2)
			break
		default:
			perguntas.rodar_timer(delta_time)
			break
	}


	centralizar_no_player()
	ultimo_tempo = tempo
}

setTimeout(() => {
	sinaleira.iniciar_contagem()
	centralizar_no_player()
	atualizar_pontuacao()
	window.requestAnimationFrame(animar)
}, 100);
