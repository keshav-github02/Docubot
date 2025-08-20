import dotenv from 'dotenv';
dotenv.config();

import { Worker } from 'bullmq';
import { QdrantVectorStore } from "@langchain/qdrant";
import { OpenAIEmbeddings } from "@langchain/openai";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";

const embeddings = new OpenAIEmbeddings({
    model: "text-embedding-3-small",
    openAIApiKey: process.env.OPENAI_API_KEY,
  });

const worker = new Worker('file-upload-queue', async job => {
    if (job.name === 'file-ready') {
    //   await paintCar(job.data.color);
    console.log(`Job: `, job.data)
    const data = JSON.parse(job.data)
    /**
     * Path : data.path
     * read the pdf from the path
     * chunk the pdf
     * call the openai embedding model for generating embedding vector for each chunk
     * store the embedding vectors in a vector store - QuadrantDB
     */
     
    // console.log("the parsed file data is :", data);

    //document loaders
    const path = data.path;
    const loader = new PDFLoader(path);
    const docs = await loader.load();

    console.log("DOCS : ", docs[0]);
 
    //text splitters
    // const textSplitter = new RecursiveCharacterTextSplitter({
    //     chunkSize: 200,
    //     chunkOverlap: 0,
    //   });
    //   const texts = await textSplitter.splitText(docs[0]);
    //   console.log("TEXTS : ", texts);

     //embedding vector generation
    
    //  const client = new QdrantClient({ url: `http://localhost:6333` });

     const vectorStore = await QdrantVectorStore.fromExistingCollection(
         embeddings, {
         url: 'http://localhost:6333',
         collectionName: "pdf-docs",
      });

      
     //store the embedding vectors in a vector store - QuadrantDB
     await vectorStore.addDocuments(docs);
     console.log(`All Document are added to vector store`);
    }
  }, { concurrency: 100, connection: {
    host: 'localhost',
    port: '6379',
  } });