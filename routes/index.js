const userRouter = require('./user');
const uploadRouter = require('./upload');
const downloadRouter = require('./download');
const authRouter = require('./auth');
const { verifyToken } = require('../middleware/auth');
module.exports = (app) => {
    app.use('/users', userRouter)
    app.use('/upload', uploadRouter)
    app.use('/download', downloadRouter)
    app.use('/auth', authRouter)
}