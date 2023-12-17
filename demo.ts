const db = await Deno.openKv()

/* for await (const entry of entries)( console.log(entry) ) */ //el operador entries es asíncrono por eso es un for await -> javascript

/* xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx */

/* const user = 'valenvier'
const result = await db.set(["username"], user)
console.log(result)

const username = await db.get(["username"])
console.log(username)

const result = await db.set(["counter"], 0)
const counter = await db.get(["counter"])
console.log(counter) */

/* xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx */

/* const { value } = await db.get<number>(["counter"])

const newCounter = value == null ? 0 : value + 1

const result = await db.set(["counter"], newCounter)

console.log(value) */

/* xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx */

//await db.set(["visits"], new Deno.KvU64(0n)) //setteamos una sola vez, luego lo quitamos

/* usamos bit int: porque es un tipo de dato que nos permite mucha flexibilidad para el día de mañana y porque en deno keyValue el tema de hacer sumar, el mínimo y el máximo solo lo puedes hacer con este tipo, es un tipo de dato optimizado para los números */

await db
    .atomic() //esperamos a que finalice una transacción antes de empezar otra para que no se pisen
    .sum(["visits"], 1n)
    .commit()
    
const result = await db.get<Deno.KvU64>(["visits"])

console.log(result.value)



