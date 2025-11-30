import express from 'express';
import connectDB from './config/db.js';
import authRoutes from  './routes/auth.routes.js';
import fileRoutes from "./routes/file.routes.js";


const app = express();

app.use(express.json());
connectDB();

const PORT  = process.env.PORT || 3000;

app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);

app.get("/",(req,res) => {
res.send('✅ Study Genii Backend is running On Vercel....');


});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
