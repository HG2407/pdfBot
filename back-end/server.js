const express = require('express');
const path = require('path');
const { PDFLoader } = require('langchain/document_loaders/fs/pdf');
const {PineconeClient} = require('@pinecone-database/pinecone');
const {OpenAIEmbeddings} = require('langchain/embeddings/openai');
const {PineconeStore} = require('langchain/vectorstores/pinecone');
const {Document} = require('langchain/document');
const {CharacterTextSplitter} = require('langchain/text_splitter');
const {VectorDBQAChain} = require('langchain/chains');
const { OpenAI } = require('langchain/llms/openai');

const app = express();
require('dotenv').config();

app.use(express.json());
app.use(express.static(path.join(__dirname, './back-end/dist')));

app.listen(8000, () => {
    console.log('server is listening on port: 8000');
})

app.post('/post', async (req, res) => {
    let input = req.body.msg;

    let client = new PineconeClient();
    await client.init({
        apiKey:process.env.PINECONE_API_KEY,
        environment: process.env.PINECONE_ENVIRONMENT
    });

    let pineconeIndex = client.Index(process.env.PINECONE_INDEX);

    let vectorStore = await PineconeStore.fromExistingIndex(new OpenAIEmbeddings(), {pineconeIndex});

    let model = new OpenAI();
    let chain = VectorDBQAChain.fromLLM(
        model,
        vectorStore, 
        {
            k: 15, //how many matching results should it return :-> 1 (top most) (to open ai)
            returnSourceDocuments: true
        }
    );

    let response = await chain.call({query: input});
    res.json(response);
});

app.get('/upload', async(req, res) => {
    
        console.log('here');
        let loader = new PDFLoader('./front-end/src/assets/THE-ALCHEMIST-pdf-free-download.pdf');
        let docs = await loader.load();
        
        let splitter = new CharacterTextSplitter({
            separator: ' ',
            chunkSize: 250,
            chunkOverlap: 10
        });

        let splitDocs = await splitter.splitDocuments(docs);
        let reducedDocs = splitDocs.map((docs) => {
            let reducedMetaData = {...docs.metadata};
            delete reducedMetaData.pdf;
            return new Document({
                pageContent: docs.pageContent,
                metadata: reducedMetaData
            });
        });

        //uploading to database
        let client = new PineconeClient();
        await client.init({
            apiKey: process.env.PINECONE_API_KEY,
            environment: process.env.PINECONE_ENVIRONMENT
        });

        let pineconeIndex = client.Index(process.env.PINECONE_INDEX);

        await PineconeStore.fromDocuments(reducedDocs, new OpenAIEmbeddings(),{
            pineconeIndex
        });

        res.send('successfully added to database');

})