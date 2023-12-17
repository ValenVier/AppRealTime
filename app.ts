/* server side events */
//el servidor deja una conexion abierta en la que cada vez que tenga algo que decir se lo manda al cliente
//no es socket, sockets son bidireccional, pero server side events unidireccionales servidor -> cliente

import { Hono } from "https://deno.land/x/hono@v3.11.6/mod.ts"
import { serveStatic } from "https://deno.land/x/hono@v3.11.6/middleware.ts"
import { streamSSE } from "https://deno.land/x/hono@v3.11.6/helper/streaming/index.ts"

const db = await Deno.openKv()
const app = new Hono()
let i = 0

interface LastVisit {
    country: string
    city: string
    flag: string
}

app.get('/', serveStatic({ path: './index.html' }))

/* app.post('/counter', async (c) => {
    await db
        .atomic()
        .sum(["visits"], 1n)
        .commit()
    return c.json({ message: 'ok' })
}) */

app.post('/visit', async (c) => {
    const {city, flag, country} = await c.req.json<LastVisit>()
    await db
        .atomic()
        .set(["lastVisit"],{
            country, city, flag
        })
        .sum(["visits"], 1n)
        .commit()
    return c.json({ message: 'ok' })
})

/* app.get('/counter', (c) => {
    return streamSSE(c, async (stream) => {
        //const visitKey = ["visits"]
        //const listOfKeysToWatch = [visitKey]
        //const watcher =db.watch(listOfKeysToWatch)  //la siguiente línea hace lo mismo que lo comentado
        
        const watcher = db.watch([["visits"]])

        for await (const entry of watcher) { //es asíncrono, no sabemos cuando alguien va a crear una nueva visita
            const { value } = entry[0]
            if(value !== null){
                await stream.writeSSE({ data: value!.toString(), event: 'update', id: String(i++)})
            }
        }
        while (true) {
            //ponemos la hora cada segundo
            //const message = `Son las ${new Date().toLocaleTimeString()}`
            //await stream.writeSSE({data: message, event: 'update', id: String(i++)})
            //await stream.sleep(1000) 

            //ponemos el número de visita cada segundo
            const { value } = await db.get(["visits"])
            await stream.writeSSE({ data: Number(value).toString(), event: 'update', id: String(i++) })
            await stream.sleep(1000)
        }
    })
}) */

app.get('/visit', (c) => {
    return streamSSE(c, async (stream) => {
        
        const watcher = db.watch([["lastVisit"]])

        for await (const entry of watcher) { //es asíncrono
            const { value } = entry[0]
            if(value !== null){
                await stream.writeSSE({ data: JSON.stringify(value), event: 'update', id: String(i++)})
            }
        }
    })
})

Deno.serve(app.fetch)


