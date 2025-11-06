import * as canvas from "../canvas.js"

var cores = [
	[0, 50],    // Marrom
	[160, 100], // Azul
	[300, 90],  // Rosa
	[325, 80],  // Vermelho
	[0, 0],     // Cinza
]

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

		let index = Math.floor(Math.random() * cores.length)

		this.hue = cores[index][0]
		this.saturation = cores[index][1]

		cores.splice(index, 1)
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
