import * as canvas from "./canvas.js"

class Sprite {
	constructor({posicao, imagem, largura, altura})
	{
		this.posicao = posicao

		this.imagem = new Image()
		this.imagem.src = imagem

		this.possui_cor = false
		this.hue = -1
		this.saturation = -1
	}

	// Cor aleatoria na hora de desenhar
	cor_random()
	{
		this.possui_cor = true

		this.hue = Math.floor(Math.random() * 361)
		this.saturation = Math.floor(Math.random() * 101)
	}

	// Desenha o sprite na tela
	desenhar()
	{
		if (this.possui_cor == true){ // Cor foi gerada
			var original_filter = canvas.ctx.filter

			var hue_rotate = "hue-rotate(" + this.hue + "deg)"
			var saturate = "saturate(" + this.saturation + "%)"

			canvas.ctx.filter = hue_rotate + " " + saturate
			canvas.ctx.drawImage(this.imagem, this.posicao.x, this.posicao.y)
			canvas.ctx.filter = original_filter
		} else { // Cor padrão
			canvas.ctx.drawImage(this.imagem, this.posicao.x, this.posicao.y)
		}
	}
}

export {Sprite}
