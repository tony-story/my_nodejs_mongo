// const https = require('https');   .cjs格式

import * as https from "https";


// 获取公网 IP
export const getPublicIP = async () => {
    return new Promise((resolve, reject) => {
        https.get('https://api.ipify.org?format=json', (res) => {
            let data = '';
            res.on('data', (chunk) => (data += chunk));
            res.on('end', () => {
                try {
                    const ip = JSON.parse(data).ip;
                    console.log('server public ip: '+ ip)
                    resolve(ip);
                } catch (err) {
                    reject('Failed to parse IP data');
                }
            });
        }).on('error', (err) => reject('Error fetching IP'));
    });
};

// // 启动服务
// const startServer = async () => {
//     const PORT = 3000;
//     const server = http.createServer((req, res) => {
//         res.writeHead(200, { 'Content-Type': 'text/plain' });
//         res.end('Server is running!');
//     });
//
//     server.listen(PORT, async () => {
//         try {
//             const publicIP = await getPublicIP();
//             console.log(`Server is running on public IP: http://${publicIP}:${PORT}`);
//         } catch (error) {
//             console.error('Error fetching public IP:', error);
//         }
//     });
// };
//
// startServer();
