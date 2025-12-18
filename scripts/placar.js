import * as config from "./config.js"

var mapas_desbloqueados = {
	"corredor": true,
	"bicicleta": false,
	"carro": false,
	"barco": false,
	"aviao": false,
}

// Formato:
// placar = [
//  {nome: "PLAYER", pontuacao: PONTUACAO, cenario: "CENARIO"},
// ]
var placar = []

var nome = "Player"

// Carrega os mapas desbloqueados
function carregar_mapas_desbloqueados()
{
	const string_mapas_salvos = localStorage.getItem("MapasDesbloqueados")
	if (string_mapas_salvos != null){
		mapas_desbloqueados = JSON.parse(string_mapas_salvos)
	}
}

// Carrega os placares salvos
function carregar_placar()
{
	const string_placar_salvo = localStorage.getItem("Placar")
	if (string_placar_salvo != null){
		placar = JSON.parse(string_placar_salvo)
		console.log(placar)
	}
}

// Carrega o nome do player
function carregar_nome()
{
	const nome_salvo = localStorage.getItem("Nome")
	if (nome_salvo != null){
		nome = nome_salvo
	}
}

function carregar_saves()
{
	carregar_mapas_desbloqueados()
	carregar_placar()
	carregar_nome()
}

// Salva os mapas desbloqueados
function salvar_mapas_desbloqueados()
{
	const str = JSON.stringify(mapas_desbloqueados)
	localStorage.setItem("MapasDesbloqueados", str)
}

// Salva o placar
function salvar_placar()
{
	const str = JSON.stringify(placar)
	localStorage.setItem("Placar", str)
}

// Salva o nome do player
function salvar_nome()
{
	localStorage.setItem("Nome", nome)
}

// Tenta adicionar ao placar, assume que o placar já foi carregado
function adicionar_ao_placar(pontuacao, nome_cenario)
{
	// Player possui mais entradas do que o permitido, remover os excedentes
	if (placar.length > config.HISTORIA_MAX_PLACAR){
		const excedentes = placar.length - config.HISTORIA_MAX_PLACAR
		placar.splice(-excedentes, excedentes)
	}

	// Placar está lotado?
	if (placar.length == config.HISTORIA_MAX_PLACAR){
		// Placar está ordenado pela pontuação. Se a pontuação atual for maior do que a ultima posição do placar, é possível remover ela
		if (pontuacao > placar[placar.length - 1].pontuacao){
			placar.pop()
			placar.push({nome: nome, pontuacao: pontuacao, cenario: nome_cenario})
		}
	} else {
		placar.push({nome: nome, pontuacao: pontuacao, cenario: nome_cenario})
	}

	// Ordenar por pontuação e salvar
	placar.sort((a, b) => b.pontuacao - a.pontuacao)
	salvar_placar()
}

function desbloquear_mapa(nome_cenario)
{
	if (Object.hasOwn(mapas_desbloqueados, nome_cenario)){
		mapas_desbloqueados[nome_cenario] = true
	}
	salvar_mapas_desbloqueados()
}

export {carregar_saves, adicionar_ao_placar, desbloquear_mapa}
export {mapas_desbloqueados, placar, nome}