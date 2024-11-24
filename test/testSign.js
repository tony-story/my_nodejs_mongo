
import {generateSignature} from '../app/router/auth.js'

describe('Math Functions', () => {
    describe('add()', () => {
        it('should return the sum of two numbers', async () => {
            const _conf = {
                "auth": {
                    "token": "aaaaa"
                }
            }
            const result = await generateSignature(new Date().getTime(), _conf);
            console.log('sign res: '+ result)
        });

        //  1732459751587
        // 5bb6cb3b6c7f749e38a060c5cdbf2a0f618d597c18764e7af046b32afd629936

        // it('should handle negative numbers', () => {
        //     const result = add(-2, -3);
        //     expect(result).to.equal(-5);
        // });
    });
});
