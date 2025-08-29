import connectDB from './configs/db.config.js';
import {app} from './app.js';

const PORT = 8000;

connectDB()

.then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    })
})

.catch((error) => {
    console.error('Failed to connect to the database:', error);
});

