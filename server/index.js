import express from 'express'
import cors from 'cors'
import multer from 'multer';
import { Queue } from "bullmq";
import { QdrantVectorStore } from "@langchain/qdrant";
import { OpenAIEmbeddings } from "@langchain/openai";
import { OpenAI } from 'openai'
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client =  new OpenAI({
    openAIApiKey: process.env.OPENAI_API_KEY,
});

// Queue name
const queue = new Queue("file-upload-queue" , {connection: {
    host: 'localhost',
    port: '6379',
  }}
);

 
//the uploads folder inside /server/uploads is generted by multer from here
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, `${uniqueSuffix}-${file.originalname}`)
    }
  })
  const upload = multer({ storage: storage })


const app = express();
app.use(cors());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const PORT = 8000;

app.get('/', (req, res) => {
    return res.json({status:'ALL GOOD'});
})

app.post('/upload/pdf', upload.single('pdf'), async (req, res) => {
   await queue.add("file-ready", JSON.stringify({
        filename: req.file.originalname,
        destination: req.file.destination,
        path: req.file.path,
    }))
    return res.json({message : 'uploaded'});
} 
)

app.get('/chat', async (req, res)=> {
    const userQuery = req.query.message;
    
    const embeddings = new OpenAIEmbeddings({
        model: "text-embedding-3-small",
        openAIApiKey: process.env.OPENAI_API_KEY,
      });

    const vectorStore = await QdrantVectorStore.fromExistingCollection(
        embeddings, {
        url: 'http://localhost:6333',
        collectionName: "pdf-docs",
     });
     
     const ret = vectorStore.asRetriever({
        k : 2,  
     });
     const result = await ret.invoke(userQuery);

     const SYSTEM_PROMPT = `
     You are a helpful AI Assistant who answers the user query based on the available context from PDF File . 
     Context :
      ${JSON.stringify(result)};
     `

     const chatResult = await client.chat.completions.create({
        model: 'gpt-4.1',
        messages: [
            {role:"system", content : SYSTEM_PROMPT },
            { role: 'user', content: userQuery },
        ]
     })
      
     return res.json({ 
        message: chatResult.choices[0].message.content ,
        docs : result });

})
//The first argument to listen is the port number.
// The second argument is a callback function (no arguments needed) that runs when the server starts.
app.listen(PORT, () => {
    console.log(`Server is listening on PORT: ${PORT}`);
})