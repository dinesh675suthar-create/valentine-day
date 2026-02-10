const https = require('https');
const fs = require('fs');
const path = require('path');

const download = (url, filename) => {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(filename);
        https.get(url, (response) => {
            response.pipe(file);
            file.on('finish', () => {
                file.close(resolve);
            });
        }).on('error', (err) => {
            fs.unlink(filename, () => reject(err.message));
        });
    });
};

const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir);
}

const assets = [
    { url: 'https://media1.tenor.com/m/XNInD8iH2-sAAAAC/milk-and-mocha-bear-love.gif', name: 'question.gif' },
    { url: 'https://media1.tenor.com/m/oXlO51v-6BwAAAAC/milk-and-mocha-mocha.gif', name: 'success.gif' }
];

Promise.all(assets.map(asset => download(asset.url, path.join(publicDir, asset.name))))
    .then(() => console.log('Successfully downloaded assets'))
    .catch(err => console.error('Error downloading assets:', err));
