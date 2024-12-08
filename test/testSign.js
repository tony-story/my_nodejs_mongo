
import {generateSignature} from '../app/router/auth.js'

describe('Math Functions', () => {
    describe('add()', () => {
        // it('should return the sum of two numbers', async () => {
        //     const _conf = {
        //         "auth": {
        //             "token": "aaaaa"
        //         }
        //     }
        //     const result = await generateSignature(new Date().getTime(), _conf);
        //     console.log('sign res: '+ result)
        // });

        it('split', () => {
            const path = 'mongodb+srv://liucon988:M7ULii2wqeJxoGTT@cluster0.b7qrh.mongodb.net/,mongodb+srv://liucon988:M7ULii2wqeJxoGTT@cluster0.b7qrh.mongodb.net/question/'
            var tt = path.split(',').map(x => x.trim()).filter(x => x !== '')

            console.log('data: '+ tt)
            console.log('is array: '+ Array.isArray(tt))
        })

        //  1732459751587
        // 5bb6cb3b6c7f749e38a060c5cdbf2a0f618d597c18764e7af046b32afd629936

        // it('should handle negative numbers', () => {
        //     const result = add(-2, -3);
        //     expect(result).to.equal(-5);
        // });
    });
});
