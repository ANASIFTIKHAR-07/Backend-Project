class ApiError extends Error {
    constructor(
        statusCode,
        message = "Something went wrong",
        errors = [],
        stack = "",
    ) {
        super(message)
        this.date = null
        this.statusCode = statusCode
        this.message = message
        this.success = false
        this.errors = errors


        if (stack) {
            this.stack = stack
        } else {
            Error.stackTraceLimit(this, this.constructor)
        }
    }
}

export {ApiError}
