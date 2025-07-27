require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const url = require('url');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/public', express.static(`${process.cwd()}/public`));

// Database to store URLs

let urlDatabase = [];
let urlCounter = 1;

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl', function(req, res) {
  const originalUrl = req.body.url;
  
  // Validar que se envió una URL
  if (!originalUrl) {
    return res.json({ error: 'invalid url' });
  }
  
  // Parsear la URL para obtener el hostname
  let parsedUrl;
  try {
    parsedUrl = new URL(originalUrl);
  } catch (err) {
    return res.json({ error: 'invalid url' });
  }
  
  // Verificar que sea http o https
  if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
    return res.json({ error: 'invalid url' });
  }
  
  // Usar dns.lookup para verificar que el host existe
  dns.lookup(parsedUrl.hostname, (err) => {
    if (err) {
      return res.json({ error: 'invalid url' });
    }
    
    // Guardar la URL y generar respuesta
    const shortUrl = urlCounter++;
    urlDatabase.push({
      original_url: originalUrl,
      short_url: shortUrl
    });
    
    res.json({
      original_url: originalUrl,
      short_url: shortUrl
    });
  });
});

app.get('/api/shorturl/:short_url', function(req, res) {
  const shortUrl = req.params.short_url;
  const urlEntry = urlDatabase.find(entry => entry.short_url === parseInt(shortUrl));
  
  if (urlEntry) {
    res.redirect(urlEntry.original_url);
  } else {
    res.json({ error: 'URL not found' });
  }
});

/*
3. Cuando visitas /api/shorturl/<short_url>, 
serás redirigido a la URL original.

*/



app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
