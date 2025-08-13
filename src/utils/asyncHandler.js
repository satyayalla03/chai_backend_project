const asyncHandler = (requestHandler) => {
    (req, res, next) => {
        Promise.resolve(requestHandler).catch((err) => next(err))
    }
}


export {asyncHandler}


// wrapper function
// higher order function i.e., which takes another function as a parameter
/*
const asyncHandler = (fn) => async (req, res, next) => {
    try {
        await fn(req, res, next);
    } catch (error) {
        res.status(err.code || 500).json ({
            success: false,
            message: err.message
        })
    }
}

*/