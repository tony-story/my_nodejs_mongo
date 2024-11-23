

async function digestMessage(message) {
    if (typeof crypto !== 'undefined' && crypto?.subtle?.digest) {
        const msgUint8 = new TextEncoder().encode(message)
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8)
        const hashArray = Array.from(new Uint8Array(hashBuffer))
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    } else {
        return sha256(message).toString()
    }
}

export const generateSignature = async(timestamp, config) => {
    // const { t: timestamp} = payload
    const secretKey = config.auth.token
    const signText = `${timestamp}:${secretKey}`
    // eslint-disable-next-line no-return-await
    return await digestMessage(signText)
}

export const verifySignature = async(req, config) => {
    const payloadSign = await generateSignature(req.timestamp,config)
    return payloadSign === req.sign
}
