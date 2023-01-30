import express, { Request, Response } from 'express'
import cors from 'cors'
import { TVideosDB } from './types'
import { db } from './database/knex'
import { Videos } from './database/models/Videos'

const app = express()

app.use(cors())
app.use(express.json())

app.listen(3003, () => {
    console.log(`Servidor rodando na porta ${3003}`)
})

app.get("/ping", async (req: Request, res: Response) => {
    try {
        res.status(200).send({ message: "Pong!" })
    } catch (error) {
        console.log(error)

        if (req.statusCode === 200) {
            res.status(500)
        }

        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
})

app.get("/videos", async (req: Request, res: Response) => {
    try {
        const q = req.query.q

        let videosDB

        if (q) {
            const result: TVideosDB[] = await db("videos").where("title", "LIKE", `%${q}%`)
           videosDB = result
        } else {
            const result: TVideosDB[] = await db("videos")
            videosDB = result
        }

        const videos: Videos[] = videosDB.map((videoDB)=>new Videos(
            videoDB.id,
            videoDB.title,
            videoDB.duration,
            videoDB.created_at
        ))

        res.status(200).send(videos)
    } catch (error) {
        console.log(error)

        if (req.statusCode === 200) {
            res.status(500)
        }

        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
})

app.post("/videos", async (req: Request, res: Response) => {
    try {
        const { id, title, duration } = req.body

        if (typeof id !== "string") {
            res.status(400)
            throw new Error("'id' deve ser string")
        }

        if (typeof title !== "string") {
            res.status(400)
            throw new Error("'title' deve ser string")
        }

        if (typeof duration !== "string") {
            res.status(400)
            throw new Error("'duration' deve ser string")
        }


        const [videosDBExists ]: TVideosDB[] | undefined[] = await db("videos").where({ id })

        if (videosDBExists) {
            res.status(400)
            throw new Error("'id' já existe")
        }

        //instanciar os dados vindos do body

        const newVideo = new Videos(
            id,
            title,
            duration,
            new Date().toISOString()
        )
        //objeto simples para modelar as infos para o bando de dados

        const newVideoDB = {
            id: newVideo.getId(),
            title: newVideo.getTitle(),
            duration: newVideo.getDuration(),
            created_at: newVideo.getCreatedAt() 


        }

        await db("videos").insert(newVideoDB)

        // const [ userDB ]: TUserDB[] = await db("users").where({ id })

        res.status(201).send(newVideoDB)
    } catch (error) {
        console.log(error)

        if (req.statusCode === 200) {
            res.status(500)
        }

        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
})

app.put("/videos/:id", async (req: Request, res: Response) => {
    try {

        const idEditVideo = req.params.id
        const { id, title, duration } = req.body as TVideosDB

        if (!idEditVideo) {
            res.status(400)
            throw new Error("Id inválido");
        }
        const [video]: TVideosDB[] = await db("videos").where({ id: idEditVideo })
        if (!video) {
            res.status(404)
            throw new Error("Video não encontrado");
        }
       
        const newVideo = new Videos(
            id || idEditVideo,
            title || video.title,
            duration || video.duration,
            new Date().toISOString()
        )
        const newVideoDB: TVideosDB = {
            id: newVideo.getId(),
            title: newVideo.getTitle(),
            duration: newVideo.getDuration(),
            created_at: newVideo.getCreatedAt()

        }
        await db("videos").update(newVideoDB).where({ id: idEditVideo })
        res.status(200).send({
            messsage: "Video editado com sucesso",
            result: newVideo
        })

    } catch (error) {
        console.log(error)

        if (req.statusCode === 200) {
            res.status(500)
        }

        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }

})

app.delete("/videos/:id", async (req: Request, res: Response) => {
    try {
        const idToDelete = req.params.id

        if (idToDelete[0] !== "v") {
            res.status(400)
            throw new Error("id deve iniciar com a letra v")
        }

        const videoIdAlreadyExists: TVideosDB[] | undefined[] = await db("videos").where({ id: idToDelete })



        if (!videoIdAlreadyExists) {
            res.status(404)
            throw new Error("id não encontrado")
        }
        await db("videos").del().where({ id: idToDelete })

        res.status(200).send({ message: "Video deletada com sucesso" })

    } catch (error) {
        console.log(error)
        if (req.statusCode === 200) {
            res.status(500)
        }
        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
})
