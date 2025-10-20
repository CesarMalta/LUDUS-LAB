import * as config from "./config.js"

const pergunta = document.getElementById("pergunta")

const timer = document.getElementById("timer")
var tempo_restante = 0

const resposta1 = document.getElementById("resposta-1")
const resposta2 = document.getElementById("resposta-2")
const resposta3 = document.getElementById("resposta-3")
const resposta4 = document.getElementById("resposta-4")

var botao_correto

// Clique nos botões de resposta
function botao_clicado(evt)
{
	var botao = evt.currentTarget
	if (botao.isSameNode(botao_correto)){
		// Botao correto clicado
		document.dispatchEvent(new Event("RespostaCorreta"))
	} else {
		// Botao incorreto clicado
		document.dispatchEvent(new Event("RespostaErrada"))
	}
}

resposta1.addEventListener("click", botao_clicado)
resposta2.addEventListener("click", botao_clicado)
resposta3.addEventListener("click", botao_clicado)
resposta4.addEventListener("click", botao_clicado)
////////////////////////////////

// Atualiza o timer da pergunta para o player
function rodar_timer(delta_time)
{
	tempo_restante = tempo_restante - (delta_time / 1000)

	if (tempo_restante <= 0){
		// Acabou o tempo
		gerar_pergunta()
		// Tratar como resposta errada
		document.dispatchEvent(new Event("RespostaErrada"))
	} else {
		// Ainda não acabou o tempo
		timer.textContent = Math.ceil(tempo_restante).toString()
	}
}

// Gera uma nova pergunta para o player
function gerar_pergunta()
{
	tempo_restante = config.TEMPO_DE_RESPOSTA

	var max

	// Gerar valores ( A + B )
	max = 20;
	var random_a = Math.floor(Math.random() * max)
	var random_b = Math.floor(Math.random() * max)

	var resposta_correta = random_a + random_b

	// Qual botão será o correto
	max = 4;
	var num_botao_resposta = Math.floor(Math.random() * max) + 1

	// Modificar os botões
	for (var i = 1; i <= 4; i++){
		var esse_botao = document.getElementById("resposta-" + i.toString());

		if (i != num_botao_resposta){
			// Variação das respostas incorretas
			max = 40;
			var random_var
			do{
				random_var = Math.floor(Math.random() * max) - max/2
			}while(random_var == 0)

			esse_botao.textContent = (resposta_correta + random_var).toString()
		} else {
			botao_correto = esse_botao
			esse_botao.textContent = resposta_correta.toString()
		}
	}

	pergunta.textContent = random_a.toString() + " + " + random_b.toString()
}

export {gerar_pergunta, rodar_timer}
