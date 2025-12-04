import * as saves from "./storage.js"

const div_placar = document.getElementById("placar")

saves.carregar_saves()

saves.placar.forEach(entrada => {
	const nova_entrada = document.createElement("div")
	nova_entrada.classList.add("placar-entrada")
	div_placar.appendChild(nova_entrada)

	const nome = document.createElement("p")
	nome.classList.add("nome")
	nome.innerText = entrada.nome
	nova_entrada.appendChild(nome)

	const pontuacao = document.createElement("p")
	pontuacao.classList.add("pontuacao")
	pontuacao.innerText = entrada.pontuacao.toString()
	nova_entrada.appendChild(pontuacao)

	const cenario = document.createElement("p")
	cenario.classList.add("cenario")
	cenario.innerText = entrada.cenario
	nova_entrada.appendChild(cenario)
})
