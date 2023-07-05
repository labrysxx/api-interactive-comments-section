const express = require('express') // aqui estou iniciando o express
const router = express.Router() // aqui estou configurando a primeira parte da rota
const cors = require('cors') // aqui estou trazendo o pacote cors que permite consumir essa api no front-end

const conectaBancoDeDados = require('./bancoDeDados') //aqui eu estou ligando ao arquivo bancoDeDados
conectaBancoDeDados() //estou chamando a função que conecta o banco de dados

const Comment = require('./commentModel.js')

const app = express() // aqui estou iniciando o app
app.use(express.json())
app.use(cors())

const porta = 3333 // aqui estou criando a porta

//GET
async function mostraComentario(request, response) {
    try {
        const comentariosVindasDoBancoDeDados = await Comment.find()

        response.json(comentariosVindasDoBancoDeDados)
    } catch(erro) {
        console.log(erro)
    }
}

//POST /comments/:id
async function criaComentario(request, response) {
    const novoComentario = new Comment({
        author: {
            name: request.body.author.name,
            image: request.body.author.image
        },
        body: request.body.body,
        answers: request.body.answers.map(answer => ({
            author: {
                name: answer.author.name,
                image: answer.author.image
            },
            body: answer.body,
            date: answer.date,
            image: answer.image,
            votes: answer.votes
        })),
        date: request.body.date,
        meta: {
            votes: request.body.meta.votes
        }
    })

    try {
        const comentarioCriado = await novoComentario.save()
        response.status(201).json(comentarioCriado)
    } catch(erro) {
        console.log(erro)
    }
}

// POST /comments/:id/answers
async function respondeComentario(request, response) {
    const commentId = request.params.id;
    const { author, body } = request.body;

    try {
        const comentarioEncontrado = await Comment.findById(commentId);

        if (!comentarioEncontrado) {
            return response.status(404).json({ message: 'Comentário não encontrado.' });
        }

        const novaResposta = {
            author: {
                name: author.name,
                image: author.image,
            },
            body: body,
            date: new Date(),
            votes: 0,
            answeredBy: author.name
        };

        comentarioEncontrado.answers.push(novaResposta);
        const comentarioAtualizado = await comentarioEncontrado.save();

        response.status(201).json(comentarioAtualizado);
    } catch (erro) {
        console.log(erro);
        response.status(500).json({ message: 'Ocorreu um erro ao responder ao comentário.' });
    }
}

//PATCH
async function corrigeComentario(request, response) {
    try {
        const comentarioEncontrado = await Comment.findById(request.params.id);

        if (request.body.author.name) {
            comentarioEncontrado.author.name = request.body.author.name;
        }

        if (request.body.author.image) {
            comentarioEncontrado.author.image = request.body.author.image;
        }

        if (request.body.body) {
            comentarioEncontrado.body = request.body.body;
        }

        if (request.body.answers) {
            comentarioEncontrado.answers = request.body.answers.map(answer => ({
                author: {
                    name: answer.author.name,
                    image: answer.author.image
                },
                body: answer.body,
                date: answer.date,
                votes: answer.votes
            }));
        }

        if (request.body.meta.votes) {
            comentarioEncontrado.meta.votes = request.body.meta.votes;
        }

        const comentarioAtualizadoNoBancoDeDados = await comentarioEncontrado.save();

        response.json(comentarioAtualizadoNoBancoDeDados);
    } catch (erro) {
        console.log(erro);
    }
}

//DELETE
async function deletaComentario(request, response) {
    try {
        await Comment.findByIdAndDelete(request.params.id)
        response.json({ menssagem: 'Comentario deletado com sucesso!'})
    } catch(erro) {
        console.log(erro)
    }
}

//PORTA
function mostraPorta() {
    console.log(`Servidor criado e rodando na porta ${porta}`)
}

app.use(router.get('/comments', mostraComentario)) // configurei rota GET
app.use(router.post('/comments', criaComentario)) // configurei rota POST
app.post('/comments/:id/answers', respondeComentario);
app.use(router.patch('/comments/:id', corrigeComentario)) // configurei rota PATCH
app.use(router.delete('/comments/:id', deletaComentario)) // configurei rota DELETE
app.listen(porta, mostraPorta) // servidor ouvindo a porta