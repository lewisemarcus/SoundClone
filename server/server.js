import cors from "cors"
import express from "express"
import dotenv from "dotenv"
import { getSongs, postSong, deleteSong } from "./routes/index.js"
import morgan from "morgan"
import { authMiddleware } from "./utils/auth.js"
import { ApolloServer } from "apollo-server-express"
import mongoose from "mongoose"
import path from "path"
import bodyParser from "body-parser"
dotenv.config()
// import { default as typeDefs } from "./schema/typeDefs.js";
// import typeDefs from "./schema/typeDefs.js";
// const typeDefs = require("./graphql/typeDefs")
// import { default as resolvers } from "./schema/Users.js";
// import { resolvers } from "./schema/resolvers/Users.js";
// const resolvers = require("./graphql/resolvers")
import resolvers from "./schema/resolvers.js"
import typeDefs from "./schema/typeDefs.js"

const MONGODB = process.env.MONGO_URL

const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: authMiddleware,
})

const app = express()
server.applyMiddleware({ app })

const port = process.env.PORT || 4000

if (process.env.NODE_ENV !== "production") {
    app.use(morgan("dev"))
}
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser({ limit: "50mb" }))
app.use(cors())
app.use(express.json())

app.use("/", getSongs)
app.use("/", postSong)
app.use("/", deleteSong)

mongoose
    .connect(MONGODB, { useNewUrlParser: true })
    .then(() => {
        console.log("MongoDB Connected")
        return app.listen(port)
    })
    .then((res) => {
        console.log(
            `Server running at http://localhost:${port}${server.graphqlPath}`,
        )
    })
if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "..", "client", "build")))
    app.get("*", (req, res) => {
        res.sendFile(
            path.join(__dirname, "..", "client", "build", "index.html"),
        )
    })
}
