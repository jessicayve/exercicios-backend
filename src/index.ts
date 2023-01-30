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
            const result: TVideosDB[] = await db("videos").where("name", "LIKE", `%${q}%`)
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
            throw new Error("'name' deve ser string")
        }

        if (typeof duration !== "string") {
            res.status(400)
            throw new Error("'email' deve ser string")
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
        const idToEdit = req.params.id

      

        const newId = req.body.id
        const newTitle = req.body.title
        const newDuration = req.body.duration
        const newCreatedAt = req.body.created_at

        if (newId !== undefined) {

            if (typeof newId !== "string") {
                res.status(400)
                throw new Error("id deve ser uma string")
            }

            if (newId.length < 4) {
                res.status(400)
                throw new Error("id deve possuir pelo menos 4 caracteres")
            }
        }

        if (newTitle !== undefined) {
            if (typeof newTitle !== "string") {
                res.status(400)
                throw new Error("title deve ser uma string")
            }

            if (newTitle.length < 4) {
                res.status(400)
                throw new Error("title deve possuir pelo menos dois caracteres")
            }
        }

        if (newDuration!== undefined) {
            if (typeof newDuration !== "string") {
                res.status(400)
                throw new Error("Duration deve ser um number")
            }
        }

        if (newCreatedAt!== undefined) {
            if (typeof newCreatedAt !== "string") {
                res.status(400)
                throw new Error("Image url deve ser uma string")
            }
        }
       

        const [videos]: TVideosDB[] | undefined = await db("videos").where({ id: idToEdit })

        if (!videos) {
            res.status(404)
            throw new Error("id não encontrado")
        }

        const newVideo: TVideosDB = {
            id: newId || videos.id,
            title: newTitle || videos.title,
            duration: newDuration|| videos.duration,
            created_at: newCreatedAt || videos.created_at

        }

        await db("videos").update(newVideo).where({ id: idToEdit })

        res.status(200).send({ message: "Video editado com sucesso", videos: newVideo})


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
