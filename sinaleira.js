import * as config from "./config.js"
import {Sprite} from "./sprite.js"

// Enum sinaleira
const ESTADO_SINALEIRA = Object.freeze({
	VERMELHO: 0,
	AMARELO: 1,
	VERDE: 2
})

class Sinaleira {
	constructor({posicao, imagem_vermelho, imagem_amarelo, imagem_verde})
	{
		this.sprite_vermelho = new Sprite({
			posicao: posicao,
			imagem: imagem_vermelho,
		})
		this.sprite_amarelo = new Sprite({
			posicao: posicao,
			imagem: imagem_amarelo,
		})
		this.sprite_verde = new Sprite({
			posicao: posicao,
			imagem: imagem_verde,
		})

		this.estado = ESTADO_SINALEIRA.VERMELHO
	}

	// Muda a cor da sinaleira para a proxima
	#prox_estado()
	{
		if (this.estado == ESTADO_SINALEIRA.VERMELHO){
			this.estado = ESTADO_SINALEIRA.AMARELO
		} else {
			this.estado = ESTADO_SINALEIRA.VERDE
			document.dispatchEvent(new Event("SinaleiraVerde"))
		}
	}

	iniciar_contagem()
	{
		this.tempo_de_contagem = new Date().getTime()
	}

	// Desenha a imagem correta
	desenhar()
	{
		switch(this.estado){
			case ESTADO_SINALEIRA.VERMELHO:
				this.sprite_vermelho.desenhar()
				break
			case ESTADO_SINALEIRA.AMARELO:
				this.sprite_amarelo.desenhar()
				break
			case ESTADO_SINALEIRA.VERDE:
				this.sprite_verde.desenhar()
				break
		}
	}

	// Atualiza a cor e desenha o sprite correto
	atualizar()
	{
		var tempo_agora = new Date().getTime()

		if (((tempo_agora - this.tempo_de_contagem)/1000 >= config.SINALEIRA_TEMPO_MUDAR_COR) &&
			(this.estado != ESTADO_SINALEIRA.VERDE)) {
			this.#prox_estado()
			this.tempo_de_contagem = tempo_agora
		}

		this.desenhar()
	}
}

export {Sinaleira}
