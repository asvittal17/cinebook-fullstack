import mongoose from 'mongoose'

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI || !process.env.MONGODB_URI.includes('mongodb')) {
      console.log('⚠️ MongoDB not configured, running without database')
      return
    }
    mongoose.set('bufferCommands', false)
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    })
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`)
  } catch (error) {
    console.error(`❌ MongoDB Error: ${error.message}`)
    console.error('👉 Check your MONGODB_URI in server/.env file')
  }
}

export default connectDB