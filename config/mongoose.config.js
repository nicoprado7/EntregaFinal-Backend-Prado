import mongoose from 'mongoose';

const connectDB = () => {
  const URI = "mongodb+srv://nicoprado7:vqZRIUO8QORZOGlI@cluster0.lqucksl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

  const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: "ecommerce",
  };

  mongoose.connect(URI, options)
    .then(() => console.log("Conectado a MongoDB"))
    .catch((err) => console.error("Error al conectar con MongoDB", err));
};

const isValidID = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

export { connectDB, isValidID };
