const env = process.env.NODE_ENV || 'dev'


// Trocar a URI_MONGO
const config = () => {
    switch(env) {
        case 'dev': 
        return{
            URI_MONGO : 'mongodb+srv://db_user:daniel123@cluster0.q3wl4.gcp.mongodb.net/<dbname>?retryWrites=true&w=majority'
        }
    }
}

console.log(`iniciando a api em ambiente ${env.toUpperCase()}`)

module.exports = config()