const SONS = Object.freeze({
	ACERTO: "assets/som/acerto.wav",
	ERRO: "assets/som/erro.wav",
	SEMAFORO_CLICK: "assets/som/semaforo_click.wav",
	SEMAFORO_GO: "assets/som/semaforo_go.wav",
})

function tocar(som)
{
	let audio = new Audio(som)
	audio.play();
}

export {SONS, tocar}
